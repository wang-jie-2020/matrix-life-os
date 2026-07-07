# 数据模型与 Schema

> 反推日期：2026-07-07  
> 主要依据：`src/types/index.ts`、`src/store/useAppStore.ts`、`src/store/slices/*`  
> 目标：为从 0-1 实现 ALO 提供施工级数据字典。

## 1. 总览

ALO 的核心状态集中在 `AppState`，由 Zustand store 持有，并通过 persist 持久化。

```ts
interface AppState {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  principles: Principle[];
  abilities: Ability[];
  reflections: Reflection[];
  entertainments: Entertainment[];
  objectives: Objective[];
  archives: ObjectiveArchive[];
  inboxItems: InboxItem[];
  config: AppConfig;
  enabledModules: ModuleId[];
  habits: Habit[];
  moods: MoodEntry[];
  timeBlocks: TimeBlock[];
  inspirations: Inspiration[];
  reflectionTemplates: ReflectionTemplate[];
  dashboardLayout: DashboardLayout;
  reflectionLayout: TwoColumnLayout;
  systemLayout: TwoColumnLayout;
  __version: string;
}
```

## 2. 持久化规则

### 2.1 Persist key

```ts
name: 'alo-storage'
```

### 2.2 持久化字段

当前 `partialize` 持久化以下字段：

| 字段 | 是否持久化 | 说明 |
|---|---:|---|
| `tasks` | 是 | 任务板 |
| `calendarEvents` | 是 | 日历事件 |
| `principles` | 是 | 原则 |
| `abilities` | 是 | 能力 |
| `reflections` | 是 | 反思 |
| `entertainments` | 是 | 娱乐安排 |
| `objectives` | 是 | 活跃目标 |
| `archives` | 是 | 已完成目标归档 |
| `inboxItems` | 是 | 收集箱 |
| `config` | 是 | 主题、周起点、上次访问日期等 |
| `enabledModules` | 是 | 模块开关 |
| `habits` | 是 | 习惯 |
| `moods` | 是 | 心情记录 |
| `timeBlocks` | 是 | 时间块 |
| `inspirations` | 是 | 灵感 |
| `reflectionTemplates` | 是 | 反思模板 |
| `dashboardLayout` | 是 | ActionDesk 布局 |
| `reflectionLayout` | 是 | ReviewArchive 布局 |
| `systemLayout` | 是 | System 布局 |
| `__version` | 是 | 数据版本 |
| `storageWarning` | 否 | 运行时 UI 状态 |

### 2.3 新增字段规则

新增持久化字段时必须同步：

1. `src/types/index.ts` 的 `AppState`；
2. 对应 slice 初始值；
3. `src/store/useAppStore.ts` 的 slice composition；
4. `partialize`；
5. rehydrate defaults / migration；
6. DataHealth 检查，如字段有引用关系；
7. backup/export/import，如果备份能力恢复；
8. docs。

## 3. ID 规则

当前 slices 多数使用：

```ts
Math.random().toString(36).substring(2, 9)
```

作为短 id。

### 建议

从 0-1 新建项目时可以继续使用该策略实现 MVP，但 v1.0 前建议统一封装：

```ts
createId(): string
```

原因：

- 便于测试；
- 便于替换为 crypto random；
- 便于 mock；
- 避免每个 slice 重复实现。

## 4. Task

### 4.1 Schema

```ts
type DayColumn = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
type TaskStatus = 'active' | 'completed';

interface Task {
  id: string;
  content: string;
  column: DayColumn;
  date: string;
  status: TaskStatus;
  order: number;
  abilityId?: string;
  abilityPoints?: number;
  completedAt?: string;
  migratedFrom?: string;
  linkedKrId: string | null;
  source?: 'manual' | 'inbox' | 'ability' | 'kr';
}
```

### 4.2 字段说明

| 字段 | 必填 | 默认值 | 说明 |
|---|---:|---|---|
| `id` | 是 | generated | task id |
| `content` | 是 | 用户输入 | 任务内容 |
| `column` | 是 | 从 `date` 推导 | 周列 |
| `date` | 是 | 目标日期 | ISO date string，通常 `YYYY-MM-DD` |
| `status` | 是 | `active` | 任务状态 |
| `order` | 是 | 当前日期末尾 | 同日排序 |
| `abilityId` | 否 | undefined | 关联能力 |
| `abilityPoints` | 否 | undefined | 完成后增加能力分 |
| `completedAt` | 否 | undefined | 完成时间 |
| `migratedFrom` | 否 | undefined | 从旧日期迁移而来 |
| `linkedKrId` | 是 | `null` | 关联 KR |
| `source` | 否 | `manual` | 来源 |

