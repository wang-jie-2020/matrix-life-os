# 0-1 实施计划

> 反推日期：2026-07-07  
> 目标：让开发者可以从空仓库开始，按阶段建成 ALO Electron 桌面版。  
> 范围：React + TypeScript + Vite + Electron + Zustand。

## 1. 实施原则

### 1.1 先闭环，后扩展

优先实现最短闭环：

```text
QuickInbox → TaskBoard → Task completed → Reflection
```

再扩展：

```text
Objective/KR → linked task → archive
```

最后补：

```text
模块系统、数据健康、Electron hardening、可选模块
```

### 1.2 先数据，再 UI

每个模块顺序：

1. 类型；
2. slice actions；
3. 基础 UI；
4. 持久化；
5. migration/defaults；
6. 测试/验收；
7. 文档。

### 1.3 不提前做平台扩展

0-1 阶段不做：

- 云同步；
- 账号；
- 多端；
- 小程序；
- 插件系统；
- AI 自动规划。

## 2. 阶段 0：项目初始化

### 2.1 目标

建立可运行、可构建、可 lint 的 React + TS 项目。

### 2.2 任务

- 初始化 Vite React TS。
- 配置 TypeScript。
- 配置 ESLint。
- 添加基础脚本：
  - `dev`
  - `build`
  - `lint`
  - `preview`
- 创建目录结构：

```text
src/
├── components/
├── copy/
├── features/
├── hooks/
├── pages/
├── store/
│   └── slices/
├── types/
├── utils/
├── App.tsx
├── main.tsx
└── index.css
```

### 2.3 验收

```text
npm run dev 可启动
npm run build 可通过
npm run lint 可运行
```

## 3. 阶段 1：设计系统骨架

### 3.1 目标

建立 Monastic Terminal 的基础视觉，不等业务完成后再补样式。

### 3.2 任务

- 编写 `src/index.css`：
  - color tokens；
  - typography tokens；
  - spacing tokens；
  - motion tokens；
  - reset；
  - utility classes；
  - responsive skeleton。
- 创建通用组件：
  - `AsciiBox`
  - `AsciiButton`
  - `AsciiProgress`
- 创建空页面：
  - `ActionDesk`
  - `ReviewArchive`
  - `System`
- 创建 App shell：
  - 顶部导航；
  - 三页切换；
  - 主题切换占位。

### 3.3 验收

- 三页能切换。
- 样式符合暗色主题。
- AsciiBox / AsciiButton 可在任一页面展示。

## 4. 阶段 2：类型与 Store 基础

### 4.1 目标

建立 AppState 和 Zustand store，为业务模块提供状态基础。

### 4.2 任务

- 创建 `src/types/index.ts` 基础类型：
  - `Task`
  - `InboxItem`
  - `AppConfig`
  - `AppState`
- 创建 `configSlice`：
  - `theme`
  - `currentWeekStart`
  - `lastVisitDate`
  - `updateConfig`
  - `toggleTheme`
- 创建 `taskSlice` basic：
  - `tasks`
  - `addTask`
  - `deleteTask`
  - `toggleTask`
  - `updateTask`
- 创建 `okrSlice` 的 inbox 部分：
  - `inboxItems`
  - `addQuickInboxItem`
  - `removeFromInbox`
  - `deleteInboxItem`
- 创建 `useAppStore.ts`。
- 接入 Zustand persist，先用 localStorage。

### 4.3 验收

- theme 切换后刷新保留。
- addTask 后刷新保留。
- addQuickInboxItem 后刷新保留。

## 5. 阶段 3：QuickInbox + TaskBoard MVP

### 5.1 目标

实现最小执行系统。

### 5.2 任务

#### QuickInbox

- 创建 `QuickInbox`。
- 输入框 Enter 创建 inbox item。
- 展示 inbox item 列表。
- 删除 inbox item。
- 空状态。

#### TaskBoard

- 日期工具：
  - `getTodayString`
  - `getWeekStart`
  - `getWeekDates`
  - `getDayColumnFromDate`
  - `isSameWeek`
- 创建 `TaskBoard`。
- 创建 `TaskColumn`。
- 创建 `TaskCard`。
- 支持新增手动 task。
- 支持 task 完成/取消完成。
- 支持 task 编辑/删除。

#### Inbox → Task

- 先实现按钮或简单 drop：把 inbox item 转为今日 task。
- 转换成功后 remove inbox item。

### 5.3 验收

- QuickInbox 捕捉可用。
- Inbox → 今日 Task 可用。
- Task 完成状态可切换。
- Task 重启后保留。

## 6. 阶段 4：DnD 执行系统

### 6.1 目标

引入 @dnd-kit，让 ALO 的核心交互成型。

