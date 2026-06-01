# CLAUDE.md — 灵感花园 (Inspire Garden)

## 项目概述

灵感花园是一个用植物生长隐喻管理灵感收藏的 Next.js 全栈 Web 应用。用户将日常收藏的灵感碎片（截图、链接、文字）种入花园，AI 小园丁帮助识别、归类、补全信息，同主题灵感从种子生长到开花（可采摘为行动清单）再到结果（真实行动完成）。

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| UI 库 | React 18 |
| 语言 | TypeScript (strict mode) |
| 样式 | Tailwind CSS 3.4 |
| 动效 | Framer Motion 11 |
| 后端 | Next.js API Routes |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth (邮箱 + 密码) |
| AI | 通义千问 (Qwen) API |
| 数据请求 | SWR 2 |
| 部署 | Vercel |
| 花园可视化 | SVG 组件 + Canvas 粒子层 |

## 色彩系统

| Token | 色值 | 用途 |
|-------|------|------|
| cream | `#faf6f0` | 页面底色 |
| mist-pink | `#f2e4da` | 按钮渐变、浮板底色 |
| warm-brown | `#d9b299` | 次级文字 |
| deep-brown | `#947453` | 辅助文字 |
| gold | `#e5c872` | 高亮、开花标识 |
| dark-gold | `#d3a76d` | 金麦色 |
| coral | `#ed726e` | CTA 按钮、关键强调 |
| text-primary | `#69562c` | 标题、正文 |

## 开发命令

```bash
cd inspire-garden

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
inspire-garden/
├── public/assets/          # 静态资源（花园背景 PNG、头像等）
├── src/
│   ├── app/                # Next.js App Router 页面
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 首页
│   │   ├── auth/           # 认证页面
│   │   ├── garden/         # 花圃详情 + 主题详情
│   │   └── api/            # API Routes
│   ├── components/
│   │   ├── layout/         # TopNav, GardenShell, Providers
│   │   ├── home/           # 首页各区域组件
│   │   ├── garden/         # TopicGrid, TopicCard, TopicDetail
│   │   ├── chat/           # ChatPanel, MessageBubble
│   │   ├── seed/           # SeedCard, SeedEditor
│   │   └── ui/             # Button, Modal, FloatPanel, Tag
│   ├── lib/
│   │   ├── constants.ts    # 花园配置常量
│   │   ├── garden-engine.ts # 生长引擎纯函数
│   │   ├── qwen.ts         # Qwen API 封装
│   │   └── supabase/       # Supabase 客户端
│   ├── hooks/              # 自定义 Hooks
│   └── types/              # TypeScript 类型定义
├── supabase/
│   └── migrations/         # 数据库迁移脚本
└── docs/                   # 设计文档
```

## 架构约束

1. **一级花圃固定 5 个**：旅行、美食、购物、生活锦囊、审美灵感。AI 分类必须归入现有花圃，新增需 ≥10 条未分类内容 + AI 建议 + 用户确认。
2. **二级主题**由 AI 自动生成，命名 2-6 字。
3. **不使用 Three.js**，花园可视化用 SVG 组件 + Canvas 粒子层。
4. **不做枯萎/预警/打卡/排行榜**等游戏化压力机制。
5. **桌面端优先**，移动端适配后续迭代。

## 设计文档

- 设计说明书：`docs/superpowers/specs/2026-05-31-inspire-garden-design.md`
- 实现计划：`docs/superpowers/plans/2026-06-01-inspire-garden-plan.md`

## 关键设计决策

- 花园生长值 = 主题密度分×0.35 + 信息完整度分×0.35 + 主题结构度分×0.30
- 不同花圃有不同关键字段集（旅行 9 类、美食 8 类、购物 7 类、生活锦囊 5 类、审美灵感 4 类）
- 开花需要生长值 ≥ 75 且 canHarvest = true
- AI 对话采用轻量意图识别（收藏/提问/补充/聊天）四分支路由
- 首页采用静态 PNG 背景 + React 动态内容叠加的 5 层结构
- 半主动式 AI 交互（默认），用户可配置主动程度
