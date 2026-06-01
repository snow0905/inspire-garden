// src/components/home/GardenLogBar.tsx
'use client';

import { motion } from 'framer-motion';
import type { RecentItem } from '@/types';
import { COLORS } from '@/lib/constants';

interface GardenLogBarProps {
  recentSeeds: RecentItem[];
  recentBloomingTopics: RecentItem[];
  gardenReview: { label: string; count: number };
}

export function GardenLogBar({ recentSeeds, recentBloomingTopics, gardenReview }: GardenLogBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute bottom-0 left-0 right-0 z-20"
    >
      <div className="mx-6 mb-4 px-6 py-4 float-panel flex items-center gap-12">
        {/* 最近种下 */}
        <div className="flex-1">
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.deepBrown }}>
            <span>🌱</span> 最近种下
          </h4>
          <div className="space-y-1">
            {recentSeeds.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: COLORS.textPrimary }}>{item.label}</span>
                <span className="text-xs" style={{ color: `${COLORS.deepBrown}99` }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 最近开花 */}
        <div className="flex-1">
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.deepBrown }}>
            <span>🌸</span> 最近开花
          </h4>
          <div className="space-y-1">
            {recentBloomingTopics.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: COLORS.textPrimary }}>{item.label}</span>
                <span className="text-xs" style={{ color: `${COLORS.deepBrown}99` }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 花园回顾 */}
        <div className="flex-shrink-0 text-right">
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1 justify-end" style={{ color: COLORS.deepBrown }}>
            <span>📊</span> 花园回顾
          </h4>
          <p className="text-sm" style={{ color: COLORS.textPrimary }}>{gardenReview.label}</p>
          <p className="text-lg font-semibold" style={{ color: COLORS.gold }}>
            收获 {gardenReview.count} 条新灵感
          </p>
        </div>
      </div>
    </motion.div>
  );
}