### 6.2 任务

- 安装并配置 @dnd-kit。
- TaskBoard 支持：
  - 列内排序；
  - 跨日移动；
  - drop 到空列。
- QuickInbox item 支持 draggable。
- ActionDesk 包裹 `DndContext`。
- 实现 DroppableZone。
- Inbox → TaskBoard drop。
- DragOverlay。

### 6.3 验收

- task 可列内排序。
- task 可拖到其他日期。
- inbox item 可拖到 TaskBoard 创建 task。
- DnD 失败不会产生副作用。

## 7. 阶段 5：OKR 与 Archive

### 7.1 目标

实现目标到任务、任务到归档的闭环。

### 7.2 任务

#### 类型

- `Objective`
- `KeyResult`
- `ObjectiveArchive`
- Task 增加：
  - `linkedKrId`
  - `source`

#### Store

- 完成 `okrSlice`：
  - add/update/delete Objective；
  - add/update/delete/toggle KR；
  - completeKR / uncompleteKR；
  - scheduleKR / unscheduleKR。
- 新增 `archiveSlice`。

#### UI

- 创建 `OKRPanel`。
- KR 支持 draggable。
- ActionDesk 处理 KR drop 到 TaskBoard。
- 创建 `ObjectiveArchivePanel`。
- TaskCard 显示 `[KR]`。

#### 联动

- Task complete → completeKR。
- Task uncomplete → uncompleteKR。
- all KRs complete → archiveObjective + deleteObjective。

### 7.3 验收

- Objective / KR 可创建。
- KR 可拖到任务板。
- linked task 完成后 KR completed。
- 所有 KR completed 后 Objective 归档。

## 8. 阶段 6：Reflection 系统

### 8.1 目标

实现每日反思与历史沉淀。

### 8.2 任务

#### 类型

- `ReflectionQuestion`
- `ReflectionTemplate`
- `Reflection`

#### Store

- `reflectionSlice`
- `reflectionTemplateSlice`
- 默认模板。

#### UI

- `ReflectionQuickEntry`
- `ReflectionForm`
- `ReflectionGrid`
- `ReflectionDetailModal`
- `ReflectionTemplateManager`
- ReviewArchive 页面布局。

#### 迁移/默认值

- rehydrate 时没有 template 则补默认模板。
- Reflection save 按 date upsert。

### 8.3 验收

- 今天可以保存 reflection。
- 同一天重复保存为更新。
- 历史 reflection 可查看详情。
- 默认模板存在。

## 9. 阶段 7：模块系统与可选模块

### 9.1 目标

让系统可裁剪，并逐步接入支撑/洞察模块。

### 9.2 任务

#### Module system

- `GtdPhase`
- `ModulePage`
- `ModuleId`
- `ModuleMeta`
- `MODULE_REGISTRY`
- `moduleSlice`
- `ModuleManager`

#### Layout system

- `DashboardLayout`
- `TwoColumnLayout`
- `layoutSlice`
- `DraggablePanel`
- ActionDesk main panel sorting。
- System panel sorting。

#### Optional modules

按优先级接入：

1. Principles；
2. Calendar；
3. Ability basic；
4. DataHealthPanel；
5. UpdatePanel；
6. ManualPanel；
7. Habits；
8. Mood；
9. TimeBlocks；
10. Entertainment；
11. Inspiration。

### 9.3 验收

- core module 不可关闭。
- optional module 可关闭且 UI 消失。
- layout 排序持久化。
- System 页面可用。

## 10. 阶段 8：Electron 本地优先

### 10.1 目标

将浏览器 localStorage MVP 升级为 Electron 本地文件持久化。

### 10.2 任务

#### Electron scaffold

- 创建 `electron/main.cjs`。
- 创建 `electron/preload.cjs`。
- 配置 `package.json main`。
- 配置 electron-builder。

#### IPC

- `load-data-sync`
- `save-data`
- `get-app-version`
- `app-before-quit`

#### Storage

- 创建 `src/utils/electronStorage.ts`。
- Electron 下使用 IPC。
- Browser 下 fallback localStorage。
- cache。
- dirty flag。
- debounce flush。
- retry。
- before quit flush。

#### Main file storage

- `alo-data.json`
- `.tmp`
- `.bak`
- atomic write。
- backup recovery。

### 10.3 验收

- Electron 中新增数据后重启保留。
- 损坏主文件时可从 backup 恢复。
- Vite dev 下仍可 fallback localStorage。

## 11. 阶段 9：Migration 与 DataHealth

### 11.1 目标

让版本升级和数据损坏不静默失败。

### 11.2 任务

