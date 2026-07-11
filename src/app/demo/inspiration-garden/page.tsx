// src/app/demo/inspiration-garden/page.tsx
// Demo 首页 —— 复用所有现有 UI 组件，使用静态 demo 数据
'use client';

import { WelcomeBar } from '@/components/home/WelcomeBar';
import { SearchBox } from '@/components/home/SearchBox';
import { GardenCanvas } from '@/components/home/GardenCanvas';
import { GardenGuidePanel } from '@/components/home/GardenGuidePanel';
import { GardenerLetter } from '@/components/home/GardenerLetter';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { demoHomeSummary } from '@/lib/demo-data';

const DEMO_BASE = '/demo/inspiration-garden';

export default function DemoHomePage() {
  const data = demoHomeSummary;

  return (
    <ToastProvider>
      <DemoBanner />
      <div className="relative min-h-[calc(100vh-64px)]">
        {/* 欢迎区 */}
        <WelcomeBar title={data.greeting.title} keywords={data.greeting.recentKeywords} />

        {/* 搜索框 */}
        <SearchBox />

        {/* 花园主场景 */}
        <GardenCanvas gardens={data.gardens} basePath={DEMO_BASE} />

        {/* 左侧花园导览牌 */}
        <GardenGuidePanel gardens={data.gardens} basePath={DEMO_BASE} />

        {/* 右侧小园丁信笺 */}
        <GardenerLetter
          actionableTopics={data.actionableTopics}
          wateringSeeds={data.wateringSeeds}
          observation={data.gardenObservation}
          basePath={DEMO_BASE}
        />
      </div>
    </ToastProvider>
  );
}
