// src/components/garden/TopicDetail.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Topic, Seed, Harvest, HarvestPreview, BranchInfo } from '@/types';
import { GARDEN_CONFIG, COLORS, BRANCH_ICONS } from '@/lib/constants';
import { GardenScene } from '@/components/garden/GardenScene';
import { GrowthStatusCard } from '@/components/garden/GrowthStatusCard';
import { PreferenceCard } from '@/components/garden/PreferenceCard';
import { TagCard } from '@/components/garden/TagCard';
import { BranchCard } from '@/components/garden/BranchCard';
import { HarvestClipboard } from '@/components/garden/HarvestClipboard';
import { TitleBanner } from '@/components/garden/TitleBanner';
import { SeedListSection } from '@/components/garden/SeedListSection';
import { TopicDetailNav } from '@/components/garden/TopicDetailNav';
import { HarvestPreviewPanel } from '@/components/garden/HarvestPreviewPanel';
import { useSetBreadcrumb } from '@/hooks/useBreadcrumb';
import { simulateDelay } from '@/lib/demo-data';

interface TopicDetailProps {
  topic: Topic;
  seeds: Seed[];
  /** 数据模式：'user' 读真实 DB，'demo' 读静态数据，默认 'user' */
  mode?: 'user' | 'demo';
  /** demo 模式下的预置清单数据 */
  demoHarvest?: Harvest | null;
  /** demo 模式下的预置清单预览 */
  demoHarvestPreview?: HarvestPreview | null;
  /** demo 模式下的 toast 回调 */
  onDemoToast?: (msg: string) => void;
}

