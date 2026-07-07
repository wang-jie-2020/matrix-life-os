# ASCII Life OS 文档索引

> 反推日期：2026-07-07  
> 文档性质：基于当前源码与 README 反推的产品、设计与技术开发指导。  
> 适用范围：当前 Electron + React 桌面版 `ascii-life-os`。

## 1. 文档定位

`docs/alo/` 是 ASCII Life OS（ALO）的开发指导文档目录。它不是从零设定的愿景文档，而是从当前项目实现反推出来的事实文档：

- 当前产品是什么；
- 用户如何使用核心流程；
- 前端 UI 应如何保持一致；
- 技术架构、数据模型、持久化和发布方式是什么；
- 哪些能力存在代码但未确认挂载，不能误写为已上线能力。

这些文档的主要依据包括：

- `README.md`
- `src/App.tsx`
- `src/pages/ActionDesk.tsx`
- `src/pages/ReviewArchive.tsx`
- `src/pages/System.tsx`
- `src/types/index.ts`
- `src/store/useAppStore.ts`
- `src/features/modules/moduleRegistry.ts`
- `src/index.css`
- `electron/main.cjs`
- `electron/preload.cjs`

## 2. 推荐阅读顺序

| 顺序 | 文档 | 适合谁读 | 解决什么问题 |
|---:|---|---|---|
| 1 | [`01-product-prd.md`](01-product-prd.md) | 产品、设计、开发 | ALO 是什么，不是什么，核心模块和边界是什么 |
| 2 | [`02-user-stories-and-flows.md`](02-user-stories-and-flows.md) | 产品、测试、开发 | 用户如何完成捕捉、执行、反思、归档等核心流程 |
| 3 | [`03-frontend-design-system.md`](03-frontend-design-system.md) | 前端、设计 | UI 视觉、交互、组件和状态表达应该如何保持一致 |
| 4 | [`04-technical-architecture.md`](04-technical-architecture.md) | 开发、维护者 | 技术栈、数据模型、store、持久化、构建发布如何组织 |
| 5 | [`05-implementation-notes-and-gaps.md`](05-implementation-notes-and-gaps.md) | 产品、开发、维护者 | 当前实现与 README/理想 PRD 的差异、遗留组件和决策点 |
| 6 | [`06-mvp-roadmap.md`](06-mvp-roadmap.md) | 产品、项目负责人、开发 | 0-1 版本分层、P0/P1/P2、阶段目标和 release gate |
| 7 | [`07-page-specs.md`](07-page-specs.md) | 前端、测试、产品 | 三页结构、组件树、页面状态、数据来源和页面验收 |
| 8 | [`08-data-schema.md`](08-data-schema.md) | 开发、测试、维护者 | AppState 数据字典、字段、关系、持久化和迁移 checklist |
| 9 | [`09-state-machines-and-business-rules.md`](09-state-machines-and-business-rules.md) | 开发、测试、产品 | Task/KR/Objective/Reflection/Module 等状态机与业务规则 |
| 10 | [`10-implementation-plan.md`](10-implementation-plan.md) | 开发负责人、开发 | 从空仓库到可发布版本的实施阶段、任务顺序和 DoD |
| 11 | [`11-test-and-acceptance-plan.md`](11-test-and-acceptance-plan.md) | 测试、开发、发布负责人 | 测试分层、手动验收、Electron 验收和 release checklist |
| 12 | [`12-project-scaffold-guide.md`](12-project-scaffold-guide.md) | 新项目开发者 | 新项目脚手架、依赖、目录、Electron、CI 和首月节奏 |

## 3. 状态标注规则

为了避免把“源码存在”误写成“用户可用”，本目录统一使用以下状态标签：

| 状态 | 含义 |
|---|---|
| `Implemented and mounted` | 已实现，并能从当前页面/模块路径访问 |
| `Implemented but not mounted` | 有实现代码，但当前未确认被页面或布局挂载 |
| `Partially implemented` | 部分能力已实现，但与完整产品需求存在差距 |
| `Legacy / uncertain` | 疑似历史遗留、替代实现或状态不明 |
| `Planned / candidate` | 符合产品方向，但当前未实现或未完整实现 |

