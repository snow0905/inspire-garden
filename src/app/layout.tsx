// src/app/layout.tsx
import type { Metadata } from 'next';
import { Providers } from '@/components/layout/Providers';
import { GardenShell } from '@/components/layout/GardenShell';
import './globals.css';

export const metadata: Metadata = {
  title: '灵感花园',
  description: '用植物生长隐喻管理灵感收藏',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <GardenShell>
            {children}
          </GardenShell>
        </Providers>
      </body>
    </html>
  );
}
