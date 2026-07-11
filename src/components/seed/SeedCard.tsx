// src/components/seed/SeedCard.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Seed, SourceType } from '@/types';
import { COLORS } from '@/lib/constants';

interface SeedCardProps {
  seed: Seed;
  isLatest?: boolean;
  expanded: boolean;
  supplementing: boolean;
  onToggleExpand: (seedId: string) => void;
  onToggleSupplement: (seedId: string) => void;
  onSupplementSave: (seedId: string, notes: string) => Promise<void>;
  onViewOriginal: (seed: Seed) => void;
  onMove: (seedId: string) => void;
}

const sourceTypeMeta: Record<SourceType, { icon: string; label: string }> = {
  image: { icon: '📸', label: '图片' },
  link: { icon: '🔗', label: '链接' },
  text: { icon: '✏️', label: '文字' },
  wechat: { icon: '💬', label: '微信' },
};

type ViewActionLabel = Record<SourceType, string>;
const viewActionLabel: ViewActionLabel = {
  image: '查看原图',
  link: '打开链接',
  text: '查看原文',
  wechat: '查看原文',
};

const TAG_VARIANTS = [
  { bg: '#f2e4da', text: '#7a5a4a', border: '#e0cdb8' },
  { bg: '#f5efe0', text: '#8b7355', border: '#e8dbc5' },
  { bg: '#dce8d0', text: '#5a6b42', border: '#c5d4b4' },
  { bg: '#f0e6c8', text: '#8b7528', border: '#e0d4a8' },
];

