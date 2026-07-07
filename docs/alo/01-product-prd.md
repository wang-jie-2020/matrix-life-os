# ASCII Life OS PRD

> 反推日期：2026-07-07  
> 状态：基于当前源码与 README 反推  
> 范围：Electron + React 桌面版 ALO

## 1. 产品定位

ASCII Life OS（ALO）是一款本地优先的个人 Life OS 桌面应用。它用 ASCII / Terminal / Monastic 风格，把个人生活管理拆成一个低干扰、可长期维护的闭环：

```text
捕捉 → 支撑 → 执行 → 洞察
```

ALO 不是普通 Todo App。它不追求“收集更多事项”，而是帮助用户：

1. 清空脑内缓存；
2. 把模糊念头澄清成系统对象；
3. 把目标拆成可执行任务；
4. 把执行结果沉淀为反思、能力和完成证据。

当前实现是 React + Electron 桌面应用，数据本地保存，不依赖账号或云端。

## 2. 背景与问题

用户的日常管理常见问题：

- 想法、任务、目标、反思散落在不同工具；
- Todo 列表容易膨胀为垃圾场；
- 目标和每日任务脱节；
- 已完成任务很多，但真正有长期价值的成果没有被沉淀；
- 云端效率工具常带来账号、同步、隐私和复杂协作负担。

ALO 的产品判断：

- 大脑是 CPU，不是硬盘；
- 普通任务是过程数据，应该轻；
- Objective 与 Reflection 是结果数据，应该重；
- 个人系统应本地优先、可裁剪、低装饰、高密度；
- 个人成长需要一点“带刺的镜子”，而不只是温柔鼓励。

## 3. 目标用户

### 3.1 核心用户

1. **个人效率 / 自我管理用户**
   - 需要管理任务、目标、习惯、反思、原则和情绪。
   - 希望用一个统一系统减少上下文切换。

2. **本地优先与隐私敏感用户**
   - 不想注册账号。
   - 不希望个人生活数据默认上云。
   - 接受 JSON 文件、导入导出、手动备份等本地化工作流。

3. **喜欢文本化和终端美学的用户**
   - 接受 ASCII、等宽字体、高密度面板。
   - 不需要圆角、卡片阴影、复杂图标库和算法推荐。

4. **希望把行动连接到长期成长的用户**
   - 不只想勾掉任务，还想看到 Objective、KR、能力、反思和归档之间的联系。

### 3.2 非目标用户

- 需要多人协作、权限、评论和团队看板的用户；
- 需要云同步、多端实时协同的用户；
- 需要完整项目管理、甘特图、任务依赖和报表的用户；
- 需要复杂日历、提醒、重复规则、第三方日历同步的用户；
- 偏好强视觉装饰和传统 SaaS 卡片 UI 的用户。

## 4. 产品原则

### 4.1 三页即全部

当前一级页面只有三个：

```text
[行动台] [回顾档案] [系统]
```

- **行动台**：承载捕捉、支撑、执行。
- **回顾档案**：承载洞察、复盘、长期证据。
- **系统**：承载模块、模板、数据健康、版本、手册等低频配置。

源码依据：`src/App.tsx` 中的 `page` 状态与页面渲染。

### 4.2 单向行动流

ALO 的模块不是 Notion 式任意互通，而是遵循大致的流向：

```text
捕捉（收集箱 / 灵感）
        ↓ clarify
支撑（原则 / 日历 / 习惯 / 心情 / 娱乐）
        ↓ arrange
执行（周看板 / OKR / 时间块）
        ↓ complete
洞察（反思 / 能力 / 光荣榜）
```

当前最明确的单向流在 `src/pages/ActionDesk.tsx`：QuickInbox item 可以通过拖拽被转换为任务、目标、原则、灵感、日历、习惯、娱乐或时间块。

### 4.3 过程轻，结果重

普通 completed tasks 会在新周被清理；长期保存的核心证据是：

- Reflection；
- ObjectiveArchive；
- 能力分数；
- 模块状态与个人配置。

源码依据：

- `src/hooks/useDayMigration.ts`
- `src/hooks/useObjectiveAutoArchive.ts`
- `src/store/slices/archiveSlice.ts`

### 4.4 本地优先

ALO 当前不设计账号与云同步。数据通过 Zustand persist 落到本地：

- Electron 环境：`alo-data.json`、`.bak`、`.tmp`；
- 浏览器/dev 环境：`localStorage` fallback。

源码依据：

- `src/utils/electronStorage.ts`
- `electron/main.cjs`
- `electron/preload.cjs`

### 4.5 模块可裁剪

每个模块有 `defaultEnabled`、`defaultZone`、`gtdPhase`、`page` 和 `core` 标记。核心模块不可关闭，非核心模块可由用户按阶段启用/关闭。

