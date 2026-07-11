// src/app/api/harvest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/harvest?topicId=xxx — 获取 topic 的已有清单
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const { data: harvest, error } = await supabase
      .from('harvests')
      .select('*')
      .eq('topic_id', topicId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 统计自清单生成后新增的灵感数
    let newSeedsSinceHarvest = 0;
    if (harvest) {
      const { count, error: countError } = await supabase
        .from('seeds')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId)
        .eq('user_id', user.id)
        .gt('created_at', harvest.updated_at);

      if (!countError) {
        newSeedsSinceHarvest = count ?? 0;
      }
    }

    return NextResponse.json({
      harvest: harvest ?? null,
      newSeedsSinceHarvest,
    });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/harvest — 确认保存清单
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topicId, outputType, title, subtitle, baseInfo, sections } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    // 验证 topic 属于当前用户
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('id', topicId)
      .eq('user_id', user.id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // 检查是否已有 harvest
    const { data: existing } = await supabase
      .from('harvests')
      .select('id, version')
      .eq('topic_id', topicId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // 更新已有 harvest
      const { data: harvest, error } = await supabase
        .from('harvests')
        .update({
          version: (existing.version as number) + 1,
          output_type: outputType || 'checklist',
          title: title || '',
          subtitle: subtitle || '',
          base_info: baseInfo || {},
          sections: sections || [],
          updated_at: now,
        })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ harvest });
    } else {
      // 创建新 harvest
      const { data: harvest, error } = await supabase
        .from('harvests')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          version: 1,
          output_type: outputType || 'checklist',
          title: title || '',
          subtitle: subtitle || '',
          base_info: baseInfo || {},
          sections: sections || [],
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ harvest });
    }
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
