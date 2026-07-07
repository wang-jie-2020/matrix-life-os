# 用户故事与核心流程

> 反推日期：2026-07-07  
> 范围：当前 Electron + React 桌面版 ALO  
> 约定：本文件默认描述当前已挂载流程；源码存在但未确认挂载的能力会显式标注。

## 1. 用户故事总览

### Story A：快速捕捉脑中杂念

作为一个容易被想法打断的用户，
我希望能把脑中闪过的任务、念头、担忧或灵感快速丢进收集箱，
以便稍后处理，而不是立刻切换上下文。

核心模块：

- `QuickInbox`
- `InboxItem`
- `ActionDesk`

源码入口：

- `src/features/inbox/QuickInbox.tsx`
- `src/pages/ActionDesk.tsx`
- `src/types/index.ts`

### Story B：把模糊输入澄清成系统对象

作为一个使用个人 Life OS 的用户，
我希望能把收集箱里的模糊内容拖到合适模块，
以便它成为任务、目标、原则、灵感、日程、习惯、娱乐或时间块。

核心模块：

- `QuickInbox`
- `ActionDesk` droppable zones
- `TaskBoard`
- `OKRPanel`
- `PrinciplesPanel`
- `MiniCalendar`
- `HabitTrackerPanel`
- `EntertainmentPanel`
- `TimeBlockPanel`
- `InspirationVaultPanel`

源码入口：

- `src/pages/ActionDesk.tsx`

### Story C：把长期目标变成具体任务

作为一个有 Objective / KR 的用户，
我希望能把 KR 拖到周看板某一天，
以便长期目标能转化为当天可执行任务。

核心模块：

- `OKRPanel`
- `TaskBoard`
- `TaskCard`
- `Objective`
- `KeyResult`
- `Task.linkedKrId`

源码入口：

- `src/features/okr/OKRPanel.tsx`
- `src/pages/ActionDesk.tsx`
- `src/features/tasks/TaskCard.tsx`
- `src/store/slices/okrSlice.ts`
- `src/store/slices/taskSlice.ts`

### Story D：执行任务并推进能力 / 目标

作为一个希望看到成长证据的用户，
我希望完成任务时系统自动推进关联能力或 KR，
以便任务不只是被勾掉，而是连接到长期成长。

核心模块：

- `TaskCard`
- `Ability`
- `Objective`
- `KeyResult`
- `ObjectiveArchive`

源码入口：

- `src/features/tasks/TaskCard.tsx`
- `src/store/slices/abilitySlice.ts`
- `src/store/slices/okrSlice.ts`
- `src/hooks/useObjectiveAutoArchive.ts`
- `src/store/slices/archiveSlice.ts`

### Story E：每日反思与长期沉淀

作为一个复盘型用户，
我希望每天按模板完成一次 reflection，
以便把行动、情绪、目标和经验沉淀为长期可回看资料。

核心模块：

- `ReflectionQuickEntry`
- `ReflectionForm`
- `ReflectionGrid`
- `ReflectionTemplateManager`
- `ObjectiveArchivePanel`

源码入口：

- `src/pages/ReviewArchive.tsx`
- `src/features/reflections/*`
- `src/store/slices/reflectionSlice.ts`
- `src/store/slices/reflectionTemplateSlice.ts`

### Story F：按阶段裁剪系统

作为一个不同阶段关注点不同的用户，
我希望能在系统页开启或关闭非核心模块，
以便行动台只保留当前真正需要的工具。

核心模块：

- `ModuleManager`
- `MODULE_REGISTRY`
- `enabledModules`

源码入口：

- `src/features/modules/ModuleManager.tsx`
- `src/features/modules/moduleRegistry.ts`
- `src/store/slices/moduleSlice.ts`
- `src/store/useAppStore.ts`

## 2. 核心流程一：QuickInbox 捕捉

### 2.1 目标

让用户用最小成本捕捉任何脑中闪过的内容。

