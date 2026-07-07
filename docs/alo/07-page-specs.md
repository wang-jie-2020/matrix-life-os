# 页面级规格

> 反推日期：2026-07-07  
> 目标：为从 0-1 实现 ALO 提供页面结构、组件树、数据来源和交互规格。  
> 范围：ActionDesk / ReviewArchive / System 三页。

## 1. 全局页面壳

### 1.1 App Shell

源码参考：`src/App.tsx`

```text
App
├── nav
│   ├── logo / product title
│   ├── ActionDesk tab
│   ├── ReviewArchive tab
│   ├── System tab + update marker
│   └── theme toggle
├── storage warning banner
├── main
│   ├── ActionDesk | ReviewArchive | System
└── last words overlay
```

### 1.2 顶部导航规格

| 项 | 规格 |
|---|---|
| 高度 | 48px |
| 背景 | `--bg-primary` |
| 底边框 | `1px solid var(--border-primary)` |
| 当前页 | `--accent-gold` + 方括号 |
| 非当前页 | `--text-secondary` |
| hover | `--text-primary` |
| 主题按钮 | dark: `[◐]`，light: `[◑]` |

### 1.3 storage warning

触发：`storageWarning === true`。

内容：

- 警告文案；
- `[导出并清理]`：跳转 System，并关闭 warning；
- `[x]`：关闭 warning。

注意：当前 System 尚未正式挂载 DataBackupRitual，因此“导出并清理”是产品意图，实际清理/导出入口需补齐。

### 1.4 Last Words Overlay

Electron before quit 时触发。

条件：当天没有 reflection。

规格：

- fixed bottom；
- `--bg-secondary`；
- 顶部 border；
- 默认 opacity 0；
- 触发后滑入。

## 2. ActionDesk 页面规格

源码参考：`src/pages/ActionDesk.tsx`

### 2.1 页面职责

ActionDesk 是日常主工作台，承载：

- 捕捉；
- 支撑；
- 执行；
- inbox 澄清；
- KR 调度；
- task 移动和排序。

### 2.2 组件树

```text
ActionDesk
└── DndContext
    ├── SarcasticMonologueBanner
    ├── QuickInbox
    ├── DroppableZone(drop-weekboard)
    │   └── TaskBoard
    ├── dashboard-layout
    │   ├── main-area
    │   │   ├── DroppableZone(drop-okr)
    │   │   │   └── OKRPanel
    │   │   └── DroppableColumn(actiondesk-main)
    │   │       └── SortableContext(visibleMain)
    │   │           └── DraggablePanel
    │   │               ├── TimeBlockPanel
    │   │               └── HabitTrackerPanel
    │   └── side-panel
    │       ├── AsciiBox(DailyProgress)
    │       │   └── TodayProgress
    │       ├── DroppableZone(drop-principles)
    │       │   └── PrinciplesPanel
    │       ├── DroppableZone(drop-calendar)
    │       │   └── AsciiBox(Calendar)
    │       │       └── MiniCalendar
    │       ├── DroppableZone(drop-entertainment)
    │       │   └── EntertainmentPanel
    │       ├── MoodTrackerPanel
    │       └── DroppableZone(drop-inspiration)
    │           └── InspirationVaultPanel
    └── DragOverlay
```

### 2.3 布局

| 区域 | 位置 | 说明 |
|---|---|---|
| Monologue | 顶部，可选 | 有文案时显示 |
| QuickInbox | 顶部固定 | 永远在 TaskBoard 之前 |
| TaskBoard | 顶部固定 | 核心执行区 |
| Main area | 下半区左侧，约 61.8% | OKR 固定在上，其他 main panel 可拖 |
| Side panel | 下半区右侧，约 38.2% | 支撑信息 |

### 2.4 数据来源

| 组件 | Store / 数据 |
|---|---|
| QuickInbox | `inboxItems`、`addQuickInboxItem`、`deleteInboxItem` |
| TaskBoard | `tasks`、`config.currentWeekStart`、task actions |
| OKRPanel | `objectives`、OKR actions |
| TodayProgress | `tasks` |
| PrinciplesPanel | `principles` |
| MiniCalendar | `calendarEvents`、`tasks`、`reflections`、`habits` 等 |
| HabitTrackerPanel | `habits` |
| MoodTrackerPanel | `moods` |
| TimeBlockPanel | `timeBlocks`、`tasks` |
| InspirationVaultPanel | `inspirations` |
| visible modules | `enabledModules`、`dashboardLayout` |

### 2.5 DnD types

