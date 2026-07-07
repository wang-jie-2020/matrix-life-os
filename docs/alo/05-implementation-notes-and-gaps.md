# 实现差异、遗留组件与决策点

> 反推日期：2026-07-07  
> 范围：当前 Electron + React 桌面版 ALO  
> 目的：防止把“源码存在”误写成“当前已上线能力”。

## 1. 状态标签

本文件使用以下状态标签：

| 状态 | 含义 |
|---|---|
| `Implemented and mounted` | 已实现，并能从当前页面/布局访问 |
| `Implemented but not mounted` | 有实现代码，但当前未确认被页面或布局挂载 |
| `Partially implemented` | 部分实现，但与完整产品需求或 README 表达存在差距 |
| `Legacy / uncertain` | 疑似历史遗留、替代实现或状态不明 |
| `Planned / candidate` | 符合产品方向，但当前未实现或未完整实现 |

判断“是否已上线”时，以以下路径为准：

- `src/App.tsx` 是否渲染对应页面；
- `src/pages/*` 是否 import/render 对应组件；
- `src/store/slices/layoutSlice.ts` 是否放入默认 layout；
- `src/features/modules/moduleRegistry.ts` 是否注册为模块；
- `enabledModules` 是否影响该模块显示；
- 是否存在用户可触达入口。

## 2. README 引用 `docs/alo/`，但目录原本缺失

**Status:** `Implemented by this documentation pass`

### Current state

`README.md` 末尾写有：

```md
详细设计文档见 `docs/alo/`。
```

但在本次落盘前，仓库中未发现 `docs/` 目录。

### Product implication

README 已经把 `docs/alo/` 当作详细设计文档入口。如果目录缺失，会造成：

- 新开发者找不到架构和产品文档；
- README 与仓库结构不一致；
- 后续需求、UI、数据模型修改缺少统一依据。

### Decision

本次新增：

- `docs/alo/00-index.md`
- `docs/alo/01-product-prd.md`
- `docs/alo/02-user-stories-and-flows.md`
- `docs/alo/03-frontend-design-system.md`
- `docs/alo/04-technical-architecture.md`
- `docs/alo/05-implementation-notes-and-gaps.md`

### Source references

- `README.md`
- `docs/alo/00-index.md`

## 3. 数据备份能力：README 表达与当前挂载存在差异

**Status:** `Partially implemented / implemented but not mounted`

### Current state

当前存在两个备份相关组件：

1. `src/features/data/DataBackupPanel.tsx`
2. `src/features/system/DataBackupRitual.tsx`

但当前 System 页面渲染器只包含：

- `UpdatePanel`
- `ManualPanel`
- `DataHealthPanel`
- `AboutBox`
- `MonkQuote`
- `ReflectionTemplateManager`
- `ModuleManager`

`src/pages/System.tsx` 没有 import/render `DataBackupPanel` 或 `DataBackupRitual`。`src/store/slices/layoutSlice.ts` 的 `DEFAULT_SYSTEM_LAYOUT` 也没有 backup panel。

### Current implementation details

#### DataBackupPanel

`DataBackupPanel` 导出字段较旧，只覆盖：

- tasks
- calendarEvents
- principles
- abilities
- reflections
- entertainments
- objectives
- inboxItems
- config

它没有覆盖当前 `partialize` 中的所有字段，例如：

- archives
- enabledModules
- habits
- moods
- timeBlocks
- inspirations
- reflectionTemplates
- dashboardLayout
- reflectionLayout
- systemLayout
- `__version`

#### DataBackupRitual

`DataBackupRitual` 覆盖范围更接近当前状态，支持：

- full export
- high value export

full export 包含：

- tasks
- calendarEvents
- principles
- abilities
- reflections
- entertainments
- objectives
- inboxItems
- config
- enabledModules
- habits
- moods
- timeBlocks
- inspirations
- reflectionTemplates
- archives
- `__version`

但它仍未包含 layout 字段：

- dashboardLayout
- reflectionLayout
- systemLayout

并且当前未确认挂载。

### Product implication

README 当前写有：

- “支持一键导出/导入 JSON 备份”；
- “建议定期通过应用内「数据备份」导出 JSON 到安全位置”；
- 功能地图中包含“数据备份”。

但从当前页面挂载看，用户可能无法从 System 页面访问备份入口。即使入口恢复，也要定义“完整备份”的字段范围。

### Recommended decision

选择一个方向：

1. **正式恢复为产品能力**
   - 将 `DataBackupRitual` 挂载到 System；
   - 加入 `DEFAULT_SYSTEM_LAYOUT`；
   - 补齐 layout 字段导出/导入；
   - 明确 full / highValue 的语义；
   - 更新 DataHealth 或导入校验。

