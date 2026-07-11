// src/components/home/GardenGuidePanel.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { GardenOverview, GardenType } from '@/types';
import { COLORS } from '@/lib/constants';

// ============================================================
// 配置
// ============================================================

const GARDEN_COLORS: Record<GardenType, { dot: string; soft: string }> = {
  travel:    { dot: '#8BA36B', soft: '#EAF0E3' },
  food:      { dot: '#F1A9B8', soft: '#FDF0F3' },
  shopping:  { dot: '#EFA36A', soft: '#FDF3EB' },
  life:      { dot: '#A6B985', soft: '#EEF4E5' },
  aesthetic: { dot: '#B99BEA', soft: '#F4EEFC' },
};

// ============================================================
// 小型植物 SVG 精灵图
// ============================================================

function PlantSprite({ gardenType, size = 38 }: { gardenType: GardenType; size?: number }) {
  const c = GARDEN_COLORS[gardenType].dot;

  const id = gardenType;
  const vb = '0 0 40 40';
  const common = { xmlns: 'http://www.w3.org/2000/svg' };

  if (id === 'travel') {
    // 🌳 树 — 乔木造型
    return (
      <svg width={size} height={size} viewBox={vb} fill="none" {...common}>
        <rect x="17" y="24" width="6" height="11" rx="2" fill={c} opacity="0.35" />
        <circle cx="20" cy="15" r="11" fill={c} opacity="0.13" />
        <circle cx="20" cy="15" r="8" fill={c} opacity="0.22" />
        <circle cx="17" cy="13" r="3.5" fill={c} opacity="0.3" />
        <circle cx="23" cy="12" r="2.5" fill={c} opacity="0.25" />
      </svg>
    );
  }

  if (id === 'food') {
    // 🌿 草本 — 簇生叶片
    return (
      <svg width={size} height={size} viewBox={vb} fill="none" {...common}>
        <path d="M20 28v7M17 31.5h6" stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
        <ellipse cx="15" cy="16" rx="6" ry="9" fill={c} opacity="0.15" transform="rotate(-10 15 16)" />
        <ellipse cx="25" cy="15" rx="5.5" ry="9.5" fill={c} opacity="0.2" transform="rotate(8 25 15)" />
        <ellipse cx="20" cy="17" rx="5" ry="8" fill={c} opacity="0.22" />
        <ellipse cx="20" cy="15" rx="3" ry="5" fill={c} opacity="0.28" />
      </svg>
    );
  }

  if (id === 'shopping') {
    // 🌸 花 — 五瓣花
    return (
      <svg width={size} height={size} viewBox={vb} fill="none" {...common}>
        <path d="M20 28v7M16.5 32h7" stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="20" cy="13"
            rx="4.5" ry="8"
            fill={c} opacity="0.28"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="4" fill="rgba(255,240,200,0.5)" />
        <circle cx="20" cy="20" r="2.5" fill={c} opacity="0.35" />
      </svg>
    );
  }

  if (id === 'life') {
    // 🍃 藤蔓 — 蜿蜒小藤
    return (
      <svg width={size} height={size} viewBox={vb} fill="none" {...common}>
        <path
          d="M8 34C10 26 14 20 20 20c5 0 8 6 8 4 0-4-6-10-2-14 3-3 7 0 8 4"
          stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45"
        />
        <circle cx="18" cy="19" r="3" fill={c} opacity="0.22" />
        <circle cx="28" cy="14" r="2.5" fill={c} opacity="0.2" />
        <circle cx="22" cy="12" r="1.8" fill={c} opacity="0.18" />
        <circle cx="14" cy="30" r="2" fill={c} opacity="0.15" />
      </svg>
    );
  }

  // aesthetic — 紫藤花穗
  return (
    <svg width={size} height={size} viewBox={vb} fill="none" {...common}>
      <path d="M20 6v23" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="20" cy="9" r="5" fill={c} opacity="0.22" />
      <circle cx="21" cy="13" r="4.5" fill={c} opacity="0.24" />
      <circle cx="19" cy="16.5" r="4" fill={c} opacity="0.22" />
      <circle cx="20.5" cy="20" r="3.5" fill={c} opacity="0.18" />
      <circle cx="19" cy="23" r="2.5" fill={c} opacity="0.14" />
      <circle cx="20" cy="10" r="2" fill="white" opacity="0.25" />
      <circle cx="22" cy="14" r="1.8" fill="white" opacity="0.22" />
    </svg>
  );
}

// ============================================================
// 左侧藤蔓装饰 SVG
// ============================================================

