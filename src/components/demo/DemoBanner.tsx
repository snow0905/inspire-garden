// src/components/demo/DemoBanner.tsx
// Demo 页面顶部的轻盈提示条
'use client';

import Link from 'next/link';
import { COLORS } from '@/lib/constants';

export function DemoBanner() {
  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2.5 text-sm"
      style={{
        background: 'rgba(250, 246, 240, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(181, 201, 182, 0.25)',
      }}
    >
      <span className="text-base leading-none">🌿</span>
      <span style={{ color: COLORS.deepBrown }}>
        你正在体验示例花园，无需登录即可查看完整产品流程。登录后可创建并保存你的专属灵感花园。
      </span>
      <Link
        href="/auth"
        className="flex-shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all hover:opacity-85"
        style={{
          background: `linear-gradient(135deg, ${COLORS.sageGreen} 0%, #8ab88d 100%)`,
          color: 'white',
        }}
      >
        登录创建我的花园
      </Link>
    </div>
  );
}