2. **降级为候选能力**
   - README 删除或弱化“一键备份”表述；
   - 文档标记为 planned / candidate；
   - 暂不暴露 UI。

3. **清理旧实现**
   - 删除 `DataBackupPanel`，保留一个统一备份实现；
   - 或将旧组件移动到 legacy/notes。

### Source references

- `README.md`
- `src/features/data/DataBackupPanel.tsx`
- `src/features/system/DataBackupRitual.tsx`
- `src/pages/System.tsx`
- `src/store/slices/layoutSlice.ts`
- `src/store/useAppStore.ts`

## 4. InboxClarifier：存在弹窗式澄清，但当前主流程是拖拽

**Status:** `Implemented but not mounted / legacy uncertain`

### Current state

存在组件：

- `src/features/inbox/InboxClarifier.tsx`

它支持：

- 转为 Objective；
- 转为 KR；
- 转为今日任务；
- 转为灵感；
- 删除。

但当前 `QuickInbox` 中 inbox item 只展示可拖拽条目和 `[x]` 删除按钮，没有打开 `InboxClarifier` 的入口。`ActionDesk` 当前处理 inbox 的主流程是拖拽 drop：

- drop 到 OKR；
- drop 到 Principles；
- drop 到 Inspiration；
- drop 到 Calendar；
- drop 到 Habits；
- drop 到 Entertainment；
- drop 到 TimeBlocks；
- drop 到 WeekBoard / TaskBoard。

### Product implication

README 快速上手中写到：

```text
每条收集项点击 [处理]，决定它是垃圾、今日任务、OKR 还是灵感。
```

但当前可见实现更接近“拖拽澄清”，而不是“点击 [处理] 弹窗澄清”。

### Recommended decision

选择一个方向：

1. **以拖拽澄清为正式主路径**
   - 更新 README 中“点击 [处理]”表述；
   - 保持 `InboxClarifier` 为 legacy 或删除；
   - 文档继续以 `ActionDesk.handleDragEnd` 为准。

2. **恢复点击澄清入口**
   - 在 `QuickInbox` 中为 item 增加 `[处理]`；
   - 挂载 `InboxClarifier`；
   - 决定弹窗澄清与拖拽澄清的优先级；
   - 补齐转 Calendar / Habit / Entertainment / TimeBlock 等当前拖拽支持但 Clarifier 不支持的目标。

### Source references

- `README.md`
- `src/features/inbox/QuickInbox.tsx`
- `src/features/inbox/InboxClarifier.tsx`
- `src/pages/ActionDesk.tsx`

## 5. ModulePicker：存在弹窗式模块管理，但当前以 System / ModuleManager 为准

**Status:** `Implemented but not mounted / legacy uncertain`

### Current state

存在组件：

- `src/features/modules/ModulePicker.tsx`

它提供一个 fixed overlay 模块管理器，按 phase 展示模块，可切换非 core 模块。

但当前 System 页面挂载的是：

- `src/features/modules/ModuleManager.tsx`

当前默认系统布局也只包含：

```ts
left: ['moduleManager']
```

未看到 `ModulePicker` 的页面入口。

### Product implication

如果同时保留 ModulePicker 和 ModuleManager，可能出现两套模块管理交互：

- 弹窗式；
- 系统页面板式。

这会增加维护成本，也可能导致文档和 UI 表达不一致。

### Recommended decision

- 当前文档以 `ModuleManager` 为正式模块管理入口。
- 如需恢复 ModulePicker，应定义它的入口：例如顶部快捷入口、Command palette 或 System 页按钮。
- 如果不恢复，应考虑删除或标记 legacy。

### Source references

- `src/features/modules/ModulePicker.tsx`
- `src/features/modules/ModuleManager.tsx`
- `src/pages/System.tsx`
- `src/store/slices/layoutSlice.ts`
- `src/features/modules/moduleRegistry.ts`

## 6. Ability 相关组件：部分已挂载，部分疑似候选/遗留

**Status:** `Partially implemented`

### Current state

当前 `ReviewArchive` 明确挂载：

- `AbilityReader`
- `AbilityTraining`

存在但未在当前页面挂载路径中确认使用的组件/工具包括：

- `src/features/abilities/AbilityManagementPanel.tsx`
- `src/features/abilities/AbilityListPanel.tsx`
- `src/features/abilities/AsciiRadar.tsx`
- `src/hooks/useAsciiRadar.ts`

`AbilitySlice` 提供完整的基础 action：

- addAbility
- deleteAbility
- updateAbility
- addAbilityTask
- removeAbilityTask
- incrementScore
- collectAbilityTaskToInbox

