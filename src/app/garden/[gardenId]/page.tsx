'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import type { GardenType, GardenCardsResponse, PlantStage } from '@/types';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import { GardenNav } from '@/components/garden/GardenNav';
import { GardenHeader } from '@/components/garden/GardenHeader';
import { FilterSortBar } from '@/components/garden/FilterSortBar';
import { GardenContainer } from '@/components/garden/GardenContainer';
import { PlantCard } from '@/components/garden/PlantCard';
import { PlantPlaceholderCard } from '@/components/garden/PlantPlaceholderCard';
import { GardenEmptyState } from '@/components/garden/GardenEmptyState';
import { useSetBreadcrumb } from '@/hooks/useBreadcrumb';

type FilterStage = 'all' | PlantStage;
type SortBy = 'updated' | 'growth_desc' | 'growth_asc';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GardenPage() {
  const params = useParams();
  const gardenId = params.gardenId as GardenType;

  const { data, error, isLoading } = useSWR<GardenCardsResponse>(
    VALID_GARDENS.includes(gardenId) ? `/api/garden/${gardenId}/cards` : null,
    fetcher,
  );

  const [filterStage, setFilterStage] = useState<FilterStage>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');

  const config = GARDEN_CONFIG[gardenId] ?? GARDEN_CONFIG.travel;

  // 面包屑
  useSetBreadcrumb([{ label: config.name }]);

  // 前端筛选 + 排序
  const filteredTopics = useMemo(() => {
    if (!data?.topics) return [];
    let result = [...data.topics];

    // 筛选
    if (filterStage !== 'all') {
      result = result.filter((t) => t.stage === filterStage);
    }

    // 排序
    switch (sortBy) {
      case 'growth_desc':
        result.sort((a, b) => b.growthScore - a.growthScore);
        break;
      case 'growth_asc':
        result.sort((a, b) => a.growthScore - b.growthScore);
        break;
      case 'updated':
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [data, filterStage, sortBy]);

  // ── 加载态 ──
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GardenNav currentGarden={gardenId} />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-3xl animate-bounce">🌱</div>
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>正在打理你的花园…</p>
        </div>
      </div>
    );
  }

  // ── 错误态 ──
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GardenNav currentGarden={gardenId} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-4xl">😥</div>
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>花园数据加载失败，请刷新页面。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-full"
            style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const allTopics = data.topics;
  const nonEmpty = allTopics.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-6 py-8"
    >
      {/* 花圃切换胶囊 */}
      <div className="mb-4">
        <GardenNav currentGarden={gardenId} />
      </div>

      {/* 标题行 */}
      <GardenHeader gardenType={gardenId} topicCount={allTopics.length} />

      {/* 筛选 + 排序（非空时显示） */}
      {nonEmpty && (
        <FilterSortBar
          filterStage={filterStage}
          onFilterChange={setFilterStage}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* 空状态 */}
      {!nonEmpty && <GardenEmptyState gardenType={gardenId} />}

      {/* 花圃容器 + 植物网格 */}
      {nonEmpty && (
        <GardenContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTopics.map((topic, i) => (
              <motion.div
                key={topic.topicId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
              >
                <PlantCard data={topic} gardenId={gardenId} />
              </motion.div>
            ))}

            {/* 占位卡：当筛选后数量 < 4 时显示 */}
            {filteredTopics.length < 4 && filterStage === 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTopics.length * 0.06, duration: 0.4 }}
              >
                <PlantPlaceholderCard />
              </motion.div>
            )}
          </div>
        </GardenContainer>
      )}
    </motion.div>
  );
}
