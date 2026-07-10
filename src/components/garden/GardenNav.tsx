// src/components/garden/GardenNav.tsx
'use client';

import Link from 'next/link';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import type { GardenType } from '@/types';

const GARDENS = (Object.entries(GARDEN_CONFIG) as [GardenType, (typeof GARDEN_CONFIG)[GardenType]][]).map(
  ([id, config]) => ({
    id,
    name: config.name,
    icon: config.icon,
    route: `/garden/${id}`,
  }),
);

interface GardenNavProps {
  currentGarden: GardenType;
}

/** 一级花圃横向胶囊切换栏（不含面包屑，面包屑已移至 TopNav） */
export function GardenNav({ currentGarden }: GardenNavProps) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="花园切换">
      {GARDENS.map((garden) => {
        const isActive = garden.id === currentGarden;
        return (
          <Link
            key={garden.id}
            href={garden.route}
            role="tab"
            aria-selected={isActive}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive ? 'rgba(181, 201, 182, 0.22)' : 'rgba(255,255,255,0.45)',
              color: isActive ? '#4a5e3a' : COLORS.deepBrown,
              border: isActive
                ? '1px solid rgba(181, 201, 182, 0.45)'
                : `1px solid ${COLORS.warmBrown}22`,
              boxShadow: isActive
                ? '0 2px 12px rgba(181, 201, 182, 0.2)'
                : '0 1px 2px rgba(0,0,0,0.04)',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 16px rgba(181, 201, 182, 0.25)`;
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.45)';
              }
            }}
          >
            <span className="text-base leading-none">{garden.icon}</span>
            <span>{garden.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
