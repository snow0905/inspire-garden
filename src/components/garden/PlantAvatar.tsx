// src/components/garden/PlantAvatar.tsx
'use client';

import { motion } from 'framer-motion';
import type { PlantFamily, PlantStage } from '@/types';
import { COLORS } from '@/lib/constants';

interface PlantAvatarProps {
  plantFamily: PlantFamily;
  stage: PlantStage;
  size?: number;
  className?: string;
}

// 柔和的暖绿色系
const LEAF_GREEN = '#8bab7a';
const LEAF_LIGHT = '#a3b899';
const LEAF_DARK = '#6b8b6b';
const TRUNK_BROWN = '#947453';
const TRUNK_LIGHT = '#b8957a';
const FLOWER_PINK = '#f0c4c0';
const FLOWER_CORAL = '#ed726e';
const FRUIT_GOLD = '#e5c872';
const FRUIT_ORANGE = '#e8a850';
const SOIL_BROWN = '#c4a882';

// ============ 绘制辅助函数 ============

/** 土壤小弧线 */
function SoilLine({ y, cx, r }: { y: number; cx: number; r: number }) {
  return (
    <ellipse cx={cx} cy={y} rx={r} ry={r * 0.25} fill={SOIL_BROWN} opacity={0.6} />
  );
}

// ---------- tree 系列 ----------

function TreeSeed() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      <circle cx={60} cy={80} r={6} fill={TRUNK_BROWN} />
      <path d="M60 80 Q58 72 54 70" stroke={LEAF_GREEN} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function TreeSprout() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      <line x1={60} y1={88} x2={60} y2={60} stroke={TRUNK_BROWN} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={52} cy={62} rx={10} ry={5} fill={LEAF_GREEN} transform="rotate(-30 52 62)" />
      <ellipse cx={68} cy={58} rx={10} ry={5} fill={LEAF_LIGHT} transform="rotate(25 68 58)" />
    </g>
  );
}

function TreeGrowing() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={56} y={55} width={8} height={37} rx={4} fill={TRUNK_BROWN} />
      <circle cx={60} cy={42} r={28} fill={LEAF_GREEN} opacity={0.85} />
      <circle cx={60} cy={42} r={22} fill={LEAF_LIGHT} opacity={0.5} />
      {/* 小叶子点缀 */}
      <ellipse cx={38} cy={44} rx={8} ry={4} fill={LEAF_DARK} opacity={0.5} transform="rotate(-20 38 44)" />
      <ellipse cx={82} cy={40} rx={8} ry={4} fill={LEAF_DARK} opacity={0.5} transform="rotate(15 82 40)" />
    </g>
  );
}

function TreeBloom() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={56} y={55} width={8} height={37} rx={4} fill={TRUNK_BROWN} />
      <circle cx={60} cy={40} r={30} fill={LEAF_GREEN} opacity={0.85} />
      <circle cx={60} cy={40} r={24} fill={LEAF_LIGHT} opacity={0.45} />
      {/* 花朵 */}
      <circle cx={48} cy={30} r={6} fill={FLOWER_PINK} />
      <circle cx={72} cy={32} r={6} fill={FLOWER_PINK} />
      <circle cx={60} cy={22} r={6} fill={FLOWER_PINK} />
      <circle cx={42} cy={42} r={5} fill={FLOWER_PINK} />
      <circle cx={78} cy={44} r={5} fill={FLOWER_PINK} />
    </g>
  );
}

function TreeFruit() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={56} y={55} width={8} height={37} rx={4} fill={TRUNK_BROWN} />
      <circle cx={60} cy={40} r={30} fill={LEAF_GREEN} opacity={0.85} />
      <circle cx={60} cy={40} r={24} fill={LEAF_LIGHT} opacity={0.45} />
      {/* 金色果实 */}
      <circle cx={46} cy={34} r={6} fill={FRUIT_GOLD} />
      <circle cx={74} cy={36} r={6} fill={FRUIT_GOLD} />
      <circle cx={60} cy={26} r={6} fill={FRUIT_ORANGE} />
      <circle cx={42} cy={48} r={5} fill={FRUIT_ORANGE} />
      <circle cx={78} cy={48} r={5} fill={FRUIT_GOLD} />
    </g>
  );
}

