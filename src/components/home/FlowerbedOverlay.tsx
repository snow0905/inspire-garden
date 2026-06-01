// src/components/home/FlowerbedOverlay.tsx
import type { GardenOverview } from '@/types';
import { FlowerbedTag } from './FlowerbedTag';

// 5 个花圃在花园场景中的位置坐标（百分比定位，对应 PNG 背景中花圃位置）
const POSITIONS = [
  { top: '15%', left: '25%' },   // 旅行花园
  { top: '25%', left: '45%' },   // 美食花园
  { top: '40%', left: '35%' },   // 购物种草
  { top: '30%', left: '58%' },   // 生活锦囊
  { top: '20%', left: '65%' },   // 审美灵感
];

interface FlowerbedOverlayProps {
  gardens: GardenOverview[];
}

export function FlowerbedOverlay({ gardens }: FlowerbedOverlayProps) {
  return (
    <>
      {gardens.map((garden, i) => (
        <FlowerbedTag
          key={garden.gardenId}
          garden={garden}
          style={{ position: 'absolute', ...POSITIONS[i] }}
        />
      ))}
    </>
  );
}
