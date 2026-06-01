// src/components/ui/Button.tsx
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { COLORS } from '@/lib/constants';

/**
 * framer-motion 专属属性，仅 primary 变体使用。
 * 与原生 button 属性（ButtonHTMLAttributes）分离管理。
 */
interface ButtonMotionProps {
  whileHover?: TargetAndTransition;
  whileTap?: TargetAndTransition;
  transition?: Transition;
}

/**
 * HTML button 属性中与 framer-motion HTMLMotionProps 类型冲突的 key。
 * motion.button 将这些事件处理器重定义为自身的动画/拖拽回调签名。
 */
type OmittedMotionConflicts = 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | OmittedMotionConflicts>,
    ButtonMotionProps {
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

/** 小型旋转加载指示器，使用 Tailwind animate-spin */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  variant = 'primary',
  icon,
  children,
  loading = false,
  disabled = false,
  className = '',
  whileHover,
  whileTap,
  transition,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const base = 'inline-flex items-center gap-2 text-sm font-medium transition-all duration-200';
  const disabledStyles = isDisabled ? 'opacity-50 pointer-events-none' : '';

  if (variant === 'primary') {
    return (
      <motion.button
        whileHover={
          whileHover !== undefined
            ? whileHover
            : isDisabled
              ? undefined
              : { scale: 1.02, boxShadow: `0 0 20px ${COLORS.coral}4D` }
        }
        whileTap={
          whileTap !== undefined
            ? whileTap
            : isDisabled
              ? undefined
              : { scale: 0.98 }
        }
        transition={transition ?? { type: 'spring', stiffness: 400, damping: 30 }}
        className={`${base} px-5 py-2.5 text-white rounded-full ${disabledStyles} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
        }}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Spinner /> : icon}
        {children}
      </motion.button>
    );
  }

  // ghost variant: 无背景，仅文字色 + hover 时半透明背景
  return (
    <button
      className={`${base} px-4 py-2 rounded-full ${disabledStyles} ${isDisabled ? '' : 'hover:bg-[var(--ghost-hover)]'} ${className}`}
      style={{
        color: COLORS.textPrimary,
        '--ghost-hover': `${COLORS.mistPink}80`,
      } as React.CSSProperties}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
