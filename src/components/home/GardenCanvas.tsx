// src/components/home/GardenCanvas.tsx
import type { GardenOverview } from '@/types';
import { FlowerbedOverlay } from './FlowerbedOverlay';

interface GardenCanvasProps {
  gardens: GardenOverview[];
}

export function GardenCanvas({ gardens }: GardenCanvasProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Layer 2: 花园背景 PNG (来自 inspire-garden/image/首页背景.png) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/garden-bg.png)',
          opacity: 0.85,
        }}
      />

      {/* Layer 4: 花圃浮签叠加层 */}
      <FlowerbedOverlay gardens={gardens} />

      {/* Layer 5: Canvas 粒子层（预留） */}
      <canvas
        id="garden-particles"
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />
    </div>
  );
}
