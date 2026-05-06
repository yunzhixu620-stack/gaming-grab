# 变更日志 (Changelog)

> 按时间倒序排列。每次代码变更必须同步在此记录。

---

## [2026-05-06] 项目启动

### 新增 (Added)
- `docs/ARCHITECTURE.md` — 架构总纲，单一事实来源
- `docs/MODULE-STATUS.md` — 6大模块状态追踪表 + 里程碑
- `docs/decisions/D-01-to-D-06.md` — 6个顶层决策的完整记录
- 目录结构: `data/projects/`, `data/cache/`, `docs/plans/`, `docs/changelog/`, `evolution-drafts/*`

### 确认的决策
1. **D-01**: Web 应用形态（PC + Mobile PWA）
2. **D-02**: 混合数据源策略
3. **D-03**: 海外 + 国内双市场
4. **D-04**: Next.js + FastAPI 技术栈
5. **D-05**: 功能域隔离、模块解耦架构原则
6. **D-06**: 分模块版本管理 + 状态回退机制

### 下一步
- [ ] Part 2 设计: 数据库设计与 API 接口规范
- [ ] M0: 搭建项目脚手架

---