写 PRD、用户故事或验收标准时，默认只把 `Implemented and mounted` 写成当前能力。其他状态必须显式标注。

## 4. 当前产品一句话

ALO 是一款本地优先的 Electron 桌面个人 Life OS：用 ASCII/Terminal/Monastic 风格，把个人生活管理拆成“捕捉 → 支撑 → 执行 → 洞察”的闭环。

它不是团队协作系统，不是云端任务平台，也不是普通 Todo App。

## 5. 关键源码入口

### 应用入口与页面

- `src/main.tsx`：React 入口。
- `src/App.tsx`：应用壳、三页导航、主题切换、更新提示、存储警告。
- `src/pages/ActionDesk.tsx`：行动台，核心执行页。
- `src/pages/ReviewArchive.tsx`：回顾档案，反思、能力、归档页。
- `src/pages/System.tsx`：系统页，模块、模板、数据健康、更新、手册。

### 模块与状态

- `src/types/index.ts`：核心数据模型与 `AppState`。
- `src/store/useAppStore.ts`：Zustand store 组合、持久化、rehydrate 迁移。
- `src/store/slices/*`：按领域拆分的状态与 action。
- `src/features/modules/moduleRegistry.ts`：模块注册表、GTD phase、默认启用、核心标记。
- `src/store/slices/layoutSlice.ts`：Dashboard / Reflection / System 默认布局。

### UI 与设计系统

- `src/index.css`：设计 tokens、主题、字体、间距、动效、响应式。
- `src/components/AsciiBox.tsx`：标准面板。
- `src/components/AsciiButton.tsx`：方括号按钮。
- `src/components/AsciiProgress.tsx`：ASCII 进度条。
- `src/components/DraggablePanel.tsx`：可拖拽面板壳。

### 本地持久化与发布

- `src/utils/electronStorage.ts`：Zustand persist storage adapter。
- `electron/main.cjs`：Electron 主进程、`alo-data.json`、`.bak`、`.tmp`、IPC。
- `electron/preload.cjs`：暴露有限 `window.electronAPI`。
- `package.json`：脚本、依赖、electron-builder 配置。
- `vite.config.ts`：Vite 配置、版本注入。
- `.github/workflows/release.yml`：GitHub Release 发布流程。

## 6. 开发时如何使用这些文档

### 新增功能前

1. 先读 `01-product-prd.md`，确认功能是否符合产品边界。
2. 再读 `02-user-stories-and-flows.md`，确认它接入哪个用户流程。
3. 如果涉及 UI，读 `03-frontend-design-system.md` 和 `07-page-specs.md`。
4. 如果涉及数据，读 `08-data-schema.md` 与 `09-state-machines-and-business-rules.md`。
5. 如果涉及架构、持久化、发布，读 `04-technical-architecture.md`。
6. 如果功能看起来已有代码，先查 `05-implementation-notes-and-gaps.md`，避免重复实现或误用遗留组件。
7. 如果是从 0-1 新建项目，按 `06-mvp-roadmap.md`、`10-implementation-plan.md`、`12-project-scaffold-guide.md` 执行，并用 `11-test-and-acceptance-plan.md` 验收。

### 修改数据模型时

必须同步检查：

- `src/types/index.ts`
- 对应 `src/store/slices/*`
- `src/store/useAppStore.ts` 的 `partialize`
- rehydrate / migration
- data health / backup 相关逻辑
- 是否需要更新本文档

### 修改 UI 时

默认遵守：

- 使用 CSS variables，不硬编码主题色；
- 优先复用 ASCII 风格组件；
- 按 `[命令]`、`☐/☑`、`[x]`、`[✎]` 等符号表达状态；
- hover / active 用反相、边框、金色强调，不引入现代圆角卡片式视觉；
- 动效短促克制，尊重 reduced motion。

## 7. 维护规则

- 文档中的功能断言应能追溯到源码或明确标注为 `Planned / candidate`。
- 当新增模块、字段、持久化策略、发布流程或 UI 规范时，应同步更新相关文档。
- 若发现 README 与当前实现不一致，优先在 `05-implementation-notes-and-gaps.md` 记录，再决定是否修 README 或补实现。
