# Gaming PM Agent — 项目架构总纲

> **版本**: v1.0-arch | **创建**: 2026-05-06 | **状态**: ACTIVE
> **用途**: 本文件是整个项目的"单一事实来源"(Single Source of Truth)。
> 任何架构变更必须先改此文件，再改代码。禁止绕过此文件直接改结构。

---

## 1. 项目定位

数据驱动型游戏产品经理智能体，从社交论坛和搜索数据中挖掘未被满足的细分游戏需求，
转化为结构化 GDD 模块和 Steam 宣发资产。

## 2. 已确认的顶层决策

| # | 决策项 | 结论 | 确认时间 | 不可随意更改 |
|---|--------|------|----------|-------------|
| D-01 | 目标形态 | Web 应用（PC + Mobile PWA） | 2026-05-06 09:58 | ⚠️ 改动需重新评估 |
| D-02 | 数据源策略 | 混合模式（真实API + Mock） | 2026-05-06 10:01 | 可扩展 |
| D-03 | 目标市场 | 海外 + 国内双市场 | 2026-05-06 10:01 | 可扩展 |
| D-04 | 技术栈 | Next.js + Tailwind 前端 / Python FastAPI 后端 | 2026-05-06 10:11 | ⚠️ 影响全局 |
| D-05 | 架构原则 | 功能域隔离、模块解耦、独立开发互不影响 | 2026-05-06 10:11 | ❌ 不可违反 |
| D-06 | 版本管理 | 分模块记录 + 状态回退能力 | 2026-05-06 10:15 | ❌ 不可违反 |

## 3. 目录结构

```
gaming-pm-agent/
├── apps/                          # 独立可部署的应用单元
│   ├── web/                       # Next.js 前端（PC + Mobile PWA）
│   │   ├── src/
│   │   │   ├── app/              # 路由页（每个 Phase 一个页面）
│   │   │   ├── features/         # ⭐ 模块化功能域（核心解耦层）
│   │   │   │   ├── discovery/    # Phase 1: 品类发现
│   │   │   │   ├── sentiment/    # Phase 2: 痛点分析
│   │   │   │   ├── structuring/  # Phase 3: 需求结构化
│   │   │   │   └── asset-gen/    # Phase 4: 资产生成
│   │   │   ├── shared/           # 公共 UI 组件
│   │   │   └── lib/              # 工具函数
│   │   └── package.json
│   │
│   └── api/                       # FastAPI 后端
│       ├── routers/              # ⭐ 每个模块独立路由
│       │   ├── discovery.py
│       │   ├── sentiment.py
│       │   ├── structuring.py
│       │   └── asset_gen.py
│       ├── services/             # 业务逻辑层（各模块独立）
│       ├── crawlers/             # 数据采集（独立模块）
│       ├── models/               # Pydantic 数据模型
│       └── main.py
│
├── packages/                     # 共享包（单向依赖）
│   ├── shared-types/
│   └── shared-utils/
│
├── data/                         # 数据存储
│   ├── cache/                    # 爬虫缓存
│   └── projects/                 # 用户项目数据
│
└── docker-compose.yml
```

## 4. 解耦原则（不可违反）

1. **功能域隔离**: `features/` 下每个 Phase 是独立文件夹，有自己的组件/Hooks/API
2. **后端路由独立**: 每个 router 是一个文件，不 cross-import
3. **共享包单向依赖**: `apps/` → `packages/`，反向禁止
4. **数据通过 API 交接**: Phase 间通过 project_id 传递 JSON 文件

## 5. Phase 数据流

```
用户创建 Project → project_id
  → Phase 1 输出 → data/projects/{id}/phase1.json
  → Phase 2 读取 phase1.json → 输出 phase2.json
  → Phase 3 读取 phase2.json → 输出 phase3.json
  → Phase 4 读取 phase3.json → 输出 phase4.json
```

每个 Phase 的输入输出格式变更只影响该 Phase 内部。

## 6. 四阶段工作流定义

| Phase | 名称 | Agent | 输入 | 输出 |
|-------|------|-------|------|------|
| 1 | Niche Discovery | Scout Agent | 泛品类词（如 "co-op games"） | 细分品类候选池（3-5个卡片） |
| 2 | Sentiment Analysis | Reddit Analyst Agent | 选中的细分品类 | 核心共识点（痛点+爽点+原话引用） |
| 3 | Data Structuring | PM Agent | 确认的核心共识 | Feature Backlog 表格（P0-P3） |
| 4 | Asset Generation | Asset Generator | Feature Backlog | Elevator Pitch / Steam 描述 / Devlog 选题 |

## 7. 数据源优先级

### 海外（Phase 1-2 首选）
- 关键词: Semrush API / Google Serper API / Reddit Search
- 社交: Reddit JSON API（免费无需认证）, Discord 公开频道

### 国内（并行采集）
- 小红书: 需登录态（第二期）
- B站: 公开评论可抓
- TapTap: 需登录态（第二期）
- NGA / 小黑盒 / 贴吧: 公开可抓

## 8. 技术栈详情

### 前端 (apps/web)
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand（轻量，按 feature 分 store）
- 拖拽: @dnd-kit/core（Feature Backlog 卡片拖拽）
- PWA: next-pwa（支持手机添加到主屏幕）

### 后端 (apps/api)
- Framework: FastAPI
- Crawler: httpx (async) + BeautifulSoup4
- LLM: OpenAI-compatible API（可切换模型）
- Storage: SQLite (aiosqlite) + JSON 文件缓存
- Task Queue: asyncio（第一版不需要 Celery）

---

_本文件变更日志见 docs/changelog/architecture.md_
