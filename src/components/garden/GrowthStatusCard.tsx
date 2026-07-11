// src/components/garden/GrowthStatusCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { PlantStage } from '@/types';
import { COLORS, getGardenerHint } from '@/lib/constants';
import { LifecycleBar } from './LifecycleBar';

interface GrowthStatusCardProps {
  growthScore: number;
  seedCount: number;
  stage: PlantStage;
  className?: string;
}

export function GrowthStatusCard({
  growthScore,
  seedCount,
  stage,
  className = '',
}: GrowthStatusCardProps) {
  const hint = getGardenerHint(stage, seedCount);
  // 进度百分比，最大 100
  const progress = Math.min(growthScore, 100);
  // 进度条颜色根据进度变化
  const barColor =
    progress < 25
      ? COLORS.warmBrown
      : progress < 75
        ? COLORS.gold
        : '#8bab7a';

  return (
    <motion.div
      className={`float-card flex flex-col ${className}`}
      style={{ gap: '16px', borderRadius: '26px', padding: '20px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* 标题 */}
      <h3
        className="text-base font-semibold m-0"
        style={{ color: COLORS.textPrimary }}
      >
        成长状态
      </h3>

      {/* 第一行：成长值 + 灵感数量 */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline" style={{ gap: '4px' }}>
          <span
            className="font-bold leading-none"
            style={{
              fontSize: '32px',
              color: COLORS.textPrimary,
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          >
            {growthScore}
          </span>
          <span
            className="text-sm leading-none"
            style={{ color: COLORS.deepBrown }}
          >
            / 100
          </span>
        </div>

        {/* 灵感数量胶囊 */}
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(148, 116, 83, 0.1)',
            color: COLORS.deepBrown,
          }}
        >
          灵感数量 {seedCount} 条
        </span>
      </div>

      {/* 横向进度条 */}
      <div
        className="w-full overflow-hidden"
        style={{
          height: '8px',
          backgroundColor: 'rgba(148, 116, 83, 0.1)',
          borderRadius: '4px',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: '4px',
            background: `linear-gradient(90deg, ${COLORS.gold}, ${barColor})`,
            width: `${progress}%`,
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* LifecycleBar */}
      <LifecycleBar currentStage={stage} />

      {/* 分隔线 */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(148, 116, 83, 0.1)',
          width: '100%',
        }}
      />

      {/* 底部小园丁提示 */}
      <div className="flex items-start" style={{ gap: '8px' }}>
        <span className="text-base flex-shrink-0 leading-none pt-1" role="img" aria-label="小园丁">
          🧚
        </span>
        <p
          className="text-sm leading-relaxed m-0"
          style={{ color: COLORS.deepBrown }}
        >
          {hint}
        </p>
      </div>
    </motion.div>
  );
}

export type { GrowthStatusCardProps };
