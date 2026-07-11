// src/components/garden/GrowthFeedback.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface GrowthFeedbackProps {
  previousScore: number;
  currentScore: number;
  narrativeText: string;
  className?: string;
}

/** 数字滚动 Hook */
function useCountUp(target: number, duration: number = 1200): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startValue = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

export function GrowthFeedback({
  previousScore,
  currentScore,
  narrativeText,
  className = '',
}: GrowthFeedbackProps) {
  const displayScore = useCountUp(currentScore, 1200);
  const diff = currentScore - previousScore;
  const progressPercent = Math.min((currentScore / 100) * 100, 100);
  const previousPercent = Math.min((previousScore / 100) * 100, 100);

  return (
    <div
      className={className}
      style={
        {
          '--color-mistPink': COLORS.mistPink,
          '--color-warmBrown': COLORS.warmBrown,
          '--color-deepBrown': COLORS.deepBrown,
          '--color-gold': COLORS.gold,
          '--color-coral': COLORS.coral,
          '--color-textPrimary': COLORS.textPrimary,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col items-center gap-4 py-4">
        {/* 成长值数字 + 贡献值 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-baseline gap-3"
        >
          <span
            className="text-4xl font-light tracking-wide"
            style={{ color: COLORS.textPrimary }}
          >
            {displayScore}
          </span>
          {diff > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-lg font-medium"
              style={{ color: COLORS.coral }}
            >
              +{diff}
            </motion.span>
          )}
        </motion.div>

        {/* 成长条 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-xs"
        >
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: `${COLORS.mistPink}66` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS.mistPink} 0%, ${COLORS.gold} 100%)`,
              }}
              initial={{ width: `${previousPercent}%` }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
              0
            </span>
            <span className="text-xs" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
              100
            </span>
          </div>
        </motion.div>

        {/* 叙事文案 */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm leading-relaxed text-center max-w-xs"
          style={{ color: COLORS.deepBrown }}
        >
          {narrativeText}
        </motion.p>
      </div>
    </div>
  );
}