源码依据：`src/features/modules/moduleRegistry.ts`、`src/features/modules/ModuleManager.tsx`。

## 5. 信息架构

## 5.1 一级页面

| 页面 | 英文名 | 职责 | 当前入口 |
|---|---|---|---|
| 行动台 | `ActionDesk` | 捕捉、支撑、执行、日常操作 | `src/pages/ActionDesk.tsx` |
| 回顾档案 | `ReviewArchive` | 反思、能力、目标归档、洞察 | `src/pages/ReviewArchive.tsx` |
| 系统 | `System` | 模块、模板、数据健康、更新、手册 | `src/pages/System.tsx` |

### 5.2 GTD phase

| 阶段 | 英文 | 产品含义 |
|---|---|---|
| 捕捉 | `capture` | 快速记录，不判断、不排序 |
| 支撑 | `support` | 原则、日历、习惯、情绪、娱乐等生活支撑信息 |
| 执行 | `execute` | 周任务、OKR、时间块，唯一直接产生完成的区域 |
| 洞察 | `insight` | 反思、能力、目标归档，形成长期证据 |

源码依据：`src/types/index.ts` 的 `GtdPhase` 与 `src/features/modules/moduleRegistry.ts`。

## 6. 模块地图

以下以 `MODULE_REGISTRY` 为准。注意：`defaultEnabled` 不等于 `core`；例如 Calendar 与 Entertainment 默认开启，但 `core: false`。

| 阶段 | 模块 | ModuleId | 页面 | 默认开启 | Core | 产品职责 |
|---|---|---|---|---:|---:|---|
| 捕捉 | 收集箱 | `inbox` | ActionDesk | 是 | 是 | 捕捉任意想法，稍后澄清 |
| 捕捉 | 灵感仓库 | `inspiration` | ActionDesk | 否 | 否 | 保存灵感，可转执行项 |
| 支撑 | 日历 | `calendar` | ActionDesk | 是 | 否 | 轻量日期视图、事件与日期上下文 |
| 支撑 | 原则 | `principles` | ActionDesk | 是 | 是 | 保存个人原则，作为行动判断锚点 |
| 支撑 | 习惯 | `habits` | ActionDesk | 否 | 否 | 追踪重复性行为与 streak |
| 支撑 | 娱乐 | `entertainment` | ActionDesk | 是 | 否 | 安排恢复性娱乐，承认能量管理 |
| 执行 | 周看板 | `weekBoard` | ActionDesk | 是 | 是 | 七日任务看板，执行核心 |
| 执行 | OKR | `okr` | ActionDesk | 是 | 是 | Objective / KR 拆解，连接目标与任务 |
| 执行 | 时间块 | `timeBlocks` | ActionDesk | 否 | 否 | 把一天切成可执行时间段 |
| 洞察 | 能力 | `abilities` | ReviewArchive | 是 | 是 | 能力雷达与训练 |
| 洞察 | 反思档案 | `reflectionLibrary` | ReviewArchive | 是 | 是 | 每日反思、历史记录、标签 |
| 洞察 | 光荣榜 | `objectiveArchive` | ReviewArchive | 是 | 是 | 已完成 Objective 的长期证据 |
| 洞察 | 心情 | `mood` | ActionDesk / ReviewArchive | 否 | 否 | 心情与能量记录、趋势 |

## 7. 核心功能需求

### R1. 应用壳与三页导航

- 默认进入 ActionDesk。
- 顶部导航只在 ActionDesk / ReviewArchive / System 间切换。
- 主题按钮在暗色/亮色间切换。
- 系统页可显示更新提示标记。
- 存储体积接近上限时显示顶部 warning。

源码依据：`src/App.tsx`。

### R2. QuickInbox 捕捉

- 用户可以在行动台顶部快速输入任意内容。
- 按 Enter 创建 inbox item。
- inbox item 以可拖拽条目展示。
- 用户可以删除 inbox item。
- 空状态提示用户“先丢进来，再决定怎么处理”。

源码依据：`src/features/inbox/QuickInbox.tsx`。

### R3. Inbox 澄清与转换

当前挂载的主流程是拖拽澄清。Inbox item 可转换为：

- Objective；
- Principle；
- Inspiration；
- CalendarEvent；
- Habit；
- Entertainment；
- TimeBlock；
- Task。

源码依据：`src/pages/ActionDesk.tsx` 的 `handleDragEnd`。

### R4. 周任务板

- 展示当前周七日列。
- 支持周切换。
- 支持新增、编辑、删除、完成任务。
- 支持任务跨列移动和列内排序。
- 已迁移任务显示来源标记。
- KR 来源任务显示 `[KR]`。