function VineLeft() {
  return (
    <svg
      className="absolute left-0 top-0 bottom-0 pointer-events-none z-0"
      width="52"
      viewBox="0 0 52 540"
      preserveAspectRatio="none"
      fill="none"
    >
      {/* 主藤 */}
      <path
        d="M28 0C16 90 38 170 20 250C10 300 32 370 14 440C4 480 24 520 18 540"
        stroke="rgba(148,180,130,0.22)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* 分枝 1 */}
      <path
        d="M20 100C34 115 42 105 48 125"
        stroke="rgba(148,180,130,0.15)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* 分枝 2 */}
      <path
        d="M30 290C42 300 46 290 50 310"
        stroke="rgba(148,180,130,0.12)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {/* 叶片 */}
      <ellipse cx="38" cy="105" rx="5.5" ry="3.2" fill="rgba(166,185,133,0.16)" transform="rotate(-18 38 105)" />
      <ellipse cx="47" cy="122" rx="4.5" ry="2.5" fill="rgba(166,185,133,0.12)" transform="rotate(10 47 122)" />
      <ellipse cx="40" cy="282" rx="5" ry="3" fill="rgba(166,185,133,0.14)" transform="rotate(-12 40 282)" />
      <ellipse cx="49" cy="307" rx="4" ry="2.2" fill="rgba(166,185,133,0.1)" transform="rotate(6 49 307)" />
      <ellipse cx="22" cy="420" rx="4.5" ry="2.8" fill="rgba(166,185,133,0.12)" transform="rotate(-20 22 420)" />
      {/* 小花蕾 */}
      <circle cx="32" cy="170" r="3" fill="rgba(244,180,190,0.18)" />
      <circle cx="16" cy="370" r="2.5" fill="rgba(244,180,190,0.14)" />
      <circle cx="26" cy="470" r="2" fill="rgba(244,180,190,0.12)" />
    </svg>
  );
}

// ============================================================
// 底部柔粉大花装饰
// ============================================================

function BottomBloom() {
  return (
    <svg
      className="absolute -bottom-3 -left-3 pointer-events-none z-0"
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
    >
      {/* 外圈花瓣 */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={`outer-${deg}`}
          cx="48" cy="26"
          rx="12" ry="20"
          fill="rgba(244,180,190,0.16)"
          stroke="rgba(244,180,190,0.08)"
          strokeWidth="0.5"
          transform={`rotate(${deg} 48 48)`}
        />
      ))}
      {/* 内圈花瓣 */}
      {[36, 108, 180, 252, 324].map((deg) => (
        <ellipse
          key={`inner-${deg}`}
          cx="48" cy="34"
          rx="7" ry="13"
          fill="rgba(244,180,190,0.22)"
          transform={`rotate(${deg} 48 48)`}
        />
      ))}
      {/* 花心 */}
      <circle cx="48" cy="48" r="8" fill="rgba(227,200,114,0.35)" />
      <circle cx="48" cy="48" r="5" fill="rgba(227,200,114,0.28)" />
      <circle cx="48" cy="48" r="2.5" fill="rgba(255,245,225,0.3)" />
    </svg>
  );
}

// ============================================================
// 标题花枝分隔线
// ============================================================

function TitleDivider() {
  return (
    <svg
      width="130"
      height="14"
      viewBox="0 0 130 14"
      fill="none"
      className="mx-auto"
    >
      {/* 左枝 */}
      <path
        d="M8 7C8 7 22 4 38 5.5C50 6.5 60 7 63 7"
        stroke="rgba(148,180,130,0.22)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* 中心小花 */}
      <circle cx="65" cy="7" r="3" fill="rgba(241,169,184,0.22)" />
      <circle cx="65" cy="7" r="1.5" fill="rgba(241,169,184,0.32)" />
      {/* 右枝 */}
      <path
        d="M67 7C70 7 80 6.5 92 5.5C107 4 122 7 122 7"
        stroke="rgba(148,180,130,0.22)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* 小叶 */}
      <ellipse cx="38" cy="4.5" rx="3" ry="1.8" fill="rgba(166,185,133,0.14)" transform="rotate(-15 38 4.5)" />
      <ellipse cx="92" cy="5" rx="3" ry="1.8" fill="rgba(166,185,133,0.14)" transform="rotate(12 92 5)" />
    </svg>
  );
}