export function SeedCard({
  seed,
  isLatest = false,
  expanded,
  supplementing,
  onToggleExpand,
  onToggleSupplement,
  onSupplementSave,
  onViewOriginal,
  onMove,
}: SeedCardProps) {
  const [supplementNotes, setSupplementNotes] = useState(seed.user_notes ?? '');
  const [savingSupplement, setSavingSupplement] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [supplementError, setSupplementError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const meta = sourceTypeMeta[seed.source_type] ?? { icon: '📄', label: '未知' };

  const formattedTime = (() => {
    try {
      return new Date(seed.created_at).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  // 点击外部关闭 more 菜单
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const handleSaveSupplement = useCallback(async () => {
    setSavingSupplement(true);
    setSupplementError(null);
    try {
      await onSupplementSave(seed.id, supplementNotes);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch (err) {
      setSupplementError('保存失败，请重试');
      console.error('Supplement save failed:', err);
    } finally {
      setSavingSupplement(false);
    }
  }, [seed.id, supplementNotes, onSupplementSave]);

  const hasTextContent =
    seed.source_type === 'text' || seed.source_type === 'wechat';
  const originalText = seed.content?.text || seed.content?.ocrText || '';

  const visibleTags = (seed.tags ?? []).slice(0, 4);
  const overflowTagCount = Math.max(0, (seed.tags ?? []).length - 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="seed-card relative"
      style={
        {
          padding: '12px 16px',
          borderColor: isLatest
            ? `${COLORS.coral}66`
            : 'rgba(var(--color-warm-brown-rgb), 0.15)',
          boxShadow: isLatest
            ? '0 0 20px rgba(237, 114, 110, 0.10), 0 2px 12px rgba(105, 86, 44, 0.04)'
            : undefined,
          '--color-warm-brown-rgb': '217, 178, 153',
        } as React.CSSProperties
      }
    >
      {/* ====== 最新角标 ====== */}
      {isLatest && <div className="seed-latest-badge">✨ 最新</div>}

      {/* ====== 横向主内容 ====== */}
      <div className="flex gap-3">
        {/* --- 左：缩略图 --- */}
        <div
          className="seed-thumbnail flex-shrink-0 cursor-pointer group/thumb"
          style={{ width: 100 }}
          onClick={() => onViewOriginal(seed)}
          role="button"
          tabIndex={0}
          aria-label={`查看${seed.source_type === 'image' ? '原图' : '详情'}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onViewOriginal(seed);
            }
          }}
        >
          {seed.source_type === 'image' && seed.image_url ? (
            <>
              <img
                src={seed.image_url}
                alt={seed.title || '灵感图片'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
                <span className="text-white text-lg">🔍</span>
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xl"
              style={{ backgroundColor: `${COLORS.mistPink}4D` }}
            >
              {meta.icon}
            </div>
          )}
          <span className="seed-source-badge">
            {meta.icon} {meta.label}
          </span>
        </div>

        {/* --- 中：主内容 --- */}
        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: '3px' }}>
          {/* AI 标题 + 操作按钮行 */}
          <div className="flex items-center justify-between gap-2">
            <h4
              className="text-sm font-medium truncate"
              style={{ color: COLORS.textPrimary }}
            >
              {seed.title || '未命名灵感'}
            </h4>
            {/* 右侧紧凑操作区 */}
            <div className="flex-shrink-0 flex items-center gap-0.5">
              {/* 查看原图/原文 */}
              <button
                type="button"
                onClick={() => onViewOriginal(seed)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-xs opacity-50 hover:opacity-90 hover:bg-black/3 transition-all"
                title={viewActionLabel[seed.source_type]}
                aria-label={viewActionLabel[seed.source_type]}
              >
                👁
              </button>
              {/* 更多菜单 */}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-xs opacity-50 hover:opacity-90 hover:bg-black/3 transition-all"
                  title="更多操作"
                  aria-label="更多操作"
                >
                  ⋯
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 z-30 py-1 rounded-xl shadow-lg border"
                      style={{
                        minWidth: 130,
                        background: 'rgba(255,255,255,0.96)',
                        backdropFilter: 'blur(12px)',
                        borderColor: `${COLORS.warmBrown}22`,
                        boxShadow: '0 6px 24px rgba(105,86,44,0.10)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => { onToggleSupplement(seed.id); setMoreOpen(false); }}
                        className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-black/3 transition-colors flex items-center gap-2"
                        style={{ color: COLORS.textPrimary }}
                      >
                        💧 补充信息
                      </button>
                      <button
                        type="button"
                        onClick={() => { onMove(seed.id); setMoreOpen(false); }}
                        className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-black/3 transition-colors flex items-center gap-2"
                        style={{ color: COLORS.deepBrown }}
                      >
                        📦 移动
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 来源 + 时间 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: COLORS.warmBrown }}>
              {meta.icon}
            </span>
            <span
              className="text-[11px]"
              style={{ color: COLORS.deepBrown, opacity: 0.65 }}
            >
              {formattedTime}
            </span>
          </div>

          {/* AI 摘要 */}
          {seed.summary && (
            <p
              className="text-[11px] leading-relaxed line-clamp-2"
              style={{ color: COLORS.deepBrown, opacity: 0.75 }}
            >
              {seed.summary}
            </p>
          )}

          {/* 标签胶囊（更紧凑） */}
          {(seed.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag, i) => {
                const v = TAG_VARIANTS[i % 4];
                return (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      backgroundColor: v.bg,
                      color: v.text,
                      border: `1px solid ${v.border}`,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
              {overflowTagCount > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{
                    backgroundColor: 'rgba(200, 180, 160, 0.12)',
                    color: COLORS.deepBrown,
                    border: `1px dashed ${COLORS.warmBrown}33`,
                  }}
                >
                  +{overflowTagCount}
                </span>
              )}
            </div>
          )}

          {/* 我的补充（紧凑） */}
          {seed.user_notes && (
            <p
              className="text-[10px] leading-relaxed italic"
              style={{ color: COLORS.deepBrown, opacity: 0.5 }}
            >
              💧 {seed.user_notes}
            </p>
          )}

          {/* 保存成功轻提示 */}
          {savedIndicator && (
            <span className="text-[10px] animate-pulse" style={{ color: '#5a6b42' }}>
              ✓ 已补充
            </span>
          )}
        </div>
      </div>

      {/* ====== 展开区：原始内容 ====== */}
      <AnimatePresence>
        {expanded && hasTextContent && originalText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.warmBrown}14` }}>
              <p className="text-[10px] font-medium" style={{ color: COLORS.deepBrown }}>
                📄 原始内容
              </p>
              <div
                className="mt-1 px-3 py-2 rounded-lg text-[11px] leading-relaxed max-h-28 overflow-y-auto"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  color: COLORS.deepBrown,
                }}
              >
                {originalText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 补充区：内联表单 ====== */}
      <AnimatePresence>
        {supplementing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 pt-3 rounded-xl"
              style={{ borderTop: `1px solid ${COLORS.mistPink}66` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: COLORS.textPrimary }}>
                补充这条灵感的信息 💧
              </p>
              <p className="text-[10px] mb-2" style={{ color: COLORS.deepBrown, opacity: 0.55 }}>
                可以补一点你想记住的信息，小园丁会一起整理进这株植物里。
              </p>

              <textarea
                value={supplementNotes}
                onChange={(e) => setSupplementNotes(e.target.value)}
                placeholder="例如：备注、地点、价格、时间、其他想法..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs resize-none focus:outline-none transition-all"
                style={{
                  background: 'rgba(250, 246, 240, 0.65)',
                  border: '1px solid rgba(200, 180, 155, 0.25)',
                  color: COLORS.textPrimary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229, 200, 114, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229, 200, 114, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(200, 180, 155, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {supplementError && (
                <p className="text-[10px] mt-1.5" style={{ color: COLORS.coral }}>
                  😥 {supplementError}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSupplementNotes(seed.user_notes ?? '');
                    setSupplementError(null);
                    onToggleSupplement(seed.id);
                  }}
                  className="px-3 py-1.5 text-[11px] rounded-full transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    color: COLORS.textPrimary,
                    border: `1px solid ${COLORS.warmBrown}33`,
                  }}
                >
                  收起
                </button>
                <button
                  type="button"
                  onClick={handleSaveSupplement}
                  disabled={savingSupplement}
                  className="px-3 py-1.5 text-[11px] rounded-full text-white transition-all hover:translate-y-[-1px] disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                  }}
                >
                  {savingSupplement ? '保存中...' : '保存补充'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