### 2.2 主路径

1. 用户打开 ActionDesk。
2. 用户在 QuickInbox 输入框输入内容。
3. 用户按 Enter。
4. 系统创建一条 `InboxItem`。
5. 输入框清空。
6. Inbox item 出现在列表中。

### 2.3 验收标准

```text
Given 用户在 ActionDesk
When 用户在 QuickInbox 输入非空内容并按 Enter
Then 系统创建一条 inbox item
And 输入框被清空
And 新条目显示在 QuickInbox 列表中
```

```text
Given QuickInbox 输入为空或只有空白字符
When 用户按 Enter
Then 系统不创建 inbox item
```

```text
Given QuickInbox 中存在 inbox item
When 用户点击该条目的 [x]
Then 该 inbox item 被删除
```

```text
Given QuickInbox 没有 inbox item
Then 系统显示空状态文案
```

### 2.4 当前实现备注

- Inbox item 使用 `useDraggable` 注册为 `inbox-{item.id}`。
- 当前可见流程是“捕捉 + 拖拽澄清”。
- `InboxClarifier.tsx` 存在，但未确认被当前页面挂载；不要把“点击处理弹窗”写成当前已上线主路径。

## 3. 核心流程二：Inbox 拖拽澄清

### 3.1 目标

把模糊输入转化为系统对象，并从 inbox 移除。

### 3.2 Drop targets

当前 `ActionDesk` 支持以下 inbox drop 行为：

| Drop target | 结果 | 说明 |
|---|---|---|
| `drop-okr` | 创建 Objective | `addObjective(inboxItem.content)` |
| `drop-principles` | 创建 Principle | `addPrinciple(inboxItem.content)` |
| `drop-inspiration` | 创建 Inspiration | source 为 `inbox` |
| `drop-calendar` | 创建今日 CalendarEvent | 使用今天日期 |
| `calendar-day-{date}` | 创建指定日期 CalendarEvent | 使用日历日期 |
| `drop-habits` | 创建 Habit | 默认 gold / daily / targetDays 7 |
| `drop-entertainment` | 创建今日 Entertainment | 使用今天日期 |
| `drop-timeblocks` | 创建 TimeBlock | 默认从当前时间后一小时开始，持续一小时 |
| `drop-weekboard` | 创建今日 Task | source 为 `inbox` |
| `column-{date}` 或某个 task | 创建指定日期 Task | source 为 `inbox` |