- `migrateAppData.ts`
- `migrateReflectionData.ts`
- `CURRENT_APP_VERSION`
- `onRehydrateStorage` migration pipeline。
- DataHealthPanel：
  - required fields；
  - orphaned KR；
  - orphaned template；
  - size check。
- storage warning banner。

### 11.3 验收

- 缺字段旧数据可补默认值。
- 旧 reflection 可迁移。
- orphaned linkedKrId 可发现。
- 数据超过阈值显示 warning。

## 12. 阶段 10：更新、发布与文档

### 12.1 目标

让应用可发布、可检查更新、可维护。

### 12.2 任务

- `checkUpdate.ts`。
- `UpdatePanel`。
- Vite 注入 `__APP_VERSION__`。
- `electronAPI.getAppVersion()`。
- `scripts/audit-contrast.mjs`。
- GitHub Actions release workflow。
- `README.md`。
- `CHANGELOG.md`。
- `RELEASE_NOTES.md`。
- `docs/alo/`。

### 12.3 验收

- `npm run build` 通过。
- `npm run lint` 可运行。
- `npm run audit:contrast` 通过。
- `npm run electron:build` 生成产物。
- tag `v*` 可触发 release workflow。

## 13. 阶段 11：质量补强

### 13.1 目标

降低后续重构风险。

### 13.2 任务

建议新增测试体系：

- unit tests：utils、migration、version compare；
- store tests：task/okr/archive/reflection；
- integration tests：Inbox → Task、KR → Task → Archive；
- manual E2E checklist：Electron storage、DnD、theme、release。

### 13.3 验收

- 关键业务链有测试或手动验收记录。
- release 前 checklist 固化。

## 14. 推荐开发顺序表

| 顺序 | 交付物 | 依赖 |
|---:|---|---|
| 1 | Vite/React/TS skeleton | 无 |
| 2 | index.css tokens | skeleton |
| 3 | App shell / pages | tokens |
| 4 | types / config store | skeleton |
| 5 | persist localStorage | store |
| 6 | QuickInbox | inbox store |
| 7 | TaskBoard | task store/date utils |
| 8 | TaskCard complete/edit/delete | TaskBoard |
| 9 | Inbox → Task | QuickInbox + TaskBoard |
| 10 | DnD task move/reorder | TaskBoard |
| 11 | Objective/KR store | types/store |
| 12 | OKRPanel | OKR store |
| 13 | KR → Task | OKR + DnD + Task |
| 14 | Task complete → KR | TaskCard + OKR store |
| 15 | Archive | Objective/KR complete |
| 16 | Reflection | templates/store |
| 17 | ReviewArchive | reflection/archive/ability |
| 18 | ModuleRegistry | module types |
| 19 | ModuleManager | module store |
| 20 | Layout persistence | layout store + DnD |
| 21 | Electron storage | app stable enough |
| 22 | Migration | persisted data exists |
| 23 | DataHealth | schema stable |
| 24 | Update/release | package/version |
| 25 | Tests/docs | all above |

## 15. 每个模块的 Definition of Done

一个模块完成必须满足：

- [ ] 类型已定义。
- [ ] slice action 已实现。
- [ ] UI 已接入页面。
- [ ] 空状态已写。
- [ ] 删除/危险操作有明确交互。
- [ ] 如需持久化，已加入 partialize。
- [ ] 如需默认值，已加入 rehydrate。
- [ ] 如有引用关系，已加入 DataHealth 或有说明。
- [ ] 与 theme tokens 一致。
- [ ] 文档已更新。
- [ ] 至少有手动验收步骤。

## 16. 风险控制

### 16.1 DnD 风险

风险：DnD 逻辑耦合 ActionDesk 多种对象。

控制：

- 先实现 task DnD；
- 再实现 inbox conversion；
- 最后实现 KR scheduling；
- 每个 active id 前缀必须唯一。

### 16.2 Store 副作用风险

风险：TaskCard 同时处理 task、ability、KR、archive。

控制：

- 给 task completion 写回归测试。
- 或将副作用抽成 domain service。

### 16.3 Persistence 风险

风险：新增字段未加入 partialize，重启丢失。

控制：

- 新增字段 checklist 必须包含 partialize。
- DataHealth 增加关键字段检查。

### 16.4 README 与实现不一致风险

风险：文档承诺未挂载能力。

控制：

- 以 `05-implementation-notes-and-gaps.md` 维护差异。
- release 前同步 README。

## 17. 首次 release 前必须决策

- DataBackup 是否正式挂载？
- InboxClarifier 是否恢复？
- ModulePicker 是否删除？
- Ability score 是否可逆？
- Backup 是否对齐 `partialize`？
- 是否补 Electron dev script？
- lint 遗留问题是否允许 release？
- 是否需要最小测试脚本？
