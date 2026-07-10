'use client';

import { requestFeed } from '@/lib/feed-store';

export function PlantPlaceholderCard() {
  return (
    <div
      onClick={() => requestFeed()}
      className="relative cursor-pointer rounded-[24px] flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        minHeight: 340,
        background: 'rgba(255, 252, 247, 0.25)',
        border: '1.5px dashed rgba(181, 201, 182, 0.35)',
      }}
    >
      {/* 小种子插画 */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ background: 'rgba(181, 201, 182, 0.12)' }}
        >
          🌰
        </div>
        {/* 小土坑光晕 */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full"
          style={{ background: 'rgba(148, 116, 83, 0.08)' }}
        />
      </div>

      {/* 文案 */}
      <div className="text-center">
        <p className="text-[15px] font-medium mb-1" style={{ color: '#6b8b6b' }}>
          等待下一株植物
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: '#947453', opacity: 0.7 }}>
          继续投喂美食灵感，
          <br />
          小园丁会自动帮你归类，
          <br />
          或种下新的主题植物。
        </p>
      </div>

      {/* 底部小水壶装饰 */}
      <span className="text-lg opacity-25 absolute bottom-4 right-4">🪣</span>
      <span className="text-xs opacity-15 absolute top-3 left-4">🌱</span>
    </div>
  );
}
