# 状态机与业务规则

> 反推日期：2026-07-07  
> 目标：把 ALO 0-1 实现中最容易出错的状态联动明确成规则。  
> 主要依据：`src/store/slices/*`、`src/pages/ActionDesk.tsx`、`src/features/tasks/TaskCard.tsx`、`src/hooks/*`

## 1. 总览

ALO 的核心业务不是单个 CRUD，而是跨模块状态流转：

```text
Inbox → Task / Objective / Principle / Calendar / ...
KR → Task
Task completed → KR completed / Ability score increment
All KRs completed → ObjectiveArchive
New week → completed tasks deleted
Old active tasks → today
Reflection date → upsert
```

本文件定义这些规则，作为从 0-1 实现、测试和验收的依据。

## 2. Task 状态机

### 2.1 状态

```text
active ── toggle ──► completed
completed ── toggle ──► active
```

### 2.2 状态字段

| 状态 | `status` | `completedAt` |
|---|---|---|
| 未完成 | `active` | undefined |
| 已完成 | `completed` | ISO datetime |

### 2.3 转换规则

#### active → completed

触发：用户点击 TaskCard 完成状态。

副作用：

1. `status` 改为 `completed`；
2. `completedAt` 写入当前时间；
3. 如果有 `abilityId` 与 `abilityPoints`，调用 `incrementScore`；
4. 如果有 `linkedKrId`，找到对应 Objective/KR 并 `completeKR`；
5. 如果 linked KR 所在 Objective 全部 KR 完成，尝试 archive。

#### completed → active

触发：用户再次点击 TaskCard 完成状态。

副作用：

1. `status` 改为 `active`；
2. `completedAt` 清空；
3. 如果有 `linkedKrId`，调用 `uncompleteKR`；
4. 当前实现不会扣回 ability score。

### 2.4 验收规则

```text
Given active task
When toggle
Then status = completed
And completedAt is set
```

```text
Given completed task
When toggle
Then status = active
And completedAt is undefined
```

```text
Given active task with abilityId and abilityPoints
When toggle to completed
Then ability.currentScore increases by abilityPoints, capped at maxScore
```

```text
Given completed task with abilityId and abilityPoints
When toggle to active
Then ability.currentScore stays unchanged in current implementation
```

## 3. Task 排序与移动规则

### 3.1 同日排序

触发：task 拖拽到同一日期另一 task 上。

规则：

- 使用当前日期下的 tasks；
- 按 `order` 排序；
- `arrayMove`；
- 重写该日期所有 task 的 `order`。

### 3.2 跨日移动

触发：task 拖拽到另一日期列或另一日期 task 上。

规则：

- 更新 `date`；
- 重新计算 `column`；
- 插入目标日期指定位置；
- 重写目标日期 order；
- 从原日期移除该 task。

### 3.3 空列 drop

触发：task 拖到 `column-{date}`。

规则：

- 如果目标 date 与原 date 相同，不处理；
- 否则移动到目标日期 order 0。

## 4. Day migration 规则

### 4.1 触发

App 启动后调用 `useDayMigration()`。

### 4.2 Same day

```text
If config.lastVisitDate === today:
  do nothing
```

### 4.3 New week

```text
If !isSameWeek(config.currentWeekStart, todayWeekStart):
  deleteCompletedTasks()
  updateConfig({ currentWeekStart: todayWeekStart })
```

### 4.4 Old active tasks

```text
Find tasks where status === active and date < today
Move them to today
Set migratedFrom to original date if missing
Put migrated tasks before existing today tasks
Update lastVisitDate
```

### 4.5 产品规则

- completed ordinary tasks 是轻量过程数据，新周清理。
- active overdue tasks 不丢弃，而是迁移到今天。
- 迁移任务应显示 `⤴ 来自昨日` 或类似提示。

## 5. InboxItem 状态与转换规则

### 5.1 状态

当前 InboxItem 没有完整状态机，主要是“存在于 inbox”或“被转换/删除”。

```text
inbox ── convert ──► target object + removed from inbox
inbox ── delete ───► removed from inbox
```

### 5.2 创建来源

- QuickInbox 输入；
- KR collect；
- AbilityTask collect。

### 5.3 转换规则

| 目标 | 动作 | 原 inbox item |
|---|---|---|
| Objective | `addObjective(content)` | remove |
| Principle | `addPrinciple(content)` | remove |
| Inspiration | `addInspiration({ content, source: 'inbox', tags: [] })` | remove |
| CalendarEvent | `addCalendarEvent(date, content)` | remove |
| Habit | `addHabit({ name, color: 'gold', frequency: 'daily', targetDays: 7 })` | remove |
| Entertainment | `addEntertainment(content, today)` | remove |
| TimeBlock | `addTimeBlock(...)` | remove |
| Task | `addTask(content, date, abilityId, abilityPoints, 'inbox')` | remove |

