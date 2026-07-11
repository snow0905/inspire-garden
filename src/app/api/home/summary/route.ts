// src/app/api/home/summary/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { HomeSummary, Topic, GardenType } from '@/types';

const GARDEN_TYPES: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

const GARDEN_NAMES: Record<string, string> = {
  travel: '旅行花园', food: '美食花园', shopping: '购物种草',
  life: '生活锦囊', aesthetic: '审美灵感',
};
const GARDEN_ICONS: Record<string, string> = {
  travel: '🧳', food: '🍜', shopping: '🛍️', life: '💡', aesthetic: '🎨',
};

function getGreeting(): string {
  const h = new Date().getHours();
  const part = h < 12 ? '上午' : h < 18 ? '下午' : '晚上';
  return `${part}好，今天你的灵感花园又长大了一点。`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

function generateObservation(tags: string[]): string {
  if (tags.length === 0) return '你的花园刚刚开始，种下第一颗种子吧 🌱';
  return `你最近对「${tags.slice(0, 3).join('」「')}」很感兴趣，灵感正在悄悄生长。`;
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // ── 4 个并行查询（从原来的 16 个减少到 4 个）──
    const [
      profileResult,
      allTopicsResult,
      recentSeedsResult,
      monthlySeedsResult,
    ] = await Promise.all([
      // 1. 用户 profile
      supabase
        .from('profiles')
        .select('nickname, garden_name')
        .eq('id', user.id)
        .single(),

      // 2. 所有主题（用于花园统计、可采摘、待补水、最近开花）
      supabase
        .from('topics')
        .select('id, topic_name, garden_type, stage, can_harvest, missing_fields, updated_at')
        .eq('user_id', user.id),

      // 3. 最近 5 条种子（用于关键词和观察）
      supabase
        .from('seeds')
        .select('tags, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),

      // 4. 本月种子数
      supabase
        .from('seeds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString()),
    ]);

    const profile = profileResult.data;
    const allTopics: Pick<Topic, 'id' | 'topic_name' | 'garden_type' | 'stage' | 'can_harvest' | 'missing_fields' | 'updated_at'>[] =
      allTopicsResult.data ?? [];
    const recentSeeds = recentSeedsResult.data ?? [];
    const monthlySeeds = monthlySeedsResult.count ?? 0;

    // ── 内存聚合：花园统计（替代原来的 10 个 DB 查询）──
    const gardenStats = new Map<GardenType, { topicCount: number; bloomingCount: number }>();
    for (const t of GARDEN_TYPES) {
      gardenStats.set(t, { topicCount: 0, bloomingCount: 0 });
    }
    for (const t of allTopics) {
      const s = gardenStats.get(t.garden_type as GardenType);
      if (s) {
        s.topicCount++;
        if (t.stage === 'bloom') s.bloomingCount++;
      }
    }

    const gardens = GARDEN_TYPES.map((type) => {
      const stats = gardenStats.get(type)!;
      return {
        gardenId: type,
        name: GARDEN_NAMES[type],
        icon: GARDEN_ICONS[type],
        topicCount: stats.topicCount,
        bloomingCount: stats.bloomingCount,
      };
    });

    // ── 内存聚合：可采摘主题 ──
    const actionableTopics = allTopics
      .filter((t) => t.can_harvest)
      .slice(0, 5)
      .map((t) => ({
        topicId: t.id,
        topicName: t.topic_name,
        gardenType: t.garden_type as GardenType,
      }));

    // ── 内存聚合：待补水主题 ──
    const wateringTopics = allTopics
      .filter((t) => t.missing_fields && (t.missing_fields as unknown as any[]).length > 0)
      .slice(0, 5);

    // ── 内存聚合：最近开花主题 ──
    const bloomingTopics = allTopics
      .filter((t) => t.stage === 'bloom')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    // ── 种子标签（用于关键词和观察）──
    const allTags = recentSeeds.flatMap((s) => s.tags ?? []);

    const summary: HomeSummary = {
      user: {
        name: profile?.nickname ?? '园丁',
        avatarUrl: '/assets/avatar.png',
      },
      greeting: {
        title: getGreeting(),
        recentKeywords: allTags.slice(0, 4),
      },
      gardens,
      actionableTopics,
      wateringSeeds: wateringTopics.map((t) => ({
        topicId: t.id,
        topicName: t.topic_name,
        missingFields: t.missing_fields,
      })),
      recentSeeds: recentSeeds.map((s) => ({
        label: s.tags?.[0] ?? '新种子',
        time: formatRelativeTime(s.created_at),
      })),
      recentBloomingTopics: bloomingTopics.map((t) => ({
        label: t.topic_name,
        time: formatRelativeTime(t.updated_at),
      })),
      gardenReview: {
        label: `${new Date().getMonth() + 1}月灵感回顾`,
        count: monthlySeeds,
      },
      gardenObservation: generateObservation(allTags),
    };

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
