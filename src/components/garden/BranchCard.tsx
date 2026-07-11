'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { COLORS, BRANCH_ICONS } from '@/lib/constants';
import type { BranchInfo } from '@/types';
import { BranchInputPopover } from './BranchInputPopover';

interface BranchCardProps {
  branches: BranchInfo[];
  selectedBranch: string | null;
  onToggleBranchFilter: (branch: string | null) => void;
  onCreateBranch: (name: string) => Promise<void>;
  className?: string;
}

export function BranchCard({
  branches,
  selectedBranch,
  onToggleBranchFilter,
  onCreateBranch,
  className = '',
}: BranchCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 展示有内容的预设分支 + 所有自定义分支（含新建的 count=0 分支）
  const effectiveBranches = useMemo(
    () => branches.filter((b) => b.count > 0 || b.isCustom),
    [branches],
  );

  const existingBranchNames = useMemo(
    () => branches.map((b) => b.name),
    [branches],
  );

  const hasBranches = effectiveBranches.length > 0;

  const handleBranchClick = (name: string) => {
    if (selectedBranch === name) {
      onToggleBranchFilter(null);
    } else {
      onToggleBranchFilter(name);
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
        🪴
      </span>

      <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>
        分支结构
      </h3>

      {hasBranches ? (
        <>
          <p className="text-xs mb-3" style={{ color: COLORS.deepBrown }}>
            已创建{' '}
            <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
              {effectiveBranches.length}
            </span>{' '}
            个分支
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {effectiveBranches.map((branch) => {
              const isSelected = selectedBranch === branch.name;
              const icon = branch.icon || BRANCH_ICONS[branch.name] || '📁';
              return (
                <motion.button
                  key={branch.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleBranchClick(branch.name)}
                  className="capsule-tag-interactive"
                  style={{
                    background: isSelected
                      ? `${COLORS.mistPink}`
                      : `${COLORS.mistPink}60`,
                    color: COLORS.textPrimary,
                    border: isSelected
                      ? `1.5px solid ${COLORS.warmBrown}`
                      : `1px solid ${COLORS.warmBrown}40`,
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  <span className="mr-1 text-xs">{icon}</span>
                  {branch.name}
                  <span
                    className="ml-1 text-xs"
                    style={{ color: COLORS.deepBrown, opacity: 0.7 }}
                  >
                    {branch.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mb-3">
          <p className="text-xs leading-relaxed" style={{ color: COLORS.deepBrown }}>
            暂时还没有形成明显分支。
          </p>
          <p className="text-xs leading-relaxed mt-1" style={{ color: COLORS.warmBrown }}>
            当你继续收藏相关内容后，这里会自动长出分支。
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
        <span>+</span> 新建分支
      </button>

      <BranchInputPopover
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        onCreate={onCreateBranch}
        existingBranches={existingBranchNames}
      />
    </div>
  );
}
