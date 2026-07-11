// src/components/garden/GardenScene.tsx
'use client';

import { motion } from 'framer-motion';
import type { PlantFamily, PlantStage } from '@/types';
import { COLORS, STAGE_LABELS } from '@/lib/constants';
import { PlantAvatar } from './PlantAvatar';
import { GardenerHint } from './GardenerHint';

interface GardenSceneProps {
  plantFamily: PlantFamily;
  stage: PlantStage;
  topicName: string;
  growthScore: number;
  seedCount: number;
  gardenType: string;
  className?: string;
}

/** 各阶段静态图片映射 — 有图片的 stage 会直接用图片替换 SVG 场景+植物+木牌 */
const STAGE_IMAGES: Partial<Record<PlantStage, string>> = {
  seed: '/assets/garden/seed.webp',
  sprout: '/assets/garden/sprout.webp',
  growing: '/assets/garden/growing.webp',
  bloom: '/assets/garden/bloom.webp',
  fruit: '/assets/garden/fruit.webp',
};

/** 草地颜色系 */
const GRASS_DARK = '#8bab7a';
const GRASS_MID = '#a3b899';
const GRASS_LIGHT = '#c5d4b4';
const PATH_COLOR = '#c4a882';
const WOOD_COLOR = '#947453';
const FLOWER_PINK = '#f0c4c0';
const SOIL_COLOR = '#8b7355';
const TREE_GREEN = '#9dbb8a';
const TREE_DARK = '#7a9a6a';

/** 浮动光点位置 — 覆盖全场景，上部标题背后区域也散布 */
const FLOATING_LIGHTS = [
  // 上部（标题背后区域）
  { cx: 50, cy: 25, r: 2.5, delay: 0 },
  { cx: 180, cy: 20, r: 2, delay: 0.8 },
  { cx: 320, cy: 30, r: 3, delay: 1.6 },
  { cx: 100, cy: 65, r: 2, delay: 2.2 },
  { cx: 280, cy: 55, r: 2.5, delay: 0.4 },
  { cx: 350, cy: 75, r: 2, delay: 1.0 },
  { cx: 30, cy: 110, r: 3, delay: 1.8 },
  { cx: 220, cy: 90, r: 2, delay: 2.8 },
  { cx: 370, cy: 130, r: 2.5, delay: 0.6 },
  // 中部
  { cx: 60, cy: 190, r: 3, delay: 2.4 },
  { cx: 340, cy: 210, r: 2.5, delay: 0.3 },
  { cx: 150, cy: 170, r: 2, delay: 3.0 },
  { cx: 280, cy: 180, r: 2.5, delay: 1.5 },
  // 下部
  { cx: 30, cy: 320, r: 2, delay: 0.9 },
  { cx: 370, cy: 300, r: 2.5, delay: 2.2 },
  { cx: 80, cy: 420, r: 2, delay: 1.2 },
  { cx: 320, cy: 400, r: 2.5, delay: 3.2 },
];

/** 柔焦花朵 — 散布在草地各处 */
const BLUR_FLOWERS = [
  { cx: 40, cy: 300, r: 7, fill: FLOWER_PINK },
  { cx: 360, cy: 310, r: 6, fill: COLORS.gold },
  { cx: 100, cy: 360, r: 5, fill: FLOWER_PINK },
  { cx: 320, cy: 350, r: 6, fill: COLORS.gold },
  { cx: 60, cy: 400, r: 4.5, fill: FLOWER_PINK },
  { cx: 350, cy: 390, r: 5, fill: COLORS.gold },
  { cx: 180, cy: 420, r: 4, fill: FLOWER_PINK },
  { cx: 280, cy: 430, r: 5.5, fill: COLORS.gold },
  { cx: 50, cy: 450, r: 4, fill: FLOWER_PINK },
  { cx: 340, cy: 460, r: 4.5, fill: COLORS.gold },
  { cx: 130, cy: 470, r: 3.5, fill: FLOWER_PINK },
  { cx: 250, cy: 475, r: 4, fill: COLORS.gold },
];

/** 上部树影 — 远景点缀，标题区背后更丰富的层次 */
const TREE_SHADOWS = [
  { cx: 60, cy: 40, rx: 50, ry: 60, fill: TREE_DARK, opacity: 0.16 },
  { cx: 350, cy: 30, rx: 55, ry: 65, fill: TREE_GREEN, opacity: 0.14 },
  { cx: 380, cy: 65, rx: 40, ry: 50, fill: TREE_DARK, opacity: 0.11 },
  { cx: 20, cy: 75, rx: 35, ry: 45, fill: TREE_GREEN, opacity: 0.12 },
  { cx: 200, cy: 25, rx: 60, ry: 50, fill: TREE_GREEN, opacity: 0.09 },
  { cx: 130, cy: 55, rx: 40, ry: 45, fill: TREE_DARK, opacity: 0.10 },
  { cx: 300, cy: 50, rx: 45, ry: 40, fill: TREE_GREEN, opacity: 0.10 },
  { cx: 50, cy: 130, rx: 30, ry: 35, fill: TREE_DARK, opacity: 0.08 },
];

