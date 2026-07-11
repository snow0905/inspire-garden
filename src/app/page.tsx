// src/app/page.tsx
'use client';

import useSWR from 'swr';
import type { HomeSummary } from '@/types';
import { WelcomeBar } from '@/components/home/WelcomeBar';
import { SearchBox } from '@/components/home/SearchBox';
import { GardenCanvas } from '@/components/home/GardenCanvas';
import { GardenGuidePanel } from '@/components/home/GardenGuidePanel';
import { GardenerLetter } from '@/components/home/GardenerLetter';

export default function HomePage() {
  const { data, isLoading, error } = useSWR<HomeSummary>('/api/home/summary');

  // ── 加载中 ──
  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl animate-bounce">🌱</div>
          <p className="text-sm text-[#947453]">正在打理你的花园…</p>
        </div>
      </div>
    );
  }

  // ── API 异常 ──
  if (error || !data) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="text-4xl">😥</div>
          <p className="text-sm text-[#947453]">
            花园数据加载失败，请检查网络后刷新页面。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #f2e4da 0%, #ed726e 100%)',
            }}
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // ── 正常渲染真实数据 ──
  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* 欢迎区 */}
      <WelcomeBar title={data.greeting.title} keywords={data.greeting.recentKeywords} />

      {/* 搜索框 */}
      <SearchBox />

      {/* 花园主场景 */}
      <GardenCanvas gardens={data.gardens} />

      {/* 左侧花园导览牌 */}
      <GardenGuidePanel gardens={data.gardens} />

      {/* 右侧小园丁信笺 */}
      <GardenerLetter
        actionableTopics={data.actionableTopics}
        wateringSeeds={data.wateringSeeds}
        observation={data.gardenObservation}
      />
    </div>
  );
}
