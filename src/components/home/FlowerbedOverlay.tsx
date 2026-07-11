// src/components/home/FlowerbedOverlay.tsx
import type { GardenOverview, GardenType } from '@/types';
import { FlowerbedTag } from './FlowerbedTag';

// 5 个花圃位置 —— 仅对应背景 PNG 中间的 5 棵花树（非边缘植被）
// 通过分析树干密度+树冠粉色综合评分定位，背景图 1672×941
const POSITIONS: Record<GardenType, { top: string; left: string }> = {
  travel:    { top: '34%', left: '36%' },   // 旅行花园
  food:      { top: '54%', left: '32%' },   // 美食花园
  shopping:  { top: '47%', left: '56%' },   // 购物种草
  life:      { top: '30%', left: '66%' },   // 生活锦囊
  aesthetic: { top: '52%', left: '72%' },   // 审美灵感 — 紫藤花
};

interface FlowerbedOverlayProps {
  gardens: GardenOverview[];
  basePath?: string;
}

export function FlowerbedOverlay({ gardens, basePath }: FlowerbedOverlayProps) {
  return (
    <>
      {gardens.map((garden) => (
        <FlowerbedTag
          key={garden.gardenId}
          garden={garden}
          basePath={basePath}
          style={{ position: 'absolute', ...POSITIONS[garden.gardenId] }}
        />
      ))}
    </>
  );
}
