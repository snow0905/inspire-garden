// src/components/garden/LifecycleBar.tsx
'use client';

import { motion } from 'framer-motion';
import type { PlantStage } from '@/types';
import { COLORS, STAGE_EMOJI, STAGE_LABELS } from '@/lib/constants';

interface LifecycleBarProps {
  currentStage: PlantStage;
}

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'growing', 'bloom', 'fruit'];

export function LifecycleBar({ currentStage }: LifecycleBarProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: '64px', gap: '0px' }}
    >
      {STAGE_ORDER.map((stage, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={stage} className="flex items-center" style={{ gap: '0px' }}>
            {/* 阶段节点 */}
            <motion.div
              className="flex flex-col items-center justify-center"
              style={{ gap: '2px' }}
              animate={{
                scale: isCurrent ? 1.3 : 1,
                opacity: isFuture ? 0.35 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Emoji 图标 */}
              <span
                className="text-lg leading-none select-none"
                style={{
                  filter: isPast
                    ? 'drop-shadow(0 1px 2px rgba(229, 200, 114, 0.4))'
                    : 'none',
                }}
                role="img"
                aria-label={STAGE_LABELS[stage]}
              >
                {STAGE_EMOJI[stage]}
              </span>

              {/* 阶段标签 */}
              <span
                className="text-[10px] leading-tight select-none whitespace-nowrap"
                style={{
                  color: isCurrent ? COLORS.gold : COLORS.textPrimary,
                  fontWeight: isCurrent ? 600 : 400,
                  opacity: isFuture ? 0.6 : 1,
                }}
              >
                {STAGE_LABELS[stage]}
              </span>

              {/* 当前阶段底部金色下划线 */}
              {isCurrent && (
                <motion.div
                  layoutId="lifecycle-underline"
                  style={{
                    height: '3px',
                    borderRadius: '3px',
                    backgroundColor: COLORS.gold,
                    width: '100%',
                    minWidth: '24px',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              )}
            </motion.div>

            {/* 阶段间连线（最后一个不渲染） */}
            {index < STAGE_ORDER.length - 1 && (
              <div
                style={{
                  width: '28px',
                  height: '2px',
                  borderRadius: '1px',
                  backgroundColor: index < currentIndex ? COLORS.gold : COLORS.warmBrown,
                  opacity: index < currentIndex ? 0.6 : 0.25,
                  marginLeft: '4px',
                  marginRight: '4px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export type { LifecycleBarProps };
