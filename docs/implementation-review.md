# Implementation Review

本文档审查当前实现与 `docs/project-requirements.md`、`CONTEXT.md` 的一致性。

本次审查只判断“现在代码做出来的产品行为是否符合需求”，不提出代码结构设计，不要求立刻重构，也不修改源码。

## 结论

当前实现不是从零开始不可用的状态。周任务板和本地持久化已经有可保留基础。

主要风险在于：当前产品表面仍然是旧的“大而全管理系统”，而正式需求已经收敛为四类核心记录的 CRUD。实现中保留了 OKR/KR、能力分、原则、习惯、心情、娱乐、时间块、目标归档、反思模板、更新检查、备份导出提示等旧功能。这会让后续修改难以下手，因为用户看到的产品范围和文档定义的产品范围不一致。

## Must Fix

### 1. 更新检查与“无网络核心使用”冲突

需求要求产品不需要账号、云同步或网络访问即可核心使用，并且 System Area 只要求版本信息。

当前实现：

- `src/App.tsx:34` 到 `src/App.tsx:50` 在应用启动后自动调用 `checkUpdate`。
- `src/features/system/UpdatePanel.tsx:18` 到 `src/features/system/UpdatePanel.tsx:43` 提供手动检查更新。
- `src/utils/checkUpdate.ts:25` 到 `src/utils/checkUpdate.ts:29` 访问 GitHub API、Shields、GitHub releases URL。

影响：

- 用户即使只使用本地记录，也会遇到更新检查逻辑。
- System Area 的“版本信息”被扩展成“更新服务”。
- 这与当前需求方向不一致。应保留版本显示，移除更新检查行为和更新入口。

### 2. 备份、导出、恢复被提前宣传

需求明确说：手动备份和恢复不是当前要求，产品不得宣传 backup、export、import、recovery。

当前实现：

- `src/App.tsx:219` 到 `src/App.tsx:253` 的存储警告文案建议导出备份并清理。
- `src/store/useAppStore.ts:94` 到 `src/store/useAppStore.ts:99` 的存储体积检查也输出 export and clean up recommended。
- `src/utils/electronStorage.ts:8` 到 `src/utils/electronStorage.ts:13` 注释描述自动 `.bak`、corruption recovery 等能力。

影响：

- 用户会以为备份/导出/恢复是当前产品承诺的一部分。
- 后续 review 会反复卡在“到底有没有备份功能”。
- 应先从产品 UI 和正式文档中移除这类承诺；内部已有的文件写入保护可以另行记录为实现细节，但不能作为当前产品功能宣传。

### 3. Capture Note 实现成了流转入口，且缺少编辑

需求要求 Capture Note 只需要创建、查看、编辑、删除；不需要转换成任务、目标或其他记录。

当前实现：

- `src/features/inbox/QuickInbox.tsx:75` 到 `src/features/inbox/QuickInbox.tsx:130` 支持新增、查看、删除 inbox item，但没有编辑入口。
- `src/features/inbox/QuickInbox.tsx:14` 到 `src/features/inbox/QuickInbox.tsx:17` 把 inbox item 做成可拖拽对象。
- `src/pages/ActionDesk.tsx:209` 到 `src/pages/ActionDesk.tsx:278` 支持把 inbox item 拖到 OKR、原则、灵感、日历、习惯、娱乐、时间块、周任务板等目标。

影响：

- “捕获项”不是简单记录，而是旧工作流的入口。
- 正式需求里的 edit 缺失。
- 需求已经明确不要求转换，当前转换行为会制造范围膨胀。

### 4. Goal Note 实现成了 OKR/KR 系统

需求要求 Goal Note 只需要创建、查看、编辑、删除；不需要 key results、任务链接、进度评分或完成状态。

当前实现：

- `src/features/okr/OKRPanel.tsx:162` 到 `src/features/okr/OKRPanel.tsx:486` 实现的是 Objective + KR。
- `src/features/okr/OKRPanel.tsx:202` 到 `src/features/okr/OKRPanel.tsx:208` 支持添加 KR。
- `src/features/okr/OKRPanel.tsx:343` 到 `src/features/okr/OKRPanel.tsx:356` 支持 KR 完成、删除、编辑。
- `src/pages/ActionDesk.tsx:179` 到 `src/pages/ActionDesk.tsx:206` 支持把 KR 拖到任务板，并创建关联任务。
- `src/types/index.ts:94` 到 `src/types/index.ts:109` 的数据模型包含 KeyResult、Objective status、linkedTaskId。

影响：

- 目标记录比需求复杂很多。
- 任务和目标之间产生了当前需求不需要的链接。
- 完成状态、KR 和任务联动会干扰后续按“Goal Note CRUD”重做。

