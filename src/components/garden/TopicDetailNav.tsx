// src/components/garden/TopicDetailNav.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { createPortal } from 'react-dom';
import { GARDEN_CONFIG, COLORS, STAGE_EMOJI } from '@/lib/constants';
import type { GardenType, Topic } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TopicDetailNavProps {
  currentGarden: GardenType;
  currentTopicId: string;
  currentTopicName: string;
  /** 触发按钮样式变体：'nav' (默认，右上角导航) | 'capsule' (小胶囊，放在标题旁边) */
  variant?: 'nav' | 'capsule';
  /** 导航链接前缀，默认 '/garden'，demo 模式传 '/demo/inspiration-garden' */
  basePath?: string;
}

export function TopicDetailNav({ currentGarden, currentTopicId, currentTopicName, variant = 'nav', basePath = '/garden' }: TopicDetailNavProps) {
  const isDemo = basePath !== '/garden';

  const GARDENS = (Object.entries(GARDEN_CONFIG) as [GardenType, (typeof GARDEN_CONFIG)[GardenType]][]).map(
    ([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      route: `${basePath}/${id}`,
    }),
  );
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredGarden, setHoveredGarden] = useState<GardenType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // 记住用户最后 hover 的一级花圃，用于 mouseEnter 恢复
  const lastHoveredGardenRef = useRef<GardenType | null>(null);

  const currentConfig = GARDEN_CONFIG[currentGarden];

  // 当前活跃花园 = hover 的花园 或 当前花园
  const activeGarden = hoveredGarden || currentGarden;
  const activeConfig = GARDEN_CONFIG[activeGarden];

  // 根据活跃花园加载主题列表
  const { data, isLoading: topicsLoading } = useSWR(
    open && !isDemo ? `/api/garden/${activeGarden}` : null,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true },
  );
  const topics: (Topic & { seed_count?: number })[] = data?.topics ?? [];

  // 点击外部关闭 — 同时检查按钮容器和 Portal 面板
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    const insideTrigger = containerRef.current?.contains(target);
    const insidePopover = popoverRef.current?.contains(target);
    if (!insideTrigger && !insidePopover) {
      setOpen(false);
      setHoveredGarden(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Popover 位置 — 基于按钮实际屏幕坐标，Portal 到 body 避免被裁切
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  useEffect(() => {
    if (open && containerRef.current) {
      const btn = containerRef.current.querySelector('button');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setPopoverPos({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    }
  }, [open]);

  // hover 进入左侧花园项 — 立即切换右侧预览，并记住到 ref
  const handleGardenMouseEnter = useCallback((gardenId: GardenType) => {
    lastHoveredGardenRef.current = gardenId;
    setHoveredGarden(gardenId);
  }, []);

  // 鼠标进入 popover 面板 — 如果有记忆的花圃，恢复预览
  // 这解决了 CSS gap 导致 mouseLeave 意外触发后，鼠标进入右侧列表时恢复预览
  const handlePopoverMouseEnter = useCallback(() => {
    if (lastHoveredGardenRef.current) {
      setHoveredGarden(lastHoveredGardenRef.current);
    }
  }, []);

  // 鼠标离开整个 popover 面板 — 清空预览和记忆
  const handlePopoverMouseLeave = useCallback(() => {
    lastHoveredGardenRef.current = null;
    setHoveredGarden(null);
  }, []);

  const handleGardenClick = (gardenId: GardenType) => {
    setOpen(false);
    setHoveredGarden(null);
    router.push(`${basePath}/${gardenId}`);
  };

  const handleTopicClick = (topicId: string, gardenType: GardenType) => {
    setOpen(false);
    router.push(`${basePath}/${gardenType}/${topicId}`);
  };

  // 列表项通用样式
  const itemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    borderRadius: 12,
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: COLORS.textPrimary,
    textAlign: 'left' as const,
    transition: 'background-color 0.15s',
  };

  const isCapsule = variant === 'capsule';

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setHoveredGarden(null);
        }}
        className="inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200"
        style={{
          padding: isCapsule ? '6px 14px' : '8px 14px',
          fontSize: isCapsule ? '12px' : '14px',
          backgroundColor: open
            ? `${COLORS.mistPink}99`
            : isCapsule
              ? 'rgba(255,255,255,0.5)'
              : 'rgba(255,255,255,0.55)',
          color: isCapsule ? COLORS.deepBrown : COLORS.textPrimary,
          border: open
            ? `1px solid ${COLORS.warmBrown}66`
            : `1px solid ${COLORS.warmBrown}22`,
          boxShadow: open ? `0 2px 12px ${COLORS.mistPink}66` : 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {isCapsule ? (
          <>
            <span className="text-xs leading-none">🌿</span>
            <span>切换主题</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">{currentConfig.icon}</span>
            <span className="hidden sm:inline">{currentTopicName}</span>
          </>
        )}
        <span
          className="text-xs transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            color: COLORS.deepBrown,
            marginLeft: isCapsule ? '0px' : undefined,
          }}
        >
          ▾
        </span>
      </button>

      {/* Popover 双栏面板 — Portal 到 body 避免被父容器裁切 */}
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            style={{
              position: 'fixed',
              top: popoverPos.top,
              right: popoverPos.right,
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${COLORS.warmBrown}22`,
              borderRadius: 20,
              padding: 12,
              boxShadow: `0 12px 40px rgba(0,0,0,0.10), 0 4px 12px ${COLORS.mistPink}55`,
              zIndex: 9999,
              display: 'flex',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
            }}
          >
          {/* 左栏：切换花圃 */}
          <div style={{ minWidth: 160, paddingRight: 12 }}>
            <p
              className="text-xs font-semibold px-3 py-1.5 mb-1"
              style={{ color: COLORS.deepBrown, opacity: 0.7 }}
            >
              切换花圃
            </p>
            {GARDENS.map((garden) => {
              const isActive = garden.id === currentGarden;
              const isHovered = garden.id === hoveredGarden;
              return (
                <button
                  key={garden.id}
                  type="button"
                  onClick={() => handleGardenClick(garden.id)}
                  onMouseEnter={() => handleGardenMouseEnter(garden.id)}
                  style={{
                    ...itemBase,
                    backgroundColor:
                      isActive || isHovered
                        ? `${COLORS.mistPink}88`
                        : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="text-base">{garden.icon}</span>
                  <span className="flex-1">{garden.name}</span>
                  {isActive && (
                    <span className="text-[10px]" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
                      当前
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 分隔线 */}
          <div style={{ width: 1, backgroundColor: `${COLORS.warmBrown}22` }} />

          {/* 右栏：展示当前 hover 花圃下的植物 */}
          <div style={{ minWidth: 180, paddingLeft: 12 }}>
            <p
              className="text-xs font-semibold px-3 py-1.5 mb-1"
              style={{ color: COLORS.deepBrown, opacity: 0.7 }}
            >
              {activeConfig.icon} {activeConfig.name} 的植物
            </p>
            {topicsLoading ? (
              <p className="text-xs py-3 px-3" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                加载中...
              </p>
            ) : topics.length > 0 ? (
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {topics.map((t) => {
                  const isCurrentTopic =
                    t.id === currentTopicId && activeGarden === currentGarden;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTopicClick(t.id, t.garden_type)}
                      style={{
                        ...itemBase,
                        backgroundColor: isCurrentTopic ? `${COLORS.mistPink}88` : 'transparent',
                        fontWeight: isCurrentTopic ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentTopic)
                          e.currentTarget.style.backgroundColor = `${COLORS.mistPink}44`;
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentTopic)
                          e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="text-base">{STAGE_EMOJI[t.stage] || '🌱'}</span>
                      <span className="flex-1">{t.topic_name}</span>
                      <span className="text-[10px]" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                        {t.seed_count ?? 0} 条
                      </span>
                      {isCurrentTopic && (
                        <span className="text-[10px]" style={{ color: COLORS.deepBrown, opacity: 0.6 }}>
                          当前
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs py-3 px-3" style={{ color: COLORS.deepBrown, opacity: 0.5 }}>
                暂无植物
              </p>
            )}
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
