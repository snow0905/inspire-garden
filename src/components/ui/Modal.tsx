// src/components/ui/Modal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';
import { COLORS } from '@/lib/constants';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** 弹窗宽度：sm=384px, md=448px, lg=512px, xl=768px */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASS: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
};

/** 查询 firstFocusable 的 CSS 选择器：所有可交互元素 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, size = 'lg' }: ModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // 打开/关闭时控制 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape 键关闭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 焦点管理：打开时移入 modal，关闭时归还
  useEffect(() => {
    if (open) {
      // 保存当前焦点元素，稍后在关闭时归还
      previousFocusRef.current = document.activeElement as HTMLElement | null;

      // 等 AnimatePresence 完成挂载后，聚焦 modal 内第一个可聚焦元素
      const raf = requestAnimationFrame(() => {
        if (containerRef.current) {
          const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            // 没有任何可聚焦元素时，聚焦容器自身（需 tabIndex=-1 允许聚焦）
            containerRef.current.focus();
          }
        }
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // 关闭时归还焦点（需确认元素仍在 DOM 中，避免聚焦已卸载的元素）
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className="fixed inset-0 z-[100] flex items-center justify-center outline-none"
        >
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            aria-label="关闭弹窗"
            tabIndex={0}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: `${COLORS.textPrimary}1A` }}
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
          />

          {/* 弹窗面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative w-full ${SIZE_CLASS[size]} mx-4 p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg`}
          >
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold mb-4"
                style={{ color: COLORS.textPrimary }}
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