### 5. Reflection 缺少删除入口，并且有多余联动

需求要求 Reflection 支持创建、查看、查看单条、编辑、删除、分配到某一天。

当前实现：

- `src/features/reflections/ReflectionQuickEntry.tsx:86` 到 `src/features/reflections/ReflectionQuickEntry.tsx:101` 支持创建当天反思。
- `src/features/reflections/ReflectionGrid.tsx:61` 到 `src/features/reflections/ReflectionGrid.tsx:67` 支持列表和进入详情。
- `src/features/reflections/ReflectionDetailModal.tsx:75` 到 `src/features/reflections/ReflectionDetailModal.tsx:83` 支持编辑。
- `src/features/reflections/ReflectionDetailModal.tsx:154` 到 `src/features/reflections/ReflectionDetailModal.tsx:178` 只有编辑按钮，没有删除按钮。
- `src/features/reflections/ReflectionDetailModal.tsx:107` 到 `src/features/reflections/ReflectionDetailModal.tsx:132` 展示关联目标。
- `src/types/index.ts:67` 到 `src/types/index.ts:77` 的 Reflection 包含 templateId、tags、linkedObjectiveIds。

影响：

- 反思 CRUD 中 delete 不完整。
- 反思被模板、标签、目标关联扩展，超出当前需求。
- 后续整改应满足基本 CRUD，并清除不属于正式需求的联动。

## Partial Match

### 任务板基本符合需求

当前实现已经覆盖任务需求的大部分内容：

- `src/features/tasks/TaskBoard.tsx:27` 默认当前周。
- `src/features/tasks/TaskBoard.tsx:36` 到 `src/features/tasks/TaskBoard.tsx:149` 渲染一周七天。
- `src/features/tasks/TaskBoard.tsx:42` 到 `src/features/tasks/TaskBoard.tsx:44` 支持上一周、下一周、当前周。
- `src/features/tasks/TaskColumn.tsx:33` 到 `src/features/tasks/TaskColumn.tsx:44` 在具体日期列下创建任务。
- `src/features/tasks/TaskColumn.tsx:25` 到 `src/features/tasks/TaskColumn.tsx:27` 标记当天列。
- `src/features/tasks/TaskCard.tsx:36` 到 `src/features/tasks/TaskCard.tsx:49` 支持编辑任务。
- `src/features/tasks/TaskCard.tsx:62` 到 `src/features/tasks/TaskCard.tsx:94` 支持完成/取消完成。
- `src/features/tasks/TaskCard.tsx:259` 到 `src/features/tasks/TaskCard.tsx:283` 支持删除任务。
- `src/pages/ActionDesk.tsx:281` 到 `src/pages/ActionDesk.tsx:310` 支持任务移动和同日重排。

保留风险：

- `src/features/tasks/TaskCard.tsx:62` 到 `src/features/tasks/TaskCard.tsx:94` 把任务完成和能力分、KR 完成、目标归档联动。
- `src/features/tasks/TaskColumn.tsx:141` 到 `src/features/tasks/TaskColumn.tsx:186` 在新增任务时暴露能力关联和分值。

结论：任务板可以作为第一批保留对象，但应清除不属于正式需求的能力/KR联动。

### System Area 有基础，但内容不干净

需求要求 System Area 支持：模块/功能显示控制、用户能理解的数据状态、版本信息、短帮助。

当前实现：

- `src/pages/System.tsx:130` 到 `src/pages/System.tsx:134` 渲染 ModuleManager。
- `src/features/modules/ModuleManager.tsx:10` 到 `src/features/modules/ModuleManager.tsx:167` 提供模块显示控制。
- `src/pages/System.tsx:97` 到 `src/pages/System.tsx:100` 渲染更新面板和帮助面板。
- `src/pages/System.tsx:101` 到 `src/pages/System.tsx:102` 渲染 DataHealthPanel。

偏差：

- `src/features/system/UpdatePanel.tsx` 包含更新检查，不只是版本信息。
- `src/pages/System.tsx:124` 到 `src/pages/System.tsx:128` 暴露反思模板管理，不是当前需求。
- `src/features/system/DataHealthPanel.tsx:31` 到 `src/features/system/DataHealthPanel.tsx:67` 检查旧模块字段和旧关系，包括 principles、abilities、entertainments、calendarEvents、KR、reflectionTemplates。

结论：System Area 的位置和能力可保留，但内容需要按当前需求重新收敛。

### 本地持久化有基础，但保存失败提示不完整

需求要求核心记录关闭重开仍存在，并且用户能理解数据是否本地保存、保存在哪里、保存了什么；如果核心记录不能保存，产品必须警告。

当前实现：