/** 小型点缀花朵（非模糊，清晰可见） */
const SMALL_FLOWERS = [
  { cx: 45, cy: 370, r: 3, fill: FLOWER_PINK, opacity: 0.7 },
  { cx: 355, cy: 365, r: 2.5, fill: '#fff5e0', opacity: 0.65 },
  { cx: 90, cy: 445, r: 2, fill: FLOWER_PINK, opacity: 0.6 },
  { cx: 310, cy: 440, r: 2.5, fill: '#fff5e0', opacity: 0.6 },
  { cx: 160, cy: 460, r: 2, fill: FLOWER_PINK, opacity: 0.55 },
  { cx: 270, cy: 465, r: 2, fill: '#fff5e0', opacity: 0.55 },
];

export function GardenScene({
  plantFamily,
  stage,
  topicName,
  growthScore,
  seedCount,
  gardenType,
  className = '',
}: GardenSceneProps) {
  const stageImage = STAGE_IMAGES[stage];

  return (
    <motion.div
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={{ minHeight: '560px', borderRadius: '26px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {stageImage ? (
        /* ======== 图片模式：一张静态图覆盖场景 + 植物 + 木牌 ======== */
        <img
          src={stageImage}
          alt={`${STAGE_LABELS[stage]} - ${topicName}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
      ) : (
        <>
          {/* ======== SVG 背景层（图片未就绪时的兜底） ======== */}
          <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 540"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 天空渐变 — 更柔和的奶油白到浅绿 */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.cream} />
            <stop offset="40%" stopColor="#f7f2e8" />
            <stop offset="100%" stopColor="#eef0e0" />
          </linearGradient>

          {/* 柔焦滤镜（花朵） */}
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>

          {/* 强柔焦滤镜（树影） */}
          <filter id="treeBlur">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          {/* 发光滤镜（光点） */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 土壤渐变 */}
          <radialGradient id="soilGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#a08464" />
            <stop offset="100%" stopColor={SOIL_COLOR} />
          </radialGradient>
        </defs>

        {/* 天空背景 */}
        <rect x="0" y="0" width="400" height="540" fill="url(#skyGrad)" />

        {/* 远山/树影 — 柔和的上部装饰 */}
        {TREE_SHADOWS.map((t, i) => (
          <ellipse
            key={`tree-${i}`}
            cx={t.cx}
            cy={t.cy}
            rx={t.rx}
            ry={t.ry}
            fill={t.fill}
            opacity={t.opacity}
            filter="url(#treeBlur)"
          />
        ))}

        {/* 藤蔓/树枝延伸到顶部 — 标题背后可见 */}
        <g opacity="0.14">
          {/* 左侧藤蔓 */}
          <path
            d="M 0 0 Q 40 30 60 80 Q 70 60 90 40"
            stroke={GRASS_DARK}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 0 40 Q 25 65 50 95 Q 55 75 60 55"
            stroke={GRASS_MID}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* 右侧藤蔓 */}
          <path
            d="M 400 0 Q 360 25 340 70 Q 330 50 310 35"
            stroke={GRASS_DARK}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 400 50 Q 370 75 345 100 Q 340 80 345 60"
            stroke={GRASS_MID}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* 顶部垂藤 */}
          <path
            d="M 150 0 Q 155 25 145 50 Q 140 60 148 70"
            stroke={GRASS_LIGHT}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 280 0 Q 275 20 285 40"
            stroke={GRASS_LIGHT}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 左边小叶片点缀 — 更多更丰富 */}
        <g opacity="0.14">
          <ellipse cx="15" cy="50" rx="20" ry="9" fill={GRASS_MID} transform="rotate(-22 15 50)" />
          <ellipse cx="12" cy="90" rx="16" ry="7" fill={GRASS_LIGHT} transform="rotate(-18 12 90)" />
          <ellipse cx="20" cy="130" rx="14" ry="6" fill={GRASS_MID} transform="rotate(-15 20 130)" />
          <ellipse cx="8" cy="170" rx="12" ry="5" fill={GRASS_LIGHT} transform="rotate(-10 8 170)" />
        </g>

        {/* 右边小叶片点缀 — 延伸到卡片区域 */}
        <g opacity="0.14">
          <ellipse cx="385" cy="45" rx="20" ry="9" fill={GRASS_MID} transform="rotate(22 385 45)" />
          <ellipse cx="388" cy="85" rx="16" ry="7" fill={GRASS_LIGHT} transform="rotate(18 388 85)" />
          <ellipse cx="382" cy="125" rx="14" ry="6" fill={GRASS_MID} transform="rotate(15 382 125)" />
          <ellipse cx="392" cy="165" rx="12" ry="5" fill={GRASS_LIGHT} transform="rotate(10 392 165)" />
        </g>

        {/* 右侧溢出藤蔓 — 向卡片栏延伸，建立花园融合感 */}
        <g opacity="0.11">
          <path
            d="M 400 100 Q 408 120 402 145 Q 398 160 405 175"
            stroke={GRASS_DARK}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="404" cy="148" rx="10" ry="5" fill={GRASS_MID} transform="rotate(15 404 148)" />
          <ellipse cx="402" cy="170" rx="8" ry="4" fill={GRASS_LIGHT} transform="rotate(8 402 170)" />
          <path
            d="M 400 180 Q 407 195 403 215 Q 400 230 406 245"
            stroke={GRASS_DARK}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="404" cy="218" rx="7" ry="3.5" fill={GRASS_MID} transform="rotate(12 404 218)" />
          <ellipse cx="403" cy="238" rx="6" ry="3" fill={GRASS_LIGHT} transform="rotate(5 403 238)" />
        </g>

        {/* 右侧光点 — 向卡片过渡 */}
        <g>
          {[
            { cx: 393, cy: 130, r: 2, delay: 1.3 },
            { cx: 396, cy: 200, r: 2.5, delay: 0.7 },
            { cx: 394, cy: 260, r: 1.8, delay: 2.1 },
            { cx: 398, cy: 310, r: 2.2, delay: 1.8 },
          ].map((l, i) => (
            <circle
              key={`edge-light-${i}`}
              cx={l.cx}
              cy={l.cy}
              r={l.r}
              fill={COLORS.gold}
              opacity={0.15}
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.05;0.22;0.05"
                dur={`${3 + (i % 2) * 1.2}s`}
                begin={`${l.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* 多层椭圆草地（从远到近）—— 加厚加宽，更明确的草坡层次 */}
        <ellipse cx="200" cy="410" rx="310" ry="90" fill={GRASS_LIGHT} opacity="0.50" />
        <ellipse cx="150" cy="430" rx="250" ry="80" fill={GRASS_MID} opacity="0.58" />
        <ellipse cx="260" cy="445" rx="270" ry="85" fill={GRASS_LIGHT} opacity="0.45" />
        <ellipse cx="200" cy="460" rx="330" ry="95" fill={GRASS_DARK} opacity="0.55" />
        <ellipse cx="180" cy="480" rx="290" ry="90" fill={GRASS_MID} opacity="0.48" />
        <ellipse cx="210" cy="505" rx="340" ry="105" fill={GRASS_DARK} opacity="0.52" />

        {/* 蜿蜒小路（贝塞尔曲线） */}
        <path
          d="M 100 540 Q 140 450 190 400 Q 240 350 290 330"
          stroke={PATH_COLOR}
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M 100 540 Q 140 450 190 400 Q 240 350 290 330"
          stroke={PATH_COLOR}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />

        {/* 土壤堆 — 种子的家，更大更明确 */}
        <ellipse cx="200" cy="348" rx="62" ry="22" fill={SOIL_COLOR} opacity="0.65" />
        <ellipse cx="200" cy="343" rx="54" ry="16" fill="url(#soilGrad)" opacity="0.75" />
        <ellipse cx="200" cy="339" rx="42" ry="10" fill="#a08464" opacity="0.35" />
        {/* 土壤上小裂纹/纹理 */}
        <path d="M 168 342 Q 180 338 192 341" stroke="#7a6348" strokeWidth="0.8" fill="none" opacity="0.35" />
        <path d="M 208 340 Q 220 335 232 340" stroke="#7a6348" strokeWidth="0.8" fill="none" opacity="0.35" />
        <path d="M 185 348 Q 195 345 205 347" stroke="#7a6348" strokeWidth="0.6" fill="none" opacity="0.25" />
        {/* 小石子 */}
        <ellipse cx="160" cy="345" rx="3.5" ry="2.5" fill="#b8a080" opacity="0.4" />
        <ellipse cx="242" cy="342" rx="3" ry="2" fill="#c4a882" opacity="0.35" />
        <ellipse cx="175" cy="355" rx="2.5" ry="1.8" fill="#b8a080" opacity="0.3" />
        <ellipse cx="228" cy="352" rx="2" ry="1.5" fill="#c4a882" opacity="0.3" />

        {/* 柔焦小花朵 */}
        {BLUR_FLOWERS.map((f, i) => (
          <circle
            key={`flower-${i}`}
            cx={f.cx}
            cy={f.cy}
            r={f.r}
            fill={f.fill}
            opacity={0.45}
            filter="url(#softBlur)"
          />
        ))}

        {/* 清晰小花朵 */}
        {SMALL_FLOWERS.map((f, i) => (
          <g key={`sflower-${i}`}>
            <circle cx={f.cx} cy={f.cy} r={f.r} fill={f.fill} opacity={f.opacity} />
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.8} fill="#fff" opacity={f.opacity * 0.5} />
          </g>
        ))}

        {/* 浮动光点 */}
        {FLOATING_LIGHTS.map((l, i) => (
          <circle
            key={`light-${i}`}
            cx={l.cx}
            cy={l.cy}
            r={l.r}
            fill={COLORS.gold}
            opacity={0.3}
            filter="url(#glow)"
          >
            <animate
              attributeName="opacity"
              values="0.12;0.45;0.12"
              dur={`${3.5 + (i % 3) * 0.8}s`}
              begin={`${l.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* 小草丛装饰 — 散布在土壤周围，更大更密 */}
        <g opacity="0.38">
          {[152, 165, 178, 192, 206, 220, 235, 248].map((cx, i) => (
            <path
              key={`grass-${i}`}
              d={`M ${cx} 345 Q ${cx - 4} 328 ${cx - 3} 316`}
              stroke={i % 2 === 0 ? GRASS_DARK : GRASS_MID}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 右下角浇水壶剪影 — 更大更明显 */}
        <g opacity="0.25" transform="translate(290, 340)">
          {/* 壶身 */}
          <ellipse cx="30" cy="30" rx="24" ry="18" fill={COLORS.deepBrown} />
          {/* 壶颈 */}
          <rect x="22" y="6" width="14" height="24" rx="4" fill={COLORS.deepBrown} />
          {/* 壶嘴 */}
          <path
            d="M 44 16 Q 58 6 64 -2"
            stroke={COLORS.deepBrown}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* 壶口 */}
          <ellipse cx="29" cy="6" rx="8" ry="3.5" fill={COLORS.deepBrown} />
          {/* 壶柄 */}
          <path
            d="M 6 22 Q -4 28 6 36"
            stroke={COLORS.deepBrown}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* 水滴 */}
          <circle cx="62" cy="2" r="2" fill={COLORS.cream} opacity="0.6">
            <animate
              attributeName="cy"
              values="-2;8;16"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.3;0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {/* ======== 植物主体（上移减少与标题的空白，放大约 30%） ======== */}
      <div
        className="absolute left-1/2"
        style={{
          top: '35%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <PlantAvatar plantFamily={plantFamily} stage={stage} size={220} />
      </div>

      {/* ======== 小木牌（更大更明确） ======== */}
      <div
        className="absolute left-1/2"
        style={{
          top: '48%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <svg width="100" height="62" viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg">
          {/* 小杆子 — 粗一点 */}
          <line x1="50" y1="30" x2="50" y2="58" stroke={WOOD_COLOR} strokeWidth="5" strokeLinecap="round" />
          {/* 木牌阴影 */}
          <rect x="12" y="4" width="76" height="28" rx="7" fill={SOIL_COLOR} opacity="0.15" />
          {/* 木牌背景 */}
          <rect x="10" y="2" width="76" height="28" rx="7" fill={WOOD_COLOR} opacity="0.88" />
          {/* 木纹纹理 */}
          <line x1="16" y1="9" x2="80" y2="9" stroke="white" strokeWidth="0.6" opacity="0.15" />
          <line x1="16" y1="18" x2="76" y2="18" stroke="white" strokeWidth="0.4" opacity="0.10" />
          {/* 木牌高光 */}
          <rect x="10" y="2" width="76" height="5" rx="2.5" fill="white" opacity="0.12" />
          {/* 钉子 */}
          <circle cx="18" cy="8" r="2" fill="#7a6348" opacity="0.5" />
          <circle cx="80" cy="8" r="2" fill="#7a6348" opacity="0.5" />
          {/* 文字 */}
          <text
            x="48"
            y="22"
            textAnchor="middle"
            fill="#faf6f0"
            fontSize="13"
            fontFamily="'PingFang SC', 'Noto Sans SC', sans-serif"
            fontWeight="600"
          >
            {STAGE_LABELS[stage]}
          </text>
        </svg>
      </div>
      </>
      )}

      {/* ======== 左下角 GardenerHint（图片 / SVG 模式共用，始终由程序动态生成） ======== */}
      <div
        className="absolute left-3 bottom-3"
        style={{ zIndex: 20, maxWidth: 'calc(100% - 24px)' }}
      >
        <GardenerHint stage={stage} seedCount={seedCount} />
      </div>
    </motion.div>
  );
}

export type { GardenSceneProps };
