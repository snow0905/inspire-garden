// src/components/home/GardenerLetter.tsx
'use client';

import Link from 'next/link';
import type { ActionableTopic, WateringSeed } from '@/types';
import { FloatPanel } from '@/components/ui/FloatPanel';
import { COLORS } from '@/lib/constants';

interface GardenerLetterProps {
  actionableTopics: ActionableTopic[];
  wateringSeeds: WateringSeed[];
  observation: string;
}

export function GardenerLetter({ actionableTopics, wateringSeeds, observation }: GardenerLetterProps) {
  return (
    <>
      <style>{`
        .gl-link:hover { background-color: ${COLORS.mistPink}4D; }
      `}</style>
      <FloatPanel title="小园丁信笺" className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-64">
        {/* 1. 今天可以采摘 */}
        {actionableTopics.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.coral }}>
              <span>🌸</span> 今天可以采摘
            </h4>
            <div className="space-y-1.5">
              {actionableTopics.map((topic) => (
                <Link
                  key={topic.topicId}
                  href={`/garden/${topic.gardenType}/${topic.topicId}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm gl-link"
                >
                  <span style={{ color: COLORS.textPrimary }}>{topic.topicName}</span>
                  <span className="text-xs" style={{ color: COLORS.coral }}>去采摘</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. 待补水的小苗 */}
        {wateringSeeds.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.darkGold }}>
              <span>💧</span> 待补水的小苗
            </h4>
            <div className="space-y-1.5">
              {wateringSeeds.map((seed) => (
                <div key={seed.topicId} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm gl-link">
                  <span style={{ color: COLORS.textPrimary }}>{seed.topicName}</span>
                  <span className="text-xs" style={{ color: COLORS.deepBrown }}>缺少{seed.missingFields.join('、')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 近期灵感观察 */}
        <div className="pt-3 border-t" style={{ borderTopColor: `${COLORS.warmBrown}26` }}>
          <p className="text-xs leading-relaxed italic" style={{ color: COLORS.deepBrown }}>
            💬 {observation}
          </p>
        </div>
      </FloatPanel>
    </>
  );
}
