// src/components/ui/Skeleton.tsx
import { COLORS } from '@/lib/constants';

interface SkeletonProps {
  className?: string;
  /** 宽度，支持数字(px) 或字符串 */
  width?: number | string;
  /** 高度，支持数字(px) 或字符串 */
  height?: number | string;
  /** 圆角：Tailwind rounded token 名称或 'full' */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export function Skeleton({ className = '', width, height, rounded = 'lg' }: SkeletonProps) {
  const roundedClass = `rounded-${rounded}`;

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse ${roundedClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: COLORS.mistPink,
      }}
    />
  );
}