### 5.4 DnD 失败规则

```text
If over target is null or unsupported:
  no object is created
  inbox item remains
```

### 5.5 产品约束

- 转换成功必须 remove，避免同一个念头重复待处理。
- 转换应尽量保留 metadata，例如 abilityId / abilityPoints。
- 如果未来支持“保留原 item”，必须明确状态字段，而不是静默保留。

## 6. Objective / KR 状态机

## 6.1 Objective 状态

```text
active ── all KRs completed + archive ──► archived snapshot
```

当前 `Objective.status` 支持：

```ts
'active' | 'completed'
```

但当前自动归档流程是：archive 后从 active objectives 删除，因此归档后的对象由 `ObjectiveArchive` 表示。

### 6.2 Objective 规则

- 新 Objective 默认 active。
- Objective 可以没有 KR。
- 没有 KR 的 Objective 不应自动归档。
- Objective 至少有一个 KR 且全部 completed 时可以归档。

## 6.3 KR 状态

KR 有两个独立维度：

```text
completed: false | true
scheduled: false | true
```

以及链接：

```text
linkedTaskId: string | null
```

### 6.4 KR 调度状态机

```text
unscheduled ── scheduleKR(taskId) ──► scheduled
scheduled ── unscheduleKR ────────► unscheduled
scheduled ── reschedule ─────────► scheduled with new linkedTaskId
```

当前 ActionDesk 重新调度规则：

1. 如果 KR 有旧 `linkedTaskId`，先 deleteTask；
2. 创建新 task；
3. `scheduleKR(objectiveId, krId, newTaskId)`。

### 6.5 KR 完成状态机

```text
incomplete ── completeKR ──► completed
completed ── uncompleteKR ─► incomplete
```

触发来源：

- 用户直接 toggle KR；
- linked task 完成 / 取消完成。

### 6.6 Objective auto archive

```text
If objective.krList.length > 0
And every kr.completed === true
Then archiveObjective(objective)
And deleteObjective(objective.id)
```

### 6.7 验收规则

```text
Given KR has no linkedTaskId
When dropped on date column
Then Task is created
And KR.scheduled = true
And KR.linkedTaskId = Task.id
```

```text
Given KR has linkedTaskId
When dropped on another date column
Then old linked task is deleted
And new linked task is created
And KR.linkedTaskId = new Task.id
```

```text
Given Objective has all KRs completed
When tryArchiveObjective runs
Then archive is created with KR snapshot
And Objective is removed from objectives
```

## 7. ObjectiveArchive 规则

### 7.1 创建规则

由 `archiveObjective(obj)` 创建：

- new archive id；
- `objectiveTitle = obj.title`；
- `krSnapshot = copy of obj.krList`；
- `completedAt = obj.completedAt || now`；
- `createdAt = now`。

### 7.2 Snapshot 规则

Archive 是快照，不应依赖原 Objective 后续变化。

### 7.3 删除规则

用户可以删除 archive，但这是长期证据，应有确认或足够明确的危险操作。

## 8. Ability score 规则

### 8.1 增长规则

```text
If task.status === active
And task.abilityId exists
And task.abilityPoints exists
When user completes task
Then incrementScore(abilityId, abilityPoints)
```

`incrementScore`：

```text
currentScore = min(currentScore + points, maxScore)
```

### 8.2 不可逆现状

当前取消 task completed 不会扣回 ability score。

### 8.3 产品决策点

必须明确二选一：

1. 能力分是不可逆成长记录；
2. 能力分应随 task completed 状态可逆。

当前文档按现状记录为不可自动扣回。

## 9. Reflection 状态与 upsert 规则

### 9.1 状态

Reflection 没有复杂状态机，核心规则是 date upsert：

```text
No reflection for date ── save ──► create
Existing reflection for date ── save ──► update
```

### 9.2 创建规则

新建 Reflection：

- 生成 id；
- 写 createdAt；
- 保存 date、templateId、answers、tags、linkedObjectiveIds。

### 9.3 更新规则

同 date 已存在：

- 保留 id；
- 更新字段；
- 写 updatedAt。

### 9.4 校验规则

- templateId 必须存在。
- required question 必须有 answer。
- answer 类型应匹配 question.type。
- linkedObjectiveIds 应指向 Objective。

### 9.5 退出提醒规则

Electron before quit：

```text
If today has no reflection:
  show Last Words overlay
```

## 10. ReflectionTemplate 规则

### 10.1 默认模板

- 新用户必须有默认模板。
- 老用户 rehydrate 如果没有 templates，补默认模板。

### 10.2 isDefault 规则

建议保证：

- 至多一个 template `isDefault = true`；
- 删除默认模板前必须指定替代或禁止删除。

当前实现细节以 `reflectionTemplateSlice` 为准；若从 0-1 新建，应显式测试这些规则。

