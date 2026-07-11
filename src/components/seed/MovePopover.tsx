// src/components/seed/MovePopover.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { GARDEN_CONFIG, COLORS, STAGE_EMOJI } from '@/lib/constants';
import type { GardenType, Topic } from '@/types';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

interface MovePopoverProps {
  seedId: string;
  currentTopicId: string;
  currentGardenType: GardenType;
  open: boolean;
  onClose: () => void;
  onMoved: (seedId: string) => void;
}

type TopicWithCount = Topic & { seed_count?: number };

export function MovePopover({
  seedId,
  currentTopicId,
  currentGardenType,
  open,
  onClose,
  onMoved,
}: MovePopoverProps) {
  // 过滤掉当前种子所在的一级花园
  const availableGardens = VALID_GARDENS.filter((g) => g !== currentGardenType);

  const [selectedGarden, setSelectedGarden] = useState<GardenType | null>(null);
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 选择花园后加载其二级主题
  useEffect(() => {
    if (!open || !selectedGarden) {
      setTopics([]);
      setSelectedTopicId(null);
      return;
    }
    setTopicsLoading(true);
    setError(null);
    setSelectedTopicId(null);

    fetch(`/api/garden/${selectedGarden}`)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          throw new Error(`花园 API 返回 ${r.status}: ${text.slice(0, 200)}`);
        }
        return r.json();
      })
      .then((d) => {
        const raw = d?.topics;
        const all: TopicWithCount[] = Array.isArray(raw) ? raw : [];
        // 排除当前主题
        setTopics(all.filter((t) => t?.id && t.id !== currentTopicId));
      })
      .catch((err) => {
        console.error('MovePopover 加载主题失败:', err);
        setError(err instanceof Error ? err.message : '加载主题失败');
      })
      .finally(() => setTopicsLoading(false));
  }, [open, selectedGarden, currentTopicId]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setSelectedGarden(null);
      setSelectedTopicId(null);
      setTopics([]);
      setError(null);
    }
  }, [open]);

  const canConfirm = selectedGarden !== null;

  const handleMove = useCallback(async () => {
    if (!canConfirm) return;
    setMoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/seed/${seedId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGardenType: selectedGarden,
          targetTopicId: selectedTopicId || undefined,
        }),
      });
      if (res.ok) {
        onMoved(seedId);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '移动失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setMoving(false);
    }
  }, [canConfirm, selectedGarden, selectedTopicId, seedId, onMoved, onClose]);

  const selectedGardenName = selectedGarden ? GARDEN_CONFIG[selectedGarden].name : '';
  const selectedTopicName = (() => {
    if (!selectedTopicId) return '';
    return topics.find((t) => t.id === selectedTopicId)?.topic_name ?? '';
  })();

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* 标题行 + 关闭按钮 */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
            移动到其他植物
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all hover:bg-black/5"
            style={{ color: COLORS.deepBrown }}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Step 1：选择一级花圃（排除当前） */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: COLORS.deepBrown }}>
            选择目标花圃
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {availableGardens.map((g) => {
              const config = GARDEN_CONFIG[g];
              const isActive = selectedGarden === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setSelectedGarden((prev) => (prev === g ? null : g))
                  }
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-xs transition-all"
                  style={{
                    backgroundColor: isActive
                      ? `${COLORS.mistPink}99`
                      : 'rgba(255,255,255,0.5)',
                    color: COLORS.textPrimary,
                    border: isActive
                      ? `1px solid ${COLORS.warmBrown}66`
                      : `1px solid ${COLORS.warmBrown}22`,
                  }}
                >
                  <span className="text-base">{config.icon}</span>
                  <span className="ml-1">{config.name}</span>
                </button>
              );
            })}
          </div>
          {availableGardens.length === 0 && (
            <p className="text-xs py-2" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
              没有其他可移动的花圃
            </p>
          )}
        </div>

        {/* Step 2：选择二级主题（可选） */}
        {selectedGarden && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: COLORS.deepBrown }}>
              选择目标植物
              <span className="font-normal ml-1" style={{ opacity: 0.5 }}>（可选）</span>
            </p>
            {topicsLoading ? (
              <p className="text-xs py-2" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                加载中...
              </p>
            ) : topics.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setSelectedTopicId((prev) => (prev === t.id ? null : t.id))
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all"
                    style={{
                      backgroundColor:
                        selectedTopicId === t.id
                          ? `${COLORS.gold}22`
                          : 'transparent',
                      border:
                        selectedTopicId === t.id
                          ? `1px solid ${COLORS.gold}66`
                          : `1px solid transparent`,
                      color: COLORS.textPrimary,
                    }}
                  >
                    <span className="text-base">{STAGE_EMOJI[t.stage]}</span>
                    <span className="flex-1">{t.topic_name}</span>
                    <span className="text-xs" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                      {t.seed_count ?? 0} 条灵感
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs py-2" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                该花圃暂无其他植物，种子将直接放入花圃
              </p>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <p className="text-xs text-center" style={{ color: COLORS.coral }}>
            😥 {error}
          </p>
        )}

        {/* 确认按钮 */}
        <button
          type="button"
          disabled={!canConfirm || moving}
          onClick={handleMove}
          className="w-full py-2.5 text-sm font-medium rounded-full text-white transition-all disabled:opacity-40 hover:translate-y-[-1px]"
          style={{
            background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
          }}
        >
          {moving
            ? '移动中...'
            : !canConfirm
              ? '请先选择目标花圃'
              : selectedTopicId
                ? `移动到「${selectedGardenName} · ${selectedTopicName}」`
                : `移动到「${selectedGardenName}」`}
        </button>
      </div>
    </Modal>
  );
}
