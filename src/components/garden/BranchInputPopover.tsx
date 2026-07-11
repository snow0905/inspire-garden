'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface BranchInputPopoverProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  existingBranches: string[];
}

export function BranchInputPopover({ open, onClose, onCreate, existingBranches }: BranchInputPopoverProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim();

  // 校验重名
  const duplicate = useMemo(() => {
    if (!trimmed) return false;
    return existingBranches.some((b) => b === trimmed);
  }, [trimmed, existingBranches]);

  useEffect(() => {
    if (open) {
      setValue('');
      setShowCheck(false);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!trimmed || loading || duplicate) return;
    setLoading(true);
    try {
      await onCreate(trimmed);
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
      handleCreate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
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
            style={{ top: 0, right: 0, minWidth: 260 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                新建分支
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
                <span className="ml-2 text-xs" style={{ color: COLORS.textPrimary }}>已创建</span>
              </motion.div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  className="garden-input mb-1.5"
                  placeholder="例如 火锅清单 / 小吃探索 / 咖啡收藏"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                {duplicate && (
                  <motion.p
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs mb-3"
                    style={{ color: COLORS.coral }}
                  >
                    已存在同名分支
                  </motion.p>
                )}
                {!duplicate && <div className="mb-3" />}
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
                    onClick={handleCreate}
                    disabled={!trimmed || loading || duplicate}
                    className="px-3 py-1.5 text-xs rounded-full transition-all"
                    style={{
                      color: COLORS.coral,
                      opacity: trimmed && !loading && !duplicate ? 1 : 0.4,
                      cursor: trimmed && !loading && !duplicate ? 'pointer' : 'default',
                    }}
                  >
                    {loading ? '创建中...' : '创建'}
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
