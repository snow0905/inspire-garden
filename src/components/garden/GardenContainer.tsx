// src/components/garden/GardenContainer.tsx
import type { ReactNode } from 'react';

interface GardenContainerProps {
  children: ReactNode;
}

export function GardenContainer({ children }: GardenContainerProps) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 'min(1440px, 92vw)' }}>
      <div
        className="relative rounded-[32px] overflow-hidden p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(250, 246, 240, 0.6) 0%, rgba(226, 235, 220, 0.35) 40%, rgba(242, 240, 230, 0.45) 100%)',
          boxShadow:
            '0 4px 32px rgba(148, 116, 83, 0.08), 0 1px 4px rgba(148, 116, 83, 0.04)',
          border: '1px solid rgba(217, 178, 153, 0.1)',
        }}
      >
        {/* 装饰层：藤蔓、小花、光点 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
          <span className="absolute top-3 left-4 text-lg opacity-20">🌿</span>
          <span className="absolute top-8 left-2 text-sm opacity-15 rotate-12">🍃</span>
          <span className="absolute top-4 right-6 text-base opacity-20">🌸</span>
          <span className="absolute top-2 right-4 text-xs opacity-15">✨</span>
          <span className="absolute bottom-6 left-5 text-xs opacity-15">✦</span>
          <span className="absolute bottom-3 left-10 text-sm opacity-12">🌼</span>
          <span className="absolute bottom-4 right-5 text-sm opacity-15">🪨</span>
          <span className="absolute bottom-2 right-10 text-xs opacity-12">🌱</span>
        </div>

        {/* 底部草地装饰条 */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 6,
            background:
              'linear-gradient(90deg, rgba(181, 201, 182, 0.35), rgba(229, 200, 114, 0.2), rgba(181, 201, 182, 0.25), rgba(210, 190, 160, 0.2), rgba(181, 201, 182, 0.3))',
          }}
        />

        {/* 内容 */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
