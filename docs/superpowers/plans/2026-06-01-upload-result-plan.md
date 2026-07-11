# 实现计划：上传结果页 & 植物详情页

## 并行阶段（5 agent 同时推进）

### Agent A: 数据层
- `src/types/index.ts` — Seed 接口扩展（image_url, title, summary, extracted_fields, missing_fields 种子级, branch）
- `src/lib/constants.ts` — 植物阶段文案映射、分支文案映射、growthNarrative 模板
- `src/lib/garden-engine.ts` — 新增 `generateGrowthNarrative()` 模板函数
- `supabase/migrations/002_seed_enhancements.sql` — ALTER TABLE seeds 新增 6 字段

### Agent B: API 路由
- `src/app/api/upload/route.ts` — 图片上传到 Supabase Storage
- `src/app/api/classify/route.ts` — mock 模式 + AI prompt 扩展（title/summary/extractedFields/branch）
- `src/app/api/seed/route.ts` — POST 扩展接收新字段 + recalcTopic + 返回 growthNarrative
- `src/app/api/seed/[seedId]/route.ts` — PATCH 补充后重算
- `src/app/api/seed/[seedId]/move/route.ts` — 种子移动到其他主题
- `src/lib/qwen.ts` — classify prompt 扩展

### Agent C: FeedModal 结果卡
- `src/components/home/FeedModal.tsx` — 替换 saved 状态为完整结果卡
  - 种好啦标题
  - 已种进位置模块
  - AI 识别结果模块
  - 成长贡献模块
  - 缺失信息/补水模块
  - CTA 按钮组

### Agent D: 植物详情页组件
- `src/components/garden/TopicDetail.tsx` — 完全重构为植物详情页
  - 植物状态头部（左插图 + 右数据）
  - 生命周期轻量进度条
  - 分支结构
  - 标签 + 缺失
  - 采摘状态
  - 灵感列表（使用 SeedCard）

### Agent E: SeedCard + PlantAvatar + GrowthFeedback
- `src/components/seed/SeedCard.tsx` — 灵感卡片（缩略图/标题/摘要/OCR折叠/字段/标签/操作）
- `src/components/garden/PlantAvatar.tsx` — SVG 植物插画
- `src/components/garden/GrowthFeedback.tsx` — 成长反馈动效组件
