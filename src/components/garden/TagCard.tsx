'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';
import { TagInputPopover } from './TagInputPopover';

interface TagCardProps {
  tags: string[];
  selectedTag: string | null;
  onToggleTagFilter: (tag: string | null) => void;
  onAddTag: (tag: string) => Promise<void>;
  className?: string;
}

const TAG_CAPSULE_COLORS = [
  { bg: '#f2e4da', text: '#7a5a4a', border: '#e0cdb8' },
  { bg: '#f5efe0', text: '#8b7355', border: '#e8dbc5' },
  { bg: '#dce8d0', text: '#5a6b42', border: '#c5d4b4' },
  { bg: '#f0e6c8', text: '#8b7528', border: '#e0d4a8' },
];

export function TagCard({ tags, selectedTag, onToggleTagFilter, onAddTag, className = '' }: TagCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const displayTags = tags.slice(0, 8);
  const hasTags = tags.length > 0;

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      onToggleTagFilter(null);
    } else {
      onToggleTagFilter(tag);
    }
  };

  return (
    <div className={`float-card ${className}`} style={{ position: 'relative' }}>
      {/* 装饰 emoji */}
      <span
        className="absolute text-lg select-none pointer-events-none"
        style={{ bottom: 10, right: 14, opacity: 0.35 }}
        aria-hidden="true"
      >
        🏷️
      </span>

      <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>
        关联标签
      </h3>

      {hasTags ? (
        <>
          <p className="text-xs mb-3" style={{ color: COLORS.deepBrown }}>
            已添加{' '}
            <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>{tags.length}</span>{' '}
            个标签
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayTags.map((tag, i) => {
              const isSelected = selectedTag === tag;
              const colorSet = TAG_CAPSULE_COLORS[i % TAG_CAPSULE_COLORS.length];
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleTagClick(tag)}
                  className="capsule-tag-interactive"
                  style={{
                    background: isSelected ? colorSet.bg : `${colorSet.bg}80`,
                    color: colorSet.text,
                    border: isSelected
                      ? `1.5px solid ${colorSet.text}50`
                      : `1px solid ${colorSet.border}`,
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  {tag}
                </motion.button>
              );
            })}
            {tags.length > 8 && (
              <span className="capsule-tag" style={{ background: 'transparent' }}>
                +{tags.length - 8}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="mb-3">
          <p className="text-xs leading-relaxed" style={{ color: COLORS.deepBrown }}>
            暂时还没有形成明确标签。
          </p>
          <p className="text-xs leading-relaxed mt-1" style={{ color: COLORS.warmBrown }}>
            继续投喂几条相关灵感后，小园丁会自动提炼关键词。
          </p>
        </div>
      )}

      <button
        onClick={() => setPopoverOpen(true)}
        className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors"
        style={{
          color: COLORS.coral,
          background: `${COLORS.mistPink}60`,
          border: `1px solid ${COLORS.warmBrown}30`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = `${COLORS.mistPink}90`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = `${COLORS.mistPink}60`;
        }}
      >
        <span>+</span> 添加标签
      </button>

      <TagInputPopover
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        onAdd={onAddTag}
      />
    </div>
  );
}
