// src/components/layout/TopNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { COLORS } from '@/lib/constants';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

interface TopNavProps {
  onFeedClick?: () => void;
  demo?: boolean;
}

export function TopNav({ onFeedClick, demo = false }: TopNavProps) {
  const router = useRouter();
  const supabase = createClient();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const breadcrumbs = useBreadcrumb();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <nav
      className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(255, 248, 239, 0.35)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* 左侧：Logo + 面包屑 */}
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-75"
          style={{ color: COLORS.textPrimary }}
        >
          <span className="text-lg leading-none">🪷</span>
          <span>灵感花园</span>
        </Link>

        {breadcrumbs.length > 0 && (
          <>
            {breadcrumbs.map((item, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1">
                  <span style={{ color: COLORS.warmBrown, opacity: 0.5 }} className="text-xs">
                    /
                  </span>
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="transition-opacity hover:opacity-70"
                      style={{ color: COLORS.deepBrown, opacity: 0.85 }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span style={{ color: COLORS.textPrimary, opacity: 0.9 }}>
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </>
        )}
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-3">
        {demo && (
          <span
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{
              background: 'rgba(181, 201, 182, 0.25)',
              color: '#5a7a5c',
              border: '1px solid rgba(181, 201, 182, 0.4)',
            }}
          >
            🌿 Demo 体验
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${COLORS.coral}4D` }}
          onClick={() => {
            if (demo) {
              alert('当前为 Demo 体验模式，登录后可投喂灵感到你的专属花园。');
              return;
            }
            onFeedClick?.();
          }}
          className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all"
          style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
        >
          + 投喂新灵感
        </motion.button>
        {demo ? (
          <a
            href="/auth"
            className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:opacity-80"
            style={{
              background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
              color: 'white',
            }}
          >
            免费注册
          </a>
        ) : (
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{
              backgroundColor: hoveredLabel === 'logout'
                ? `${COLORS.warmBrown}80`
                : `${COLORS.warmBrown}4D`,
              color: COLORS.textPrimary,
            }}
            onMouseEnter={() => setHoveredLabel('logout')}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            👤
          </button>
        )}
      </div>
    </nav>
  );
}