// ---------- flower 系列 ----------

function FlowerSeed() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={20} />
      <circle cx={60} cy={80} r={5} fill={TRUNK_BROWN} />
      <path d="M60 80 Q58 73 56 72" stroke={LEAF_GREEN} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function FlowerSprout() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      <line x1={60} y1={88} x2={60} y2={58} stroke={LEAF_GREEN} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx={50} cy={64} rx={9} ry={4} fill={LEAF_GREEN} transform="rotate(-35 50 64)" />
      <ellipse cx={70} cy={60} rx={9} ry={4} fill={LEAF_LIGHT} transform="rotate(30 70 60)" />
    </g>
  );
}

function FlowerGrowing() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <line x1={60} y1={92} x2={60} y2={38} stroke={LEAF_GREEN} strokeWidth="3.5" strokeLinecap="round" />
      {/* 叶片 */}
      <ellipse cx={44} cy={70} rx={14} ry={6} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-40 44 70)" />
      <ellipse cx={76} cy={65} rx={14} ry={6} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(35 76 65)" />
      <ellipse cx={48} cy={50} rx={10} ry={4} fill={LEAF_GREEN} opacity={0.7} transform="rotate(-25 48 50)" />
      <ellipse cx={72} cy={46} rx={10} ry={4} fill={LEAF_LIGHT} opacity={0.7} transform="rotate(20 72 46)" />
      {/* 花苞 */}
      <circle cx={60} cy={34} r={7} fill={FLOWER_PINK} />
      <circle cx={60} cy={34} r={4} fill={FLOWER_CORAL} opacity={0.4} />
    </g>
  );
}