### 3.3 验收标准

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到 OKR 区域
Then 系统创建一个 title 等于 item.content 的 Objective
And 该 inbox item 从收集箱移除
```

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到周看板某一天
Then 系统在对应日期创建 Task
And Task.source 为 inbox
And 该 inbox item 从收集箱移除
```

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到原则区域
Then 系统创建 Principle
And 该 inbox item 从收集箱移除
```

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到灵感仓库
Then 系统创建 Inspiration
And Inspiration.source 为 inbox
And 该 inbox item 从收集箱移除
```

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到具体日历日期
Then 系统创建该日期的 CalendarEvent
And 该 inbox item 从收集箱移除
```

```text
Given QuickInbox 中存在 inbox item
When 用户将该 item 拖到时间块区域
Then 系统创建一个默认一小时 TimeBlock
And 该 inbox item 从收集箱移除
```

### 3.4 设计约束

- Inbox 澄清是核心 GTD 流程，不应隐藏在深层菜单。
- Drop 反馈应明显但克制，当前使用金色 inset outline。
- 转换后必须处理原 inbox item，避免重复待处理。

## 4. 核心流程三：KR 调度到任务板

### 4.1 目标

把 Objective 的 Key Result 变成某天的可执行任务。

### 4.2 主路径

1. 用户在 OKRPanel 中创建 Objective。
2. 用户为 Objective 创建 KR。
3. 用户将 KR 拖到 TaskBoard 某一天或某个 task 上。
4. 系统创建一个新 Task：
   - `content = KR.content`
   - `source = 'kr'`
   - `linkedKrId = KR.id`
5. 系统调用 `scheduleKR(objectiveId, krId, newTaskId)`。
6. KR 标记为 scheduled，并记录 linked task。

### 4.3 重新调度规则

如果 KR 已经有 `linkedTaskId`：

1. 删除旧 linked task；
2. 创建新 task；
3. KR 重新链接到新 task。

### 4.4 验收标准

```text
Given 一个未调度 KR
When 用户将该 KR 拖到某日任务列
Then 系统创建一个 linked task
And task.source 为 kr
And task.linkedKrId 等于 KR.id
And KR.scheduled 为 true
And KR.linkedTaskId 指向新 task
```

```text
Given 一个已调度 KR
When 用户将该 KR 拖到另一日任务列
Then 系统删除旧 linked task
And 创建新 linked task
And KR.linkedTaskId 指向新 task
```

```text
Given 用户拖拽 KR 但 drop target 不是任务列或任务
When drag end
Then 系统不创建 task
And KR 状态不应变化
```

## 5. 核心流程四：Task 执行、能力增长与 KR 同步

### 5.1 普通任务完成

```text
Given 一个 active task
When 用户点击任务复选状态
Then task.status 切换为 completed
And UI 显示 ☑ 与删除线
```

```text
Given 一个 completed task
When 用户再次点击任务复选状态
Then task.status 切换回 active
And UI 显示 ☐
```

### 5.2 Ability-linked task

```text
Given active task 绑定 abilityId 和 abilityPoints
When 用户完成该 task
Then 对应 ability.currentScore 增加 abilityPoints
And currentScore 不超过 maxScore
```

当前实现事实：取消完成不会自动扣回 ability score。若后续产品希望能力分可逆，需要单独设计。

### 5.3 KR-linked task

```text
Given active task 绑定 linkedKrId
When 用户完成该 task
Then 对应 KR 被标记 completed
And task.status 切换为 completed
```

```text
Given completed task 绑定 linkedKrId
When 用户取消完成该 task
Then 对应 KR 被取消 completed
And task.status 切换为 active
```

### 5.4 Objective 自动归档

```text
Given Objective 至少有一个 KR
And 所有 KR 都 completed
When 系统检查 Objective 完成状态
Then Objective 被 archiveObjective 归档
And active objectives 中删除该 Objective
```

注意：自动归档依赖 `tryArchiveObjective` 读取最新 store 状态。

## 6. 核心流程五：周迁移与轻量历史

### 6.1 目标

保持任务系统轻量，避免普通完成任务长期堆积。

### 6.2 主路径

1. App 启动后调用 `useDayMigration()`。
2. 如果 `config.lastVisitDate` 是今天，不处理。
3. 如果进入新周：
   - 删除所有 completed tasks；
   - 更新 `currentWeekStart`。
4. 将今天之前仍 active 的任务迁移到今天。
5. 更新 `lastVisitDate`。

### 6.3 验收标准

```text
Given 用户今天已经打开过应用
When App 再次启动
Then 不执行任务迁移
```

```text
Given 当前日期进入新周
When App 启动
Then 系统删除 completed tasks
And 更新 currentWeekStart
```

```text
Given 存在早于今天且仍 active 的 task
When App 执行 day migration
Then 该 task 被迁移到今天
And 保留 migratedFrom 标记
```

### 6.4 产品含义

普通任务是过程数据，不是长期成就档案。长期价值主要由 Reflection 和 ObjectiveArchive 承担。

## 7. 核心流程六：每日 Reflection

### 7.1 目标

让用户每天用模板完成一次反思，把经验、情绪和目标上下文沉淀下来。

### 7.2 主路径

1. 用户进入 ReviewArchive。
2. 用户在“今日反思”区域填写表单。
3. 表单根据默认 ReflectionTemplate 渲染问题。
4. 用户填写 required answers。
5. 用户可关联 Objective。
6. 用户保存。
7. 系统按 date upsert Reflection。
8. Reflection 出现在历史档案中。

### 7.3 验收标准

```text
Given 今天没有 Reflection
When 用户进入 ReviewArchive
Then 用户可以填写今日反思
```

```text
Given 当前模板包含 required question
When required answer 为空
Then 系统不应保存无效 Reflection
```

```text
Given 用户保存今日 Reflection
When 今天已有 Reflection
Then 系统更新同日期 Reflection，而不是创建重复记录
```

```text
Given 用户保存 Reflection 并选择关联 Objective
Then Reflection.linkedObjectiveIds 包含该 Objective.id
```

```text
Given 用户点击历史 Reflection
Then 系统打开 ReflectionDetailModal 查看详情
```

### 7.4 退出前提醒

当前 App 在 Electron 环境中监听 `onBeforeQuit`。如果当天没有 Reflection，会显示 last words overlay。

验收标准：

```text
Given Electron 环境下当天没有 Reflection
When 应用收到 before quit 事件
Then 显示退出前提示 overlay
```

## 8. 核心流程七：模块开关与布局

### 8.1 模块开关

```text
Given 用户进入 System 页面
When 用户查看 ModuleManager
Then 模块按 捕捉 / 支撑 / 执行 / 洞察 分组
```

```text
Given 一个 core module
When 用户尝试关闭该模块
Then 系统不允许关闭
And UI 应显示核心标记
```

```text
Given 一个非 core module
When 用户切换模块开关
Then enabledModules 更新
And 对应页面中的模块显示/隐藏
```

### 8.2 布局持久化

```text
Given 用户拖拽 System 页面右侧面板排序
When drop 在同一列内完成
Then systemLayout.right 被更新
And 重启后布局顺序保留
```

```text
Given 用户拖拽 ActionDesk 主区可拖拽面板排序
When drop 完成
Then dashboardLayout.main 被更新
And 重启后布局顺序保留
```

当前实现备注：

- ActionDesk 主区仅 `timeBlocks`、`habits` 属于可拖拽 main panels；OKR 固定在主区顶部。
- System 页面支持左右列内部排序，但不跨列移动。

## 9. 核心流程八：数据健康与更新

### 9.1 DataHealth

```text
Given 用户进入 System 页面
When DataHealthPanel 渲染
Then 系统检查必需字段、KR 引用、template 引用和数据体积
```

```text
Given AppState 缺少必需字段
When DataHealthPanel 检查
Then 状态应为 error
```

```text
Given task.linkedKrId 指向不存在的 KR
When DataHealthPanel 检查
Then 状态应为 warn
```

```text
Given Reflection.templateId 指向不存在的 template
When DataHealthPanel 检查
Then 状态应为 warn
```

### 9.2 Update

```text
Given App 启动后经过短暂延迟
When checkUpdate 检测到新版本
Then System 导航项显示更新标记
```

```text
Given 用户打开 System 页面 UpdatePanel
When 手动检查更新
Then 系统展示当前版本、最新版本和更新状态
```

## 10. 当前不应写成已上线主流程的能力

以下组件或能力需要在开发时谨慎处理：

| 能力 | 当前判断 | 开发含义 |
|---|---|---|
| `InboxClarifier` | 代码存在，未确认挂载 | 不要把“点击处理弹窗”写为当前主流程 |
| `DataBackupPanel` / `DataBackupRitual` | 代码存在，但 System 当前挂载不明确且备份范围需确认 | PRD 中不要直接承诺完整一键备份 |
| `ModulePicker` | 代码存在，当前模块管理以 ModuleManager 为准 | 避免重复做模块入口 |
| 部分 Ability 管理组件 | 可能存在 legacy/候选组件 | 以 ReviewArchive 当前挂载为准 |

详细见 [`05-implementation-notes-and-gaps.md`](05-implementation-notes-and-gaps.md)。
