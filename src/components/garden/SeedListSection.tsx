// src/components/garden/SeedListSection.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Seed, Topic, SourceType } from '@/types';
import { COLORS } from '@/lib/constants';
import { SeedCard } from '@/components/seed/SeedCard';
import { ImageViewer } from '@/components/seed/ImageViewer';
import { MovePopover } from '@/components/seed/MovePopover';

interface SeedListSectionProps {
  seeds: Seed[];
  topic: Topic;
  /** 支持直接传数组或函数式更新（prev => next），与 React setState 一致 */
  onSeedsChange: (seeds: Seed[] | ((prev: Seed[]) => Seed[])) => void;
}

const SOURCE_FILTER_TABS: { key: 'all' | SourceType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'image', label: '图片', icon: '📸' },
  { key: 'link', label: '链接', icon: '🔗' },
  { key: 'text', label: '文字', icon: '✏️' },
  { key: 'wechat', label: '微信', icon: '💬' },
];


export function SeedListSection({ seeds, topic, onSeedsChange }: SeedListSectionProps) {
  // 来源筛选状态
  const [activeSourceFilter, setActiveSourceFilter] = useState<'all' | SourceType>('all');

  // 交互状态
  const [expandedSeedId, setExpandedSeedId] = useState<string | null>(null);
  const [supplementingSeedId, setSupplementingSeedId] = useState<string | null>(null);
  const [movingSeedId, setMovingSeedId] = useState<string | null>(null);
  const [imageViewerSeed, setImageViewerSeed] = useState<Seed | null>(null);

  // ===== 筛选 + 排序 =====
  const filteredSeeds = useMemo(() => {
    let result = seeds;

    // 来源类型筛选
    if (activeSourceFilter !== 'all') {
      result = result.filter((s) => s.source_type === activeSourceFilter);
    }

    return result;
  }, [seeds, activeSourceFilter]);

  // ===== 判断最新 =====
  const isLatestSeed = useCallback(
    (seed: Seed) => {
      if (seeds.length === 0) return false;
      // seeds 从服务端已按 created_at DESC 排序
      return seed.id === seeds[0].id;
    },
    [seeds],
  );

  // ===== 查看原文/原图/链接 =====
  const getImageUrl = useCallback((seed: Seed): string | null => {
    // 优先使用 image_url，否则尝试从 content 中提取
    if (seed.image_url) return seed.image_url;
    const content = seed.content as Record<string, string> | undefined;
    if (content) {
      return content.imageUrl || content.originalImageUrl || content.image_url || content.url || null;
    }
    return null;
  }, []);

  const handleViewOriginal = useCallback(
    (seed: Seed) => {
      switch (seed.source_type) {
        case 'image': {
          const imgUrl = getImageUrl(seed);
          if (imgUrl) setImageViewerSeed({ ...seed, image_url: imgUrl });
          break;
        }
        case 'link':
          if (seed.source_url) window.open(seed.source_url, '_blank', 'noopener,noreferrer');
          break;
        case 'text':
        case 'wechat':
          // 展开/收起卡片查看原文
          setExpandedSeedId((prev) => (prev === seed.id ? null : seed.id));
          break;
      }
    },
    [getImageUrl],
  );

  // ===== 展开/收起 AI 信息 =====
  const handleToggleExpand = useCallback((seedId: string) => {
    setExpandedSeedId((prev) => (prev === seedId ? null : seedId));
  }, []);

  // ===== 补充信息 =====
  const handleToggleSupplement = useCallback((seedId: string) => {
    setSupplementingSeedId((prev) => (prev === seedId ? null : seedId));
  }, []);

  const handleSupplementSave = useCallback(
    async (seedId: string, notes: string) => {
      let res: Response;
      try {
        res = await fetch(`/api/seed/${seedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_notes: notes }),
        });
      } catch (networkErr) {
        console.error('Network error during supplement save:', networkErr);
        throw new Error('网络错误，请检查连接后重试');
      }

      if (res.ok) {
        // 使用函数式更新，避免 seeds prop 被筛选后导致数据丢失
        onSeedsChange((prev: Seed[]) =>
          prev.map((s) => (s.id === seedId ? { ...s, user_notes: notes } : s)),
        );
        setSupplementingSeedId(null);
        return;
      }

      // 尝试提取 API 返回的错误信息
      let errorMsg = '保存失败';
      try {
        const errData = await res.json();
        if (errData?.error) errorMsg = errData.error;
      } catch {
        // 无法解析错误响应
      }
      throw new Error(errorMsg);
    },
    [onSeedsChange],
  );

  // ===== 移动到其他植物 =====
  const handleMove = useCallback((seedId: string) => {
    setMovingSeedId(seedId);
  }, []);

  const handleMoved = useCallback(
    (seedId: string) => {
      // 使用函数式更新，始终操作完整的种子列表，避免分支筛选后数据丢失
      onSeedsChange((prev: Seed[]) => prev.filter((s) => s.id !== seedId));
    },
    [onSeedsChange],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* ===== 第一层：来源类型筛选（浅色胶囊） ===== */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {SOURCE_FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSourceFilter(tab.key)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all"
            style={{
              backgroundColor:
                activeSourceFilter === tab.key
                  ? `${COLORS.mistPink}55`
                  : 'transparent',
              color: COLORS.textPrimary,
              border:
                activeSourceFilter === tab.key
                  ? `1px solid ${COLORS.warmBrown}44`
                  : `1px solid ${COLORS.warmBrown}18`,
              fontWeight: activeSourceFilter === tab.key ? 500 : 400,
              opacity: activeSourceFilter === tab.key ? 1 : 0.55,
            }}
          >
            <span className="text-[11px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== 灵感卡片列表 ===== */}
      {filteredSeeds.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            border: `1px dashed ${COLORS.warmBrown}33`,
          }}
        >
          <p className="text-3xl mb-3">🌱</p>
          <p className="text-sm mb-1" style={{ color: COLORS.textPrimary }}>
            没有找到符合这个标签的灵感。
          </p>
          <p className="text-xs" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
            换个标签看看，或者继续给这株植物投喂新的灵感吧。
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSeeds.map((seed) => {
            // 判断这条是否最后上传的 (在整个列表中最早)
            const isLatest = isLatestSeed(seed) && activeSourceFilter === 'all';
            return (
              <SeedCard
                key={seed.id}
                seed={seed}
                isLatest={isLatest}
                expanded={expandedSeedId === seed.id}
                supplementing={supplementingSeedId === seed.id}
                onToggleExpand={handleToggleExpand}
                onToggleSupplement={handleToggleSupplement}
                onSupplementSave={handleSupplementSave}
                onViewOriginal={handleViewOriginal}
                onMove={handleMove}
              />
            );
          })}
        </div>
      )}

      {/* ===== 弹层：图片查看器 ===== */}
      <ImageViewer
        open={!!imageViewerSeed}
        onClose={() => setImageViewerSeed(null)}
        imageUrl={imageViewerSeed?.image_url ?? ''}
        title={imageViewerSeed?.title}
      />

      {/* ===== 弹层：移动到其他植物 ===== */}
      <MovePopover
        seedId={movingSeedId ?? ''}
        currentTopicId={topic.id}
        currentGardenType={topic.garden_type}
        open={!!movingSeedId}
        onClose={() => setMovingSeedId(null)}
        onMoved={handleMoved}
      />
    </motion.div>
  );
}