### 4.3 创建者

- 用户手动新增；
- Inbox item 转 task；
- KR 调度生成 task；
- Ability task collect to inbox 再转 task；
- Inspiration 转 task。

### 4.4 修改者

- `taskSlice.updateTask`
- `taskSlice.toggleTask`
- `taskSlice.moveTask`
- `taskSlice.reorderTasks`
- `taskSlice.migrateAllBeforeToday`
- `taskSlice.migrateUnfinishedTasks`

### 4.5 删除者

- 用户删除；
- 新周 `deleteCompletedTasks`；
- KR 重新调度时删除旧 linked task。

### 4.6 关系

```text
Task.linkedKrId ───► KeyResult.id
Task.abilityId ───► Ability.id
```

### 4.7 业务约束

- `linkedKrId` 必须是 string 或 null，不应为 undefined。
- 同一 `date` 内 `order` 应连续或至少可排序。
- 完成时写入 `completedAt`。
- 取消完成时清空 `completedAt`。
- 新周清理 completed tasks。

## 5. CalendarEvent

### 5.1 Schema

```ts
interface CalendarEvent {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}
```

### 5.2 说明

| 字段 | 必填 | 说明 |
|---|---:|---|
| `id` | 是 | event id |
| `date` | 是 | 事件日期 |
| `content` | 是 | 内容 |
| `createdAt` | 是 | 创建时间 |

### 5.3 边界

当前 CalendarEvent 是轻量模型，不包含：

- start/end time；
- recurrence；
- reminder；
- timezone；
- external calendar id。

如要做完整日历，需要另开模型设计。

## 6. Principle

### 6.1 Schema

```ts
interface Principle {
  id: string;
  content: string;
  order: number;
}
```

### 6.2 说明

Principle 是个人原则，作为支撑模块，不直接产生完成状态。

约束：

- `order` 用于显示排序；
- 删除 Principle 不应影响历史 task/reflection。

## 7. Ability / AbilityTask

### 7.1 Schema

```ts
interface AbilityTask {
  id: string;
  content: string;
  points: number;
}

interface Ability {
  id: string;
  name: string;
  currentScore: number;
  maxScore: number;
  tasks: AbilityTask[];
}
```

### 7.2 字段说明

| 字段 | 必填 | 说明 |
|---|---:|---|
| `Ability.id` | 是 | ability id |
| `name` | 是 | 能力名称 |
| `currentScore` | 是 | 当前分数 |
| `maxScore` | 是 | 上限 |
| `tasks` | 是 | 训练任务列表 |
| `AbilityTask.points` | 是 | 完成后加分 |

### 7.3 关系

```text
Task.abilityId ───► Ability.id
InboxItem.abilityId ───► Ability.id
```

### 7.4 业务约束

- `incrementScore` 不超过 `maxScore`。
- 当前取消任务完成不会扣回能力分。
- AbilityTask 可以 collect 到 inbox，生成带 ability metadata 的 InboxItem。

## 8. ReflectionQuestion / ReflectionTemplate / Reflection

### 8.1 Schema

```ts
interface ReflectionQuestion {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
  abilityLink?: string;
}

interface ReflectionTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  questions: ReflectionQuestion[];
}

interface Reflection {
  id: string;
  date: string;
  templateId: string;
  answers: Record<string, string | number | boolean>;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  linkedObjectiveIds: string[];
}
```

### 8.2 关系

```text
Reflection.templateId ───► ReflectionTemplate.id
Reflection.answers[questionId] ───► ReflectionQuestion.id
Reflection.linkedObjectiveIds[] ───► Objective.id
ReflectionQuestion.abilityLink ───► Ability.id
```

### 8.3 业务约束

- 同一天最多一条 Reflection；`saveReflection` 按 `date` upsert。
- required question 必须有 answer。
- `templateId` 应指向现有 template。
- 默认模板必须存在。
- 旧数据 migration 要补 `templateId` 和 `linkedObjectiveIds`。

## 9. Inspiration

### 9.1 Schema

```ts
interface Inspiration {
  id: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: string;
  convertedToTaskId?: string;
}
```

### 9.2 说明

Inspiration 是“想法的冷宫”，不是立即执行项。

字段：

