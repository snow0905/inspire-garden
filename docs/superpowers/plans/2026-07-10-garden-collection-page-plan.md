# 一级花圃植物集合页 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 5 个独立的一级花圃页重设计为统一的动态路由花圃式植物集合页，含聚合 API、植物卡片网格、筛选排序和梦幻花园视觉风格。

**Architecture:** 新建动态路由 `src/app/garden/[gardenId]/page.tsx` 替代 5 个静态页面；新建聚合 API `GET /api/garden/[gardenId]/cards` 一次返回卡片全量数据；新建 6 个组件（GardenHeader、FilterSortBar、GardenContainer、PlantCard、PlantPlaceholderCard、GardenEmptyState）；微调 GardenNav 样式。

**Tech Stack:** Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS 3.4 + Framer Motion 11 + SWR 2

## 全局约束

- 色彩系统遵守现有 Token（cream `#faf6f0`、mistPink `#f2e4da`、warmBrown `#d9b299`、deepBrown `#947453`、gold `#e5c872`、coral `#ed726e`、textPrimary `#69562c`）
- 新增鼠尾草绿 `COLORS.sageGreen = '#b5c9b6'` 到 constants.ts
- 筛选和排序纯前端，不触发额外 API 请求
- 不做「当前」标签
- 不展示灵感数量、清单详情、OCR 原文
- 动效克制：hover 上浮 4-6px + 淡入动画
- 桌面端优先，响应式适配

---

## 文件结构

```
新建：
  src/app/api/garden/[gardenId]/cards/route.ts    ← 聚合 API
  src/app/garden/[gardenId]/page.tsx              ← 动态路由页面
  src/components/garden/GardenHeader.tsx           ← 标题行
  src/components/garden/FilterSortBar.tsx          ← 筛选排序
  src/components/garden/PlantCard.tsx              ← 植物卡片
  src/components/garden/PlantPlaceholderCard.tsx   ← 占位卡
  src/components/garden/GardenEmptyState.tsx       ← 空状态
  src/components/garden/GardenContainer.tsx        ← 花圃容器

修改：
  src/lib/constants.ts                             ← 加 sageGreen、STAGE_FILTER 常量
  src/types/index.ts                               ← 加 TopicCardData、GardenCardsResponse
  src/components/garden/GardenNav.tsx              ← 微调高亮为鼠尾草绿

删除：
  src/app/garden/travel/page.tsx
  src/app/garden/food/page.tsx
  src/app/garden/shopping/page.tsx
  src/app/garden/life/page.tsx
  src/app/garden/aesthetic/page.tsx
  src/components/garden/TopicCard.tsx
  src/components/garden/TopicGrid.tsx
```

---

### Task 1: 类型定义 + 常量扩展

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/constants.ts`

**Interfaces:**
- Produces: `TopicCardData` interface, `GardenCardsResponse` interface, `COLORS.sageGreen`, `STAGE_FILTER` constant

- [ ] **Step 1: 在 `src/types/index.ts` 末尾追加新类型**

```typescript
// 植物卡片聚合数据（API 返回）
export interface TopicCardData {
  topicId: string;
  topicName: string;
  plantFamily: PlantFamily;
  stage: PlantStage;
  growthScore: number;
  seedCount: number;
  tags: string[];
  latestSeedTitle: string | null;
  hasHarvest: boolean;
  updatedAt: string;
}

export interface GardenCardsResponse {
  gardenType: GardenType;
  topics: TopicCardData[];
}
```

- [ ] **Step 2: 在 `src/lib/constants.ts` 中 `COLORS` 对象里追加 `sageGreen`**

找到 `COLORS` 定义，在 `textPrimary` 后追加：

```typescript
sageGreen: '#b5c9b6',
```

在 `STAGE_EMOJI` 后追加筛选常量：

```typescript
export const STAGE_FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'sprout', label: '发芽中' },
  { value: 'growing', label: '生长中' },
  { value: 'bloom', label: '开花中' },
  { value: 'fruit', label: '已结果' },
] as const;

