# 模块开发状态追踪表

> **更新规则**: 每完成一个模块的任何变更，必须同步更新此文件。
> **回退规则**: 每个模块记录当前版本和上一稳定版本，支持快速回退。

---

## 状态图例

| 状态 | 含义 | 颜色标识 |
|------|------|----------|
| `NOT_STARTED` | 未开始 | ⚪ |
| `DESIGNING` | 设计中（文档/接口定义） | 🟡 |
| `DEVELOPING` | 开发中 | 🔵 |
| `TESTING` | 测试中 | 🟠 |
| `STABLE` | 稳定可用 | 🟢 |
| `FROZEN` | 已冻结（不推荐修改） | ❄️ |
| `DEPRECATED` | 已废弃 | ⛔ |

---

## Phase 1: Niche Discovery（品类发现）

| 字段 | 值 |
|------|-----|
| **模块ID** | `P1-DISCOVERY` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **前端路径** | `apps/web/src/features/discovery/` |
| **后端路径** | `apps/api/routers/discovery.py` → `services/scout_agent.py` → `crawlers/keyword_research.py` + `crawlers/reddit_crawler.py` |
| **数据输入** | 用户输入泛品类词 |
| **数据输出** | `data/projects/{id}/phase1.json` → 细分品类候选池卡片 |
| **依赖项** | 无（首个模块） |
| **被依赖** | Phase 2 (读取 phase1.json) |

### 版本历史

| 版本 | 日期 | 变更内容 | 状态标记 |
|------|------|----------|----------|
| v0.1.0 | 2026-05-06 | M1完成: Scout Agent + Google Autocomplete + Reddit JSON API + 前端卡片UI | STABLE |
| v0.0.0 | — | 初始创建 | NOT_STARTED |

### 回退点

| 版本 | 文件快照路径 | 备注 |
|------|-------------|------|
| — | — | 尚无可用回退点 |

---

## Phase 2: Sentiment & Consensus Analysis（痛点验证）

| 字段 | 值 |
|------|-----|
| **模块ID** | `P2-SENTIMENT` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **前端路径** | `apps/web/src/features/sentiment/` |
| **后端路径** | `apps/api/routers/sentiment.py` → `services/reddit_analyst.py` → `crawlers/reddit_crawler.py` |
| **数据输入** | `phase1.json`（选中的细分品类） |
| **数据输出** | `data/projects/{id}/phase2.json` → 核心共识点卡片 |
| **依赖项** | Phase 1 输出 |
| **被依赖** | Phase 3 |

### 版本历史

| 版本 | 日期 | 变更内容 | 状态标记 |
|------|------|----------|----------|
| v0.0.0 | — | 初始创建 | NOT_STARTED |

### 回退点

| 版本 | 文件快照路径 | 备注 |
|------|-------------|------|
| — | — | 尚无可用回退点 |

---

## Phase 3: Data Structuring（需求结构化）

| 字段 | 值 |
|------|-----|
| **模块ID** | `P3-STRUCTURING` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **前端路径** | `apps/web/src/features/structuring/` |
| **后端路径** | `apps/api/routers/structuring.py` → `services/pm_agent.py` |
| **数据输入** | `phase2.json`（确认的核心共识） |
| **数据输出** | `data/projects/{id}/phase3.json` → Feature Backlog 表格 |
| **依赖项** | Phase 2 输出 |
| **被依赖** | Phase 4 |

### 版本历史

| 版本 | 日期 | 变更内容 | 状态标记 |
|------|------|----------|----------|
| v0.0.0 | — | 初始创建 | NOT_STARTED |

### 回退点

| 版本 | 文件快照路径 | 备注 |
|------|-------------|------|
| — | — | 尚无可用回退点 |

---

## Phase 4: Asset Generation（产品资产）

| 字段 | 值 |
|------|-----|
| **模块ID** | `P4-ASSET-GEN` |
| **当前状态** | `NOT_STARTED` |
| **当前版本** | `v0.0.0` |
| **上一稳定版** | — |
| **前端路径** | `apps/web/src/features/asset-gen/` |
| **后端路径** | `apps/api/routers/asset_gen.py` → `services/asset_generator.py` |
| **数据输入** | `phase3.json`（Feature Backlog） |
| **数据输出** | `data/projects/{id}/phase4.json` → Elevator Pitch / Steam 描述 / Devlog |
| **依赖项** | Phase 3 输出 |
| **被依赖** | 无（最终输出） |

### 版本历史

| 版本 | 日期 | 变更内容 | 状态标记 |
|------|------|----------|------|
| v0.0.0 | — | 初始创建 | NOT_STARTED |

### 回退点

| 版本 | 文件快照路径 | 备注 |
|------|-------------|------|
| — | — | 尚无可用回退点 |

---

## 共享模块

### shared-types（共享类型定义）

| 字段 | 值 |
|------|-----|
| **模块ID** | `SHARED-TYPES` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **路径** | `packages/shared-types/index.ts` |
| **说明** | TypeScript 接口定义，与 Python Pydantic models.py 对齐 |

### Web 前端 - Core

| 字段 | 值 |
|------|-----|
| **模块ID** | `WEB-CORE` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **路径** | `apps/web/src/app/`, `next.config.ts`, `package.json` |
| **说明** | Next.js 15 入口页、冷灰主题CSS、Phase导航卡片占位、API代理配置 |

### API 后端 - Core

| 字段 | 值 |
|------|-----|
| **模块ID** | `API-CORE` |
| **当前状态** | `STABLE` ✅ |
| **当前版本** | `v0.1.0` |
| **上一稳定版** | — |
| **路径** | `apps/api/main.py`, `models.py`, `routers/` |
| **说明** | FastAPI 入口、4个独立路由、Pydantic模型、CORS中间件、健康检查 |

---

## 全局里程碑

| # | 里程碑 | 涉及模块 | 目标状态 | 完成日期 |
|---|--------|----------|----------|----------|
| M0 | 项目脚手架搭建完成 | API-CORE + WEB-CORE + SHARED-TYPES | ✅ STABLE | 2026-05-06 |
| M1 | Phase 1 可用 | P1-DISCOVERY | ✅ STABLE | 2026-05-06 |
| M2 | Phase 1+2 可用 | P1 + P2 | ✅ STABLE | 2026-05-06 |
| M3 | Phase 1-3 可用 | P1 + P2 + P3 | ✅ STABLE | 2026-05-06 |
| M4 | 国内数据源接入 | P1 + P2 爬虫扩展 | STABLE | — |
| M5 | 移动端 PWA 优化 | WEB + 全部前端 | STABLE | — |

---

_每次变更模块状态时，同步在 docs/changelog/ 下追加一条记录_
