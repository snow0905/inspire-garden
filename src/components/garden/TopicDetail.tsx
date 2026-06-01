// src/components/garden/TopicDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Topic, Seed } from '@/types';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';

const STAGE_ORDER = ['seed', 'sprout', 'growing', 'bloom', 'fruit'] as const;
const STAGE_LABELS: Record<string, string> = {
  seed: '🌰 种子', sprout: '🌱 发芽', growing: '🌿 生长中', bloom: '🌸 开花', fruit: '🍎 结果',
};

interface TopicDetailProps {
  topic: Topic;
  seeds: Seed[];
}

export function TopicDetail({ topic, seeds }: TopicDetailProps) {
  const [showHarvest, setShowHarvest] = useState(false);
  const router = useRouter();
  const config = GARDEN_CONFIG[topic.garden_type];
  const stageIdx = STAGE_ORDER.indexOf(topic.stage);

  const handleHarvest = async () => {
    await fetch('/api/harvest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId: topic.id }),
    });
    setShowHarvest(true);
  };

  const handleFruit = async () => {
    await fetch(`/api/topic/${topic.id}/fruit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: '已完成' }),
    });
    router.refresh();
  };

  const harvestLabels: Record<string, string> = {
    itinerary: '行程规划',
    comparison: '候选对比表',
    checklist: '检查表',
    moodboard: '灵感集',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <span className="text-sm" style={{ color: COLORS.deepBrown }}>
          {config.icon} {config.name}
        </span>
        <h1 className="text-2xl font-semibold mt-1" style={{ color: COLORS.textPrimary }}>
          {topic.topic_name}
        </h1>
      </div>

      {/* 生长轨迹 */}
      <div className="float-panel p-6 mb-6">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: COLORS.deepBrown }}
        >
          生长轨迹
        </h3>
        <div className="flex items-center gap-1">
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div
                className={`flex flex-col items-center ${
                  i <= stageIdx ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span className="text-2xl">{STAGE_LABELS[stage].split(' ')[0]}</span>
                <span className="text-xs mt-1" style={{ color: COLORS.deepBrown }}>
                  {STAGE_LABELS[stage].split(' ')[1]}
                </span>
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1"
                  style={{ backgroundColor: `${COLORS.warmBrown}33` }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i < stageIdx ? '100%' : '0%' }}
                    className="h-full"
                    style={{ backgroundColor: COLORS.gold }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 生长值三围 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['density_score', 'completeness_score', 'structure_score'] as const).map((key) => (
          <div key={key} className="float-panel p-4 text-center">
            <div className="text-2xl font-semibold" style={{ color: COLORS.gold }}>
              {topic[key]}
            </div>
            <div className="text-xs mt-1" style={{ color: COLORS.deepBrown }}>
              {key === 'density_score'
                ? '主题密度'
                : key === 'completeness_score'
                  ? '信息完整度'
                  : '主题结构度'}
            </div>
          </div>
        ))}
      </div>

      {/* 种子列表 */}
      <div className="float-panel p-6 mb-6">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: COLORS.deepBrown }}
        >
          灵感种子 ({seeds.length})
        </h3>
        {seeds.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>
            暂无种子
          </p>
        ) : (
          <div className="space-y-3">
            {seeds.map((seed) => (
              <div
                key={seed.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${COLORS.mistPink}33` }}
              >
                <span className="text-lg">
                  {seed.source_type === 'image'
                    ? '📸'
                    : seed.source_type === 'link'
                      ? '🔗'
                      : '✏️'}
                </span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: COLORS.textPrimary }}>
                    {Object.values(seed.content).filter(Boolean)[0] ?? '未命名种子'}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {seed.tags?.map((tag) => (
                      <span key={tag} className="text-xs" style={{ color: COLORS.deepBrown }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs" style={{ color: COLORS.deepBrown }}>
                  {new Date(seed.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div className="flex gap-3">
        {topic.can_harvest && topic.stage === 'bloom' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleHarvest}
            className="px-6 py-3 text-sm font-medium text-white rounded-full"
            style={{
              background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
            }}
          >
            🌸 采摘为{harvestLabels[config.harvestType]}
          </motion.button>
        )}
        {topic.stage === 'bloom' && (
          <button
            onClick={handleFruit}
            className="px-6 py-3 text-sm font-medium rounded-full border"
            style={{
              color: COLORS.textPrimary,
              borderColor: `${COLORS.warmBrown}4D`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.mistPink}4D`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🍎 标记已完成
          </button>
        )}
      </div>

      {showHarvest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 float-panel p-6 text-center"
        >
          <div className="text-4xl mb-3">🌸</div>
          <p className="text-base font-medium" style={{ color: COLORS.textPrimary }}>
            采摘成功！
          </p>
          <p className="text-sm mt-1" style={{ color: COLORS.deepBrown }}>
            已生成{harvestLabels[config.harvestType]}
          </p>
        </motion.div>
      )}
    </div>
  );
}
