'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, PREFERENCE_LABELS, PREFERENCE_PLACEHOLDERS } from '@/lib/constants';

interface PreferencePopoverProps {
  open: boolean;
  onClose: () => void;
  gardenType: string;
  topicFields: string[];
  initialValues: Record<string, string>;
  onSave: (fields: Record<string, string>) => Promise<void>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const POPOVER_WIDTH = 320;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 52;
const GAP = 8;
const VIEWPORT_PAD = 16;

export function PreferencePopover({
  open,
  onClose,
  gardenType,
  topicFields,
  initialValues,
  onSave,
  triggerRef,
}: PreferencePopoverProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({
    top: -9999,
    left: -9999,
  });

  const placeholders = PREFERENCE_PLACEHOLDERS[gardenType] || {};
  const label = PREFERENCE_LABELS[gardenType] || '偏好信息';

  // --- SSR 安全 ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- 打开时重置 ---
  useEffect(() => {
    if (open) {
      setValues({ ...initialValues });
      setLoading(false);
    }
  }, [open, initialValues]);

  // --- 计算弹出位置 ---
  const calcPosition = useCallback(() => {
    if (!triggerRef?.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // 可用高度 = 视口高度 - 上下留白
    const availHeight = window.innerHeight - VIEWPORT_PAD * 2;

    // 优先放在按钮下方
    let top = rect.bottom + GAP;
    const fitsBelow = top + availHeight * 0.6 <= window.innerHeight - VIEWPORT_PAD;

    if (!fitsBelow) {
      // 翻到按钮上方
      top = rect.top - availHeight * 0.6 - GAP;
      if (top < VIEWPORT_PAD) {
        // 上下都不够，贴顶
        top = VIEWPORT_PAD;
      }
    }
    // 确保不超出视口底部
    const maxTop = window.innerHeight - availHeight * 0.6 - VIEWPORT_PAD;
    if (top > maxTop) top = maxTop;
    if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;

    // 水平居中于触发按钮
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
    if (left + POPOVER_WIDTH > window.innerWidth - VIEWPORT_PAD) {
      left = window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD;
    }

    setPopoverPos({ top, left });
  }, [triggerRef]);

  useEffect(() => {
    if (open) calcPosition();
  }, [open, calcPosition]);

  // --- 打开期间跟踪滚动 & resize，保持锚定触发按钮 ---
  useEffect(() => {
    if (!open) return;
    const onScroll = () => calcPosition();
    const onResize = () => calcPosition();
    // capture: true 捕获所有滚动事件（包括中间列的滚动容器）
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, calcPosition]);

  // --- 字段变更 ---
  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // --- 保存 ---
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSave(values);
      // onSave 内部已处理关闭和刷新，这里不做额外动作
    } catch {
      // 父级已捕获错误，保留面板让用户重试
    } finally {
      setLoading(false);
    }
  };

  // --- Escape 关闭 ---
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* 透明遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={onClose}
          />

          {/* 弹出面板 —— position: fixed，绝对脱离页面布局流 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              width: POPOVER_WIDTH,
              zIndex: 9999,
              background: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(217, 178, 153, 0.25)',
              borderRadius: 18,
              boxShadow: '0 12px 48px rgba(105, 86, 44, 0.13)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              // 最大高度不会超出视口
              maxHeight: `calc(100vh - ${VIEWPORT_PAD * 2}px)`,
            }}
          >
            {/* ========== Header 固定 ========== */}
            <div
              className="flex items-center justify-between flex-shrink-0"
              style={{ height: HEADER_HEIGHT, padding: '0 16px' }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                补充{label}{' '}
                <span className="select-none" aria-hidden="true">
                  🌿
                </span>
              </span>
              <button
                onClick={onClose}
                className="text-base leading-none w-7 h-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                style={{ color: COLORS.deepBrown }}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            {/* ========== Body 可滚动 ========== */}
            <div
              className="flex-1"
              style={{
                overflowY: 'auto',
                padding: '4px 16px 8px',
                // 确保 Footer 始终可见
                maxHeight: `calc(100vh - ${VIEWPORT_PAD * 2}px - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
              }}
            >
              <div className="space-y-3">
                {topicFields.map((field) => (
                  <div key={field}>
                    <label
                      className="block text-xs mb-1 font-medium"
                      style={{ color: '#8A725C' }}
                    >
                      {field}
                    </label>
                    <input
                      className="garden-input"
                      placeholder={placeholders[field] || `请输入${field}`}
                      value={values[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ========== Footer 固定 ========== */}
            <div
              className="flex items-center justify-end gap-2.5 flex-shrink-0"
              style={{
                height: FOOTER_HEIGHT,
                padding: '0 16px',
                borderTop: `1px solid ${COLORS.warmBrown}18`,
              }}
            >
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-1.5 text-xs rounded-full border transition-colors"
                style={{
                  color: COLORS.deepBrown,
                  borderColor: `${COLORS.warmBrown}80`,
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${COLORS.mistPink}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium rounded-full transition-all"
                style={{
                  color: '#fff',
                  background: loading ? COLORS.warmBrown : COLORS.coral,
                  border: 'none',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: loading
                    ? 'none'
                    : '0 2px 8px rgba(237, 114, 110, 0.25)',
                }}
              >
                {loading ? '保存中...' : '保存修改'}
              </button>
            </div>

            {/* 角落装饰 */}
            <span
              className="absolute text-sm select-none pointer-events-none"
              style={{ bottom: -2, right: -2, opacity: 0.45 }}
              aria-hidden="true"
            >
              🌿
            </span>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