- `src/store/useAppStore.ts:45` 到 `src/store/useAppStore.ts:70` 使用 Zustand persist 和 `electronStorage`。
- `src/store/useAppStore.ts:71` 到 `src/store/useAppStore.ts:93` 持久化包含核心记录，也包含大量旧模块数据。
- `src/utils/electronStorage.ts:25` 到 `src/utils/electronStorage.ts:158` 在 Electron 下通过 IPC 保存。
- `src/utils/electronStorage.ts:160` 到 `src/utils/electronStorage.ts:185` 在浏览器下回退 localStorage。

风险：

- 浏览器回退保存失败时，`src/utils/electronStorage.ts:171` 到 `src/utils/electronStorage.ts:177` 静默忽略。
- Electron 保存连续失败时，`src/utils/electronStorage.ts:81` 到 `src/utils/electronStorage.ts:87` 只写 console error，未看到明确用户提示。
- 当前 DataHealthPanel 更像结构检查，不等于“用户能理解的本地数据状态”。

结论：本地保存能力可能已经能跑，但产品层的数据状态说明和保存失败警告仍需要补齐。

## Scope Creep

以下实现不是当前正式需求，后续应从源码中清除，除非先另写正式需求。

- 原则：`src/pages/ActionDesk.tsx:18`、`src/features/modules/moduleRegistry.ts:40` 到 `src/features/modules/moduleRegistry.ts:50`。
- 能力分：`src/types/index.ts:35` 到 `src/types/index.ts:47`，并且任务创建/完成会使用。
- 习惯：`src/pages/ActionDesk.tsx:19`、`src/features/modules/moduleRegistry.ts:51` 到 `src/features/modules/moduleRegistry.ts:61`。
- 心情：`src/pages/ActionDesk.tsx:20`、`src/features/modules/moduleRegistry.ts:143` 到 `src/features/modules/moduleRegistry.ts:153`。
- 时间块：`src/pages/ActionDesk.tsx:21`、`src/features/modules/moduleRegistry.ts:97` 到 `src/features/modules/moduleRegistry.ts:107`。
- 灵感库：`src/pages/ActionDesk.tsx:22`、`src/features/modules/moduleRegistry.ts:16` 到 `src/features/modules/moduleRegistry.ts:26`。
- 娱乐：`src/pages/ActionDesk.tsx:17`、`src/features/modules/moduleRegistry.ts:62` 到 `src/features/modules/moduleRegistry.ts:72`。
- 日历：`src/pages/ActionDesk.tsx:27`、`src/features/modules/moduleRegistry.ts:29` 到 `src/features/modules/moduleRegistry.ts:39`。
- 目标归档：`src/features/modules/moduleRegistry.ts:132` 到 `src/features/modules/moduleRegistry.ts:142`。
- 反思模板管理：`src/pages/System.tsx:124` 到 `src/pages/System.tsx:128`。
- 退出前 last words 浮层：`src/App.tsx:52` 到 `src/App.tsx:68`、`src/App.tsx:280` 到 `src/App.tsx:303`。

这些内容应在后续整改中删除，不能再作为隐藏功能、实验模块或当前产品范围的核心部分保留。

## User-Facing Copy Note

此前静态审查中，部分源码内容在 PowerShell 默认输出下显示为 mojibake。复核后确认：这些位置按 UTF-8 读取时是正常中文，例如：

- `src/App.tsx:137` 显示为 `[行动台]`。
- `src/features/tasks/TaskBoard.tsx:15` 到 `src/features/tasks/TaskBoard.tsx:23` 显示为 `周一` 到 `周日`。
- `src/features/inbox/QuickInbox.tsx:93` 显示为 `脑中闪过的任何事，先丢进来……`。

结论：源码中文不是当前实现风险，不应作为整改项。后续只需要在核心路径上审查文案是否符合当前需求，避免旧的宏大叙事、调侃文案或概念术语继续出现在产品表面。

## Suggested Work Order

建议下一步不要先做大重构，而是先把产品表面和正式需求对齐：

1. 移除更新检查，只保留版本显示。
2. 移除备份、导出、导入、恢复相关 UI 文案和入口。
3. 把 Quick Inbox 对齐为 Capture Note：补编辑，去掉转换流转。
4. 把 OKRPanel 对齐为 Goal Note：清除 KR、完成状态、任务链接、归档行为。
5. 补 Reflection 删除入口。
6. 调整 Module Registry：当前正式核心只应对应任务、捕获、目标、反思、System 必要能力。
7. 调整 DataHealthPanel：只说明当前核心数据、本地存储位置、保存状态。
8. 审查核心路径文案是否符合当前需求。

## Review Status

本次只做静态审查，未运行 build、lint、test，也未启动应用做交互验证。

该文档可以作为后续拆 issue 或做实现整改 review 的输入。
