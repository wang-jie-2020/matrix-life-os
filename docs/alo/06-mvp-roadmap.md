# MVP 路线图

> 反推日期：2026-07-07  
> 目标：把现有 ALO 产品与架构文档转化为可从 0-1 实施的版本路线。  
> 范围：Electron + React 桌面版；不包含微信小程序、云同步、多人协作。

## 1. 路线图原则

ALO 的 0-1 版本不应追求“一次性复刻所有模块”。优先级应围绕一条闭环：

```text
捕捉 → 执行 → 目标推进 → 反思 → 归档
```

MVP 的目标不是模块数量，而是验证：

1. 用户可以快速捕捉想法；
2. 用户可以把想法变成任务或目标；
3. 用户可以在周看板中执行；
4. 完成任务可以推进 KR；
5. 完成 Objective 可以归档；
6. 用户每天可以反思；
7. 数据可以本地保存并重启恢复。

## 2. 版本分层

| 阶段 | 目标 | 版本性质 |
|---|---|---|
| v0.1 | 可启动、可保存、可导航 | 技术骨架 |
| v0.2 | Inbox + TaskBoard 闭环 | 最小执行系统 |
| v0.3 | OKR + KR → Task | 目标到任务闭环 |
| v0.4 | Reflection + Archive | 洞察与长期证据 |
| v0.5 | Module system + System page | 可裁剪与配置 |
| v0.6 | Electron storage hardening | 本地优先可信版本 |
| v1.0 | 体验完整、质量门禁齐备 | 可发布版本 |

## 3. P0 / P1 / P2 优先级

### P0：必须有，否则不是 ALO

- 三页应用壳：ActionDesk / ReviewArchive / System。
- 全局设计 tokens 与暗色主题。
- Zustand store + persist。
- 本地存储 adapter。
- QuickInbox。
- TaskBoard 七日列。
- Task 新增、编辑、删除、完成。
- Inbox → Task。
- Objective / KR。
- KR → Task。
- Task complete → KR complete。
- Objective all KRs complete → Archive。
- Reflection basic form。
- Reflection history。
- Day migration：新周清理 completed tasks，旧 active tasks 迁移到今天。
- Electron main/preload 基础存储。

### P1：第一版应尽量有

- ModuleRegistry 与 ModuleManager。
- Principles。
- Calendar basic events。
- Ability basic score。
- DataHealthPanel。
- UpdatePanel。
- ManualPanel。
- Reflection template manager。
- Layout persistence。
- Drag-and-drop task move / reorder。
- Inbox → Objective / Principle / Calendar / Inspiration 等扩展转换。
- Contrast audit。
- Release workflow。

### P2：可以延期

- Habits。
- Mood。
- TimeBlocks。
- Entertainment。
- Inspiration full vault。
- DataBackupRitual。
- Advanced module picker。
- Ability management advanced UI。
- Electron dev script。
- Automated E2E tests。
- Import/export 完整恢复流程。

## 4. v0.1：技术骨架

### 目标

让项目可以启动、显示三页、切换主题、保存基础配置。

### 范围

- 初始化 Vite + React + TypeScript。
- 引入 `src/index.css` tokens。
- 实现 `App.tsx` 三页导航。
- 实现空的 `ActionDesk` / `ReviewArchive` / `System` 页面。
- 接入 Zustand store。
- 实现 `config` slice：`theme`、`currentWeekStart`、`lastVisitDate`。
- 实现浏览器 localStorage persist。

### 不做

- Electron 文件存储。
- DnD。
- OKR。
- Reflection。
- 模块开关。

### 验收

```text
Given 用户运行 npm run dev
When 应用打开
Then 可以看到三页导航
And 默认进入 ActionDesk
And 可以切换 dark/light theme
And 刷新后 theme 保持
```

## 5. v0.2：最小执行系统

### 目标

用户可以捕捉想法，并把它变成任务执行。

### 范围

- `Task` 数据模型。
- `InboxItem` 数据模型。
- `taskSlice`：add / update / delete / toggle / move / reorder。
- `okrSlice` 中 inbox 相关 actions：addQuickInboxItem / removeFromInbox / deleteInboxItem。
- `QuickInbox`。
- `TaskBoard` 七日列。
- `TaskColumn`。
- `TaskCard`。
- Inbox → Task basic conversion。
- Day migration。

### 推荐先不做

- KR linkage。
- Ability score。
- 复杂 DnD；可以先用按钮完成 Inbox → Today Task。

### 验收

```text
Given 用户输入 inbox item
When 用户把它转成今日任务
Then 今日列出现 task
And inbox item 被移除
```

```text
Given active task 存在
When 用户点击完成
Then task 显示 ☑ 和删除线
```

```text
Given 今天之前有 active task
When 新一天打开应用
Then task 迁移到今天并显示 migratedFrom
```

## 6. v0.3：OKR 与目标闭环

### 目标

让长期目标可以变成具体任务，并随任务完成自动推进。

### 范围