源码依据：`src/features/tasks/TaskBoard.tsx`、`src/features/tasks/TaskColumn.tsx`、`src/features/tasks/TaskCard.tsx`、`src/store/slices/taskSlice.ts`。

### R5. OKR 与 KR 调度

- 用户可创建 Objective。
- 用户可为 Objective 添加 KR。
- KR 可完成、取消完成、编辑、删除。
- KR 可拖到任务板某一天，生成 linked task。
- 如果 KR 已有关联 task，重新调度时删除旧 task 并创建新 task。
- linked task 完成时同步完成 KR。
- linked task 取消完成时同步取消 KR。
- Objective 的 KR 全部完成后自动进入 archive。

源码依据：`src/features/okr/OKRPanel.tsx`、`src/pages/ActionDesk.tsx`、`src/features/tasks/TaskCard.tsx`、`src/hooks/useObjectiveAutoArchive.ts`。

### R6. Ability / 能力系统

- 用户可维护能力项。
- 能力有当前分数和最大分数。
- 任务可关联能力与分值。
- 完成 ability-linked task 时增加能力分。
- 能力分不超过 maxScore。

注意：当前完成能力任务增加分数，但取消完成任务不会自动扣回分数；这是当前实现事实，是否调整需作为后续产品决策。

源码依据：`src/types/index.ts`、`src/store/slices/abilitySlice.ts`、`src/features/tasks/TaskCard.tsx`。

### R7. Reflection / 每日反思

- Reflection 基于 template。
- Template question 支持 text / number / select / boolean。
- required question 必须填写。
- 同一天最多一条 reflection，重复保存为更新。
- Reflection 可关联 Objective。
- Reflection 可生成 tags。
- 用户可管理 reflection templates，并设置默认模板。

源码依据：`src/types/index.ts`、`src/store/slices/reflectionSlice.ts`、`src/store/slices/reflectionTemplateSlice.ts`、`src/features/reflections/*`。

### R8. ObjectiveArchive / 光荣榜

- Objective 全部 KR 完成后归档。
- Archive 保存 Objective title、KR snapshot、createdAt、completedAt。
- ReviewArchive 展示历史 Objective 成果。
- 删除 archive item 应谨慎，当前组件使用确认式删除。

源码依据：`src/store/slices/archiveSlice.ts`、`src/features/archive/ObjectiveArchivePanel.tsx`。

### R9. 模块管理

- System 页面提供 ModuleManager。
- 模块按 GTD phase 分组展示。
- Core 模块不可关闭。
- 非 core 模块可开关。
- 旧数据 rehydrate 时会补齐核心模块。

源码依据：`src/features/modules/ModuleManager.tsx`、`src/features/modules/moduleRegistry.ts`、`src/store/slices/moduleSlice.ts`、`src/store/useAppStore.ts`。

### R10. 数据健康

- System 页面展示 DataHealthPanel。
- 检查必需字段是否存在。
- 检查 task 是否引用不存在的 KR。
- 检查 reflection 是否引用不存在的 template。
- 检查数据体积。
- 状态分 ok / warn / error。

源码依据：`src/features/system/DataHealthPanel.tsx`。

## 8. 数据策略

### 8.1 持久化字段

`useAppStore` 的 `partialize` 持久化主要业务字段：

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

新增持久化字段必须加入 `partialize`，否则重启后会丢失。

### 8.2 数据迁移

rehydrate 时会执行：

1. 旧 Reflection 格式迁移；
2. 默认 reflection template 补齐；
3. layout 默认值补齐；
4. system panels 补齐；
5. core modules 补齐；
6. app version migration。

源码依据：`src/store/useAppStore.ts`、`src/utils/migrateAppData.ts`、`src/utils/migrateReflectionData.ts`。

## 9. 产品边界与非目标

当前 PRD 明确不包含：

- 账号系统；
- 云同步；
- 多人协作；
- 权限、评论、共享；
- 复杂项目管理；
- 完整日历系统；
- 外部第三方系统深度集成；
- 永久保存所有普通 completed tasks；
- 现代 SaaS 圆角卡片式 UI。

## 10. 当前实现差异说明

以下能力在 README、源码或文案中有线索，但不能直接写成已上线核心能力：

- `DataBackupPanel` / `DataBackupRitual`：存在相关代码，但当前 System 挂载与完整备份范围需谨慎确认。
- `InboxClarifier`：存在弹窗式澄清组件，但当前主流程是拖拽澄清，未确认挂载。
- `ModulePicker`：存在组件，但当前模块管理以 `ModuleManager` 为准。
- 部分 Ability 管理组件可能是候选/遗留实现，当前用户可达路径以 `ReviewArchive` 实际挂载为准。

详细记录见 [`05-implementation-notes-and-gaps.md`](05-implementation-notes-and-gaps.md)。
