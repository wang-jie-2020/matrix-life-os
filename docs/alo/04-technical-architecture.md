# 技术架构

> 反推日期：2026-07-07  
> 范围：当前 Electron + React 桌面版 ALO  
> 主要依据：`package.json`、`src/*`、`electron/*`、`.github/workflows/release.yml`

## 1. 架构概览

ALO 当前是一个本地优先的 Electron 桌面应用：

```text
Electron main process
        │
        │ IPC / contextBridge
        ▼
Electron renderer
React 19 + TypeScript + Vite
        │
        ▼
Zustand store + persist middleware
        │
        ▼
Electron file storage / browser localStorage fallback
```

核心特点：

- 前端框架：React 19 + TypeScript；
- 构建工具：Vite；
- 桌面壳：Electron；
- 状态管理：Zustand + persist；
- 拖拽交互：@dnd-kit；
- 日期工具：date-fns 与自定义 date utils；
- 数据策略：本地 JSON 文件优先，无账号、无云同步；
- 发布方式：electron-builder + GitHub Actions tag release。

## 2. 技术栈

来源：`package.json`

| 层级 | 技术 |
|---|---|
| UI | React `^19.2.6`、React DOM `^19.2.6` |
| 类型 | TypeScript `~6.0.2` |
| 构建 | Vite `^8.0.12`、`@vitejs/plugin-react` |
| 桌面端 | Electron `^42.2.0`、electron-builder `^26.8.1` |
| 状态 | Zustand `^5.0.13` |
| 拖拽 | `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities` |
| 日期 | date-fns `^4.3.0` |
| 质量 | ESLint、TypeScript build、contrast audit script |

## 3. 运行入口

### 3.1 Renderer 入口

文件：`src/main.tsx`

职责：

- 引入 React / ReactDOM；
- 挂载 `<App />`；
- 引入全局样式 `src/index.css`。

当前入口是标准 React DOM 挂载：

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 3.2 应用壳

文件：`src/App.tsx`

职责：

- 管理三页导航：`actionDesk` / `reviewArchive` / `system`；
- 应用主题：将 `config.theme` 写入 `document.documentElement.dataset.theme`；
- 调用 `useDayMigration()`；
- 调用 `useDocumentTitle()`；
- 启动更新检查；
- 处理 Electron `before quit` 提醒；
- 展示 storage warning；
- 渲染顶部导航和主内容。

### 3.3 Electron main process

文件：`electron/main.cjs`

职责：

- 创建 BrowserWindow；
- 加载 `dist/index.html`；
- 注册 `app://` 协议用于加载打包资源；
- 提供 IPC：`save-data`、`load-data-sync`、`get-app-version`；
- 管理本地数据文件原子写、备份和恢复；
- 在 quit 前通知 renderer flush。

窗口默认配置：

- width: 1400；
- height: 900；
- minWidth: 800；
- minHeight: 600；
- `nodeIntegration: false`；
- `contextIsolation: true`；
- preload: `electron/preload.cjs`。

### 3.4 Electron preload

文件：`electron/preload.cjs`

通过 `contextBridge.exposeInMainWorld` 暴露有限 API：

```ts
window.electronAPI = {
  loadDataSync,
  saveData,
  getAppVersion,
  onBeforeQuit,
}
```

不要在 renderer 中直接使用 Node API；需要主进程能力时，应通过 preload 暴露受控接口。

## 4. 源码组织

```text
src/
├── components/     # 通用 UI 组件：AsciiBox、AsciiButton、AsciiProgress、DraggablePanel 等
├── copy/           # 产品文案、系统文案、标题、monk quotes
├── features/       # 按功能域组织的业务模块
├── hooks/          # 自定义 hooks：day migration、auto archive、document title 等
├── pages/          # 三页：ActionDesk / ReviewArchive / System
├── store/          # Zustand store 与 slices
├── types/          # 全局 TypeScript 数据模型
├── utils/          # 日期、迁移、存储、更新、格式化等工具
├── App.tsx         # 应用壳
├── main.tsx        # React 入口
└── index.css       # 全局设计 tokens 与基础样式
```

开发约定：

- 按 feature 拆业务组件；
- 按 slice 拆 Zustand 状态；
- 全局数据模型集中在 `src/types/index.ts`；
- 文案集中在 `src/copy/`；
- 设计 tokens 集中在 `src/index.css`；
- 平台能力集中在 `src/utils/electronStorage.ts` 与 `electron/*`。

## 5. 页面架构

### 5.1 ActionDesk

文件：`src/pages/ActionDesk.tsx`

职责：

