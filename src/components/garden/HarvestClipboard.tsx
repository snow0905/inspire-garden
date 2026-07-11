// src/components/garden/HarvestClipboard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Harvest } from '@/types';
import { COLORS } from '@/lib/constants';

interface HarvestClipboardProps {
  existingHarvest: Harvest | null;
  harvestLoading: boolean;
  harvestError: string | null;
  structureBranches: string[];
  onGenerateHarvest: () => void;
  onViewHarvest?: () => void;
  topicName?: string;
  seedCount?: number;
  /** 自清单生成后新增的灵感数 */
  newSeedsSinceHarvest?: number;
  className?: string;
}

/** 计算相对时间文案 */
function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (isToday) return `今天 ${time}`;
  if (isYesterday) return `昨天 ${time}`;
  if (diffDays <= 7) return `${diffDays} 天前`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} 周前`;

  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

/** 空白清单纸 SVG 插画 */
function EmptyClipboardSVG() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center justify-center py-3"
    >
      <svg
        width="150"
        height="170"
        viewBox="0 0 150 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="18" y="21" width="114" height="132"
          rx="4" fill={COLORS.warmBrown} opacity="0.08"
        />
        <rect
          x="16" y="18" width="114" height="132"
          rx="4" fill="white"
          stroke={COLORS.warmBrown} strokeWidth="1.2" strokeOpacity="0.35"
        />
        <path
          d="M130 18 L130 40 L108 18 Z"
          fill="rgba(242, 228, 218, 0.7)"
          stroke={COLORS.warmBrown} strokeWidth="0.8" strokeOpacity="0.25"
        />
        <line x1="30" y1="44" x2="116" y2="44" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.22" />
        <line x1="30" y1="60" x2="110" y2="60" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.18" />
        <line x1="30" y1="76" x2="116" y2="76" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.18" />
        <line x1="30" y1="92" x2="96" y2="92" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.18" />
        <line x1="30" y1="108" x2="108" y2="108" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.16" />
        <rect x="31" y="48" width="9" height="9" rx="2" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.28" fill="none" />
        <rect x="31" y="64" width="9" height="9" rx="2" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.28" fill="none" />
        <rect x="31" y="80" width="9" height="9" rx="2" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.28" fill="none" />
        <rect x="31" y="96" width="9" height="9" rx="2" stroke={COLORS.warmBrown} strokeWidth="0.7" strokeOpacity="0.22" fill="none" />
        <g transform="translate(124, 142)" opacity="0.45">
          <path d="M0 0 C-4 -8, -12 -10, -8 -18 C-3 -10, 5 -8, 0 0Z" fill="#c4d4b4" />
          <path d="M-2 -2 C-2 -6, 0 -8, 3 -14 C1 -7, 1 -4, -2 -2Z" fill="#b5c8a5" />
        </g>
        <g transform="translate(22, 142)" opacity="0.35">
          <circle cx="0" cy="0" r="3" fill="#f0c4c0" />
          <circle cx="0" cy="0" r="1.5" fill="#e5c872" />
        </g>
      </svg>
    </motion.div>
  );
}

/** 环绕藤蔓装饰 — 更多缠绕效果 */
function VineDecorations() {
  return (
    <div className="pointer-events-none select-none" aria-hidden="true">
      {/* 顶部左藤蔓 */}
      <svg
        className="absolute top-0 left-0 opacity-20"
        width="80" height="60" viewBox="0 0 80 60" fill="none"
      >
        <path d="M0 0 C10 15, 25 10, 30 25 C32 32, 28 40, 35 48" stroke="#8bab7a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M30 25 C38 20, 45 28, 52 22" stroke="#a3b899" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="35" cy="48" rx="6" ry="3.5" fill="#a3b899" transform="rotate(-30 35 48)" />
        <ellipse cx="52" cy="22" rx="5" ry="3" fill="#c5d4b4" transform="rotate(15 52 22)" />
      </svg>

      {/* 顶部右藤蔓 */}
      <svg
        className="absolute top-0 right-0 opacity-20"
        width="80" height="60" viewBox="0 0 80 60" fill="none"
      >
        <path d="M80 0 C70 15, 55 10, 50 25 C48 32, 52 40, 45 48" stroke="#8bab7a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M50 25 C42 20, 35 28, 28 22" stroke="#a3b899" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="45" cy="48" rx="6" ry="3.5" fill="#a3b899" transform="rotate(30 45 48)" />
        <ellipse cx="28" cy="22" rx="5" ry="3" fill="#c5d4b4" transform="rotate(-15 28 22)" />
      </svg>

      {/* 底部左藤蔓 */}
      <svg
        className="absolute bottom-0 left-0 opacity-18"
        width="70" height="70" viewBox="0 0 70 70" fill="none"
      >
        <path d="M0 70 C12 55, 8 40, 18 30 C22 26, 28 28, 32 22" stroke="#a3b899" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M18 30 C25 35, 30 28, 38 32" stroke="#c5d4b4" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="22" rx="5" ry="3" fill="#a3b899" transform="rotate(-20 32 22)" />
        <ellipse cx="38" cy="32" rx="4" ry="2.5" fill="#c5d4b4" />
      </svg>

      {/* 底部右藤蔓 + 小花 */}
      <svg
        className="absolute bottom-0 right-0 opacity-18"
        width="70" height="70" viewBox="0 0 70 70" fill="none"
      >
        <path d="M70 70 C58 55, 62 40, 52 30 C48 26, 42 28, 38 22" stroke="#a3b899" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M52 30 C45 35, 40 28, 32 32" stroke="#c5d4b4" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="22" rx="5" ry="3" fill="#a3b899" transform="rotate(20 38 22)" />
        <ellipse cx="32" cy="32" rx="4" ry="2.5" fill="#c5d4b4" />
        {/* 小花 */}
        <circle cx="62" cy="52" r="3.5" fill="#f0c4c0" />
        <circle cx="62" cy="52" r="1.5" fill="#e5c872" />
      </svg>

      {/* 左侧边爬藤 */}
      <svg
        className="absolute left-0 top-1/4 opacity-12"
        width="24" height="120" viewBox="0 0 24 120" fill="none"
      >
        <path d="M0 0 Q12 20 4 50 Q-2 80 10 120" stroke="#8bab7a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M4 50 Q14 55 18 45" stroke="#a3b899" strokeWidth="1" fill="none" strokeLinecap="round" />
        <ellipse cx="18" cy="45" rx="4" ry="2.5" fill="#a3b899" transform="rotate(-10 18 45)" />
        <ellipse cx="10" cy="120" rx="4" ry="2.5" fill="#c5d4b4" />
      </svg>

      {/* 右侧边爬藤 */}
      <svg
        className="absolute right-0 top-1/3 opacity-12"
        width="24" height="100" viewBox="0 0 24 100" fill="none"
      >
        <path d="M24 0 Q12 15 20 40 Q28 65 14 100" stroke="#8bab7a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M20 40 Q10 45 6 35" stroke="#a3b899" strokeWidth="1" fill="none" strokeLinecap="round" />
        <ellipse cx="6" cy="35" rx="4" ry="2.5" fill="#a3b899" transform="rotate(10 6 35)" />
      </svg>
    </div>
  );
}

export function HarvestClipboard({
  existingHarvest,
  harvestLoading,
  harvestError,
  structureBranches,
  onGenerateHarvest,
  onViewHarvest,
  topicName,
  seedCount = 0,
  newSeedsSinceHarvest = 0,
  className = '',
}: HarvestClipboardProps) {
  const effectiveSections = (existingHarvest?.sections ?? []).filter(
    (s) => (s.items?.length ?? 0) > 0
  );
  const hasValidHarvest = existingHarvest !== null && effectiveSections.length > 0;
  const totalSourceCount = effectiveSections.reduce(
    (sum, s) => sum + (s.sourceCount ?? 0),
    0
  );

  // 清单包含的内容项（用斜杠分隔，不用重标签）
  const contentItems = effectiveSections
    .map((s) => s.name)
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`clipboard-panel relative overflow-hidden ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${COLORS.warmBrown}22`,
        boxShadow: '0 2px 20px rgba(105, 86, 44, 0.04)',
        padding: '20px',
        borderRadius: '26px',
      }}
    >
      {/* 环绕藤蔓装饰 */}
      <VineDecorations />

      <div className="relative z-10 p-5">
        {/* ========== 顶部木夹装饰 ========== */}
        <div className="flex items-center justify-center gap-4 -mt-9 mb-3">
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            <circle cx="11" cy="8" r="2.5" fill="#c4a882" stroke="#947453" strokeWidth="0.5" />
            <rect x="6" y="0" width="10" height="14" rx="4" fill="#b8957a" stroke="#947453" strokeWidth="0.7" />
            <rect x="6" y="14" width="10" height="14" rx="4" fill="#c9a98e" stroke="#947453" strokeWidth="0.7" />
            <line x1="6" y1="8" x2="3" y2="8" stroke="#947453" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="16" y1="8" x2="19" y2="8" stroke="#947453" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="8" y1="9" x2="14" y2="9" stroke="white" strokeWidth="0.4" opacity="0.2" />
            <line x1="9" y1="20" x2="13" y2="20" stroke="white" strokeWidth="0.4" opacity="0.15" />
          </svg>
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            <circle cx="11" cy="8" r="2.5" fill="#c4a882" stroke="#947453" strokeWidth="0.5" />
            <rect x="6" y="0" width="10" height="14" rx="4" fill="#b8957a" stroke="#947453" strokeWidth="0.7" />
            <rect x="6" y="14" width="10" height="14" rx="4" fill="#c9a98e" stroke="#947453" strokeWidth="0.7" />
            <line x1="6" y1="8" x2="3" y2="8" stroke="#947453" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="16" y1="8" x2="19" y2="8" stroke="#947453" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="8" y1="9" x2="14" y2="9" stroke="white" strokeWidth="0.4" opacity="0.2" />
            <line x1="9" y1="20" x2="13" y2="20" stroke="white" strokeWidth="0.4" opacity="0.15" />
          </svg>
        </div>

        {/* ========== 标题 ========== */}
        <h3
          className="text-sm font-semibold text-center mb-4 flex items-center justify-center gap-2"
          style={{ color: COLORS.textPrimary }}
        >
          <span>📋</span>
          当前清单
        </h3>

        {/* ========== 无清单状态 ========== */}
        {!hasValidHarvest && (
          <div className="flex flex-col items-center text-center">
            <EmptyClipboardSVG />

            <p className="text-xs mt-1" style={{ color: COLORS.deepBrown, opacity: 0.55 }}>
              还没有生成可用清单。
            </p>
            <p
              className="text-[11px] mt-1.5 leading-relaxed px-2"
              style={{ color: COLORS.deepBrown, opacity: 0.35 }}
            >
              继续投喂几条{topicName ? `「${topicName}」` : '相关'}灵感，或补充偏好后，小园丁就能帮你整理成候选清单。
            </p>

            {/* 弱提示条 */}
            {seedCount > 0 && (
              <div
                className="mt-3 px-3 py-1.5 rounded-full text-[11px]"
                style={{
                  backgroundColor: 'rgba(217, 178, 153, 0.12)',
                  color: COLORS.deepBrown,
                  border: `1px solid ${COLORS.warmBrown}22`,
                }}
              >
                基于当前 {seedCount} 条灵感生成，结果可能较简单。
              </div>
            )}

            {/* 生成按钮 */}
            <motion.button
              whileHover={harvestLoading ? {} : { scale: 1.03 }}
              whileTap={harvestLoading ? {} : { scale: 0.97 }}
              onClick={onGenerateHarvest}
              disabled={harvestLoading}
              className="mt-4 px-6 py-2 rounded-full text-sm font-medium text-white transition-all disabled:opacity-60 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                boxShadow: '0 2px 8px rgba(237, 114, 110, 0.25)',
              }}
            >
              {harvestLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>✨ 生成清单</>
              )}
            </motion.button>

            {/* 错误提示 */}
            <AnimatePresence>
              {harvestError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] mt-3 px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(237, 114, 110, 0.08)',
                    color: COLORS.coral,
                    border: `1px solid ${COLORS.coral}22`,
                  }}
                >
                  😥 {harvestError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ========== 有清单状态 ========== */}
        {hasValidHarvest && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ---- 清单摘要卡 ---- */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                borderRadius: '18px',
                border: `1px solid ${COLORS.warmBrown}1A`,
                padding: '14px 16px',
              }}
            >
              {/* 标题行 */}
              <div className="flex items-center gap-2 mb-1.5">
                {/* 小纸张 icon */}
                <span className="text-base flex-shrink-0">📄</span>
                {/* 清单名称 */}
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: COLORS.textPrimary }}
                >
                  {existingHarvest!.title}
                </span>
                {/* 最新标签 */}
                <span
                  className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${COLORS.mistPink}88`,
                    color: COLORS.deepBrown,
                  }}
                >
                  最新
                </span>
              </div>

              {/* 版本与时间 */}
              <p className="text-[11px] mb-1" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                v{existingHarvest!.version} · {relativeTime(existingHarvest!.updated_at)}
              </p>

              {/* 来源说明 */}
              <p className="text-[11px] mb-1.5" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                基于 {totalSourceCount} 条灵感整理
              </p>

              {/* 包含内容 — 斜杠分隔 */}
              {contentItems.length > 0 && (
                <p className="text-[11px]" style={{ color: COLORS.deepBrown, opacity: 0.45 }}>
                  包含：
                  {contentItems.map((name, i) => (
                    <span key={name}>
                      {name}
                      {i < contentItems.length - 1 && (
                        <span style={{ opacity: 0.35 }}> / </span>
                      )}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* ---- 新灵感提示条 ---- */}
            {newSeedsSinceHarvest > 0 ? (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-[11px]"
                style={{
                  backgroundColor: 'rgba(163, 184, 153, 0.13)',
                  color: COLORS.textPrimary,
                  border: `1px solid rgba(163, 184, 153, 0.2)`,
                }}
              >
                <span className="text-sm flex-shrink-0">🌱</span>
                <span>
                  有 <strong>{newSeedsSinceHarvest}</strong> 条新灵感尚未整理进清单
                </span>
              </div>
            ) : (
              <p
                className="text-center text-[11px] mt-3"
                style={{ color: COLORS.deepBrown, opacity: 0.35 }}
              >
                暂无新灵感等待整理
              </p>
            )}

            {/* ---- 操作按钮（横向并排） ---- */}
            <div className="flex items-center gap-3 mt-4">
              {/* 查看清单 — 次按钮 */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                type="button"
                onClick={onViewHarvest}
                disabled={harvestLoading}
                className="flex-1 px-3 py-2.5 text-[12px] font-medium rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.warmBrown}44`,
                }}
              >
                📋 查看清单
              </motion.button>

              {/* 重新生成 — 主按钮 */}
              <motion.button
                whileHover={harvestLoading ? {} : { y: -1 }}
                whileTap={harvestLoading ? {} : { y: 0 }}
                type="button"
                onClick={onGenerateHarvest}
                disabled={harvestLoading}
                className="flex-1 px-3 py-2.5 text-[12px] font-medium rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 text-white"
                style={{
                  background: harvestLoading
                    ? `linear-gradient(135deg, ${COLORS.mistPink}aa 0%, ${COLORS.coral}aa 100%)`
                    : `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                  boxShadow: harvestLoading ? 'none' : '0 2px 10px rgba(237, 114, 110, 0.22)',
                }}
              >
                {harvestLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>🔄 重新生成</>
                )}
              </motion.button>
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {harvestError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] mt-3 px-3 py-1.5 rounded-full text-center"
                  style={{
                    backgroundColor: 'rgba(237, 114, 110, 0.08)',
                    color: COLORS.coral,
                    border: `1px solid ${COLORS.coral}22`,
                  }}
                >
                  😥 {harvestError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
