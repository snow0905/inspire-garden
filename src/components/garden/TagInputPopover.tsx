'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface TagInputPopoverProps {
  open: boolean;
  onClose: () => void;
  onAdd: (tag: string) => Promise<void>;
}

export function TagInputPopover({ open, onClose, onAdd }: TagInputPopoverProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setShowCheck(false);
      setLoading(false);
      // 等 DOM 渲染后聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const handleAdd = async () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await onAdd(trimmed);
      setShowCheck(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 透明遮罩，点击外部关闭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', inset: 0, zIndex: 39 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="sticky-note-popover"
            style={{ top: 0, right: 0, minWidth: 240 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                添加标签
              </span>
              <button
                onClick={onClose}
                className="text-base leading-none p-0.5 rounded hover:opacity-70 transition-opacity"
                style={{ color: COLORS.deepBrown }}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            {showCheck ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                className="flex items-center justify-center py-3"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="text-xl"
                  style={{ color: COLORS.gold }}
                >
                  ✓
                </motion.span>
                <span className="ml-2 text-xs" style={{ color: COLORS.textPrimary }}>已添加</span>
              </motion.div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  className="garden-input mb-3"
                  placeholder="输入标签名，回车添加"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                    style={{
                      color: COLORS.deepBrown,
                      borderColor: `${COLORS.warmBrown}80`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${COLORS.mistPink}40`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!value.trim() || loading}
                    className="px-3 py-1.5 text-xs rounded-full transition-all"
                    style={{
                      color: COLORS.coral,
                      opacity: value.trim() && !loading ? 1 : 0.4,
                      cursor: value.trim() && !loading ? 'pointer' : 'default',
                    }}
                  >
                    {loading ? '添加中...' : '添加'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