- QuickInbox 捕捉；
- TaskBoard 执行；
- OKR 目标拆解；
- Inbox item 拖拽澄清；
- KR 拖拽调度到任务板；
- task 跨日移动与排序；
- dashboard main panels 排序；
- 根据 `enabledModules` 控制可选模块显示。

关键依赖：

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `src/store/useAppStore.ts`
- `src/features/*`

### 5.2 ReviewArchive

文件：`src/pages/ReviewArchive.tsx`

职责：

- 今日 Reflection；
- ReflectionGrid 历史档案；
- ObjectiveArchivePanel 光荣榜；
- AbilityReader / AbilityTraining；
- Mood trend；
- ReflectionDetailModal。

### 5.3 System

文件：`src/pages/System.tsx`

职责：

- ModuleManager；
- About；
- MonkQuote；
- ReflectionTemplateManager；
- DataHealthPanel；
- UpdatePanel；
- ManualPanel；
- System page panel ordering。

注意：System 当前渲染器未包含 `DataBackupPanel` / `DataBackupRitual`。相关差异见 `05-implementation-notes-and-gaps.md`。

## 6. 数据模型

核心类型集中在 `src/types/index.ts`。

### 6.1 Task

`Task` 是执行系统的核心对象。

关键字段：

- `id`
- `content`
- `column`
- `date`
- `status: 'active' | 'completed'`
- `order`
- `abilityId?`
- `abilityPoints?`
- `completedAt?`
- `migratedFrom?`
- `linkedKrId: string | null`
- `source?: 'manual' | 'inbox' | 'ability' | 'kr'`

重要关系：

- `linkedKrId` 连接 Task 与 KeyResult；
- `abilityId` / `abilityPoints` 连接 Task 与 Ability；
- `source` 表示任务来源。

### 6.2 Objective / KeyResult

`Objective`：

- `id`
- `title`
- `status`
- `krList`
- `createdAt`
- `completedAt`

`KeyResult`：

- `id`
- `content`
- `completed`
- `scheduled`
- `linkedTaskId`

重要关系：

- KR 可调度到 TaskBoard；
- 调度后 KR 记录 linked task；
- linked task 完成时同步 KR；
- 所有 KR 完成后 Objective 自动 archive。

### 6.3 Reflection / ReflectionTemplate

`ReflectionTemplate` 定义问题结构；`Reflection` 保存某一天的回答。

规则：

- 同一天最多一条 Reflection；
- `saveReflection` 按 date upsert；
- `templateId` 必须指向现有 template；
- `linkedObjectiveIds` 可关联 Objective。

### 6.4 Ability

Ability 包含：

- `currentScore`
- `maxScore`
- `tasks`

任务完成时可通过 `incrementScore` 增加分数。

### 6.5 Module / Layout

模块系统：

- `GtdPhase`
- `ModulePage`
- `ModuleId`
- `ModuleMeta`
- `enabledModules`

布局系统：

- `DashboardLayout`
- `TwoColumnLayout`
- `dashboardLayout`
- `reflectionLayout`
- `systemLayout`

## 7. 状态管理

文件：`src/store/useAppStore.ts`

ALO 使用 Zustand store，按 slice 组合：

- `taskSlice`
- `calendarSlice`
- `principleSlice`
- `abilitySlice`
- `reflectionSlice`
- `entertainmentSlice`
- `configSlice`
- `okrSlice`
- `archiveSlice`
- `moduleSlice`
- `habitSlice`
- `moodSlice`
- `timeBlockSlice`
- `inspirationSlice`
- `reflectionTemplateSlice`
- `layoutSlice`

### 7.1 Store composition

`AppStore` 是所有 slice 的交集，并增加：

- `__version`
- `storageWarning`
- `setStorageWarning`

### 7.2 Persist config

persist name：

```ts
name: 'alo-storage'
```

storage：

```ts
storage: electronStorage as PersistStorage<AppState>
```

### 7.3 partialize

`partialize` 控制实际持久化字段。新增业务字段如果没有加入 `partialize`，重启后会丢失。

当前持久化字段包括：

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

### 7.4 存储体积 warning

`partialize` 中会估算 JSON size：

- 超过 4MB：console warning；
- 超过 4.5MB：设置 `storageWarning = true`，App 显示顶部提示。

## 8. 关键 slices

### 8.1 taskSlice

文件：`src/store/slices/taskSlice.ts`

核心 action：

- `addTask`
- `deleteTask`
- `moveTask`
- `toggleTask`
- `deleteCompletedTasks`
- `migrateAllBeforeToday`
- `migrateUnfinishedTasks`
- `reorderTasks`
- `updateTask`

注意：`addTask` 返回新 task id，这对 KR 调度和其他转换流程很重要。

### 8.2 okrSlice