- `source` 可记录来源，例如 `inbox`；
- `convertedToTaskId` 可记录转出的 task。

### 9.3 风险

如果转换 task 后通过 content/date 反查 task，可能在重复内容下链接错误。建议直接使用 `addTask` 返回的新 id。

## 10. Entertainment

### 10.1 Schema

```ts
interface Entertainment {
  id: string;
  content: string;
  date: string;
}
```

### 10.2 说明

Entertainment 是支撑模块，用于记录合法休息/娱乐安排。

边界：

- 当前没有复杂时长、分类、评分字段。
- 如果未来要做娱乐复盘，需要新增 schema。

## 11. Objective / KeyResult / ObjectiveArchive

### 11.1 Schema

```ts
interface KeyResult {
  id: string;
  content: string;
  completed: boolean;
  scheduled: boolean;
  linkedTaskId: string | null;
}

interface Objective {
  id: string;
  title: string;
  status: 'active' | 'completed';
  krList: KeyResult[];
  createdAt: string;
  completedAt: string | null;
}

interface ObjectiveArchive {
  id: string;
  objectiveTitle: string;
  krSnapshot: KeyResult[];
  completedAt: string;
  createdAt: string;
}
```

### 11.2 关系

```text
Objective.krList[] contains KeyResult
KeyResult.linkedTaskId ───► Task.id
Task.linkedKrId ───► KeyResult.id
ObjectiveArchive.krSnapshot[] copies KeyResult
```

### 11.3 业务约束

- KR 可独立 completed。
- KR scheduled 代表已经安排到任务板。
- KR linkedTaskId 指向生成的 task。
- Objective 有至少一个 KR 且全部 completed 时可归档。
- Archive 是 snapshot，不应随原 Objective 变化。
- 归档后 active objectives 中删除原 Objective。

### 11.4 删除规则

- 删除 Objective 应删除相关 inbox item 中 `objectiveId` 指向该 Objective 的条目。
- 当前删除 Objective 不自动删除 linked tasks；如需级联删除，需另行设计。
- 删除 KR 当前会从 KR list 移除，并清理 inbox 中同 id item。

## 12. InboxItem

### 12.1 Schema

```ts
interface InboxItem {
  id: string;
  objectiveId?: string;
  objectiveTitle?: string;
  content: string;
  completed: boolean;
  collectedAt: string;
  abilityId?: string;
  abilityPoints?: number;
  abilityName?: string;
}
```

### 12.2 来源

- QuickInbox 输入。
- KR collect to inbox。
- AbilityTask collect to inbox。

### 12.3 转换目标

当前 ActionDesk 支持转换为：

- Objective；
- Principle；
- Inspiration；
- CalendarEvent；
- Habit；
- Entertainment；
- TimeBlock；
- Task。

### 12.4 业务约束

- 转换成功后应 removeFromInbox。
- `completed` 字段当前在 QuickInbox 主 UI 中不显著使用。
- `abilityId` / `abilityPoints` 应在转 task 时带入。

## 13. AppConfig

### 13.1 Schema

```ts
interface AppConfig {
  currentWeekStart: string;
  lastVisitDate: string;
  theme: 'dark' | 'light';
  taskColumnWidth?: number;
}
```

### 13.2 说明

| 字段 | 用途 |
|---|---|
| `currentWeekStart` | 当前周起点 |
| `lastVisitDate` | day migration 判断 |
| `theme` | dark/light |
| `taskColumnWidth` | task column 宽度 |

### 13.3 业务约束

- `lastVisitDate` 用于避免同一天重复 migration。
- 新周时更新 `currentWeekStart`。
- theme 写入 `document.documentElement.dataset.theme`。

## 14. Module 系统

### 14.1 Schema

```ts
type GtdPhase = 'capture' | 'support' | 'execute' | 'insight';
type ModulePage = 'actionDesk' | 'reviewArchive' | 'system' | 'global';

type ModuleId =
  | 'inbox'
  | 'weekBoard'
  | 'okr'
  | 'principles'
  | 'calendar'
  | 'entertainment'
  | 'abilities'
  | 'reflectionLibrary'
  | 'objectiveArchive'
  | 'timeBlocks'
  | 'habits'
  | 'mood'
  | 'inspiration';

interface ModuleMeta {
  id: ModuleId;
  name: string;
  description: string;
  defaultEnabled: boolean;
  defaultZone: 'main' | 'side';
  icon: string;
  gtdPhase: GtdPhase;
  page: ModulePage;
  core: boolean;
}

interface ModuleConfig {
  enabledModules: ModuleId[];
}
```

