// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: '请提供 file 字段' }, { status: 400 });
    }

    // 限制文件大小 (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 });
    }

    // 限制文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPEG、PNG、GIF、WebP、SVG 格式' }, { status: 400 });
    }

    // 存储操作使用 admin client（SERVICE_ROLE_KEY 有完整权限）
    const admin = getSupabaseAdmin();

    // 确保 bucket 存在
    const bucketName = 'seed-images';
    const { data: buckets, error: listError } = await admin.storage.listBuckets();

    if (listError) {
      console.error('Failed to list buckets:', listError);
      return NextResponse.json({ error: '存储服务异常' }, { status: 500 });
    }

    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await admin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: allowedTypes,
      });

      if (createBucketError) {
        console.error('Failed to create bucket:', createBucketError);
        return NextResponse.json({ error: '创建存储桶失败' }, { status: 500 });
      }
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const uuid = crypto.randomUUID();
    const path = `${user.id}/${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: '图片上传失败' }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage
      .from(bucketName)
      .getPublicUrl(path);

    const imageUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      imageUrl,
      thumbnailUrl: imageUrl,
    });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