- `Objective` / `KeyResult` 数据模型。
- `okrSlice` Objective / KR actions。
- `OKRPanel`。
- KR → TaskBoard 调度。
- Task `linkedKrId`、`source: 'kr'`。
- Task complete → completeKR。
- Task uncomplete → uncompleteKR。
- `useObjectiveAutoArchive`。
- `archiveSlice`。
- `ObjectiveArchivePanel` basic。

### 验收

```text
Given Objective 有一个 KR
When 用户将 KR 安排到今天
Then 今天生成 linked task
And KR.scheduled 为 true
```

```text
Given linked task 为 active
When 用户完成该 task
Then KR.completed 为 true
```

```text
Given Objective 的所有 KR completed
When 系统检查归档
Then Objective 被移入 archives
And active objectives 中不再出现该 Objective
```

## 7. v0.4：Reflection 与洞察

### 目标

让用户每天沉淀反思，并能查看历史。

### 范围

- `ReflectionQuestion` / `ReflectionTemplate` / `Reflection`。
- `reflectionSlice`。
- `reflectionTemplateSlice`。
- 默认模板。
- `ReflectionQuickEntry`。
- `ReflectionForm` basic。
- `ReflectionGrid`。
- `ReflectionDetailModal`。
- ReviewArchive 页面完整基础布局。

### 验收

```text
Given 今天没有 Reflection
When 用户填写必填问题并保存
Then reflections 中新增今天的记录
```

```text
Given 今天已有 Reflection
When 用户再次保存
Then 更新原记录而不是新增重复记录
```

```text
Given 历史 Reflection 存在
When 用户点击查看
Then 打开详情 modal
```

## 8. v0.5：模块系统与系统页

### 目标

让 ALO 可裁剪、可配置，并提供基础系统能力。

### 范围

- `ModuleId` / `ModuleMeta`。
- `MODULE_REGISTRY`。
- `moduleSlice`。
- `layoutSlice`。
- `ModuleManager`。
- `System` 页面两列布局。
- `DataHealthPanel`。
- `ManualPanel`。
- `UpdatePanel`。
- `ReflectionTemplateManager`。

### 验收

```text
Given 用户进入 System
When 查看 ModuleManager
Then 模块按 捕捉 / 支撑 / 执行 / 洞察 分组
```

```text
Given 非 core module 已开启
When 用户关闭该 module
Then 对应页面不再渲染该模块
```

```text
Given core module
When 用户尝试关闭
Then 系统不允许关闭
```

## 9. v0.6：Electron 本地存储可信版本

### 目标

让本地优先从“概念”变成可信实现。

### 范围

- `electron/main.cjs`。
- `electron/preload.cjs`。
- `electronStorage` adapter。
- `alo-data.json`。
- `.tmp` atomic write。
- `.bak` backup。
- backup recovery。
- save debounce。
- write retry。
- before-quit flush。
- `app://` resource protocol。
- `electron:build`。

### 验收

```text
Given 用户在 Electron 应用中新增 task
When 关闭并重新打开应用
Then task 仍存在
```

```text
Given 主数据文件损坏但 .bak 存在
When 应用加载数据
Then 尝试从 .bak 恢复
```

```text
Given 有 pending write
When 应用退出
Then renderer 收到 app-before-quit 并尝试 flush
```

## 10. v1.0：可发布版本

### 目标

体验完整、数据可信、发布流程可重复。

### 必须完成

- P0 全部完成。
- P1 大部分完成。
- 关键 gap 有明确决策。
- README 与实现一致。
- 文档 00-12 完整。
- 构建、lint、contrast audit 可运行。
- Electron 打包可用。
- Release workflow 可触发。

### 建议完成

- DataBackupRitual 正式挂载或 README 删除相关承诺。
- InboxClarifier 恢复或 README 改为拖拽澄清。
- Ability 管理路径明确。
- 最小自动测试集。

### Release gate

```text
必须通过：
- npm run build
- npm run lint
- npm run audit:contrast
- npm run electron:build
- 手动验收核心流程
```

## 11. 不做清单

0-1 阶段明确不做：

- 账号系统。
- 云同步。
- 多人协作。
- 第三方日历同步。
- 完整项目管理。
- 移动端/小程序适配。
- 所有普通 completed tasks 永久保存。
- AI 自动规划。
- 插件市场。
- 复杂权限。

## 12. 0-1 交付 checklist

### 产品

- [ ] 三页结构稳定。
- [ ] 核心模块地图与 registry 一致。
- [ ] PRD 的 P0 能力全部实现。
- [ ] README 与当前实现一致。

### 体验

- [ ] 视觉符合 Monastic Terminal。
- [ ] 暗色主题完整。
- [ ] 亮色主题可用。
- [ ] DnD 有明确反馈。
- [ ] 空状态可理解。
- [ ] 危险操作有确认或足够清晰。

### 数据

- [ ] AppState 字段完整。
- [ ] persist 字段完整。
- [ ] 旧数据 migration 可用。
- [ ] Electron 写入可靠。
- [ ] DataHealth 能发现关键引用损坏。

### 开发

- [ ] 构建通过。
- [ ] lint 通过或已记录遗留。
- [ ] contrast audit 通过。
- [ ] release workflow 可运行。
- [ ] docs/alo 更新。