function FlowerBloom() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <line x1={60} y1={92} x2={60} y2={44} stroke={LEAF_GREEN} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={46} cy={72} rx={13} ry={5} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-35 46 72)" />
      <ellipse cx={74} cy={68} rx={13} ry={5} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(30 74 68)" />
      {/* 盛开的花朵 - 5瓣 */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={60 + 10 * Math.cos((angle * Math.PI) / 180)}
          cy={36 + 10 * Math.sin((angle * Math.PI) / 180)}
          rx={7}
          ry={5}
          fill={FLOWER_PINK}
          transform={`rotate(${angle} ${60 + 10 * Math.cos((angle * Math.PI) / 180)} ${36 + 10 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx={60} cy={36} r={5} fill={FRUIT_GOLD} />
    </g>
  );
}

function FlowerFruit() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <line x1={60} y1={92} x2={60} y2={44} stroke={LEAF_GREEN} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={46} cy={72} rx={13} ry={5} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-35 46 72)" />
      <ellipse cx={74} cy={68} rx={13} ry={5} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(30 74 68)" />
      {/* 凋谢花瓣 + 种荚 */}
      <circle cx={60} cy={36} r={6} fill={TRUNK_BROWN} opacity={0.7} />
      <ellipse cx={52} cy={34} rx={5} ry={3} fill={FLOWER_PINK} opacity={0.5} transform="rotate(-30 52 34)" />
      <ellipse cx={68} cy={34} rx={5} ry={3} fill={FLOWER_PINK} opacity={0.5} transform="rotate(30 68 34)" />
      <circle cx={60} cy={28} r={3.5} fill={FRUIT_GOLD} />
    </g>
  );
}

// ---------- fruitTree 系列 ----------

function FruitTreeSeed() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={20} />
      <circle cx={60} cy={82} r={5} fill={TRUNK_BROWN} />
      <path d="M60 82 Q59 76 56 74" stroke={LEAF_GREEN} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function FruitTreeSprout() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      <line x1={60} y1={88} x2={60} y2={62} stroke={TRUNK_BROWN} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx={52} cy={64} rx={10} ry={5} fill={LEAF_GREEN} transform="rotate(-30 52 64)" />
      <ellipse cx={68} cy={60} rx={10} ry={5} fill={LEAF_LIGHT} transform="rotate(25 68 60)" />
    </g>
  );
}

function FruitTreeGrowing() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={55} y={55} width={10} height={37} rx={5} fill={TRUNK_BROWN} />
      <ellipse cx={60} cy={40} rx={34} ry={24} fill={LEAF_GREEN} opacity={0.85} />
      <ellipse cx={60} cy={36} rx={28} ry={18} fill={LEAF_LIGHT} opacity={0.5} />
    </g>
  );
}

function FruitTreeBloom() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={55} y={55} width={10} height={37} rx={5} fill={TRUNK_BROWN} />
      <ellipse cx={60} cy={40} rx={34} ry={24} fill={LEAF_GREEN} opacity={0.85} />
      <ellipse cx={60} cy={36} rx={28} ry={18} fill={LEAF_LIGHT} opacity={0.5} />
      {/* 白粉色小花 */}
      <circle cx={44} cy={36} r={5} fill={FLOWER_PINK} />
      <circle cx={60} cy={28} r={5} fill={FLOWER_PINK} />
      <circle cx={76} cy={36} r={5} fill={FLOWER_PINK} />
      <circle cx={52} cy={52} r={4} fill={FLOWER_PINK} />
      <circle cx={68} cy={52} r={4} fill={FLOWER_PINK} />
    </g>
  );
}

function FruitTreeFruit() {
  return (
    <g>
      <SoilLine y={92} cx={60} r={24} />
      <rect x={55} y={55} width={10} height={37} rx={5} fill={TRUNK_BROWN} />
      <ellipse cx={60} cy={40} rx={34} ry={24} fill={LEAF_GREEN} opacity={0.85} />
      <ellipse cx={60} cy={36} rx={28} ry={18} fill={LEAF_LIGHT} opacity={0.5} />
      {/* 橙色果实 */}
      <circle cx={42} cy={38} r={6} fill={FRUIT_ORANGE} />
      <circle cx={62} cy={28} r={6} fill={FRUIT_ORANGE} />
      <circle cx={78} cy={40} r={6} fill={FRUIT_ORANGE} />
      <circle cx={54} cy={52} r={5} fill={FRUIT_GOLD} />
      <circle cx={68} cy={50} r={5} fill={FRUIT_GOLD} />
    </g>
  );
}

// ---------- herb 系列 ----------

function HerbSeed() {
  return (
    <g>
      <SoilLine y={88} cx={60} r={18} />
      <circle cx={60} cy={82} r={4} fill={TRUNK_BROWN} />
      <path d="M60 82 Q58 77 57 76" stroke={LEAF_LIGHT} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function HerbSprout() {
  return (
    <g>
      <SoilLine y={88} cx={60} r={20} />
      {[48, 60, 72].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1={86} x2={cx} y2={64} stroke={LEAF_GREEN} strokeWidth="2" strokeLinecap="round" />
          <ellipse cx={cx - 7} cy={66} rx={7} ry={3.5} fill={LEAF_GREEN} opacity={0.8} transform={`rotate(-25 ${cx - 7} 66)`} />
          <ellipse cx={cx + 7} cy={64} rx={7} ry={3.5} fill={LEAF_LIGHT} opacity={0.8} transform={`rotate(25 ${cx + 7} 64)`} />
        </g>
      ))}
    </g>
  );
}

function HerbGrowing() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      {[44, 55, 65, 76].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1={88} x2={cx} y2={52 - i * 5} stroke={i % 2 === 0 ? LEAF_GREEN : LEAF_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx={cx - 8} cy={56 - i * 5} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform={`rotate(-30 ${cx - 8} ${56 - i * 5})`} />
          <ellipse cx={cx + 8} cy={52 - i * 5} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform={`rotate(30 ${cx + 8} ${52 - i * 5})`} />
        </g>
      ))}
    </g>
  );
}

function HerbBloom() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      {[44, 55, 65, 76].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1={88} x2={cx} y2={52 - i * 5} stroke={i % 2 === 0 ? LEAF_GREEN : LEAF_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx={cx - 8} cy={56 - i * 5} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform={`rotate(-30 ${cx - 8} ${56 - i * 5})`} />
          <ellipse cx={cx + 8} cy={52 - i * 5} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform={`rotate(30 ${cx + 8} ${52 - i * 5})`} />
          {/* 小碎花 */}
          <circle cx={cx - 4} cy={46 - i * 5} r={3} fill={FLOWER_PINK} />
          <circle cx={cx + 4} cy={44 - i * 5} r={3} fill={FLOWER_PINK} />
        </g>
      ))}
    </g>
  );
}

function HerbFruit() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={22} />
      {[44, 55, 65, 76].map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1={88} x2={cx} y2={52 - i * 5} stroke={i % 2 === 0 ? LEAF_GREEN : LEAF_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx={cx - 8} cy={56 - i * 5} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform={`rotate(-30 ${cx - 8} ${56 - i * 5})`} />
          <ellipse cx={cx + 8} cy={52 - i * 5} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform={`rotate(30 ${cx + 8} ${52 - i * 5})`} />
          {/* 小浆果 */}
          <circle cx={cx - 3} cy={44 - i * 5} r={3} fill={FRUIT_GOLD} />
          <circle cx={cx + 3} cy={42 - i * 5} r={3} fill={FRUIT_ORANGE} />
        </g>
      ))}
    </g>
  );
}

// ---------- vine 系列 ----------

function VineSeed() {
  return (
    <g>
      <SoilLine y={88} cx={60} r={18} />
      <circle cx={60} cy={82} r={4} fill={TRUNK_BROWN} />
      <path d="M60 82 Q62 76 65 74" stroke={LEAF_GREEN} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function VineSprout() {
  return (
    <g>
      <SoilLine y={88} cx={60} r={20} />
      <path d="M60 86 Q58 74 62 66 Q66 58 70 52" stroke={LEAF_GREEN} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx={58} cy={72} rx={7} ry={4} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-30 58 72)" />
      <ellipse cx={66} cy={62} rx={7} ry={4} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(20 66 62)" />
    </g>
  );
}

function VineGrowing() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={20} />
      <path d="M60 88 Q56 76 62 64 Q68 52 64 40 Q58 28 65 22" stroke={LEAF_GREEN} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 藤蔓上的叶子 */}
      <ellipse cx={52} cy={73} rx={10} ry={5} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-40 52 73)" />
      <ellipse cx={68} cy={62} rx={10} ry={5} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(25 68 62)" />
      <ellipse cx={58} cy={48} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform="rotate(-20 58 48)" />
      <ellipse cx={66} cy={35} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform="rotate(15 66 35)" />
    </g>
  );
}

function VineBloom() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={20} />
      <path d="M60 88 Q56 76 62 64 Q68 52 64 40 Q58 28 65 22" stroke={LEAF_GREEN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx={52} cy={73} rx={10} ry={5} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-40 52 73)" />
      <ellipse cx={68} cy={62} rx={10} ry={5} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(25 68 62)" />
      <ellipse cx={58} cy={48} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform="rotate(-20 58 48)" />
      <ellipse cx={66} cy={35} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform="rotate(15 66 35)" />
      {/* 藤蔓花朵 */}
      <circle cx={52} cy={65} r={5} fill={FLOWER_PINK} />
      <circle cx={70} cy={52} r={5} fill={FLOWER_PINK} />
      <circle cx={60} cy={30} r={5} fill={FLOWER_PINK} />
    </g>
  );
}

function VineFruit() {
  return (
    <g>
      <SoilLine y={90} cx={60} r={20} />
      <path d="M60 88 Q56 76 62 64 Q68 52 64 40 Q58 28 65 22" stroke={LEAF_GREEN} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx={52} cy={73} rx={10} ry={5} fill={LEAF_GREEN} opacity={0.8} transform="rotate(-40 52 73)" />
      <ellipse cx={68} cy={62} rx={10} ry={5} fill={LEAF_LIGHT} opacity={0.8} transform="rotate(25 68 62)" />
      <ellipse cx={58} cy={48} rx={9} ry={4} fill={LEAF_GREEN} opacity={0.75} transform="rotate(-20 58 48)" />
      <ellipse cx={66} cy={35} rx={9} ry={4} fill={LEAF_LIGHT} opacity={0.75} transform="rotate(15 66 35)" />
      {/* 藤蔓小果实 */}
      <circle cx={52} cy={68} r={4} fill={FRUIT_GOLD} />
      <circle cx={68} cy={55} r={4} fill={FRUIT_ORANGE} />
      <circle cx={58} cy={33} r={4} fill={FRUIT_GOLD} />
    </g>
  );
}

// ============ 组合映射 ============

const plantRenderers: Record<PlantFamily, Record<PlantStage, () => React.ReactElement>> = {
  tree: {
    seed: TreeSeed,
    sprout: TreeSprout,
    growing: TreeGrowing,
    bloom: TreeBloom,
    fruit: TreeFruit,
  },
  flower: {
    seed: FlowerSeed,
    sprout: FlowerSprout,
    growing: FlowerGrowing,
    bloom: FlowerBloom,
    fruit: FlowerFruit,
  },
  fruitTree: {
    seed: FruitTreeSeed,
    sprout: FruitTreeSprout,
    growing: FruitTreeGrowing,
    bloom: FruitTreeBloom,
    fruit: FruitTreeFruit,
  },
  herb: {
    seed: HerbSeed,
    sprout: HerbSprout,
    growing: HerbGrowing,
    bloom: HerbBloom,
    fruit: HerbFruit,
  },
  vine: {
    seed: VineSeed,
    sprout: VineSprout,
    growing: VineGrowing,
    bloom: VineBloom,
    fruit: VineFruit,
  },
};

// ============ 主组件 ============

export function PlantAvatar({ plantFamily, stage, size = 120, className = '' }: PlantAvatarProps) {
  const renderPlant = plantRenderers[plantFamily]?.[stage];
  if (!renderPlant) return null;

  const needSway = stage === 'growing';
  const needSparkle = stage === 'bloom';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 背后柔光圆形背景 */}
      <svg width={size} height={size} viewBox="0 0 120 120" className="absolute inset-0">
        <defs>
          <radialGradient id={`glow-${plantFamily}-${stage}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.25} />
            <stop offset="50%" stopColor={COLORS.mistPink} stopOpacity={0.15} />
            <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
          </radialGradient>
          {/* 闪烁光点滤镜 */}
          <filter id={`sparkle-${plantFamily}-${stage}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="55" fill={`url(#glow-${plantFamily}-${stage})`} />
      </svg>

      {/* 植物主体 */}
      <motion.svg
        width={size * 0.78}
        height={size * 0.78}
        viewBox="0 0 120 120"
        className="relative z-10"
        animate={
          needSway
            ? { rotate: [0, 1.5, 0, -1.5, 0] }
            : {}
        }
        transition={
          needSway
            ? { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
            : {}
        }
      >
        {renderPlant()}

        {/* bloom 阶段：闪烁光点 */}
        {needSparkle && (
          <>
            <motion.circle
              cx="40" cy="40" r="1.5" fill={COLORS.gold}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              filter={`url(#sparkle-${plantFamily}-${stage})`}
            />
            <motion.circle
              cx="80" cy="45" r="1.5" fill={COLORS.gold}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.6 }}
              filter={`url(#sparkle-${plantFamily}-${stage})`}
            />
            <motion.circle
              cx="60" cy="25" r="1.5" fill={COLORS.gold}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 1.2 }}
              filter={`url(#sparkle-${plantFamily}-${stage})`}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
}
