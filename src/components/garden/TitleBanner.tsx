// src/components/garden/TitleBanner.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GardenType, PlantStage } from '@/types';
import { COLORS, STAGE_LABELS, GARDEN_CONFIG } from '@/lib/constants';

interface TitleBannerProps {
  topicName: string;
  gardenType: GardenType;
  stage: PlantStage;
  seedCount: number;
  onTopicNameChange: (newName: string) => Promise<void>;
  children?: React.ReactNode;
  /** 浮动模式：花园场景上的半透明浮层，压缩高度 */
  floating?: boolean;
}

export function TitleBanner({
  topicName: initialTopicName,
  gardenType,
  stage,
  seedCount,
  onTopicNameChange,
  children,
  floating = false,
}: TitleBannerProps) {
  const [topicName, setTopicName] = useState(initialTopicName);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialTopicName);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步外部 topicName 变化
  useEffect(() => {
    if (!isEditing) {
      setTopicName(initialTopicName);
      setEditValue(initialTopicName);
    }
  }, [initialTopicName, isEditing]);

  // 进入编辑态时 focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const config = GARDEN_CONFIG[gardenType];
  const gardenName = config?.name ?? gardenType;

  const handleStartEdit = useCallback(() => {
    setEditValue(topicName);
    setSaveError(null);
    setIsEditing(true);
  }, [topicName]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      // 空值不保存，恢复原名
      setEditValue(topicName);
      setIsEditing(false);
      return;
    }
    if (trimmed === topicName) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onTopicNameChange(trimmed);
      setTopicName(trimmed);
      setIsEditing(false);
    } catch {
      setSaveError('保存失败');
      // 恢复编辑框内容到原值
      setEditValue(topicName);
    } finally {
      setSaving(false);
    }
  }, [editValue, topicName, onTopicNameChange]);

  const handleCancel = useCallback(() => {
    setEditValue(topicName);
    setSaveError(null);
    setIsEditing(false);
  }, [topicName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  // ====== 浮动浮层模式 ======
  if (floating) {
    return (
      <div
        className="absolute top-0 left-0 right-0 z-20"
        style={{ padding: '8px 10px' }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(217, 178, 153, 0.16)',
            borderRadius: '20px',
            padding: '12px 16px',
            boxShadow: '0 2px 20px rgba(105, 86, 44, 0.05)',
          }}
        >
          {/* 背景装饰：柔焦光点 */}
          <span
            className="absolute pointer-events-none select-none"
            style={{ top: -4, left: '20%', opacity: 0.12, fontSize: 28 }}
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            className="absolute pointer-events-none select-none"
            style={{ top: 8, right: '30%', opacity: 0.08, fontSize: 20 }}
            aria-hidden="true"
          >
            ✦
          </span>

          {/* 角落小叶片装饰 */}
          <span
            className="absolute pointer-events-none select-none text-sm"
            style={{ top: 6, right: 10, opacity: 0.25 }}
            aria-hidden="true"
          >
            🍃
          </span>
          <span
            className="absolute pointer-events-none select-none text-xs"
            style={{ bottom: 4, left: 8, opacity: 0.2 }}
            aria-hidden="true"
          >
            🌿
          </span>

          <div className="relative z-10 flex flex-col" style={{ gap: '1px' }}>
            {/* 第一行：标题 + 编辑 + 切换主题 */}
            <div className="flex items-center gap-2 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setSaveError(null);
                    }}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    disabled={saving}
                    className="text-base font-semibold bg-transparent outline-none min-w-[80px] max-w-[200px] border-b-2 px-0.5 py-0 transition-colors disabled:opacity-60"
                    style={{
                      color: COLORS.textPrimary,
                      borderColor: saving
                        ? `${COLORS.warmBrown}44`
                        : saveError
                          ? COLORS.coral
                          : COLORS.gold,
                    }}
                  />
                  {saving && (
                    <span className="text-[10px]" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                      ...
                    </span>
                  )}
                  {saveError && (
                    <span className="text-[10px]" style={{ color: COLORS.coral }}>
                      {saveError}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <h1
                    className="text-base font-semibold leading-tight cursor-default flex-shrink-0 truncate"
                    style={{ color: COLORS.textPrimary, maxWidth: '180px' }}
                    title={topicName}
                  >
                    {topicName}
                  </h1>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleStartEdit}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors opacity-30 hover:opacity-80"
                    style={{ backgroundColor: 'rgba(148, 116, 83, 0.06)' }}
                    title="编辑名称"
                    aria-label="编辑主题名称"
                  >
                    <span className="text-[11px] leading-none">✏️</span>
                  </motion.button>
                </>
              )}

              {/* 切换主题按钮 — 与标题同行 */}
              {children && (
                <div className="flex-shrink-0 ml-auto">{children}</div>
              )}
            </div>

            {/* 第二行：副信息 */}
            <p
              className="text-[11px] flex items-center gap-1 flex-wrap"
              style={{ color: COLORS.deepBrown, opacity: 0.65 }}
            >
              <span>{gardenName}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>{STAGE_LABELS[stage]}阶段</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>{seedCount} 条灵感</span>
            </p>

            {/* 第三行：绿色胶囊文案 */}
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-normal w-fit mt-0.5"
              style={{
                backgroundColor: 'rgba(180, 200, 165, 0.18)',
                color: '#5a6b42',
                border: '1px solid rgba(150, 180, 130, 0.2)',
              }}
            >
              每一条灵感，都是植物成长的养分
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ====== 普通模式（向后兼容） ======
  return (
    <div className="flex flex-col w-full" style={{ gap: '4px' }}>
      {/* ========== 第一行：标题 + 编辑 + 切换主题按钮 ========== */}
      <div className="flex items-center gap-3 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                setSaveError(null);
              }}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="text-[1.5rem] font-semibold bg-transparent outline-none min-w-[120px] max-w-[360px] border-b-2 px-1 py-0.5 transition-colors disabled:opacity-60"
              style={{
                color: COLORS.textPrimary,
                borderColor: saving
                  ? `${COLORS.warmBrown}44`
                  : saveError
                    ? COLORS.coral
                    : COLORS.gold,
              }}
            />
            {saving && (
              <span className="text-[10px]" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                保存中...
              </span>
            )}
            {saveError && (
              <span className="text-[10px]" style={{ color: COLORS.coral }}>
                {saveError}
              </span>
            )}
          </div>
        ) : (
          <>
            <h1
              className="text-[1.5rem] font-semibold leading-tight cursor-default flex-shrink-0"
              style={{ color: COLORS.textPrimary }}
              title={topicName}
            >
              {topicName}
            </h1>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStartEdit}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors opacity-40 hover:opacity-100"
              style={{ backgroundColor: 'rgba(148, 116, 83, 0.06)' }}
              title="编辑名称"
              aria-label="编辑主题名称"
            >
              <span className="text-[13px] leading-none">✏️</span>
            </motion.button>
          </>
        )}

        {/* 切换主题按钮 — 与标题同行，自然间距 */}
        {children && (
          <div className="flex-shrink-0 ml-2">{children}</div>
        )}
      </div>

      {/* ========== 第二行：副信息 ========== */}
      <p
        className="text-[13px] flex items-center gap-1.5 flex-wrap"
        style={{ color: COLORS.deepBrown, opacity: 0.7 }}
      >
        <span>{gardenName}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{STAGE_LABELS[stage]}阶段</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{seedCount} 条灵感</span>
      </p>

      {/* ========== 第三行：绿色胶囊文案 ========== */}
      <div className="mt-0.5">
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-normal"
          style={{
            backgroundColor: 'rgba(180, 200, 165, 0.22)',
            color: '#5a6b42',
            border: '1px solid rgba(150, 180, 130, 0.25)',
          }}
        >
          每一条灵感，都是植物成长的养分
        </span>
      </div>
    </div>
  );
}
