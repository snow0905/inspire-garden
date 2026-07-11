'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS, PREFERENCE_LABELS } from '@/lib/constants';
import { PreferencePopover } from './PreferencePopover';

interface PreferenceCardProps {
  gardenType: string;
  topicFields: string[];
  profileFields: Record<string, string>;
  onSavePreferences: (fields: Record<string, string>) => Promise<void>;
  className?: string;
}

export function PreferenceCard({
  gardenType,
  topicFields,
  profileFields,
  onSavePreferences,
  className = '',
}: PreferenceCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = PREFERENCE_LABELS[gardenType] || '补充信息';
  const fields = topicFields || [];
  const existing = profileFields ?? {};

  const filled = fields.filter((f) => existing[f]?.trim());
  const missing = fields.filter((f) => !existing[f]?.trim());
  const isAllFilled = filled.length === fields.length;
  const isEmpty = filled.length === 0;

  const handleSave = async (fields: Record<string, string>) => {
    // 先保存 → 父级更新 topic 状态 → 卡片收到新 profileFields props
    await onSavePreferences(fields);
    // 再关闭 Popover，用户看到的是已回显的最新数据
    setPopoverOpen(false);
  };

  return (
    <div className={`float-card relative ${className}`}>
      {/* 角落小叶子装饰 */}
      <span
        className="absolute text-sm select-none pointer-events-none"
        style={{ top: 12, right: 14, opacity: 0.35 }}
        aria-hidden="true"
      >
        🍃
      </span>

      <h3
        className="text-xs font-semibold mb-3 flex items-center gap-1.5"
        style={{ color: COLORS.deepBrown }}
      >
        <span>🍃</span> {label}
        {filled.length > 0 && (
          <span
            className="text-[10px] font-normal ml-auto"
            style={{ color: COLORS.deepBrown, opacity: 0.5 }}
          >
            {filled.length}/{fields.length}
          </span>
        )}
      </h3>

      {isEmpty && (
        <p
          className="text-xs mb-3"
          style={{ color: COLORS.deepBrown, opacity: 0.5 }}
        >
          可以补充一些偏好，小园丁会在生成清单时参考它们。
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {filled.map((field) => (
          <span
            key={field}
            className="px-2.5 py-1 rounded-full text-[11px]"
            style={{
              backgroundColor: 'rgba(196, 212, 184, 0.5)',
              color: '#4a5e3a',
              border: '1px solid rgba(140, 170, 130, 0.35)',
            }}
          >
            {field}
            {existing[field] && existing[field].length <= 8 ? `：${existing[field]}` : ''}
          </span>
        ))}
        {missing.map((field) => (
          <span
            key={field}
            className="px-2.5 py-1 rounded-full text-[11px]"
            style={{
              backgroundColor: `${COLORS.mistPink}66`,
              color: COLORS.deepBrown,
              border: `1px dashed ${COLORS.warmBrown}33`,
              opacity: 0.6,
            }}
          >
            {field}
          </span>
        ))}
      </div>

      {!isEmpty && !isAllFilled && missing.length > 0 && (
        <p
          className="text-[11px] mb-3"
          style={{ color: COLORS.deepBrown, opacity: 0.4 }}
        >
          还可以补充：{missing.slice(0, 2).join('、')}
          {missing.length > 2 ? ` 等 ${missing.length} 项` : ''}
        </p>
      )}

      <motion.button
        ref={triggerRef}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setPopoverOpen(true)}
        className="px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors inline-flex items-center gap-1"
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
        {isEmpty ? <><span>+</span> 补充偏好</> : isAllFilled ? '修改偏好' : '继续补充'}
      </motion.button>

      <PreferencePopover
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        gardenType={gardenType}
        topicFields={fields}
        initialValues={existing}
        onSave={handleSave}
        triggerRef={triggerRef}
      />
    </div>
  );
}