文件：`src/store/slices/okrSlice.ts`

核心 action：

- Objective：`addObjective`、`deleteObjective`、`updateObjectiveTitle`、`completeObjective`
- KR：`addKeyResult`、`deleteKeyResult`、`toggleKeyResult`、`updateKeyResult`、`completeKR`、`uncompleteKR`、`scheduleKR`、`unscheduleKR`
- Inbox：`addQuickInboxItem`、`removeFromInbox`、`deleteInboxItem`、`toggleInboxItem`

### 8.3 abilitySlice

文件：`src/store/slices/abilitySlice.ts`

核心 action：

- `addAbility`
- `deleteAbility`
- `updateAbility`
- `addAbilityTask`
- `removeAbilityTask`
- `incrementScore`
- `collectAbilityTaskToInbox`

### 8.4 reflectionSlice

文件：`src/store/slices/reflectionSlice.ts`

核心 action：

- `saveReflection`
- `updateReflection`
- `deleteReflection`
- `getReflectionByDate`

`saveReflection` 按 date upsert，同一天保存会更新而不是新增。

### 8.5 layoutSlice

文件：`src/store/slices/layoutSlice.ts`

默认布局：

```ts
DEFAULT_DASHBOARD_LAYOUT = {
  main: ['timeBlocks', 'habits'],
  side: ['principles', 'calendar', 'entertainment', 'mood', 'inspiration'],
}

DEFAULT_REFLECTION_LAYOUT = {
  left: ['reflectionLibrary'],
  right: ['abilityReader', 'abilityTraining'],
}

DEFAULT_SYSTEM_LAYOUT = {
  left: ['moduleManager'],
  right: ['aboutBox', 'monkQuote', 'reflectionTemplateManager', 'dataHealthPanel', 'updatePanel', 'manualPanel'],
}
```

## 9. 模块系统

文件：`src/features/modules/moduleRegistry.ts`

每个模块定义：

- `id`
- `name`
- `description`
- `defaultEnabled`
- `defaultZone`
- `icon`
- `gtdPhase`
- `page`
- `core`

辅助函数：

- `getModuleMeta`
- `getAllModules`
- `getModulesByZone`
- `getModulesByPhase`
- `getModulesByPage`
- `getCoreModules`
- `getOptionalModules`
- `getPhasesOrdered`
- `getPhaseLabel`

开发规则：

新增模块时必须同步：

1. `ModuleId`；
2. `MODULE_REGISTRY`；
3. `enabledModules` 默认或迁移；
4. 页面渲染；
5. layout defaults；
6. 如有数据，新增 slice 与 `partialize`；
7. 如有引用关系，更新 DataHealth；
8. 更新文档。

## 10. 数据迁移

迁移入口在 `src/store/useAppStore.ts` 的 `onRehydrateStorage`。

当前 rehydrate 会处理：

1. `migrateAllReflections`：旧 reflection 数据格式迁移；
2. 默认 reflection template 补齐；
3. dashboard / reflection / system layout 默认值补齐；
4. system 新面板补齐；
5. core modules 补齐；
6. `migrateAppData(state, CURRENT_APP_VERSION)`。

迁移工具：

- `src/utils/migrateAppData.ts`
- `src/utils/migrateReflectionData.ts`

开发规则：

- 新增字段必须考虑旧数据 undefined 情况；
- 新增持久化结构变更应写 migration；
- migration 应幂等；
- migration 不应删除用户数据，除非有明确产品规则；
- 涉及旧字段移除时，应在 gap 或 changelog 中说明。

## 11. 本地持久化

### 11.1 Renderer storage adapter

文件：`src/utils/electronStorage.ts`

职责：实现 Zustand persist 所需 storage interface。

Electron 环境：

- 通过 `window.electronAPI.loadDataSync()` 同步加载；
- 通过 `window.electronAPI.saveData()` 异步保存；
- 使用 cache；
- setItem 后 debounce flush；
- 写失败指数退避重试，最多 5 次；
- 监听 before quit，尽力立即 flush。

Browser/dev fallback：

- 使用 `localStorage`；
- get / set / remove 均 try/catch。

### 11.2 Main process file storage

文件：`electron/main.cjs`

数据文件：

```text
app.getPath('userData')/alo-data.json
app.getPath('userData')/alo-data.json.bak
app.getPath('userData')/alo-data.json.tmp
```

写入策略：

1. `JSON.stringify(data, null, 2)`；
2. 写 `.tmp`；
3. rename 到主文件；
4. best-effort copy 到 `.bak`；
5. 失败时清理 `.tmp`。

读取策略：

1. 优先读主文件；
2. 主文件缺失或损坏时读 `.bak`；
3. backup 成功时尝试恢复主文件；
4. 都失败则返回 null。

