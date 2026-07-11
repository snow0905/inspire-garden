// src/app/api/garden/[gardenId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { GardenType } from '@/types';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const { gardenId } = await params;

    if (!VALID_GARDENS.includes(gardenId as GardenType)) {
      return NextResponse.json({ error: 'Invalid garden type' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user.id)
      .eq('garden_type', gardenId)
      .order('updated_at', { ascending: false });

    // 统计每个主题的种子数量
    const topicIds = (topics ?? []).map((t) => t.id);
    let seedCounts: Record<string, number> = {};
    if (topicIds.length > 0) {
      const { data: counts } = await supabase
        .from('seeds')
        .select('topic_id')
        .in('topic_id', topicIds)
        .eq('user_id', user.id);
      seedCounts = (counts ?? []).reduce<Record<string, number>>((acc, s) => {
        const tid = s.topic_id;
        if (tid) acc[tid] = (acc[tid] || 0) + 1;
        return acc;
      }, {});
    }

    const topicsWithCount = (topics ?? []).map((t) => ({
      ...t,
      seed_count: seedCounts[t.id] || 0,
    }));

    return NextResponse.json({ gardenType: gardenId, topics: topicsWithCount });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