// ============================================================
// 空状态
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-8 px-4 text-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[42px] mb-5 select-none"
      >
        🌱
      </motion.div>
      <p
        className="text-sm leading-relaxed mb-6 max-w-[220px]"
        style={{ color: COLORS.deepBrown }}
      >
        你的花园还很安静。<br />
        先投喂一条截图、链接或文字，
        小园丁会帮你种下第一颗种子。
      </p>
      <Link
        href="/chat"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:brightness-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${COLORS.coral}E6, #f2a09eE6)`,
          color: '#fff',
          boxShadow: '0 4px 18px rgba(237,114,110,0.28)',
        }}
      >
        <span>✨</span> 投喂第一颗灵感
      </Link>
    </div>
  );
}

// ============================================================
// 单个花圃导航行
// ============================================================

function GardenNavItem({ garden, index, basePath }: { garden: GardenOverview; index: number; basePath: string }) {
  const gc = GARDEN_COLORS[garden.gardenId];

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.28 + index * 0.07, duration: 0.45, ease: 'easeOut' }}
    >
      <Link
        href={`${basePath}/${garden.gardenId}`}
        className="group flex items-center gap-2 px-2.5 py-2 rounded-[16px] transition-all duration-300"
        style={{
          background: 'rgba(255, 250, 240, 0.28)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = 'rgba(255, 248, 240, 0.55)';
          el.style.boxShadow = '0 8px 28px rgba(242, 178, 185, 0.18)';
          el.style.transform = 'translateY(-2px)';
          el.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = 'rgba(255, 250, 240, 0.28)';
          el.style.boxShadow = '';
          el.style.transform = '';
          el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        {/* 左：植物精灵图 */}
        <div className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5">
          <PlantSprite gardenType={garden.gardenId} size={30} />
        </div>

        {/* 中：名称 + 统计 */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium truncate tracking-[0.02em]"
            style={{ color: '#5E5745' }}
          >
            {garden.name}
          </p>
        </div>

        {/* 右：色点 + 箭头 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: gc.dot }}
          />
          <span
            className="inline-block text-base transition-transform duration-300 group-hover:translate-x-[3px]"
            style={{ color: COLORS.warmBrown, lineHeight: 1 }}
          >
            ›
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================================
// 主组件：GardenGuidePanel
// ============================================================

interface GardenGuidePanelProps {
  gardens: GardenOverview[];
  basePath?: string;
}

export function GardenGuidePanel({ gardens, basePath = '/garden' }: GardenGuidePanelProps) {
  const isEmpty = gardens.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="absolute left-10 z-20 select-none"
      style={{ top: 160, width: 240 }}
    >
      {/* ================================================ */}
      {/* 外壳：半透明奶油白玻璃质感导览牌                     */}
      {/* ================================================ */}
      <div
        className="relative rounded-[32px] overflow-hidden"
        style={{
          background: 'rgba(255, 250, 240, 0.62)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          boxShadow: [
            '0 18px 50px rgba(196, 148, 120, 0.14)',
            '0 0 40px rgba(255, 214, 220, 0.2)',
            'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            'inset 0 -30px 60px rgba(255, 250, 240, 0.15)',
          ].join(', '),
        }}
      >
        {/* 纸感纹理叠加 — 极淡噪点 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* 装饰层 */}
        <VineLeft />
        <BottomBloom />

        {/* ================================================ */}
        {/* 内容区 */}
        {/* ================================================ */}
        <div className="relative z-10 px-4 pt-4 pb-4">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {/* ---- 标题 ---- */}
              <div className="text-center mb-2">
                <h3
                  className="text-[18px] font-medium tracking-[0.08em] inline-flex items-center gap-2"
                  style={{ color: '#5E5745' }}
                >
                  <span className="text-xs opacity-55 -mt-0.5">🌿</span>
                  花园导览
                  <span className="text-xs opacity-55 -mt-0.5">🌿</span>
                </h3>
                <TitleDivider />
              </div>

              {/* ---- 花圃列表 ---- */}
              <div className="space-y-1 mt-3">
                {gardens.map((garden, i) => (
                  <GardenNavItem key={garden.gardenId} garden={garden} index={i} basePath={basePath} />
                ))}
              </div>

              {/* ---- 底部入口 ---- */}
              <Link
                href="/gardens"
                className="flex items-center justify-center gap-1.5 mt-4 pt-3.5 text-xs transition-all duration-300 hover:gap-2"
                style={{
                  borderTop: '1px solid rgba(180, 160, 140, 0.14)',
                  color: COLORS.deepBrown,
                }}
              >
                查看全部花园
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-[3px]">
                  →
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
