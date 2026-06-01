// src/app/page.tsx
'use client';

import useSWR from 'swr';
import { mockHomeSummary } from '@/components/home/mock-data';
import type { HomeSummary } from '@/types';
import { WelcomeBar } from '@/components/home/WelcomeBar';
import { SearchBox } from '@/components/home/SearchBox';
import { GardenCanvas } from '@/components/home/GardenCanvas';
import { GardenGuide } from '@/components/home/GardenGuide';
import { GardenerLetter } from '@/components/home/GardenerLetter';
import { GardenLogBar } from '@/components/home/GardenLogBar';

export default function HomePage() {
  const { data: apiData } = useSWR<HomeSummary>('/api/home/summary');
  const data: HomeSummary =
    apiData && Object.keys(apiData).length > 0 ? apiData : mockHomeSummary;

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* 欢迎区 */}
      <WelcomeBar title={data.greeting.title} keywords={data.greeting.recentKeywords} />

      {/* 搜索框 */}
      <SearchBox />

      {/* 花园主场景 */}
      <GardenCanvas gardens={data.gardens} />

      {/* 左侧花园导览 */}
      <GardenGuide gardens={data.gardens} />

      {/* 右侧小园丁信笺 */}
      <GardenerLetter
        actionableTopics={data.actionableTopics}
        wateringSeeds={data.wateringSeeds}
        observation={data.gardenObservation}
      />

      {/* 底部花园日志带 */}
      <GardenLogBar
        recentSeeds={data.recentSeeds}
        recentBloomingTopics={data.recentBloomingTopics}
        gardenReview={data.gardenReview}
      />
    </div>
  );
}
