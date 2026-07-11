// src/components/garden/PlantCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { TopicCardData } from '@/types';
import { COLORS, STAGE_LABELS, STAGE_EMOJI } from '@/lib/constants';
import { PlantAvatar } from './PlantAvatar';

interface PlantCardProps {
  data: TopicCardData;
  gardenId: string;
  basePath?: string;
}

export function PlantCard({ data, gardenId, basePath = '/garden' }: PlantCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`${basePath}/${gardenId}/${data.topicId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -5 }}
      className="relative cursor-pointer rounded-[24px] overflow-hidden flex flex-col transition-shadow duration-300 group"
      style={{
        width: '100%',
        minHeight: 340,
        background: 'rgba(255, 252, 247, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(217, 178, 153, 0.15)',
        boxShadow: '0 2px 16px rgba(148, 116, 83, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(148, 116, 83, 0.12), 0 0 0 3px rgba(181, 201, 182, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(148, 116, 83, 0.06)';
      }}
    >
      {/* ── 上半部：植物阶段图 ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 140,
          background: 'linear-gradient(180deg, rgba(181, 201, 182, 0.12) 0%, rgba(250, 246, 240, 0) 100%)',
        }}
      >
        {/* 光点装饰 */}
        <span className="absolute top-3 right-4 text-xs opacity-20">✨</span>
        <span className="absolute bottom-2 left-4 text-xs opacity-15">🍃</span>

        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <PlantAvatar
            plantFamily={data.plantFamily}
            stage={data.stage}
            size={96}
          />
        </motion.div>
      </div>

      {/* ── 下半部：植物信息 ── */}
      <div className="flex-1 flex flex-col px-4 pb-4 gap-2">
        {/* 植物名 */}
        <h3
          className="text-[18px] font-semibold leading-tight line-clamp-2"
          style={{ color: '#4a5e3a' }}
        >
          {data.topicName}
        </h3>

        {/* 阶段 + 成长值 */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[13px]" style={{ color: '#6b8b6b' }}>
            <span className="text-sm">{STAGE_EMOJI[data.stage]}</span>
            <span>{STAGE_LABELS[data.stage]}</span>
          </span>
          <span className="text-[13px] font-medium" style={{ color: COLORS.textPrimary }}>
            {data.growthScore} 成长值
          </span>
        </div>

        {/* 进度条 */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, backgroundColor: 'rgba(217, 178, 153, 0.15)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(data.growthScore, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #b5c9b6 0%, #e5c872 100%)',
            }}
          />
        </div>

        {/* 标签 */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-[12px] rounded-full"
                style={{
                  background: 'rgba(242, 228, 218, 0.4)',
                  color: '#7a6548',
                  border: '1px solid rgba(217, 178, 153, 0.12)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 最近灵感 */}
        <div className="flex-1" />
        <div className="text-[12px] leading-tight">
          <span style={{ color: COLORS.deepBrown, opacity: 0.6 }}>最近灵感</span>
          <p
            className="text-[13px] mt-0.5 truncate"
            style={{ color: COLORS.textPrimary, opacity: 0.85 }}
          >
            {data.latestSeedTitle ?? '暂无灵感'}
          </p>
        </div>

        {/* 清单状态 + 进入按钮 */}
        <div className="flex items-center justify-between mt-1">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] rounded-full"
            style={{
              background: data.hasHarvest
                ? 'rgba(181, 201, 182, 0.2)'
                : 'rgba(242, 228, 218, 0.3)',
              color: data.hasHarvest ? '#5a7a5a' : '#947453',
            }}
          >
            {data.hasHarvest ? '📋 已生成清单' : '🌿 未生成清单'}
          </span>

          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-[13px] rounded-full transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#6b8b6b',
              border: '1px solid rgba(181, 201, 182, 0.3)',
            }}
          >
            进入植物
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
          </span>
        </div>
      </div>

      {/* 底部草地装饰线 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 4,
          background: 'linear-gradient(90deg, rgba(181, 201, 182, 0.3), rgba(229, 200, 114, 0.2), rgba(181, 201, 182, 0.1))',
          borderRadius: '0 0 24px 24px',
        }}
      />
    </motion.div>
  );
}
