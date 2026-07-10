'use client';

import { STAGE_FILTER_OPTIONS, SORT_OPTIONS, COLORS } from '@/lib/constants';
import type { PlantStage } from '@/types';

type FilterStage = 'all' | PlantStage;
type SortBy = 'updated' | 'growth_desc' | 'growth_asc';

interface FilterSortBarProps {
  filterStage: FilterStage;
  onFilterChange: (stage: FilterStage) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export function FilterSortBar({
  filterStage,
  onFilterChange,
  sortBy,
  onSortChange,
}: FilterSortBarProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      {/* 左侧：阶段筛选胶囊 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="按阶段筛选">
        {STAGE_FILTER_OPTIONS.map((opt) => {
          const isActive = filterStage === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={isActive}
              onClick={() => onFilterChange(opt.value as FilterStage)}
              className="flex-shrink-0 px-3.5 py-1.5 text-sm rounded-full transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? 'rgba(181, 201, 182, 0.22)'
                  : 'rgba(255, 255, 255, 0.4)',
                color: isActive ? '#4a5e3a' : COLORS.deepBrown,
                border: isActive
                  ? '1px solid rgba(181, 201, 182, 0.45)'
                  : '1px solid rgba(217, 178, 153, 0.18)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 右侧：排序下拉 */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: COLORS.deepBrown, opacity: 0.7 }}>排序</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="text-sm px-3 py-1.5 rounded-full border cursor-pointer outline-none transition-all"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            color: COLORS.textPrimary,
            borderColor: 'rgba(217, 178, 153, 0.2)',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23947453' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px',
            paddingRight: '32px',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
