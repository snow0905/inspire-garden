// src/components/garden/HarvestPreviewPanel.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { COLORS, BRANCH_ICONS } from '@/lib/constants';
import { requestFeed } from '@/lib/feed-store';
import type { HarvestPreview, HarvestSection } from '@/types';

interface HarvestPreviewPanelProps {
  open: boolean;
  onClose: () => void;
  preview: HarvestPreview | null;
  loading: boolean;
  hasExistingHarvest: boolean;
  onConfirm: () => void;
  confirming: boolean;
  /** 主题名称 — 空状态时显示 */
  topicName?: string;
  /** 花园类型 — 空状态时展示对应分支建议 */
  structureBranches?: string[];
}

/** 标签颜色变体 */
const TAG_VARIANTS = [
  { bg: '#f2e4da', text: '#7a5a4a', border: '#e0cdb8' },
  { bg: '#f5efe0', text: '#8b7355', border: '#e8dbc5' },
  { bg: '#dce8d0', text: '#5a6b42', border: '#c5d4b4' },
  { bg: '#f0e6c8', text: '#8b7528', border: '#e0d4a8' },
];

function isEffectiveSection(s: HarvestSection): boolean {
  return s.sourceCount > 0 && s.items.length > 0;
}

function sortSections(sections: HarvestSection[]): HarvestSection[] {
  return [...sections].sort((a, b) => {
    const aEff = isEffectiveSection(a) ? 1 : 0;
    const bEff = isEffectiveSection(b) ? 1 : 0;
    if (aEff !== bEff) return bEff - aEff;
    return b.sourceCount - a.sourceCount;
  });
}

/** 获取准确的种子数量（优先用 API 注入的值） */
function extractSeedCount(preview: HarvestPreview): number {
  return preview.seedCount ?? 0;
}