### Product implication

能力系统是 PRD 的重要概念：任务完成可以带来能力分增长，ReviewArchive 中也有能力相关 UI。

但在写产品文档时，应区分：

- 当前已挂载的能力阅读/训练；
- 可能存在但未挂载的能力管理面板；
- 低层 store 已支持但 UI 不一定完全暴露的操作。

### Recommended decision

- 明确 Ability 的正式用户流程：创建/编辑能力、训练、加分、雷达展示分别由哪些组件承载。
- 如果 `AbilityManagementPanel` 等组件不再使用，考虑清理。
- 如果要作为正式能力管理入口，应接入 ReviewArchive 或 System，并更新文档。

### Source references

- `src/pages/ReviewArchive.tsx`
- `src/features/abilities/AbilityReader.tsx`
- `src/features/abilities/AbilityTraining.tsx`
- `src/features/abilities/AbilityManagementPanel.tsx`
- `src/features/abilities/AbilityListPanel.tsx`
- `src/features/abilities/AsciiRadar.tsx`
- `src/hooks/useAsciiRadar.ts`
- `src/store/slices/abilitySlice.ts`

## 7. Calendar 与 Entertainment：默认开启但不是 core

**Status:** `Implemented and mounted; documentation nuance`

### Current state

`moduleRegistry.ts` 中：

- `calendar.defaultEnabled = true`，`calendar.core = false`
- `entertainment.defaultEnabled = true`，`entertainment.core = false`

README 中“可选模块”主要列举习惯、心情、时间块、灵感仓库，容易让人误以为默认开启模块都是核心。

### Product implication

需要明确两个概念：

- `defaultEnabled`：新用户默认显示；
- `core`：不可关闭。

Calendar 和 Entertainment 是“默认显示但可关闭”的模块。

### Recommended decision

- 文档中的模块表以 `MODULE_REGISTRY` 为准。
- README 如需精确，可补一句：“部分默认开启模块仍可关闭，core 与 default enabled 不是同一概念。”

### Source references

- `src/features/modules/moduleRegistry.ts`
- `src/features/modules/ModuleManager.tsx`
- `README.md`

## 8. README 的“迁移前保留旧数据副本”需要精确化

**Status:** `Documentation nuance`

### Current state

README 数据安全章节写到：

```text
版本升级时自动执行数据迁移，迁移前保留旧数据副本。
```

当前代码事实：

- Electron 文件层每次成功写入后会复制 `.bak`；
- 主文件损坏时会尝试从 `.bak` 恢复；
- app rehydrate 时会执行 reflection migration 与 app version migration；
- 未看到专门“迁移前创建独立快照文件”的逻辑。

### Product implication

“迁移前保留旧数据副本”可能被理解为 migration-specific snapshot。当前更准确的表述是：

- 文件存储层有 `.bak` 备份；
- 数据迁移在 rehydrate 中执行；
- 迁移本身没有独立快照文件机制。

### Recommended decision

- README 或技术文档中将此描述精确为“文件层有 `.bak` 备份与恢复机制”。
- 如果产品确实需要 migration snapshot，应新增专门实现。

### Source references

- `README.md`
- `electron/main.cjs`
- `src/store/useAppStore.ts`
- `src/utils/migrateAppData.ts`
- `src/utils/migrateReflectionData.ts`

## 9. 数据备份字段与 persist 字段不完全一致

**Status:** `Partially implemented`

### Current state

`useAppStore.ts` 的 `partialize` 是当前持久化事实来源。

DataBackupPanel 缺少较多字段；DataBackupRitual 的 full export 更完整，但仍未包含 layout 字段。

### Product implication

如果用户以为“导出 JSON = 完整恢复 Life OS”，但导出字段缺失，就可能造成：

- layout 丢失；
- enabledModules 丢失；
- optional modules 数据丢失；
- reflection templates 丢失；
- archives 丢失。

### Recommended decision

如果恢复正式备份功能，full backup 应以 `partialize` 字段为准，至少覆盖：

- tasks
- calendarEvents
- principles
- abilities
- reflections
- entertainments
- objectives
- archives
- inboxItems
- config
- enabledModules
- habits
- moods
- timeBlocks
- inspirations
- reflectionTemplates
- dashboardLayout
- reflectionLayout
- systemLayout
- `__version`

导入时还应运行必要迁移或 defaults 补齐。

### Source references

- `src/store/useAppStore.ts`
- `src/features/data/DataBackupPanel.tsx`
- `src/features/system/DataBackupRitual.tsx`
- `src/types/index.ts`

## 10. `npm run dev` 不验证 Electron 真实环境

**Status:** `Documentation nuance`

### Current state

