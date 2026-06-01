// src/components/layout/GardenShell.tsx
'use client';

import { useState } from 'react';
import { TopNav } from './TopNav';
import { FeedModal } from '@/components/home/FeedModal';
import { COLORS } from '@/lib/constants';

export function GardenShell({ children }: { children: React.ReactNode }) {
  const [feedModalOpen, setFeedModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${COLORS.cream} 0%, ${COLORS.mistPink} 100%)` }}>
      <TopNav onFeedClick={() => setFeedModalOpen(true)} />
      <main className="flex-1 relative">
        {children}
      </main>
      <FeedModal open={feedModalOpen} onClose={() => setFeedModalOpen(false)} />
    </div>
  );
}
