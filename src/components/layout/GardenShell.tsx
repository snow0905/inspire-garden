// src/components/layout/GardenShell.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { FeedModal } from '@/components/home/FeedModal';
import { COLORS } from '@/lib/constants';
import { useSyncExternalStore } from 'react';
import { getFeedPending, clearFeedRequest, subscribeFeed } from '@/lib/feed-store';

export function GardenShell({ children }: { children: React.ReactNode }) {
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const pathname = usePathname();

  // 订阅深层组件的投喂请求
  const feedPending = useSyncExternalStore(subscribeFeed, getFeedPending, () => false);

  useEffect(() => {
    if (feedPending) {
      clearFeedRequest();
      setFeedModalOpen(true);
    }
  }, [feedPending]);

  const isDemo = pathname.startsWith('/demo');

  const handleFeedClick = useCallback(() => {
    if (isDemo) return; // Demo 模式不打开投喂弹窗（由 TopNav 的 demo 逻辑处理）
    setFeedModalOpen(true);
  }, [isDemo]);

  // 认证页面不需要外壳（TopNav / 背景 / FeedModal），直接渲染 children
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${COLORS.cream} 0%, ${COLORS.mistPink} 100%)` }}>
      <TopNav onFeedClick={handleFeedClick} demo={isDemo} />
      <main className="flex-1 relative">
        {children}
      </main>
      <FeedModal open={feedModalOpen} onClose={() => setFeedModalOpen(false)} />
    </div>
  );
}
