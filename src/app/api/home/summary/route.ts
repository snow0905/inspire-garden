// src/app/api/home/summary/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { HomeSummary } from '@/types';

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

function generateObservation(seeds: { tags?: string[] }[]): string {
  const tags = seeds?.flatMap((s) => s.tags ?? []).slice(0, 4) ?? [];
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

    // 获取用户 profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, garden_name')
      .eq('id', user.id)
      .single();

    // 获取所有花圃统计
    const gardenTypes = ['travel', 'food', 'shopping', 'life', 'aesthetic'] as const;

    const gardens = await Promise.all(
      gardenTypes.map(async (type) => {
        const { count: topicCount } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('garden_type', type);

        const { count: bloomingCount } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('garden_type', type)
          .eq('stage', 'bloom');

        return {
          gardenId: type,
          name: GARDEN_NAMES[type],
          icon: GARDEN_ICONS[type],
          topicCount: topicCount ?? 0,
          bloomingCount: bloomingCount ?? 0,
        };
      })
    );

    // 可采摘主题
    const { data: actionableTopics } = await supabase
      .from('topics')
      .select('id, topic_name, garden_type')
      .eq('user_id', user.id)
      .eq('can_harvest', true)
      .limit(5);

    // 待补水主题
    const { data: wateringTopics } = await supabase
      .from('topics')
      .select('id, topic_name, missing_fields')
      .eq('user_id', user.id)
      .not('missing_fields', 'eq', '{}')
      .limit(5);

    // 最近种下
    const { data: recentSeeds } = await supabase
      .from('seeds')
      .select('tags, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 最近开花
    const { data: recentBlooms } = await supabase
      .from('topics')
      .select('topic_name, updated_at')
      .eq('user_id', user.id)
      .eq('stage', 'bloom')
      .order('updated_at', { ascending: false })
      .limit(5);

    // 本月种子数
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count: monthlySeeds } = await supabase
      .from('seeds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    const summary: HomeSummary = {
      user: {
        name: profile?.nickname ?? '园丁',
        avatarUrl: '/assets/avatar.png',
      },
      greeting: {
        title: getGreeting(),
        recentKeywords: recentSeeds?.slice(0, 4).flatMap((s) => s.tags ?? []) ?? [],
      },
      gardens,
      actionableTopics: (actionableTopics ?? []).map((t) => ({
        topicId: t.id,
        topicName: t.topic_name,
        gardenType: t.garden_type,
      })),
      wateringSeeds: (wateringTopics ?? []).map((t) => ({
        topicId: t.id,
        topicName: t.topic_name,
        missingFields: t.missing_fields,
      })),
      recentSeeds: (recentSeeds ?? []).map((s) => ({
        label: s.tags?.[0] ?? '新种子',
        time: formatRelativeTime(s.created_at),
      })),
      recentBloomingTopics: (recentBlooms ?? []).map((t) => ({
        label: t.topic_name,
        time: formatRelativeTime(t.updated_at),
      })),
      gardenReview: {
        label: `${new Date().getMonth() + 1}月灵感回顾`,
        count: monthlySeeds ?? 0,
      },
      gardenObservation: generateObservation(recentSeeds ?? []),
    };

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
