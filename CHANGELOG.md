# 变更日志

本文档记录本项目的重要变更。

> Reset 说明：以下条目描述 reset 前的历史版本，不是当前产品需求。当前范围以 `docs/PRD.md` 为准；当前实现说明见 `docs/ARCHITECTURE.md`。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。

## [未发布]

## [0.3.0] - 2026-06-05

### 重构
- 三页架构 — 行动台 / 回顾档案 / 系统，完全替代旧 Dashboard / 反思库 / 系统页
- GTD 四阶段模块归类 — 捕捉 / 支撑 / 执行 / 洞察，模块注册表新增 `gtdPhase` 与 `page` 元数据
- 模块管理迁入系统页 — 导航栏移除全局浮层，统一在「系统 → 功能开关」管理
- 彻底移除 Backlog 面板及所有相关逻辑、类型、数据字段
- 彻底移除 Snapshot / Rollback 功能及相关的 IPC、配置、UI、数据字段
- 新增数据迁移框架 — 启动时按版本链自动迁移旧数据，并保留 `.bak` 备份

### 新增
- 快速收集箱 + 收集箱处理器 — 支持转为 O / KR / 今日任务 / 灵感 / 删除
- 行动台 (Action Desk) 页面 — 周看板、OKR、右侧辅助面板统一布局
- 回顾档案 (Review Archive) 页面 — 反思、能力雷达、能力训练、光荣榜、数据备份
- 系统页新增「生存指南」Manual 面板
- 系统页新增「数据体检报告」DataHealth 面板
- 系统页新增「反思模板」管理面板
- `titles-copy.ts` 全局模块标题中文趣味翻译
- `useDayMigration` — 未完成任务自动迁移到今天并标记「来自昨日」
- `useObjectiveAutoArchive` — O 下所有 KR 完成后自动归档到光荣榜

### 优化
- KR 拖拽到周看板落点准确性修复（引入 DragOverlay）
- 任务编辑 ability 下拉框选「无」时 blur bug 修复
- 更新检测改为直接调用 GitHub Releases API，修正仓库地址
- 数据导出/导入流程与文案统一
- 空状态、提示、按钮、导航悬停文案全面重写，统一黑色幽默人格
- 存储容量预警 — >4MB 控制台警告，>4.5MB 顶部横幅提示

### 技术
- Zustand store slices 重构 — 新增 `archiveSlice`，移除 backlog 与 snapshot 相关 slice
- Electron 主进程移除 snapshot/rollback IPC handlers
- 类型层清理 legacy `BACKLOG`、`autoAddToBacklog`、`SnapshotInfo` 等类型
- Vite 构建时继续自动注入 `__APP_VERSION__`

## [0.2.1] - 2026-06-02

### Added
- OKR 跨月份查看 — 支持 `<` / `>` 切换月份，历史 OKR 数据不再丢失
- 存储容量预警 — 数据超过 4MB 时控制台警告，超过 4.5MB 时顶部横幅提示导出清理
- 任务看板列宽记忆 — 新增 `taskColumnWidth` 配置，默认 260px
- 构建版本号自动注入 — `vite.config.ts` 读取 `package.json` version，更新检查更准确
- 反思模板默认数据 — 新用户首次打开自动加载「障碍突破」模板（5 个问题）

### Fixed
- 更新检测 404 — 移除对 `latest.json` 的依赖，改为直接调用 GitHub Releases API，解决"更新失败"误报
- 暗色模式对比度 — 提升文字色值亮度，修复伤眼问题（WCAG AA 合规）
- 任务能力值编辑 — 已有任务支持修改/补加/移除能力关联
- OKR→任务能力关联 — 收纳箱 KR 发送到看板前可选择能力+分值
- 2K 屏布局适配 — 任务看板与下方面板对齐

## [0.1.0] - 2025-05-31

### Added
- 周看板 (Dashboard) — 任务管理、能力雷达、数据备份、娱乐追踪、原则面板
- 反思库 (Reflection) — 月度计划、能力训练、反思记录与筛选
- 双主题支持 — 深色 / 浅色模式切换
- 数据持久化 — 自动保存到本地，支持导出/导入备份
- 跨平台发布 — Windows (.exe) + macOS (.dmg / .zip)