| Active id | 类型 | 行为 |
|---|---|---|
| `inbox-{id}` | Inbox item | 转换为目标模块对象 |
| `kr-{id}` | KeyResult | 调度为 linked task |
| task id | Task | 移动或排序 |
| panel id | Panel | ActionDesk main panels 排序 |

### 2.6 Drop target 规格

| Drop target | 结果 |
|---|---|
| `drop-weekboard` | 创建今日 task |
| `column-{date}` | 创建/移动到指定日期 |
| task id | 创建到该 task 所在日期，或 task reorder |
| `drop-okr` | 创建 Objective |
| `drop-principles` | 创建 Principle |
| `drop-calendar` | 创建今日 CalendarEvent |
| `calendar-day-{date}` | 创建指定日期 CalendarEvent |
| `drop-habits` | 创建 Habit |
| `drop-entertainment` | 创建 Entertainment |
| `drop-timeblocks` | 创建 TimeBlock |
| `drop-inspiration` | 创建 Inspiration |

### 2.7 空状态

必须提供：

- QuickInbox 空状态；
- TaskColumn 空状态；
- OKR 空状态；
- Principles 空状态；
- 可选模块空状态。

空状态应包含：

1. 当前为空；
2. 下一步怎么做；
3. 保持 ALO 文案语气。

### 2.8 移动/窄屏规则

- Dashboard 纵向堆叠。
- TaskBoard 横向滚动。
- TaskColumn 保持固定最小宽度，不压缩到不可读。
- Top nav 需要保持可点击；未来如做小程序，应重做移动 IA。

## 3. QuickInbox 规格

源码参考：`src/features/inbox/QuickInbox.tsx`

### 3.1 结构

```text
AsciiBox(title=quickInbox)
├── input
└── item list | empty state
```

### 3.2 输入

| 行为 | 规格 |
|---|---|
| 输入非空 + Enter | 创建 inbox item，清空输入 |
| 输入空白 + Enter | 不创建 |
| placeholder | “脑中闪过的任何事，先丢进来……” |

### 3.3 item

结构：

```text
○ {content} [x]
```

交互：

- 可拖拽；
- `[x]` 删除；
- dragging opacity 0.5；
- cursor: grab / grabbing。

## 4. TaskBoard 规格

### 4.1 结构

```text
TaskBoard
├── week navigation
└── task-board-scroll
    ├── TaskColumn(MON)
    ├── TaskColumn(TUE)
    ├── TaskColumn(WED)
    ├── TaskColumn(THU)
    ├── TaskColumn(FRI)
    ├── TaskColumn(SAT)
    └── TaskColumn(SUN)
```

### 4.2 TaskColumn

每列应支持：

- 日期标题；
- 今日高亮；
- task list；
- 新增 task 输入；
- droppable column。

### 4.3 TaskCard

显示：

- `☐` / `☑`；
- content；
- ability label `[能力 +分值]`；
- migrated label `⤴ 来自昨日`；
- source label `[KR]`；
- hover actions `[✎] [x]`。

交互：

- 点击状态切换完成；
- hover 显示编辑/删除；
- inline edit；
- Enter 保存；
- Escape 取消；
- drag move/reorder。

## 5. OKRPanel 规格

### 5.1 结构

```text
OKRPanel
├── create objective input
└── objective list
    └── objective item
        ├── title
        ├── objective actions
        ├── KR list
        │   └── draggable KR
        └── add KR input
```

### 5.2 Objective 行为

- 新增 Objective 默认 `status = active`。
- Objective 可删除。
- Objective title 可编辑。
- Objective 下可新增 KR。
- Objective 完成与归档由 KR 完成状态驱动。

### 5.3 KR 行为

- 可完成/取消完成。
- 可编辑。
- 可删除。
- 可拖到 TaskBoard 调度。
- scheduled KR 记录 `linkedTaskId`。

## 6. ReviewArchive 页面规格

源码参考：`src/pages/ReviewArchive.tsx`

### 6.1 页面职责

ReviewArchive 是洞察页，负责：

- 今日反思；
- 反思历史；
- 目标成果归档；
- 能力阅读和训练；
- 心情趋势。

### 6.2 组件树

```text
ReviewArchive
├── row 1
│   ├── left column
│   │   ├── AsciiBox(Today's Reflection)
│   │   │   └── ReflectionQuickEntry
│   │   ├── AsciiBox(Reflection Library)
│   │   │   └── ReflectionGrid
│   │   └── ObjectiveArchivePanel
│   └── right column
│       ├── AbilityReader
│       └── AbilityTraining
├── row 2
│   └── MoodTrackerPanel
└── ReflectionDetailModal
```

### 6.3 数据来源