export const SORT_OPTIONS = [
  { value: 'updated', label: '最近更新' },
  { value: 'growth_desc', label: '成长值高到低' },
  { value: 'growth_asc', label: '成长值低到高' },
] as const;
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd inspire-garden && npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/constants.ts
git commit -m "feat: add TopicCardData types and sageGreen color constant"
```

---

### Task 2: 聚合 API 端点

**Files:**
- Create: `src/app/api/garden/[gardenId]/cards/route.ts`

**Interfaces:**
- Consumes: `GardenType` from `@/types`, `TopicCardData`, `GardenCardsResponse`
- Produces: `GET /api/garden/[gardenId]/cards` → `GardenCardsResponse`

- [ ] **Step 1: 创建 API 路由文件**

```typescript
// src/app/api/garden/[gardenId]/cards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import type { GardenType, TopicCardData, GardenCardsResponse } from '@/types';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const { gardenId } = await params;

    if (!VALID_GARDENS.includes(gardenId as GardenType)) {
      return NextResponse.json({ error: 'Invalid garden type' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 查询该花圃所有 topics
    const { data: topics } = await supabase
      .from('topics')
      .select('id, topic_name, plant_family, stage, growth_score, tags, updated_at')
      .eq('user_id', user.id)
      .eq('garden_type', gardenId)
      .order('updated_at', { ascending: false });

    if (!topics || topics.length === 0) {
      return NextResponse.json({ gardenType: gardenId, topics: [] } satisfies GardenCardsResponse);
    }

    const topicIds = topics.map((t) => t.id);

    // 2. 批量查询每个 topic 的种子数量 + 最新种子标题
    const { data: seeds } = await supabase
      .from('seeds')
      .select('id, topic_id, title, created_at')
      .in('topic_id', topicIds)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 内存聚合：按 topic_id 分组
    const seedCountMap = new Map<string, number>();
    const latestSeedMap = new Map<string, string>(); // topic_id → latest title
    for (const s of seeds ?? []) {
      seedCountMap.set(s.topic_id, (seedCountMap.get(s.topic_id) ?? 0) + 1);
      if (!latestSeedMap.has(s.topic_id) && s.title) {
        latestSeedMap.set(s.topic_id, s.title);
      }
    }

    // 3. 批量查询 harvest 存在性
    const { data: harvests } = await supabase
      .from('harvests')
      .select('topic_id')
      .in('topic_id', topicIds)
      .eq('user_id', user.id);

    const harvestSet = new Set((harvests ?? []).map((h) => h.topic_id));

    // 4. 组装响应
    const cards: TopicCardData[] = topics.map((t) => ({
      topicId: t.id,
      topicName: t.topic_name,
      plantFamily: t.plant_family as TopicCardData['plantFamily'],
      stage: t.stage as TopicCardData['stage'],
      growthScore: Number(t.growth_score),
      seedCount: seedCountMap.get(t.id) ?? 0,
      tags: (t.tags ?? []).slice(0, 5),
      latestSeedTitle: latestSeedMap.get(t.id) ?? null,
      hasHarvest: harvestSet.has(t.id),
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({ gardenType: gardenId, topics: cards } satisfies GardenCardsResponse);
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/garden/[gardenId]/cards/route.ts
git commit -m "feat: add /api/garden/[gardenId]/cards aggregation endpoint"
```

---

### Task 3: GardenHeader 组件

**Files:**
- Create: `src/components/garden/GardenHeader.tsx`

**Interfaces:**
- Consumes: `GARDEN_CONFIG` from `@/lib/constants`, `COLORS` from `@/lib/constants`
- Produces: `<GardenHeader gardenType={...} topicCount={...} />`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/GardenHeader.tsx
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import type { GardenType } from '@/types';

interface GardenHeaderProps {
  gardenType: GardenType;
  topicCount: number;
}

export function GardenHeader({ gardenType, topicCount }: GardenHeaderProps) {
  const config = GARDEN_CONFIG[gardenType];

  return (
    <div className="flex items-center justify-between mb-6" style={{ minHeight: 56 }}>
      {/* 左侧：花圃名 */}
      <h1
        className="text-[28px] font-bold tracking-tight"
        style={{ color: '#4a5e3a', fontFamily: "'Georgia', 'Noto Serif SC', serif" }}
      >
        <span className="mr-2.5">{config.icon}</span>
        {config.name}
      </h1>

      {/* 右侧：植物数量 */}
      <span
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-full"
        style={{
          background: 'rgba(181, 201, 182, 0.15)',
          color: '#6b8b6b',
          border: '1px solid rgba(181, 201, 182, 0.25)',
        }}
      >
        <span>🌱</span>
        <span>
          {topicCount === 0
            ? '还没有主题植物'
            : `${topicCount} 株主题植物正在成长`}
        </span>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/GardenHeader.tsx
git commit -m "feat: add GardenHeader component with garden name and plant count"
```

---

### Task 4: FilterSortBar 组件

**Files:**
- Create: `src/components/garden/FilterSortBar.tsx`

**Interfaces:**
- Consumes: `STAGE_FILTER_OPTIONS`, `SORT_OPTIONS`, `COLORS` from `@/lib/constants`, `PlantStage` from `@/types`
- Produces: `<FilterSortBar filterStage={...} onFilterChange={...} sortBy={...} onSortChange={...} />`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/FilterSortBar.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/FilterSortBar.tsx
git commit -m "feat: add FilterSortBar with stage filter pills and sort dropdown"
```

---

### Task 5: PlantCard 组件

**Files:**
- Create: `src/components/garden/PlantCard.tsx`

**Interfaces:**
- Consumes: `TopicCardData` from `@/types`, `COLORS` `STAGE_LABELS` `STAGE_EMOJI` from `@/lib/constants`, `PlantAvatar` from `./PlantAvatar`
- Produces: `<PlantCard data={...} gardenId={...} />`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/PlantCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { TopicCardData } from '@/types';
import { COLORS, STAGE_LABELS, STAGE_EMOJI } from '@/lib/constants';
import { PlantAvatar } from './PlantAvatar';

interface PlantCardProps {
  data: TopicCardData;
  gardenId: string;
}

export function PlantCard({ data, gardenId }: PlantCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/garden/${gardenId}/${data.topicId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -5 }}
      className="relative cursor-pointer rounded-[24px] overflow-hidden flex flex-col transition-shadow duration-300 group"
      style={{
        width: '100%',
        minHeight: 340,
        background: 'rgba(255, 252, 247, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(217, 178, 153, 0.15)',
        boxShadow: '0 2px 16px rgba(148, 116, 83, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(148, 116, 83, 0.12), 0 0 0 3px rgba(181, 201, 182, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(148, 116, 83, 0.06)';
      }}
    >
      {/* ── 上半部：植物阶段图 ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 140,
          background: 'linear-gradient(180deg, rgba(181, 201, 182, 0.12) 0%, rgba(250, 246, 240, 0) 100%)',
        }}
      >
        {/* 光点装饰 */}
        <span className="absolute top-3 right-4 text-xs opacity-20">✨</span>
        <span className="absolute bottom-2 left-4 text-xs opacity-15">🍃</span>

        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <PlantAvatar
            plantFamily={data.plantFamily}
            stage={data.stage}
            size={96}
          />
        </motion.div>
      </div>

      {/* ── 下半部：植物信息 ── */}
      <div className="flex-1 flex flex-col px-4 pb-4 gap-2">
        {/* 植物名 */}
        <h3
          className="text-[18px] font-semibold leading-tight line-clamp-2"
          style={{ color: '#4a5e3a' }}
        >
          {data.topicName}
        </h3>

        {/* 阶段 + 成长值 */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[13px]" style={{ color: '#6b8b6b' }}>
            <span className="text-sm">{STAGE_EMOJI[data.stage]}</span>
            <span>{STAGE_LABELS[data.stage]}</span>
          </span>
          <span className="text-[13px] font-medium" style={{ color: COLORS.textPrimary }}>
            {data.growthScore} 成长值
          </span>
        </div>

        {/* 进度条 */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, backgroundColor: 'rgba(217, 178, 153, 0.15)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(data.growthScore, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #b5c9b6 0%, #e5c872 100%)',
            }}
          />
        </div>

        {/* 标签 */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-[12px] rounded-full"
                style={{
                  background: 'rgba(242, 228, 218, 0.4)',
                  color: '#7a6548',
                  border: '1px solid rgba(217, 178, 153, 0.12)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 最近灵感 */}
        <div className="flex-1" />
        <div className="text-[12px] leading-tight">
          <span style={{ color: COLORS.deepBrown, opacity: 0.6 }}>最近灵感</span>
          <p
            className="text-[13px] mt-0.5 truncate"
            style={{ color: COLORS.textPrimary, opacity: 0.85 }}
          >
            {data.latestSeedTitle ?? '暂无灵感'}
          </p>
        </div>

        {/* 清单状态 + 进入按钮 */}
        <div className="flex items-center justify-between mt-1">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] rounded-full"
            style={{
              background: data.hasHarvest
                ? 'rgba(181, 201, 182, 0.2)'
                : 'rgba(242, 228, 218, 0.3)',
              color: data.hasHarvest ? '#5a7a5a' : '#947453',
            }}
          >
            {data.hasHarvest ? '📋 已生成清单' : '🌿 未生成清单'}
          </span>

          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-[13px] rounded-full transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#6b8b6b',
              border: '1px solid rgba(181, 201, 182, 0.3)',
            }}
          >
            进入植物
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
          </span>
        </div>
      </div>

      {/* 底部草地装饰线 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 4,
          background: 'linear-gradient(90deg, rgba(181, 201, 182, 0.3), rgba(229, 200, 114, 0.2), rgba(181, 201, 182, 0.1))',
          borderRadius: '0 0 24px 24px',
        }}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/PlantCard.tsx
git commit -m "feat: add PlantCard component with stage art, progress bar, and glass styling"
```

---

### Task 6: PlantPlaceholderCard 组件

**Files:**
- Create: `src/components/garden/PlantPlaceholderCard.tsx`

**Interfaces:**
- Consumes: `requestFeed` from `@/lib/feed-store`
- Produces: `<PlantPlaceholderCard />`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/PlantPlaceholderCard.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/PlantPlaceholderCard.tsx
git commit -m "feat: add PlantPlaceholderCard ghost card with feed trigger"
```

---

### Task 7: GardenEmptyState 组件

**Files:**
- Create: `src/components/garden/GardenEmptyState.tsx`

**Interfaces:**
- Consumes: `requestFeed` from `@/lib/feed-store`, `COLORS` from `@/lib/constants`
- Produces: `<GardenEmptyState gardenType={...} />`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/GardenEmptyState.tsx
'use client';

import { motion } from 'framer-motion';
import { requestFeed } from '@/lib/feed-store';
import { COLORS } from '@/lib/constants';
import type { GardenType } from '@/types';

interface GardenEmptyStateProps {
  gardenType: GardenType;
}

const GARDEN_NAMES: Record<GardenType, string> = {
  travel: '旅行',
  food: '美食',
  shopping: '购物',
  life: '生活',
  aesthetic: '审美',
};

export function GardenEmptyState({ gardenType }: GardenEmptyStateProps) {
  const label = GARDEN_NAMES[gardenType] ?? '';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* 空花圃场景 */}
      <div className="relative mb-8">
        {/* 土壤 */}
        <div
          className="w-32 h-8 rounded-full mx-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(181, 165, 140, 0.3) 0%, rgba(181, 165, 140, 0.1) 100%)',
          }}
        />
        {/* 小种子 */}
        <motion.span
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          🌰
        </motion.span>
        {/* 小水壶 */}
        <motion.span
          className="absolute -top-3 -right-2 text-xl"
          animate={{ rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
        >
          🪣
        </motion.span>
        {/* 光点 */}
        <motion.span
          className="absolute -top-8 left-2 text-xs"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        >
          ✨
        </motion.span>
        {/* 小花 */}
        <span className="absolute -bottom-1 left-4 text-sm opacity-30">🌼</span>
        <span className="absolute -bottom-1 right-3 text-sm opacity-25">🍀</span>
      </div>

      {/* 文案 */}
      <p className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>
        这里还没有长出主题植物 🌱
      </p>
      <p className="text-sm mb-8 text-center leading-relaxed" style={{ color: COLORS.deepBrown, opacity: 0.8 }}>
        投喂几条{label}灵感后，
        <br />
        小园丁会帮你种下第一株植物。
      </p>

      {/* 投喂按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => requestFeed()}
        className="px-6 py-2.5 text-sm font-medium text-white rounded-full"
        style={{
          background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)`,
          boxShadow: `0 4px 16px rgba(237, 114, 110, 0.2)`,
        }}
      >
        投喂新灵感
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/GardenEmptyState.tsx
git commit -m "feat: add GardenEmptyState with empty soil scene and feed CTA"
```

---

### Task 8: GardenContainer 组件

**Files:**
- Create: `src/components/garden/GardenContainer.tsx`

**Interfaces:**
- Consumes: `COLORS` from `@/lib/constants`
- Produces: `<GardenContainer> {children} </GardenContainer>`

- [ ] **Step 1: 创建组件文件**

```typescript
// src/components/garden/GardenContainer.tsx
import type { ReactNode } from 'react';

interface GardenContainerProps {
  children: ReactNode;
  isEmpty?: boolean;
}

export function GardenContainer({ children, isEmpty }: GardenContainerProps) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 'min(1440px, 92vw)' }}>
      {/* ── 花圃容器 ── */}
      <div
        className="relative rounded-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(250, 246, 240, 0.6) 0%, rgba(226, 235, 220, 0.35) 40%, rgba(242, 240, 230, 0.45) 100%)',
          boxShadow: '0 4px 32px rgba(148, 116, 83, 0.08), 0 1px 4px rgba(148, 116, 83, 0.04)',
          border: '1px solid rgba(217, 178, 153, 0.1)',
        }}
      >
        {/* ── 草地纹理背景 ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 左上藤蔓 */}
          <span className="absolute top-3 left-4 text-lg opacity-20">🌿</span>
          <span className="absolute top-8 left-2 text-sm opacity-15 rotate-12">🍃</span>
          {/* 右上小花 */}
          <span className="absolute top-4 right-6 text-base opacity-20">🌸</span>
          <span className="absolute top-2 right-4 text-xs opacity-15">✨</span>
          {/* 左下光点 */}
          <span className="absolute bottom-6 left-5 text-xs opacity-15">✦</span>
          <span className="absolute bottom-3 left-10 text-sm opacity-12">🌼</span>
          {/* 右下小石子 */}
          <span className="absolute bottom-4 right-5 text-sm opacity-15">🪨</span>
          <span className="absolute bottom-2 right-10 text-xs opacity-12">🌱</span>
          {/* 中间散落光点 */}
          <span className="absolute top-1/2 left-[15%] text-[10px] opacity-8">·</span>
          <span className="absolute top-1/3 right-[20%] text-[10px] opacity-8">·</span>
          <span className="absolute bottom-1/4 left-[40%] text-[10px] opacity-8">·</span>
        </div>

        {/* ── 底部草地装饰条 ── */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 6,
            background: 'linear-gradient(90deg, rgba(181, 201, 182, 0.35), rgba(229, 200, 114, 0.2), rgba(181, 201, 182, 0.25), rgba(210, 190, 160, 0.2), rgba(181, 201, 182, 0.3))',
            borderTop: '1px solid rgba(181, 201, 182, 0.12)',
          }}
        />

        {/* ── 内容区 ── */}
        <div
          className={`relative z-10 ${isEmpty ? '' : 'p-8'}`}
          style={isEmpty ? {} : {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>

      {/* ── 响应式 Grid 样式注入 ── */}
      <style jsx>{`
        @media (max-width: 1279px) {
          div > :global(.relative.z-10) {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 1023px) {
          div > :global(.relative.z-10) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 639px) {
          div > :global(.relative.z-10) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
```

> **注意:** 上面的响应式 Grid 用 `<style jsx>` 不够优雅。实际实现时改为在 page.tsx 中给定 children 外层包裹一个 Tailwind 响应式 grid div，GardenContainer 仅负责装饰容器。调整如下：

- [ ] **Step 2: 重新设计为纯装饰容器（Grid 由 page.tsx 控制）**

```typescript
// src/components/garden/GardenContainer.tsx (最终版)
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
          background: 'linear-gradient(180deg, rgba(250, 246, 240, 0.6) 0%, rgba(226, 235, 220, 0.35) 40%, rgba(242, 240, 230, 0.45) 100%)',
          boxShadow: '0 4px 32px rgba(148, 116, 83, 0.08), 0 1px 4px rgba(148, 116, 83, 0.04)',
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
            background: 'linear-gradient(90deg, rgba(181, 201, 182, 0.35), rgba(229, 200, 114, 0.2), rgba(181, 201, 182, 0.25), rgba(210, 190, 160, 0.2), rgba(181, 201, 182, 0.3))',
          }}
        />

        {/* 内容 */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/garden/GardenContainer.tsx
git commit -m "feat: add GardenContainer with decorative garden bed styling"
```

---

### Task 9: GardenNav 样式微调

**Files:**
- Modify: `src/components/garden/GardenNav.tsx`

**Interfaces:**
- Consumes: `COLORS.sageGreen` from `@/lib/constants`
- Produces: 当前项高亮色从 mistPink 改为鼠尾草绿风格

- [ ] **Step 1: 修改高亮颜色**

将第 36-41 行的样式从粉色调改为鼠尾草绿：

```typescript
// 修改前:
backgroundColor: isActive ? `${COLORS.mistPink}cc` : 'rgba(255,255,255,0.45)',
border: isActive ? `1px solid ${COLORS.warmBrown}88` : `1px solid ${COLORS.warmBrown}22`,
boxShadow: isActive ? `0 2px 8px ${COLORS.mistPink}66` : '0 1px 2px rgba(0,0,0,0.04)',

// 修改后:
backgroundColor: isActive ? 'rgba(181, 201, 182, 0.22)' : 'rgba(255,255,255,0.45)',
color: isActive ? '#4a5e3a' : COLORS.deepBrown,
border: isActive ? '1px solid rgba(181, 201, 182, 0.45)' : `1px solid ${COLORS.warmBrown}22`,
boxShadow: isActive ? '0 2px 12px rgba(181, 201, 182, 0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
```

同时在 hover 样式中把 mistPink 替换：

```typescript
// 修改前:
e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.mistPink}66`;

// 修改后:
e.currentTarget.style.boxShadow = `0 4px 16px rgba(181, 201, 182, 0.25)`;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/garden/GardenNav.tsx
git commit -m "style: update GardenNav active state to sage green"
```

---

### Task 10: 页面组装 + 旧文件清理

**Files:**
- Create: `src/app/garden/[gardenId]/page.tsx`
- Delete: `src/app/garden/travel/page.tsx`
- Delete: `src/app/garden/food/page.tsx`
- Delete: `src/app/garden/shopping/page.tsx`
- Delete: `src/app/garden/life/page.tsx`
- Delete: `src/app/garden/aesthetic/page.tsx`
- Delete: `src/components/garden/TopicCard.tsx`
- Delete: `src/components/garden/TopicGrid.tsx`

**Interfaces:**
- Consumes: `useSWR` from `swr`, all new components, `GARDEN_CONFIG` from constants, `FilterStage`/`SortBy` types
- Produces: 完整的花圃集合页

- [ ] **Step 1: 删除旧页面和组件**

```bash
rm src/app/garden/travel/page.tsx
rm src/app/garden/food/page.tsx
rm src/app/garden/shopping/page.tsx
rm src/app/garden/life/page.tsx
rm src/app/garden/aesthetic/page.tsx
rm src/components/garden/TopicCard.tsx
rm src/components/garden/TopicGrid.tsx
```

- [ ] **Step 2: 创建动态路由页面**

```typescript
// src/app/garden/[gardenId]/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import type { GardenType, GardenCardsResponse, TopicCardData, PlantStage } from '@/types';
import { GARDEN_CONFIG, COLORS } from '@/lib/constants';
import { GardenNav } from '@/components/garden/GardenNav';
import { GardenHeader } from '@/components/garden/GardenHeader';
import { FilterSortBar } from '@/components/garden/FilterSortBar';
import { GardenContainer } from '@/components/garden/GardenContainer';
import { PlantCard } from '@/components/garden/PlantCard';
import { PlantPlaceholderCard } from '@/components/garden/PlantPlaceholderCard';
import { GardenEmptyState } from '@/components/garden/GardenEmptyState';
import { useSetBreadcrumb } from '@/hooks/useBreadcrumb';

type FilterStage = 'all' | PlantStage;
type SortBy = 'updated' | 'growth_desc' | 'growth_asc';

const VALID_GARDENS: GardenType[] = ['travel', 'food', 'shopping', 'life', 'aesthetic'];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GardenPage() {
  const params = useParams();
  const gardenId = params.gardenId as GardenType;

  const { data, error, isLoading } = useSWR<GardenCardsResponse>(
    VALID_GARDENS.includes(gardenId) ? `/api/garden/${gardenId}/cards` : null,
    fetcher,
  );

  const [filterStage, setFilterStage] = useState<FilterStage>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');

  const config = GARDEN_CONFIG[gardenId] ?? GARDEN_CONFIG.travel;

  // 面包屑
  useSetBreadcrumb([{ label: config.name }]);

  // 前端筛选 + 排序
  const filteredTopics = useMemo(() => {
    if (!data?.topics) return [];
    let result = [...data.topics];

    // 筛选
    if (filterStage !== 'all') {
      result = result.filter((t) => t.stage === filterStage);
    }

    // 排序
    switch (sortBy) {
      case 'growth_desc':
        result.sort((a, b) => b.growthScore - a.growthScore);
        break;
      case 'growth_asc':
        result.sort((a, b) => a.growthScore - b.growthScore);
        break;
      case 'updated':
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [data, filterStage, sortBy]);

  // ── 加载态 ──
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GardenNav currentGarden={gardenId} />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-3xl animate-bounce">🌱</div>
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>正在打理你的花园…</p>
        </div>
      </div>
    );
  }

  // ── 错误态 ──
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GardenNav currentGarden={gardenId} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-4xl">😥</div>
          <p className="text-sm" style={{ color: COLORS.deepBrown }}>花园数据加载失败，请刷新页面。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-full"
            style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const allTopics = data.topics;
  const nonEmpty = allTopics.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-6 py-8"
    >
      {/* 花圃切换胶囊 */}
      <div className="mb-4">
        <GardenNav currentGarden={gardenId} />
      </div>

      {/* 标题行 */}
      <GardenHeader gardenType={gardenId} topicCount={allTopics.length} />

      {/* 筛选 + 排序（非空时显示） */}
      {nonEmpty && (
        <FilterSortBar
          filterStage={filterStage}
          onFilterChange={setFilterStage}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* 空状态 */}
      {!nonEmpty && <GardenEmptyState gardenType={gardenId} />}

      {/* 花圃容器 + 植物网格 */}
      {nonEmpty && (
        <GardenContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTopics.map((topic, i) => (
              <motion.div
                key={topic.topicId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
              >
                <PlantCard data={topic} gardenId={gardenId} />
              </motion.div>
            ))}

            {/* 占位卡：当筛选后数量 < 4 时显示 */}
            {filteredTopics.length < 4 && filterStage === 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTopics.length * 0.06, duration: 0.4 }}
              >
                <PlantPlaceholderCard />
              </motion.div>
            )}
          </div>
        </GardenContainer>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 3: 检查是否有对 TopicCard/TopicGrid 的残留引用**

```bash
cd inspire-garden && grep -r "TopicCard\|TopicGrid" src/ --include="*.tsx" --include="*.ts"
```

Expected: 无输出（所有引用已随删除清除）。

- [ ] **Step 4: 清理空的旧路由目录**

```bash
rmdir src/app/garden/travel src/app/garden/food src/app/garden/shopping src/app/garden/life src/app/garden/aesthetic 2>/dev/null || true
```

- [ ] **Step 5: TypeScript 编译验证**

```bash
cd inspire-garden && npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 6: Commit**

```bash
git add src/app/garden/[gardenId]/page.tsx
git add -u src/app/garden/travel/page.tsx src/app/garden/food/page.tsx src/app/garden/shopping/page.tsx src/app/garden/life/page.tsx src/app/garden/aesthetic/page.tsx
git add -u src/components/garden/TopicCard.tsx src/components/garden/TopicGrid.tsx
git commit -m "feat: replace 5 static garden pages with dynamic [gardenId] route and new plant card grid"
```

---

## 计划自检

### Spec 覆盖率检查

| Spec 需求 | 对应 Task |
|-----------|----------|
| 动态路由统一 | Task 10 |
| 聚合 API | Task 2 |
| GardenHeader 标题行 | Task 3 |
| FilterSortBar 筛选排序 | Task 4 |
| GardenContainer 花圃容器 | Task 8 |
| PlantCard 植物卡片（9 项信息） | Task 5 |
| PlantPlaceholderCard 占位卡 | Task 6 |
| GardenEmptyState 空状态 | Task 7 |
| GardenNav 鼠尾草绿高亮 | Task 9 |
| 响应式 Grid | Task 10 (Tailwind grid-cols) |
| 筛选排序纯前端 | Task 10 (useMemo) |
| 不做「当前」标签 | ✅ 已排除 |
| 类型定义 | Task 1 |
| 旧文件清理 | Task 10 |
| 加载/错误态 | Task 10 |

### 占位符检查

- ✅ 无 TBD/TODO
- ✅ 所有步骤包含具体代码
- ✅ 所有类型引用一致（`TopicCardData`、`FilterStage`、`SortBy`）

### 类型一致性

- ✅ `TopicCardData` 在 Task 1 定义 → Task 2 API 返回 → Task 5 PlantCard 消费
- ✅ `FilterStage` / `SortBy` 在 Task 4 和 Task 10 使用相同定义
- ✅ `COLORS.sageGreen` 在 Task 1 添加 → Task 9 GardenNav 使用
