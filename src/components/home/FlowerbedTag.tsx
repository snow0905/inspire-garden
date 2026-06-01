// src/components/home/FlowerbedTag.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { GardenOverview } from '@/types';
import { COLORS } from '@/lib/constants';

interface FlowerbedTagProps {
  garden: GardenOverview;
  style?: React.CSSProperties;
}

export function FlowerbedTag({ garden, style }: FlowerbedTagProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 0 24px ${COLORS.gold}40` }}
      style={style}
    >
      <Link
        href={`/garden/${garden.gardenId}`}
        className="block px-4 py-3 float-panel cursor-pointer transition-colors hover:bg-white/80"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{garden.icon}</span>
          <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{garden.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.deepBrown }}>
          <span>{garden.topicCount} 株主题植物</span>
          <span style={{ color: COLORS.coral }}>{garden.bloomingCount} 株开花</span>
        </div>
        <span className="text-xs mt-1 block" style={{ color: COLORS.darkGold }}>
          进入花园 →
        </span>
      </Link>
    </motion.div>
  );
}
