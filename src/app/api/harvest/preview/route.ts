// src/app/api/harvest/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { generateHarvestPreview } from '@/lib/qwen';
import { GARDEN_CONFIG } from '@/lib/constants';
import type { GardenType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId } = await request.json();
    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    // 获取 topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('user_id', user.id)
      .single();

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // 获取该 topic 下所有 seeds
    const { data: seeds } = await supabase
      .from('seeds')
      .select('id, title, summary, tags, extracted_fields, branch, source_type')
      .eq('topic_id', topicId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const config = GARDEN_CONFIG[topic.garden_type as GardenType];
    const branches = config?.structureBranches ?? [];
    const harvestType = config?.harvestType ?? 'checklist';

    // 调用 AI 生成预览
    const preview = await generateHarvestPreview(
      {
        topic_name: topic.topic_name,
        garden_type: topic.garden_type,
        tags: topic.tags ?? [],
        profile_fields: (topic.profile_fields ?? {}) as Record<string, string>,
      },
      (seeds ?? []).map((s) => ({
        id: s.id,
        title: s.title ?? undefined,
        summary: s.summary ?? undefined,
        tags: s.tags ?? [],
        extracted_fields: (s.extracted_fields ?? {}) as Record<string, string>,
        branch: s.branch ?? undefined,
        source_type: s.source_type,
      })),
      branches,
      harvestType,
    );

    // 注入准确的种子数量（AI 可能无法准确计算）
    const seedCount = (seeds ?? []).length;
    preview.subtitle = `小园丁根据「${topic.topic_name}」里的 ${seedCount} 条灵感，帮你整理了一份候选清单`;

    return NextResponse.json({
      preview: {
        ...preview,
        seedCount,
      },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('Harvest preview error:', err.message);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}
