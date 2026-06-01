// src/components/home/GardenGuide.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { GardenOverview } from '@/types';
import { FloatPanel } from '@/components/ui/FloatPanel';
import { COLORS } from '@/lib/constants';

interface GardenGuideProps {
  gardens: GardenOverview[];
}

export function GardenGuide({ gardens }: GardenGuideProps) {
  return (
    <>
      <style>{`
        .gg-item:hover { background-color: ${COLORS.mistPink}66; }
        .gg-footer:hover { color: ${COLORS.coral}; }
      `}</style>
      <FloatPanel title="花园导览" className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-60">
        <div className="space-y-2">
          {gardens.map((garden) => (
            <motion.div key={garden.gardenId} whileHover={{ x: 4 }}>
              <Link
                href={`/garden/${garden.gardenId}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group gg-item"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{garden.icon}</span>
                  <span className="text-sm" style={{ color: COLORS.textPrimary }}>{garden.name}</span>
                </div>
                <span className="text-xs" style={{ color: COLORS.deepBrown }}>
                  {garden.topicCount}株 · {garden.bloomingCount}🌸
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        <Link
          href="/gardens"
          className="flex items-center justify-center gap-1 mt-3 pt-3 border-t text-xs transition-colors gg-footer"
          style={{ borderTopColor: `${COLORS.warmBrown}26`, color: COLORS.deepBrown }}
        >
          查看全部花园 →
        </Link>
      </FloatPanel>
    </>
  );
}
