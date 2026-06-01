// src/app/garden/travel/page.tsx
'use client';

import useSWR from 'swr';
import { TopicGrid } from '@/components/garden/TopicGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import type { Topic, TopicCard as TopicCardType } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TopicWithSeedCount = Topic & { seed_count?: number };

export default function TravelGardenPage() {
  const { data, error, isLoading } = useSWR('/api/garden/travel', fetcher);
  const config = GARDEN_CONFIG.travel;
  const topics: TopicCardType[] = (data?.topics ?? []).map((t: TopicWithSeedCount) => ({
    topicId: t.id,
    topicName: t.topic_name,
    gardenName: config.name,
    plantFamily: config.plantFamily,
    stage: t.stage,
    seedCount: t.seed_count ?? 0,
    growthScore: t.growth_score,
    tags: t.tags,
    missingFields: t.missing_fields,
    canHarvest: t.can_harvest,
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🧳</span>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>{config.name}</h1>
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>{topics.length} 个主题植物</p>
        </div>
      </div>
      {isLoading && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} rounded="full" />
            <div className="space-y-2">
              <Skeleton width={160} height={24} />
              <Skeleton width={100} height={16} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton height={200} className="w-full" />
            <Skeleton height={200} className="w-full" />
            <Skeleton height={200} className="w-full" />
          </div>
        </div>
      )}
      {error && (
        <div className="text-center py-12" style={{ color: COLORS.coral }}>加载失败，请重试</div>
      )}
      {!isLoading && !error && <TopicGrid topics={topics} gardenId="travel" />}
    </div>
  );
}
