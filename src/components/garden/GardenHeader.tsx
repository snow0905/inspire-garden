// src/components/garden/GardenHeader.tsx
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import type { GardenType } from '@/types';

interface GardenHeaderProps {
  gardenType: GardenType;
  topicCount: number;
}

export function GardenHeader({ gardenType, topicCount }: GardenHeaderProps) {
  const config = GARDEN_CONFIG[gardenType];

  return (
    <div className="flex items-center justify-between mb-6" style={{ minHeight: 56 }}>
      {/* 左侧：花圃名 */}
      <h1
        className="text-[28px] font-bold tracking-tight"
        style={{ color: '#4a5e3a', fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
      >
        <span className="mr-2.5">{config.icon}</span>
        {config.name}
      </h1>

      {/* 右侧：植物数量 */}
      <span
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full"
        style={{
          background: 'rgba(181, 201, 182, 0.15)',
          color: '#6b8b6b',
          border: '1px solid rgba(181, 201, 182, 0.25)',
        }}
      >
        <span>🌱</span>
        <span>
          {topicCount === 0
            ? '还没有主题植物'
            : `${topicCount} 株主题植物正在成长`}
        </span>
      </span>
    </div>
  );
}