## 11. Module 状态规则

### 11.1 enabledModules

模块显示由：

```text
enabledModules.includes(moduleId)
```

决定。

### 11.2 Core module

```text
If module.core === true:
  cannot disable
```

### 11.3 defaultEnabled

`defaultEnabled` 只影响新用户默认列表。

### 11.4 rehydrate 补齐

老数据加载时，系统应确保 core modules 存在于 enabledModules。

### 11.5 验收规则

```text
Given core module enabled
When user clicks toggle
Then module remains enabled
```

```text
Given optional module enabled
When user clicks toggle
Then module is removed from enabledModules
And corresponding panel disappears
```

## 12. Layout 规则

### 12.1 Dashboard layout

```text
main: ['timeBlocks', 'habits']
side: ['principles', 'calendar', 'entertainment', 'mood', 'inspiration']
```

规则：

- ActionDesk main panels 可排序；
- OKR、QuickInbox、TaskBoard 不属于可拖拽普通 panel；
- side panels 当前按代码固定顺序渲染，受 module enabled 控制。

### 12.2 System layout

```text
left: ['moduleManager']
right: ['aboutBox', 'monkQuote', 'reflectionTemplateManager', 'dataHealthPanel', 'updatePanel', 'manualPanel']
```

规则：

- 左右列内部排序；
- 不跨列移动；
- 未知 panel id 过滤；
- 新增必要 panel 时 rehydrate 补齐。

### 12.3 Reflection layout

当前类型存在，但 ReviewArchive 页面主要硬编码布局。若未来启用 reflectionLayout 拖拽，应补页面逻辑和测试。

## 13. DataHealth 规则

### 13.1 当前检查

- 必需字段存在；
- Task linkedKrId 是否 orphan；
- Reflection templateId 是否 orphan；
- JSON size 是否超过 4.5MB。

### 13.2 状态判断

```text
If structure missing:
  status = error
Else if orphanedCount > 0 or size > 4.5MB:
  status = warn
Else:
  status = ok
```

### 13.3 建议扩展

- Task abilityId orphan；
- TimeBlock taskId orphan；
- InboxItem objectiveId orphan；
- Reflection linkedObjectiveIds orphan；
- layout unknown panel id；
- enabledModules unknown module id。

## 14. Storage 规则

### 14.1 Renderer dirty cache

```text
setItem:
  serialize value
  if changed:
    update cache
    dirty = true
    schedule debounced flush
```

### 14.2 Flush

```text
flushImmediate:
  cancel pending debounce
  save snapshot through electronAPI.saveData
  if ok:
    dirty = false
    retryCount = 0
  else:
    scheduleRetry
```

### 14.3 Retry

- 最大 5 次；
- 指数退避；
- 多次失败后数据仍在内存，但退出可能丢失。

### 14.4 Main process write

```text
write TEMP_FILE
rename TEMP_FILE to DATA_FILE
copy DATA_FILE to BACKUP_FILE
```

### 14.5 Recovery

```text
read DATA_FILE
if fail:
  read BACKUP_FILE
  if success:
    copy BACKUP_FILE to DATA_FILE
```

## 15. Update check 规则

- App mount 后延迟检查，避免阻塞 first paint。
- Electron 下优先从 `window.electronAPI.getAppVersion()` 获取版本。
- 检查结果有 update 时，System nav 显示 marker。
- UpdatePanel 可手动检查。

## 16. Backup 规则候选

当前 backup 未正式挂载。若恢复为正式能力，应遵守：

1. Full backup 字段必须对齐 `partialize`。
2. High-value backup 必须明确只包含长期价值数据。
3. 导入是破坏性覆盖操作，必须有确认。
4. 导入后必须跑 migration/defaults。
5. 导入失败不能破坏当前 store。
6. 导入成功后刷新或重建 store。

## 17. 关键业务回归矩阵

| 改动区域 | 必须回归 |
|---|---|
| taskSlice | add/edit/delete/toggle/move/reorder/day migration |
| okrSlice | add objective/KR、schedule、complete、uncomplete |
| TaskCard | ability score、KR sync、archive trigger |
| ActionDesk DnD | inbox conversion、KR scheduling、task move/reorder |
| reflectionSlice | date upsert、delete、detail view |
| migration | old data defaults、reflection migration、layout补齐 |
| storage | load/save/retry/recovery/before quit |
| module system | core cannot disable、optional visible/hidden |

## 18. 禁止隐式变更

以下变更必须先改文档/PRD或明确记录：

- completed tasks 不再新周清理；
- ability score 变成可逆；
- Objective 不再自动归档；
- Inbox 转换后保留原 item；
- 增加云同步；
- 增加账号；
- DataBackup 变成正式能力；
- ModulePicker 替代 ModuleManager；
- 移动端成为主体验。
