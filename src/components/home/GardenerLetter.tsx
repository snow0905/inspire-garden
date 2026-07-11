// src/components/home/GardenerLetter.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { ActionableTopic, WateringSeed } from '@/types';
import { COLORS } from '@/lib/constants';

interface GardenerLetterProps {
  actionableTopics: ActionableTopic[];
  wateringSeeds: WateringSeed[];
  observation: string;
  basePath?: string;
}

// ============================================================
// 收起态：小信封 SVG
// ============================================================

function EnvelopeIcon() {
  return (
    <svg
      width="56"
      height="48"
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 信封主体 */}
      <rect
        x="4"
        y="8"
        width="48"
        height="34"
        rx="4"
        fill="rgba(255, 250, 240, 0.85)"
        stroke="rgba(217, 178, 153, 0.35)"
        strokeWidth="1.2"
      />
      {/* 信封折角 */}
      <path
        d="M4 12C4 12 18 28 28 28C38 28 52 12 52 12"
        stroke="rgba(217, 178, 153, 0.3)"
        strokeWidth="1.2"
        fill="rgba(255, 248, 240, 0.6)"
      />
      {/* 封口三角 */}
      <path
        d="M4 12L28 32L52 12"
        stroke="rgba(217, 178, 153, 0.35)"
        strokeWidth="1"
        fill="none"
      />
      {/* 火漆印章 */}
      <circle
        cx="28"
        cy="22"
        r="7"
        fill="rgba(237, 114, 110, 0.25)"
        stroke="rgba(237, 114, 110, 0.35)"
        strokeWidth="1"
      />
      <circle
        cx="28"
        cy="22"
        r="3.5"
        fill="rgba(237, 114, 110, 0.18)"
      />
      {/* 印章上的小花 */}
      <circle cx="26.5" cy="21" r="1.2" fill="rgba(237, 114, 110, 0.3)" />
      <circle cx="29.5" cy="21" r="1.2" fill="rgba(237, 114, 110, 0.3)" />
      <circle cx="26.5" cy="23.5" r="1.2" fill="rgba(237, 114, 110, 0.3)" />
      <circle cx="29.5" cy="23.5" r="1.2" fill="rgba(237, 114, 110, 0.3)" />
      <circle cx="28" cy="22" r="1" fill="rgba(237, 114, 110, 0.4)" />
    </svg>
  );
}

// ============================================================
// 主组件
// ============================================================

export function GardenerLetter({ actionableTopics, wateringSeeds, observation, basePath = '/garden' }: GardenerLetterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasContent = actionableTopics.length > 0 || wateringSeeds.length > 0;

  return (
    <>
      <style>{`
        .gl-link:hover { background-color: ${COLORS.mistPink}4D; }
      `}</style>

      {/* ════════════════════════════════════════
          收起态 — 小信封
         ════════════════════════════════════════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="envelope-collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => setIsOpen(true)}
            className="absolute right-8 top-28 z-20 cursor-pointer select-none"
            style={{
              background: 'rgba(255, 250, 240, 0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '20px',
              padding: '16px 14px 12px',
              boxShadow: [
                '0 8px 28px rgba(196, 148, 120, 0.12)',
                '0 0 24px rgba(255, 214, 220, 0.15)',
              ].join(', '),
            }}
            aria-label="打开小园丁信笺"
          >
            {/* 信封图标 + 微动效 */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              <EnvelopeIcon />
            </motion.div>
            <p
              className="text-[11px] mt-1.5 tracking-wider text-center"
              style={{ color: COLORS.deepBrown }}
            >
              小园丁来信
            </p>
            {/* 新消息小红点 */}
            {hasContent && (
              <span
                className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS.coral }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          展开态 — 完整信笺面板
         ════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="envelope-expanded"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute right-6 top-28 z-20 w-64"
          >
            <div
              className="rounded-[24px] p-5 relative"
              style={{
                background: 'rgba(255, 250, 240, 0.62)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: [
                  '0 18px 50px rgba(196, 148, 120, 0.14)',
                  '0 0 40px rgba(255, 214, 220, 0.2)',
                  'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                ].join(', '),
              }}
            >
              {/* 标题栏 + 关闭 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌸</span>
                  <h3
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: COLORS.deepBrown }}
                  >
                    小园丁信笺
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  style={{ color: COLORS.deepBrown }}
                  aria-label="收起信笺"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 3l8 8M11 3l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* 1. 今天可以采摘 */}
              {actionableTopics.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="text-xs font-medium mb-2 flex items-center gap-1"
                    style={{ color: COLORS.coral }}
                  >
                    <span>🌸</span> 今天可以采摘
                  </h4>
                  <div className="space-y-1.5">
                    {actionableTopics.map((topic) => (
                      <Link
                        key={topic.topicId}
                        href={`${basePath}/${topic.gardenType}/${topic.topicId}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm gl-link"
                      >
                        <span style={{ color: COLORS.textPrimary }}>
                          {topic.topicName}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.coral }}>
                          去采摘
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 待补水的小苗 */}
              {wateringSeeds.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="text-xs font-medium mb-2 flex items-center gap-1"
                    style={{ color: COLORS.darkGold }}
                  >
                    <span>💧</span> 待补水的小苗
                  </h4>
                  <div className="space-y-1.5">
                    {wateringSeeds.map((seed) => (
                      <div
                        key={seed.topicId}
                        className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm gl-link"
                      >
                        <span style={{ color: COLORS.textPrimary }}>
                          {seed.topicName}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.deepBrown }}>
                          缺少{seed.missingFields.join('、')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. 近期灵感观察 */}
              <div
                className="pt-3 border-t"
                style={{ borderTopColor: `${COLORS.warmBrown}26` }}
              >
                <p
                  className="text-xs leading-relaxed italic"
                  style={{ color: COLORS.deepBrown }}
                >
                  💬 {observation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