退出策略：

- main process `before-quit` 发送 `app-before-quit`；
- 等待 500ms；
- 再退出。

## 12. 更新检查

相关文件：

- `src/utils/checkUpdate.ts`
- `src/features/system/UpdatePanel.tsx`
- `vite.config.ts`
- `electron/preload.cjs`

版本来源：

- `vite.config.ts` 从 `package.json` 注入 `__APP_VERSION__`；
- Electron 可通过 `window.electronAPI.getAppVersion()` 获取版本。

App 启动后会延迟检查更新，发现新版本后在 System 导航项显示标记。

## 13. 构建与发布

### 13.1 npm scripts

来源：`package.json`

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动 Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm run audit:contrast` | 运行对比度审计脚本 |
| `npm run lint` | ESLint |
| `npm run preview` | Vite preview |
| `npm run electron:build` | build 后 electron-builder 打包 |

当前没有 `test` script。

### 13.2 Vite

文件：`vite.config.ts`

配置：

- `plugins: [react()]`
- `base: './'`
- `define.__APP_VERSION__ = package.json version`

### 13.3 electron-builder

配置在 `package.json` 的 `build` 字段：

- `appId: com.alo.app`
- `productName: ASCII Life OS`
- output: `release`
- files: `dist/**/*`、`electron/**/*`
- Windows target: portable
- macOS target: dmg / zip
- `publish: null`

### 13.4 GitHub Actions release

文件：`.github/workflows/release.yml`

触发：

- push tag：`v*`

流程：

1. Windows job：Node 20、`npm ci`、`npm run electron:build`、上传 `.exe`；
2. macOS job：Node 20、`npm ci`、`npm run electron:build`、上传 `.dmg` / `.zip`；
3. release job：下载产物，使用 `softprops/action-gh-release@v2` 创建 GitHub Release；
4. Release body 使用 `RELEASE_NOTES.md`。

## 14. 质量门禁

当前已有门禁：

- TypeScript build：`npm run build`
- ESLint：`npm run lint`
- 对比度审计：`npm run audit:contrast`
- Electron 打包：`npm run electron:build`
- 手动验证核心流程

当前没有：

- 单元测试脚本；
- 集成测试脚本；
- E2E 测试脚本；
- CI 中独立测试 job。

建议后续优先补测试的区域：

1. date utils；
2. migration utils；
3. checkUpdate version comparison；
4. task / KR / archive 状态联动；
5. storage adapter 的失败重试和 fallback；
6. DataHealthPanel 的引用检查。

## 15. 新增功能开发流程

### 15.1 新增普通 UI 功能

1. 确认属于哪一页：ActionDesk / ReviewArchive / System。
2. 确认是否需要 module registry。
3. 使用现有设计系统。
4. 如需状态，新增或复用 slice。
5. 如需持久化，更新 `AppState` 与 `partialize`。
6. 如需兼容旧数据，新增 migration。
7. 如有引用关系，更新 DataHealth。
8. 更新 docs。

### 15.2 新增模块

必须同步：

- `src/types/index.ts` 的 `ModuleId`；
- `src/features/modules/moduleRegistry.ts`；
- 对应 page renderer；
- `src/store/slices/layoutSlice.ts` 默认布局；
- `src/store/slices/moduleSlice.ts` 如有默认规则变化；
- `src/store/useAppStore.ts` rehydrate core/default 补齐逻辑；
- 文档中的模块地图。

### 15.3 新增持久化字段

必须同步：

- 类型；
- slice 初始值；
- `partialize`；
- migration/defaults；
- data health；
- backup/export/import，如果该能力恢复为正式功能；
- 文档。

### 15.4 修改任务完成逻辑

必须回归验证：

- 普通 task 完成 / 取消完成；
- ability-linked task 完成后加分；
- KR-linked task 完成后 KR completed；
- KR-linked task 取消完成后 KR uncompleted；
- Objective all KR completed 后 archive；
- 新周 completed tasks 清理。

## 16. 已知架构注意事项

- `DataBackupPanel` / `DataBackupRitual` 存在，但当前 System 页面未挂载，不能作为正式备份入口写入当前能力。
- `InboxClarifier` 存在，但当前主流程是拖拽澄清。
- `ModulePicker` 存在，但当前模块开关入口是 System / ModuleManager。
- README 中“迁移前保留旧数据副本”需谨慎理解：Electron 文件层有 `.bak`，但 app migration 本身没有单独的迁移前快照文件机制。
- `npm run dev` 只启动 Vite；若要验证 Electron IPC、app://、真实文件持久化，应使用 Electron 环境或补充 Electron dev 脚本。