export function TopicDetail({
  topic: initialTopic,
  seeds,
  mode = 'user',
  demoHarvest,
  demoHarvestPreview,
  onDemoToast,
}: TopicDetailProps) {
  const isDemo = mode === 'demo';
  const demoBasePath = isDemo ? '/demo/inspiration-garden' : '/garden';
  const [topic, setTopic] = useState(initialTopic);
  const [localSeeds, setLocalSeeds] = useState(seeds);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // ============ 清单生成状态 ============
  const [isHarvestPanelOpen, setIsHarvestPanelOpen] = useState(false);
  const [harvestPreview, setHarvestPreview] = useState<HarvestPreview | null>(null);
  const [harvestLoading, setHarvestLoading] = useState(false);
  const [harvestError, setHarvestError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [existingHarvest, setExistingHarvest] = useState<Harvest | null>(null);
  const [newSeedsSinceHarvest, setNewSeedsSinceHarvest] = useState(0);

  // ============ 自定义分支（UI 创建，持久化到 topic） ============
  const [customBranches, setCustomBranches] = useState<string[]>([]);

  const config = GARDEN_CONFIG[topic.garden_type];

  // 面包屑反映到 TopNav
  useSetBreadcrumb([
    { label: config.name, href: `${demoBasePath}/${topic.garden_type}` },
    { label: topic.topic_name },
  ]);

  // 加载已有清单
  useEffect(() => {
    if (isDemo) {
      // demo 模式：直接使用预置清单数据
      if (demoHarvest) setExistingHarvest(demoHarvest);
      return;
    }
    fetch(`/api/harvest?topicId=${topic.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.harvest) setExistingHarvest(d.harvest as Harvest);
        setNewSeedsSinceHarvest((d.newSeedsSinceHarvest as number) ?? 0);
      })
      .catch(() => {});
  }, [topic.id, isDemo, demoHarvest]);

  // ============ 分支统计 ============
  const branchStats: BranchInfo[] = useMemo(() => {
    const counts: Record<string, number> = {};
    const isCustom: Record<string, boolean> = {};
    // 预设分支
    config.structureBranches.forEach((b) => {
      counts[b] = 0;
    });
    // 自定义分支（标记 isCustom 以便始终展示）
    customBranches.forEach((b) => {
      counts[b] = 0;
      isCustom[b] = true;
    });
    // 统计 seeds
    localSeeds.forEach((s) => {
      if (s.branch && counts[s.branch] !== undefined) {
        counts[s.branch]++;
      } else if (s.branch) {
        counts[s.branch] = 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      icon: BRANCH_ICONS[name] || '📁',
      isCustom: isCustom[name] || false,
    }));
  }, [localSeeds, config.structureBranches, customBranches]);

  // 分支筛选后的 seeds
  const branchFilteredSeeds = useMemo(() => {
    if (!selectedBranch) return localSeeds;
    return localSeeds.filter((s) => s.branch === selectedBranch);
  }, [localSeeds, selectedBranch]);

  // ============ API 调用 ============

  // 清单生成
  const handleHarvest = useCallback(async () => {
    setHarvestLoading(true);
    setHarvestError(null);
    try {
      if (isDemo) {
        // demo 模式：模拟 1-1.5 秒 loading 后展示预置清单
        await simulateDelay(1200);
        if (demoHarvestPreview) {
          setHarvestPreview(demoHarvestPreview);
          setIsHarvestPanelOpen(true);
        } else {
          setHarvestError('Demo 示例清单暂未准备，请稍后重试');
        }
        return;
      }
      const res = await fetch('/api/harvest/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: topic.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '生成失败');
      }
      const data = await res.json();
      setHarvestPreview(data.preview as HarvestPreview);
      setIsHarvestPanelOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成清单失败，请重试';
      setHarvestError(msg);
    } finally {
      setHarvestLoading(false);
    }
  }, [topic.id, isDemo, demoHarvestPreview]);

  // 确认保存清单
  const handleConfirmHarvest = useCallback(async () => {
    if (!harvestPreview) return;
    if (isDemo) {
      onDemoToast?.('Demo 体验模式，登录后可保存清单到你的专属花园。');
      setIsHarvestPanelOpen(false);
      setHarvestPreview(null);
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch('/api/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          outputType: harvestPreview.outputType,
          title: harvestPreview.title,
          subtitle: harvestPreview.subtitle,
          baseInfo: harvestPreview.baseInfo,
          sections: harvestPreview.sections,
        }),
      });
      if (!res.ok) throw new Error('保存失败');
      const data = await res.json();
      setExistingHarvest(data.harvest as Harvest);
      setIsHarvestPanelOpen(false);
      setHarvestPreview(null);
    } catch (err) {
      console.error('Harvest save failed:', err);
    } finally {
      setConfirming(false);
    }
  }, [harvestPreview, topic.id, isDemo, onDemoToast]);

  // 查看已有清单 — 将 Harvest 转为 HarvestPreview 打开预览面板
  const handleViewHarvest = useCallback(() => {
    if (!existingHarvest) return;
    const existingSeedCount = existingHarvest.sections.reduce(
      (sum, s) => sum + (s.sourceCount ?? 0), 0,
    );
    setHarvestPreview({
      title: existingHarvest.title,
      subtitle: existingHarvest.subtitle,
      outputType: existingHarvest.output_type,
      baseInfo: existingHarvest.base_info,
      sections: existingHarvest.sections,
      seedCount: existingSeedCount,
    });
    setHarvestError(null);
    setIsHarvestPanelOpen(true);
  }, [existingHarvest]);

  // 保存偏好
  const handleSavePreferences = useCallback(
    async (fields: Record<string, string>) => {
      if (isDemo) {
        // demo 模式：仅更新本地状态
        setTopic((prev) => ({ ...prev, profile_fields: { ...(prev.profile_fields ?? {}), ...fields } }));
        onDemoToast?.('偏好已临时更新（Demo 模式，刷新后恢复默认）');
        return;
      }
      try {
        const res = await fetch(`/api/topic/${topic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_fields: fields }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topic) setTopic(data.topic as Topic);
        }
      } catch (err) {
        console.error('Save preferences failed:', err);
      }
    },
    [topic.id, isDemo, onDemoToast],
  );

  // 编辑主题名称
  const handleTopicNameChange = useCallback(
    async (newName: string) => {
      if (isDemo) {
        setTopic((prev) => ({ ...prev, topic_name: newName }));
        onDemoToast?.('名称已临时修改（Demo 模式，刷新后恢复默认）');
        return;
      }
      try {
        const res = await fetch(`/api/topic/${topic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_name: newName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topic) setTopic(data.topic as Topic);
        }
      } catch (err) {
        console.error('Rename failed:', err);
      }
    },
    [topic.id, isDemo, onDemoToast],
  );

  // 添加标签
  const handleAddTag = useCallback(
    async (tag: string) => {
      if (isDemo) {
        setTopic((prev) => ({ ...prev, tags: [...(prev.tags ?? []), tag] }));
        onDemoToast?.('标签已临时添加（Demo 模式，刷新后恢复默认）');
        return;
      }
      try {
        const res = await fetch(`/api/topic/${topic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: [tag] }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topic) setTopic(data.topic as Topic);
        }
      } catch (err) {
        console.error('Add tag failed:', err);
      }
    },
    [topic.id, isDemo, onDemoToast],
  );

  // 新建分支（UI 记录）
  const handleCreateBranch = useCallback(async (name: string) => {
    setCustomBranches((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  // 计算清单总灵感数
  const harvestSeedCount = useMemo(() => {
    if (!existingHarvest?.sections) return 0;
    return existingHarvest.sections.reduce((sum, s) => sum + (s.sourceCount || 0), 0);
  }, [existingHarvest]);

  return (
    <div
      className="w-full"
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: `linear-gradient(180deg, ${COLORS.cream} 0%, ${COLORS.mistPink}44 100%)`,
      }}
    >
      {/* ====== 主体内容区 ====== */}
      <div className="w-full max-w-[1600px] mx-auto px-6 pt-4">
        {/* ====== 三栏主体（标题浮层已融入左栏花园场景） ====== */}
        <div className="flex gap-6">
          {/* 左栏：花园场景 + 标题浮层 37% */}
          <div className="w-[37%] flex-shrink-0 relative">
            {/* 花园场景 — 充满整个左栏，延伸到标题背后 */}
            <GardenScene
              plantFamily={topic.plant_family}
              stage={topic.stage}
              topicName={topic.topic_name}
              growthScore={Number(topic.growth_score)}
              seedCount={localSeeds.length}
              gardenType={topic.garden_type}
            />
            {/* 标题浮层 — 绝对定位在花园场景上方 */}
            <TitleBanner
              topicName={topic.topic_name}
              gardenType={topic.garden_type}
              stage={topic.stage}
              seedCount={localSeeds.length}
              onTopicNameChange={handleTopicNameChange}
              floating
            >
              <TopicDetailNav
                currentGarden={topic.garden_type}
                currentTopicId={topic.id}
                currentTopicName={topic.topic_name}
                variant="capsule"
                basePath={demoBasePath}
              />
            </TitleBanner>
          </div>

          {/* 中栏：信息浮层 37% */}
          <div className="w-[37%] flex-shrink-0 flex flex-col gap-4" style={{ paddingTop: 0 }}>
            <GrowthStatusCard
              growthScore={Number(topic.growth_score)}
              seedCount={localSeeds.length}
              stage={topic.stage}
            />

            <PreferenceCard
              gardenType={topic.garden_type}
              topicFields={config.topicFields}
              profileFields={(topic.profile_fields ?? {}) as Record<string, string>}
              onSavePreferences={handleSavePreferences}
            />

            <div className="grid grid-cols-2 gap-4">
              <TagCard
                tags={(topic.tags ?? []) as string[]}
                selectedTag={selectedTag}
                onToggleTagFilter={setSelectedTag}
                onAddTag={handleAddTag}
              />
              <BranchCard
                branches={branchStats}
                selectedBranch={selectedBranch}
                onToggleBranchFilter={setSelectedBranch}
                onCreateBranch={handleCreateBranch}
              />
            </div>
          </div>

          {/* 右栏：清单夹板 26% */}
          <div className="w-[26%] flex-shrink-0">
            <HarvestClipboard
              existingHarvest={existingHarvest}
              harvestLoading={harvestLoading}
              harvestError={harvestError}
              structureBranches={config.structureBranches}
              onGenerateHarvest={handleHarvest}
              onViewHarvest={handleViewHarvest}
              topicName={topic.topic_name}
              seedCount={localSeeds.length}
              newSeedsSinceHarvest={newSeedsSinceHarvest}
            />
          </div>
        </div>

        {/* ====== 底部灵感列表 90% 宽通栏 ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-[90%] mx-auto mt-8 pb-16"
        >
          {/* 列表标题 */}
          <div className="flex items-baseline justify-between mb-4">
            <h2
              className="text-sm font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              灵感列表（{branchFilteredSeeds.length}）
            </h2>
          </div>

          <SeedListSection
            seeds={branchFilteredSeeds}
            topic={topic}
            onSeedsChange={setLocalSeeds}
          />
        </motion.div>
      </div>

      {/* ====== 清单预览面板 ====== */}
      <HarvestPreviewPanel
        open={isHarvestPanelOpen}
        onClose={() => {
          setIsHarvestPanelOpen(false);
          setHarvestPreview(null);
        }}
        preview={harvestPreview}
        loading={harvestLoading}
        hasExistingHarvest={existingHarvest !== null}
        onConfirm={handleConfirmHarvest}
        confirming={confirming}
        topicName={topic.topic_name}
        structureBranches={config.structureBranches}
      />
    </div>
  );
}
