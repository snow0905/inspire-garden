// src/app/api/garden/[gardenId]/cards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { GardenType, TopicCardData, GardenCardsResponse } from '@/types';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

export async function GET(
  _request: NextRequest,
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

    // 1. 查询该花圃所有 topics
    const { data: topics } = await supabase
      .from('topics')
      .select('id, topic_name, plant_family, stage, growth_score, tags, updated_at')
      .eq('user_id', user.id)
      .eq('garden_type', gardenId)
      .order('updated_at', { ascending: false });

    if (!topics || topics.length === 0) {
      return NextResponse.json({ gardenType: gardenId as GardenType, topics: [] } satisfies GardenCardsResponse);
    }

    const topicIds = topics.map((t) => t.id);

    // 2. 批量查询每个 topic 的种子数量 + 最新种子标题
    const { data: seeds } = await supabase
      .from('seeds')
      .select('id, topic_id, title, created_at')
      .in('topic_id', topicIds)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 内存聚合：按 topic_id 分组
    const seedCountMap = new Map<string, number>();
    const latestSeedMap = new Map<string, string>(); // topic_id → latest title
    for (const s of seeds ?? []) {
      seedCountMap.set(s.topic_id, (seedCountMap.get(s.topic_id) ?? 0) + 1);
      if (!latestSeedMap.has(s.topic_id) && s.title) {
        latestSeedMap.set(s.topic_id, s.title);
      }
    }

    // 3. 批量查询 harvest 存在性
    const { data: harvests } = await supabase
      .from('harvests')
      .select('topic_id')
      .in('topic_id', topicIds)
      .eq('user_id', user.id);

    const harvestSet = new Set((harvests ?? []).map((h) => h.topic_id));

    // 4. 组装响应
    const cards: TopicCardData[] = topics.map((t) => ({
      topicId: t.id,
      topicName: t.topic_name,
      plantFamily: t.plant_family as TopicCardData['plantFamily'],
      stage: t.stage as TopicCardData['stage'],
      growthScore: Number(t.growth_score),
      seedCount: seedCountMap.get(t.id) ?? 0,
      tags: (t.tags ?? []).slice(0, 5),
      latestSeedTitle: latestSeedMap.get(t.id) ?? null,
      hasHarvest: harvestSet.has(t.id),
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({ gardenType: gardenId as GardenType, topics: cards } satisfies GardenCardsResponse);
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
