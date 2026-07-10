'use client';

import { motion } from 'framer-motion';
import { requestFeed } from '@/lib/feed-store';
import { COLORS } from '@/lib/constants';
import type { GardenType } from '@/types';

interface GardenEmptyStateProps {
  gardenType: GardenType;
}

const GARDEN_NAMES: Record<GardenType, string> = {
  travel: '旅行',
  food: '美食',
  shopping: '购物',
  life: '生活',
  aesthetic: '审美',
};

export function GardenEmptyState({ gardenType }: GardenEmptyStateProps) {
  const label = GARDEN_NAMES[gardenType] ?? '';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* 空花圃场景 */}
      <div className="relative mb-8">
        {/* 土壤 */}
        <div
          className="w-32 h-8 rounded-full mx-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(181, 165, 140, 0.3) 0%, rgba(181, 165, 140, 0.1) 100%)',
          }}
        />
        {/* 小种子 */}
        <motion.span
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          🌰
        </motion.span>
        {/* 小水壶 */}
        <motion.span
          className="absolute -top-3 -right-2 text-xl"
          animate={{ rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
        >
          🪣
        </motion.span>
        {/* 光点 */}
        <motion.span
          className="absolute -top-8 left-2 text-xs"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        >
          ✨
        </motion.span>
        {/* 小花 */}
        <span className="absolute -bottom-1 left-4 text-sm opacity-30">🌼</span>
        <span className="absolute -bottom-1 right-3 text-sm opacity-25">🍀</span>
      </div>

      {/* 文案 */}
      <p className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>
        这里还没有长出主题植物 🌱
      </p>
      <p className="text-sm mb-8 text-center leading-relaxed" style={{ color: COLORS.deepBrown, opacity: 0.8 }}>
        投喂几条{label}灵感后，
        <br />
        小园丁会帮你种下第一株植物。
      </p>

      {/* 投喂按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => requestFeed()}
        className="px-6 py-2.5 text-sm font-medium text-white rounded-full"
        style={{
          background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
          boxShadow: `0 4px 16px rgba(237, 114, 110, 0.2)`,
        }}
      >
        投喂新灵感
      </motion.button>
    </div>
  );
}