export function HarvestPreviewPanel({
  open,
  onClose,
  preview,
  loading,
  hasExistingHarvest,
  onConfirm,
  confirming,
  topicName,
  structureBranches = [],
}: HarvestPreviewPanelProps) {
  const { visibleSections, emptySectionNames, hasContent } = useMemo(() => {
    if (!preview) return { visibleSections: [], emptySectionNames: [] as string[], hasContent: false };
    const sorted = sortSections(preview.sections);
    const visible = sorted.filter(isEffectiveSection);
    const empty = sorted.filter((s) => !isEffectiveSection(s));
    return {
      visibleSections: visible,
      emptySectionNames: empty.map((s) => s.name),
      hasContent: visible.length > 0,
    };
  }, [preview]);

  const emptyHint = useMemo(() => {
    if (emptySectionNames.length === 0) return null;
    const list = emptySectionNames.join('、');
    return `本次清单暂未包含：${list}。后续投喂相关灵感后，重新生成清单即可更新。`;
  }, [emptySectionNames]);

  const seedCount = preview ? extractSeedCount(preview) : 0;

  const handleFeedMore = () => {
    onClose();
    // 通过全局 store 触发 GardenShell 中的 FeedModal
    requestFeed();
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="flex flex-col" style={{ maxHeight: '75vh' }}>
        {/* 右上角关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          disabled={confirming}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-40 z-10"
          style={{
            backgroundColor: `${COLORS.warmBrown}18`,
            color: COLORS.deepBrown,
          }}
          aria-label="关闭预览"
        >
          ✕
        </button>

        {/* ====== Loading 状态 ====== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 mb-6"
              style={{
                borderColor: `${COLORS.mistPink}66`,
                borderTopColor: COLORS.warmBrown,
              }}
            />
            <p className="text-sm text-center leading-relaxed" style={{ color: COLORS.textPrimary }}>
              🌱 小园丁正在整理这株植物里的灵感...
            </p>
            <p className="text-xs mt-2" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
              这可能需要几秒钟
            </p>
          </div>
        )}

        {/* ====== 空状态：没有有效 section ====== */}
        {!loading && preview && !hasContent && (
          <div className="overflow-y-auto flex-1 -mx-2 px-2" style={{ maxHeight: '60vh' }}>
            {/* 中间小芽插画区 */}
            <div className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-5xl mb-5"
              >
                🌱
              </motion.div>

              <h2
                className="text-base font-semibold tracking-wide mb-3 text-center"
                style={{ color: COLORS.textPrimary }}
              >
                还没整理出可用清单
              </h2>

              <p
                className="text-sm text-center leading-relaxed mb-5 max-w-sm"
                style={{ color: COLORS.deepBrown, opacity: 0.65 }}
              >
                {topicName
                  ? `小园丁暂时只在「${topicName}」里找到 ${seedCount} 条灵感，还没有足够的信息整理成清单。`
                  : `小园丁暂时只找到 ${seedCount} 条灵感，还没有足够的信息整理成清单。`}
              </p>

              {/* 分支建议 */}
              {structureBranches.length > 0 && (
                <div className="text-center mb-5">
                  <p
                    className="text-[11px] mb-2.5"
                    style={{ color: COLORS.deepBrown, opacity: 0.5 }}
                  >
                    你可以继续投喂一些相关内容：
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {structureBranches.map((branch) => (
                      <span
                        key={branch}
                        className="px-2.5 py-1 rounded-full text-[11px]"
                        style={{
                          backgroundColor: `${COLORS.mistPink}4D`,
                          color: COLORS.textPrimary,
                          border: `1px solid ${COLORS.warmBrown}28`,
                        }}
                      >
                        {BRANCH_ICONS[branch] || '📌'} {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p
                className="text-[11px] text-center mb-6"
                style={{ color: COLORS.deepBrown, opacity: 0.4 }}
              >
                等这株植物长出更多灵感后，再来生成清单。
              </p>

              {/* 继续投喂灵感按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFeedMore}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-full transition-all"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                  boxShadow: '0 2px 12px rgba(237, 114, 110, 0.2)',
                }}
              >
                继续投喂灵感
              </motion.button>
            </div>

            <div className="h-8" />
          </div>
        )}

        {/* ====== 正常预览：有有效 section ====== */}
        {!loading && preview && hasContent && (
          <div className="overflow-y-auto flex-1 -mx-2 px-2" style={{ maxHeight: '60vh' }}>
            {/* 标题 + 副文案 */}
            <h2
              className="text-lg font-semibold tracking-wide mb-2 pr-8"
              style={{ color: COLORS.textPrimary }}
            >
              {preview.title}
            </h2>
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ color: COLORS.deepBrown, opacity: 0.75 }}
            >
              {preview.subtitle}
            </p>

            {/* 生成依据 */}
            {Object.keys(preview.baseInfo).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span
                  className="text-[11px] font-medium flex-shrink-0"
                  style={{ color: COLORS.deepBrown, opacity: 0.5 }}
                >
                  生成依据
                </span>
                {Object.entries(preview.baseInfo).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2.5 py-1 rounded-full text-[11px]"
                    style={{
                      backgroundColor: `${COLORS.mistPink}55`,
                      color: COLORS.textPrimary,
                      border: `1px solid ${COLORS.warmBrown}28`,
                    }}
                  >
                    {key}：{value}
                  </span>
                ))}
              </div>
            )}

            {/* 主体 sections */}
            <div className="space-y-3">
              {visibleSections.map((section, si) => (
                <motion.div
                  key={si}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.06 }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="w-1 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS.gold }}
                    />
                    <h3 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      {section.name}
                    </h3>
                    <span
                      className="text-[11px]"
                      style={{ color: COLORS.deepBrown, opacity: 0.5 }}
                    >
                      · 来自 {section.sourceCount} 条灵感
                    </span>
                  </div>

                  <div className="space-y-2">
                    {section.items.map((item, ii) => (
                      <div
                        key={ii}
                        className="rounded-xl px-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          border: `1px solid ${COLORS.warmBrown}10`,
                        }}
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <h4 className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                            {item.title}
                          </h4>
                          {item.sourceSeedIds.length > 0 && (
                            <span
                              className="text-[10px] flex-shrink-0 ml-2"
                              style={{ color: COLORS.deepBrown, opacity: 0.45 }}
                            >
                              来源：{item.sourceSeedIds.length} 条灵感
                            </span>
                          )}
                        </div>
                        {item.summary && (
                          <p className="text-xs leading-relaxed mb-1.5" style={{ color: COLORS.deepBrown }}>
                            {item.summary}
                          </p>
                        )}
                        {item.reason && (
                          <p
                            className="text-[11px] leading-relaxed mb-2 flex items-start gap-1"
                            style={{ color: COLORS.deepBrown, opacity: 0.65 }}
                          >
                            <span className="flex-shrink-0 mt-0.5">💡</span>
                            <span>{item.reason}</span>
                          </p>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map((tag, ti) => {
                              const v = TAG_VARIANTS[ti % TAG_VARIANTS.length];
                              return (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-full text-[10px]"
                                  style={{ backgroundColor: v.bg, color: v.text, border: `1px solid ${v.border}` }}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {item.hasUncertainInfo && item.uncertainNote && (
                          <div
                            className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg mt-1.5"
                            style={{
                              backgroundColor: `${COLORS.cream}99`,
                              border: `1px dashed ${COLORS.warmBrown}28`,
                            }}
                          >
                            <span className="text-[10px] flex-shrink-0 mt-px">🌱</span>
                            <p className="text-[10px] leading-relaxed" style={{ color: COLORS.deepBrown, opacity: 0.7 }}>
                              {item.uncertainNote}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {si < visibleSections.length - 1 && (
                    <div className="mt-3" style={{ borderTop: `1px solid ${COLORS.warmBrown}10` }} />
                  )}
                </motion.div>
              ))}
            </div>

            {/* 底部轻提示 */}
            {emptyHint && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-5 px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: 'rgba(220, 232, 208, 0.25)',
                  border: `1px solid rgba(180, 200, 165, 0.2)`,
                }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: COLORS.deepBrown, opacity: 0.65 }}>
                  {emptyHint}
                </p>
              </motion.div>
            )}

            <div className="h-16" />
          </div>
        )}

        {/* ====== 底部按钮 — 仅在有有效内容时展示 ====== */}
        {!loading && preview && hasContent && (
          <div
            className="flex justify-center pt-4 mt-2"
            style={{ borderTop: `1px solid ${COLORS.warmBrown}18` }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={confirming}
              className="px-8 py-2.5 text-sm font-medium text-white rounded-full transition-all disabled:opacity-60"
              style={{
                background: confirming
                  ? `linear-gradient(135deg, ${COLORS.warmBrown}88 0%, ${COLORS.deepBrown}88 100%)`
                  : `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
                boxShadow: confirming ? 'none' : '0 2px 12px rgba(237, 114, 110, 0.25)',
              }}
            >
              {confirming ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="inline-block w-3.5 h-3.5 rounded-full border border-white border-t-transparent"
                  />
                  保存中...
                </span>
              ) : hasExistingHarvest ? (
                '确认更新清单'
              ) : (
                '确认生成清单'
              )}
            </motion.button>
          </div>
        )}
      </div>
    </Modal>
  );
}
