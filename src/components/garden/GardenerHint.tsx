// src/components/garden/GardenerHint.tsx
'use client';

import { motion } from 'framer-motion';
import type { PlantStage } from '@/types';
import { COLORS, getGardenerHint } from '@/lib/constants';

interface GardenerHintProps {
  stage: PlantStage;
  seedCount: number;
  className?: string;
}

/** 小园丁精灵 SVG — 戴草帽的圆润可爱形象 */
function GardenerSprite() {
  return (
    <svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-label="小园丁精灵"
      role="img"
    >
      {/* 草帽帽檐 */}
      <ellipse cx="16" cy="10" rx="13" ry="4" fill="#d4b896" stroke="#c4a882" strokeWidth="0.6" />
      {/* 草帽顶部 */}
      <ellipse cx="16" cy="7" rx="8" ry="5" fill="#e0c9a8" stroke="#d4b896" strokeWidth="0.6" />
      {/* 草帽纹理 */}
      <path d="M 10 6 Q 16 4 22 6" stroke="#d4b896" strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* 草帽顶部小圆球 */}
      <circle cx="16" cy="3" r="2" fill="#e8d4b8" />
      {/* 脸 — 圆润可爱 */}
      <circle cx="16" cy="18" r="9" fill="#ffe4c9" stroke="#e8cdb0" strokeWidth="0.5" />
      {/* 腮红 */}
      <circle cx="11" cy="20" r="2.5" fill="#f0c4c0" opacity="0.5" />
      <circle cx="21" cy="20" r="2.5" fill="#f0c4c0" opacity="0.5" />
      {/* 眼睛 — 弯弯的笑眼 */}
      <path d="M 11 16 Q 12.5 14.5 14 16" stroke="#69562c" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M 18 16 Q 19.5 14.5 21 16" stroke="#69562c" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* 微笑 */}
      <path d="M 13 21 Q 16 23.5 19 21" stroke="#947453" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* 身体 — 小围裙 */}
      <ellipse cx="16" cy="32" rx="8" ry="6" fill="#c5d4b4" stroke="#a3b899" strokeWidth="0.5" />
      {/* 围裙带子 */}
      <line x1="10" y1="28" x2="10" y2="34" stroke="#a3b899" strokeWidth="0.8" />
      <line x1="22" y1="28" x2="22" y2="34" stroke="#a3b899" strokeWidth="0.8" />
      {/* 小手 */}
      <circle cx="8" cy="30" r="2.5" fill="#ffe4c9" />
      <circle cx="24" cy="30" r="2.5" fill="#ffe4c9" />
    </svg>
  );
}

export function GardenerHint({ stage, seedCount, className = '' }: GardenerHintProps) {
  const hint = getGardenerHint(stage, seedCount);

  return (
    <motion.div
      className={`relative inline-flex items-start gap-2.5 px-4 py-3 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.65)',
        borderRadius: '20px',
        boxShadow: '0 2px 16px rgba(148, 116, 83, 0.1)',
        maxWidth: '280px',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* 左下角小三角尾巴 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '24px',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid rgba(255,255,255,0.65)',
        }}
      />

      {/* 戴草帽的小园丁精灵 */}
      <GardenerSprite />

      {/* 提示文案 */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="text-[11px] font-medium"
          style={{ color: COLORS.deepBrown, opacity: 0.7 }}
        >
          小园丁提示
        </span>
        <p
          className="text-[13px] leading-relaxed m-0"
          style={{ color: COLORS.textPrimary }}
        >
          {hint}
        </p>
      </div>
    </motion.div>
  );
}

export type { GardenerHintProps };
