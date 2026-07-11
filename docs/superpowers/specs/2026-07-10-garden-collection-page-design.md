# 一级花圃植物集合页 — 设计说明书

## 概述

将 5 个一级花圃详情页（`/garden/travel`, `/garden/food`, ...）重新设计为精致、可扩展的「花圃式植物集合页」。风格为浅色梦幻花园感，不做后台 dashboard。

## 架构决策

### 路由统一

5 个独立的 `page.tsx`（travel/food/shopping/life/aesthetic）合并为一个动态路由：

```
src/app/garden/[gardenId]/page.tsx
```

通过 `params.gardenId` 区分花圃，旧路由文件删除。

### 新增聚合 API

`GET /api/garden/[gardenId]/cards` — 一次返回卡片视图所需全部数据：

```typescript
interface GardenCardsResponse {
  gardenType: GardenType;
  topics: TopicCardData[];
}

interface TopicCardData {
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
```

SQL 策略：一次查询 topics → 子查询 latest seed（`seeds` 表按 `topic_id` 分组取 `created_at DESC LIMIT 1`）→ 子查询 harvest 存在性（`harvests` 表按 `topic_id` 分组取 `EXISTS`）。最终用 JS 内存聚合。

### 组件拆分

| 组件 | 作用 | 状态 |
|------|------|------|
| `src/app/garden/[gardenId]/page.tsx` | 客户端页面，SWR 取数据 + 筛选排序 | 新建 |
| `GardenNav.tsx` | 花圃切换胶囊 | 微调样式 |
| `GardenHeader.tsx` | 标题行（花圃名 + 植物数） | 新建 |
| `FilterSortBar.tsx` | 筛选胶囊 + 排序下拉 | 新建 |
| `GardenContainer.tsx` | 花圃容器（装饰 + Grid 布局） | 新建 |
| `PlantCard.tsx` | 单张植物卡片 | 新建 |
| `PlantPlaceholderCard.tsx` | 等待下一株占位卡 | 新建 |
| `GardenEmptyState.tsx` | 空花圃状态 | 新建 |

删除旧文件：`src/app/garden/{travel,food,shopping,life,aesthetic}/page.tsx`、`TopicCard.tsx`、`TopicGrid.tsx`。

### 数据流

```
page.tsx (client)
  └─ useSWR('/api/garden/[gardenId]/cards')
       ├─ 本地 state: filterStage, sortBy
       ├─ useMemo: 前端 filter + sort
       └─ 渲染:
            GardenHeader → FilterSortBar → GardenContainer
                                              ├─ PlantCard × N
                                              └─ PlantPlaceholderCard (当 filtered N < 4 时)
```

筛选和排序纯前端，不触发额外请求。

## 页面布局

### 页面背景

浅奶油白渐变（`#faf6f0` → `#f2e4da`），柔和光晕点缀。

### 区域结构

1. **GardenNav** — 花圃切换胶囊，当前页高亮为鼠尾草绿
2. **GardenHeader** — 左侧花圃名 + 右侧「🌱 N 株主题植物正在成长」
3. **FilterSortBar** — 左侧阶段筛选胶囊（全部/发芽中/生长中/开花中/已结果），右侧排序下拉
4. **GardenContainer** — 花圃式网格容器，装饰背景 + CSS Grid

### 花圃容器视觉

- 宽度：`min(1440px, 92vw)`，居中
- 渐变背景：浅奶油到浅绿
- 圆角 32px，柔和阴影
- 左右边缘藤蔓/小花装饰（CSS 伪元素 + emoji）
- 底部小石子路径 / 草地纹理
- Grid：4 列 → 3 列 → 2 列 → 1 列（响应式）
- gap 24px，padding 32px

### PlantCard 植物卡片

- 尺寸：260-300px 宽 × 320-360px 高
- 半透明奶油白底（glass），圆角 24px
- 上半部植物阶段图（120-150px），下半部信息
- 信息层级：植物名（18-20px bold）→ 阶段状态 → 成长值+进度条 → 标签（≤3）→ 最近灵感（1 行）→ 当前清单状态 → 「进入植物 →」
- hover：上浮 4-6px，阴影增强，植物图 scale 1.03，边缘绿色光晕
- 点击整卡进入 `/garden/[gardenId]/[topicId]`

### PlantPlaceholderCard 占位卡

- 同样尺寸，虚线描边
- 内容：小种子/土坑插画 +「等待下一株植物」+ 温柔引导文案
- 点击打开投喂 Modal（通过 `requestFeed()`）

### 空状态

- 中心展示：空土壤 + 小种子 + 小水壶 + 光点 + 花草
- 文案：「这里还没有长出主题植物 🌱」
- 按钮：「投喂新灵感」

### 响应式

| 断点 | Grid 列数 |
|------|----------|
| ≥1280px | 4 列 |
| 1024-1279px | 3 列 |
| 640-1023px | 2 列 |
| <640px | 1 列 |

移动端花圃切换和筛选胶囊可横向滚动。

## 非功能需求

- 筛选和排序纯前端，不触发额外 API 请求
- 卡片骨架加载态（Skeleton）
- API 错误态友好提示
- 动效克制：hover 轻浮 + 淡入动画（Framer Motion）
- 不做「当前」标签
- 不展示灵感数量、清单详情、OCR 原文