`package.json` 中：

```json
"dev": "vite"
```

这只启动 Vite dev server。浏览器/dev 环境下 `electronStorage` fallback 到 `localStorage`。

Electron 真实能力包括：

- `window.electronAPI`
- IPC
- `alo-data.json`
- `.bak` recovery
- `app://resources/...`
- before-quit flush

这些不能仅靠 `npm run dev` 完整验证。

### Product implication

开发者若只跑 Vite，可能误以为存储、资源协议、退出 flush 均已验证。

### Recommended decision

- 技术文档中明确：`npm run dev` 是 renderer dev，不是 Electron dev。
- 如需频繁验证 Electron，应补充 Electron dev script。
- 发布前至少跑 `npm run electron:build` 或实际打开打包应用验证关键流程。

### Source references

- `package.json`
- `src/utils/electronStorage.ts`
- `electron/main.cjs`
- `electron/preload.cjs`

## 11. 当前缺少自动测试体系

**Status:** `Known gap`

### Current state

`package.json` 没有 `test` script。当前质量门禁主要是：

- `npm run build`
- `npm run lint`
- `npm run audit:contrast`
- 手动验证
- GitHub Actions release build

### Product implication

关键业务链依赖人工回归：

- Inbox 转换；
- KR 调度；
- task 完成同步 KR；
- ability score 增长；
- Objective auto archive；
- day migration；
- storage recovery；
- migration。

### Recommended decision

优先补测试：

1. `src/utils/date.ts`
2. `src/utils/migrateAppData.ts`
3. `src/utils/migrateReflectionData.ts`
4. `src/utils/checkUpdate.ts`
5. `taskSlice` / `okrSlice` / `archiveSlice` 的状态联动
6. `electronStorage` 的 fallback / retry 可测部分
7. `DataHealthPanel` 的引用检查逻辑

### Source references

- `package.json`
- `scripts/audit-contrast.mjs`
- `.github/workflows/release.yml`

## 12. Inspiration 转 task 链接方式需谨慎

**Status:** `Potential implementation risk`

### Current state

探索中发现 `InspirationVaultPanel` 将灵感转 task 后，可能通过 content/date 查找新 task 来标记 `convertedToTaskId`。

与此同时，`taskSlice.addTask` 当前已经返回新 task id。

### Product implication

如果同一天已有相同 content 的 task，通过 content/date 反查可能链接到错误任务。

### Recommended decision

- 未来修改该逻辑时，应直接使用 `addTask` 返回值。
- 用户故事中不要承诺复杂 inspiration/task 双向强一致，除非实现已修正并测试。

### Source references

- `src/features/inspiration/InspirationVaultPanel.tsx`
- `src/store/slices/taskSlice.ts`

## 13. Ability score 当前是单向增长

**Status:** `Implemented behavior / product decision needed`

### Current state

`TaskCard` 中：

- active ability-linked task 完成时调用 `incrementScore`；
- completed task 取消完成时，不会扣回 ability score。

### Product implication

这可能是合理设计：能力增长代表获得过的训练，不因取消任务而回滚。也可能是遗漏：如果用户误点完成，取消后分数仍保留。

### Recommended decision

产品层需要明确：

1. 能力分是不可逆成长记录；还是
2. 能力分应随任务完成状态可逆。

在未决策前，文档应写成当前事实，不应承诺可逆。

### Source references

- `src/features/tasks/TaskCard.tsx`
- `src/store/slices/abilitySlice.ts`

## 14. 后续 cleanup backlog

建议后续建立 issue 或任务追踪以下决策：

1. 是否恢复并挂载 `DataBackupRitual`。
2. 是否删除或恢复 `DataBackupPanel`。
3. README 中“一键备份”和“点击 [处理]”是否更新。
4. 是否恢复 `InboxClarifier`，或正式标记为 legacy。
5. 是否删除或恢复 `ModulePicker`。
6. Ability 管理入口应放在 ReviewArchive 还是 System。
7. 是否为 Electron dev 增加脚本。
8. 是否补测试脚本与最低自动化测试集。
9. 是否将 migration snapshot 做成明确能力。
10. 是否将 backup full export 对齐 `partialize`。

## 15. 写文档和开发时的底线

- 不要把未挂载组件写成已上线能力。
- 不要把 README 的愿景表达直接当作当前实现。
- 不要把默认开启写成不可关闭。
- 不要把 `.bak` 文件层备份写成 migration-specific snapshot。
- 不要声称有自动化测试体系。
- 不要在 PRD 中承诺云同步、账号、多端实时协同。
- 涉及数据恢复、删除、导入覆盖等高风险能力时，必须明确范围、备份与确认流程。
