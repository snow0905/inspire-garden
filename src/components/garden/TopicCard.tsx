// src/components/garden/TopicCard.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { TopicCard as TopicCardType } from '@/types';
import { COLORS } from '@/lib/constants';

interface TopicCardProps {
  topic: TopicCardType;
  gardenId: string;
}

const STAGE_ICONS: Record<string, string> = {
  seed: '🌰', sprout: '🌱', growing: '🌿', bloom: '🌸', fruit: '🍎',
};

const STAGE_LABELS: Record<string, string> = {
  seed: '种子', sprout: '发芽', growing: '生长中', bloom: '开花', fruit: '结果',
};

export function TopicCard({ topic, gardenId }: TopicCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} className="float-panel p-5 cursor-pointer">
      <Link href={`/garden/${gardenId}/${topic.topicId}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{STAGE_ICONS[topic.stage]}</span>
            <div>
              <h3 className="text-base font-medium" style={{ color: COLORS.textPrimary }}>{topic.topicName}</h3>
              <p className="text-xs" style={{ color: COLORS.deepBrown }}>{topic.gardenName} · {STAGE_LABELS[topic.stage]}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold" style={{ color: COLORS.gold }}>{topic.growthScore}</div>
            <div className="text-xs" style={{ color: COLORS.deepBrown }}>生长值</div>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden"
          style={{ backgroundColor: `${COLORS.mistPink}80` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${topic.growthScore}%` }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.darkGold})` }}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {topic.tags.map((tag) => (
            <span key={tag} className="capsule-tag">{tag}</span>
          ))}
          {topic.canHarvest && (
            <span className="capsule-tag" style={{ background: `${COLORS.coral}26`, color: COLORS.coral }}>
              可采摘
            </span>
          )}
        </div>

        {topic.missingFields.length > 0 && (
          <p className="text-xs mt-2" style={{ color: COLORS.deepBrown }}>
            待补水：{topic.missingFields.join('、')}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