| 组件 | 数据 |
|---|---|
| ReflectionQuickEntry | `reflections`、`reflectionTemplates`、`objectives`、`moods` |
| ReflectionGrid | `reflections` |
| ObjectiveArchivePanel | `archives` |
| AbilityReader | `abilities` |
| AbilityTraining | `abilities`、`inboxItems` |
| MoodTrackerPanel | `moods` |

### 6.4 ReflectionQuickEntry 状态

| 状态 | UI |
|---|---|
| 今天未反思 | 显示表单 |
| 今天已反思 | 显示完成态与可能的查看/编辑入口 |
| 无模板 | 使用默认模板或提示创建模板 |
| 必填未填 | 阻止保存 |

### 6.5 ReflectionGrid

应支持：

- 历史列表；
- 查看详情；
- 标签显示；
- 空状态；
- 排序/分页如当前实现。

## 7. System 页面规格

源码参考：`src/pages/System.tsx`

### 7.1 页面职责

System 是低频配置页，不承载日常执行。

### 7.2 组件树

```text
System
└── DndContext
    ├── left column
    │   └── DraggablePanel(moduleManager)
    │       └── AsciiBox(ModuleManager)
    │           └── ModuleManager
    └── right column
        ├── DraggablePanel(aboutBox)
        ├── DraggablePanel(monkQuote)
        ├── DraggablePanel(reflectionTemplateManager)
        ├── DraggablePanel(dataHealthPanel)
        ├── DraggablePanel(updatePanel)
        └── DraggablePanel(manualPanel)
```

### 7.3 默认布局

来自 `DEFAULT_SYSTEM_LAYOUT`：

```ts
left: ['moduleManager']
right: ['aboutBox', 'monkQuote', 'reflectionTemplateManager', 'dataHealthPanel', 'updatePanel', 'manualPanel']
```

### 7.4 Panel 行为

- 左列和右列内部可排序。
- 当前不支持跨列移动。
- 拖拽距离阈值 8px。
- 排序后写入 `systemLayout`。

### 7.5 ModuleManager

规格：

- 按 phase 分组；
- 显示 icon、name、description；
- core module 显示“核心”；
- core module 不可关闭；
- optional module 可开关；
- 状态使用 `[●]` / `[○]`。

### 7.6 ReflectionTemplateManager

规格：

- 显示模板列表；
- 支持新增/编辑/删除；
- 支持设置默认；
- 至少确保默认模板存在。

### 7.7 DataHealthPanel

规格：

- 手动触发检查；
- 展示 structureOk；
- 展示 orphanedCount；
- 展示 size；
- 状态：ok / warn / error。

### 7.8 UpdatePanel

规格：

- 展示当前版本；
- 检查最新版本；
- 展示更新状态；
- App 级 update marker 由启动检查驱动。

### 7.9 ManualPanel / ManualModal

规格：

- System 页有手册入口；
- modal 支持 ESC / overlay close；
- 内容用于解释 ALO 用法和哲学。

## 8. 页面状态矩阵

| 页面 | Loading | Empty | Error | Disabled |
|---|---|---|---|---|
| ActionDesk | 通常不需要全页 loading | Inbox/Task/OKR/模块局部 empty | DnD 失败静默不变 | disabled module 不渲染 |
| ReviewArchive | 通常不需要全页 loading | 无 reflection / archive / ability | 模板缺失时 fallback/default | disabled abilities/mood 不渲染 |
| System | DataHealth checking | 无模块不应出现 | health error 状态 | core module toggle disabled |

## 9. 页面开发验收 checklist

### ActionDesk

- [ ] QuickInbox 输入和删除可用。
- [ ] TaskBoard 七日列可用。
- [ ] Task 新增、编辑、删除、完成可用。
- [ ] Inbox → Task 可用。
- [ ] Inbox → Objective / Principle / Calendar / Habit 等转换按需求可用。
- [ ] KR → Task 可用。
- [ ] Task 完成同步 KR。
- [ ] 所有 KR 完成后归档。
- [ ] 可选模块受 enabledModules 控制。

### ReviewArchive

- [ ] 今日 reflection 可保存。
- [ ] 同日 reflection upsert。
- [ ] 历史 reflection 可查看。
- [ ] Objective archive 可查看。
- [ ] Abilities 受模块开关控制。
- [ ] Mood 受模块开关控制。

### System

- [ ] ModuleManager 可开关非 core 模块。
- [ ] Core 模块不可关闭。
- [ ] System panels 可排序。
- [ ] DataHealth 可运行。
- [ ] UpdatePanel 可检查。
- [ ] Manual 可打开。
- [ ] 当前未挂载能力不出现在 UI 文档中作为已上线能力。
