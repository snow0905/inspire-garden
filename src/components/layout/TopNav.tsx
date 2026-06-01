// src/components/layout/TopNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { COLORS } from '@/lib/constants';

interface NavItem {
  label: string;
  href?: string;
  action?: 'search' | 'placeholder';
}

const NAV_ITEMS: NavItem[] = [
  { label: '问问花园', action: 'search' },
  { label: '全部灵感', href: '/' },
  { label: '待补水', action: 'placeholder' },
  { label: '花园回顾', action: 'placeholder' },
];

interface TopNavProps {
  onFeedClick?: () => void;
}

export function TopNav({ onFeedClick }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
      style={{ background: `${COLORS.cream}99`, backdropFilter: 'blur(12px)' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
        <span className="text-2xl">🪷</span>
        <span>灵感花园</span>
      </Link>

      {/* 中间导航 */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          // 搜索按钮：滚动到首页搜索框并聚焦
          if (item.action === 'search') {
            const focusSearch = () => {
              const input = document.querySelector<HTMLInputElement>(
                'input[placeholder*="问问你的花园"]'
              );
              if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
              }
            };
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (pathname !== '/') {
                    router.push('/');
                    setTimeout(focusSearch, 400);
                  } else {
                    focusSearch();
                  }
                }}
                className="relative px-4 py-2 text-sm transition-colors"
                style={{ color: hoveredLabel === item.label ? COLORS.deepBrown : COLORS.textPrimary }}
                onMouseEnter={() => setHoveredLabel(item.label)}
                onMouseLeave={() => setHoveredLabel(null)}
              >
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          }

          // 占位按钮：MVP 阶段暂无独立页面
          if (item.action === 'placeholder') {
            return (
              <button
                key={item.label}
                type="button"
                className="relative px-4 py-2 text-sm transition-colors cursor-default"
                style={{ color: `${COLORS.textPrimary}66` }}
                title="即将上线"
                aria-disabled="true"
              >
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          }

          // 正常路由链接
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className="relative px-4 py-2 text-sm transition-colors"
              style={{ color: hoveredLabel === item.label ? COLORS.deepBrown : COLORS.textPrimary }}
              onMouseEnter={() => setHoveredLabel(item.label)}
              onMouseLeave={() => setHoveredLabel(null)}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full"
                  style={{ background: `${COLORS.mistPink}99` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${COLORS.coral}4D` }}
          onClick={onFeedClick}
          className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all"
          style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
        >
          + 投喂新灵感
        </motion.button>
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
      </div>
    </nav>
  );
}