### 14.2 业务约束

- `core = true` 的模块不可关闭。
- `defaultEnabled = true` 只代表新用户默认开启，不代表不可关闭。
- 旧数据 rehydrate 时应补齐 core modules。

## 15. Habit

### 15.1 Schema

```ts
type HabitColor = 'gold' | 'green' | 'blue' | 'red' | 'purple';
type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  frequency: HabitFrequency;
  targetDays: number;
  completions: Record<string, boolean>;
  createdAt: string;
}
```

### 15.2 说明

`completions` 以 date string 为 key，boolean 为 value。

业务约束：

- toggling 某天 habit completion 应只影响该 date key。
- streak / weekly progress 应从 completions 派生，不重复存储。

## 16. MoodEntry

### 16.1 Schema

```ts
interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  note: string;
  createdAt: string;
}
```

### 16.2 说明

- `mood` 与 `energy` 是数值型评分。
- 一天是否允许多条 mood 由 slice/组件规则决定；如要限定一天一条，需要明确 upsert 规则。
- Reflection 可读取当天 mood 作为上下文。

## 17. TimeBlock

### 17.1 Schema

```ts
interface TimeBlock {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  taskId?: string;
  color?: string;
  completed: boolean;
}
```

### 17.2 关系

```text
TimeBlock.taskId ───► Task.id
```

### 17.3 业务约束

- `startTime` / `endTime` 建议使用 `HH:mm`。
- 需要防止 endTime 早于 startTime。
- 如链接 task，task 删除后的 orphan 需要 DataHealth 或 UI 处理。

## 18. Layout

### 18.1 Schema

```ts
interface DashboardLayout {
  main: string[];
  side: string[];
}

interface TwoColumnLayout {
  left: string[];
  right: string[];
}
```

### 18.2 默认值

```ts
DEFAULT_DASHBOARD_LAYOUT = {
  main: ['timeBlocks', 'habits'],
  side: ['principles', 'calendar', 'entertainment', 'mood', 'inspiration'],
};

DEFAULT_REFLECTION_LAYOUT = {
  left: ['reflectionLibrary'],
  right: ['abilityReader', 'abilityTraining'],
};

DEFAULT_SYSTEM_LAYOUT = {
  left: ['moduleManager'],
  right: ['aboutBox', 'monkQuote', 'reflectionTemplateManager', 'dataHealthPanel', 'updatePanel', 'manualPanel'],
};
```

### 18.3 业务约束

- layout 数组可能包含旧 panel id；渲染时应过滤未知 id。
- 新增系统面板时，rehydrate 需要补齐必要 panel。
- `reflectionLayout` 使用 `abilityReader` / `abilityTraining`，它们不是 ModuleId，而是 panel id。

## 19. 引用关系总图

```text
Task ── linkedKrId ──► KeyResult
Task ── abilityId ───► Ability
KeyResult ── linkedTaskId ──► Task
Objective ── krList[] ─────► KeyResult
ObjectiveArchive ── krSnapshot[] ── copies KeyResult
Reflection ── templateId ──► ReflectionTemplate
Reflection ── linkedObjectiveIds[] ──► Objective
ReflectionQuestion ── abilityLink ──► Ability
InboxItem ── abilityId ──► Ability
InboxItem ── objectiveId ──► Objective
TimeBlock ── taskId ──► Task
```

## 20. DataHealth 检查建议

当前已检查：

- 必需字段是否存在；
- Task 是否引用不存在的 KR；
- Reflection 是否引用不存在的 template；
- 数据体积。

建议后续增加：

- TimeBlock.taskId orphan；
- Task.abilityId orphan；
- InboxItem.abilityId orphan；
- Reflection.linkedObjectiveIds orphan；
- enabledModules 是否包含未知 ModuleId；
- layout 是否包含未知 panel id；
- `__version` 是否缺失。

## 21. Migration checklist

新增或修改 schema 时，检查：

- [ ] 老数据没有该字段时默认值是什么？
- [ ] 是否需要 versioned migration？
- [ ] 是否需要从旧字段映射？
- [ ] 是否需要删除旧字段？
- [ ] 是否影响 `partialize`？
- [ ] 是否影响 export/import？
- [ ] 是否影响 DataHealth？
- [ ] 是否影响 UI 空状态？
- [ ] 是否影响 README 或 docs？
