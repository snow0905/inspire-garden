// src/app/demo/inspiration-garden/[gardenId]/page.tsx
// Demo 花圃详情页 —— 复用现有 UI 组件，使用静态 demo 数据
'use client';

import { useMemo, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import type { GardenType, PlantStage } from '@/types';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import { GardenNav } from '@/components/garden/GardenNav';
import { GardenHeader } from '@/components/garden/GardenHeader';
import { FilterSortBar } from '@/components/garden/FilterSortBar';
import { GardenContainer } from '@/components/garden/GardenContainer';
import { PlantCard } from '@/components/garden/PlantCard';
import { PlantPlaceholderCard } from '@/components/garden/PlantPlaceholderCard';
import { GardenEmptyState } from '@/components/garden/GardenEmptyState';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { useSetBreadcrumb } from '@/hooks/useBreadcrumb';
import { getDemoGardenCards } from '@/lib/demo-data';

type FilterStage = 'all' | PlantStage;
type SortBy = 'updated' | 'growth_desc' | 'growth_asc';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];
const DEMO_BASE = '/demo/inspiration-garden';

export default function DemoGardenPage() {
  const params = useParams();
  const gardenId = params.gardenId as GardenType;

  const demoData = VALID_GARDENS.includes(gardenId) ? getDemoGardenCards(gardenId) : null;

  if (!demoData) notFound();

  const [filterStage, setFilterStage] = useState<FilterStage>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');

  const config = GARDEN_CONFIG[gardenId] ?? GARDEN_CONFIG.travel;

  // 面包屑
  useSetBreadcrumb([{ label: config.name }]);

  // 前端筛选 + 排序
  const filteredTopics = useMemo(() => {
    if (!demoData.topics) return [];
    let result = [...demoData.topics];

    if (filterStage !== 'all') {
      result = result.filter((t) => t.stage === filterStage);
    }

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
  }, [demoData, filterStage, sortBy]);

  const allTopics = demoData.topics;
  const nonEmpty = allTopics.length > 0;

  return (
    <ToastProvider>
      <DemoBanner />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-6 py-8"
      >
        {/* 花圃切换胶囊 */}
        <div className="mb-4">
          <GardenNav currentGarden={gardenId} basePath={DEMO_BASE} />
        </div>

        {/* 标题行 */}
        <GardenHeader gardenType={gardenId} topicCount={allTopics.length} />

        {/* 筛选 + 排序 */}
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
                  <PlantCard data={topic} gardenId={gardenId} basePath={DEMO_BASE} />
                </motion.div>
              ))}

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
    </ToastProvider>
  );
}
