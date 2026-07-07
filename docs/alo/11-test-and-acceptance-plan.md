# 测试与验收计划

> 反推日期：2026-07-07  
> 目标：为 ALO 0-1 建设提供质量门禁、测试分层和手动验收清单。  
> 当前事实：现有项目没有 `test` script；本文件包含当前可执行门禁和建议新增测试体系。

## 1. 测试策略总览

ALO 的风险集中在：

1. 本地数据持久化；
2. 跨模块状态联动；
3. DnD 转换和排序；
4. 数据迁移；
5. Electron 文件写入与恢复；
6. README/PRD 与实际挂载能力不一致。

建议测试金字塔：

```text
Manual E2E / Electron acceptance
        ▲
Integration tests: flows + store interactions
        ▲
Unit tests: utils + slices + migrations
        ▲
Static checks: TypeScript + ESLint + contrast audit
```

## 2. 当前已有质量门禁

来源：`package.json`

| 命令 | 当前状态 | 用途 |
|---|---|---|
| `npm run build` | 已存在 | TypeScript build + Vite build |
| `npm run lint` | 已存在 | ESLint |
| `npm run audit:contrast` | 已存在 | 颜色对比度审计 |
| `npm run preview` | 已存在 | Vite preview |
| `npm run electron:build` | 已存在 | Electron 打包 |
| `npm test` | 不存在 | 当前无测试脚本 |

## 3. Release 前最低门禁

每次 release 前至少执行：

```bash
npm run build
npm run lint
npm run audit:contrast
npm run electron:build
```

并完成手动验收：

- App 可打开；
- 三页可切换；
- 数据可保存；
- 重启后数据存在；
- QuickInbox → Task 可用；
- KR → Task → Archive 可用；
- Reflection 可保存；
- System / DataHealth 可运行。

## 4. 建议新增测试脚本

如果从 0-1 新建，建议添加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

依赖建议：

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `jsdom`

如果不想早期引入测试库，至少保留本文件中的手动验收清单。

## 5. Unit tests

## 5.1 date utils

目标文件：`src/utils/date.ts`

应测：

- `getTodayString` 格式；
- `getWeekStart` 返回周一；
- `getWeekDates` 返回 7 天；
- `getNextWeekStart`；
- `getPrevWeekStart`；
- `isSameWeek`；
- `getDayColumnFromDate`；
- `getDateLabelForDay`。

边界：

- 周日；
- 跨月；
- 跨年；
- 时区导致的日期边界。

## 5.2 version compare / update utils

目标文件：`src/utils/checkUpdate.ts`

应测：

- `compareVersion('0.3.0', '0.3.1')`；
- `compareVersion('1.0.0', '1.0.0')`；
- `compareVersion('1.0.10', '1.0.2')`；
- release tag 带 `v` 的情况；
- cache 命中；
- fetch 失败 fallback。

## 5.3 migration utils

目标文件：

- `src/utils/migrateAppData.ts`
- `src/utils/migrateReflectionData.ts`

应测：

- 旧 Objective 结构迁移；
- Task 补 `source` / `linkedKrId`；
- legacy BACKLOG date 迁移；
- Reflection 补 `linkedObjectiveIds`；
- 旧 template 字段映射；
- migration 幂等。

## 5.4 formatBytes

目标文件：`src/utils/formatBytes.ts`

应测：

- 0 bytes；
- KB；
- MB；
- 小数格式。

## 6. Store tests

建议将 slice action 的纯逻辑尽量保持可测。

### 6.1 taskSlice

应测：

```text
addTask creates active task with order at end of date column
addTask returns id
moveTask changes date and column
moveTask reorders target date
reorderTasks rewrites order
updateTask patches fields
toggleTask active -> completed sets completedAt
toggleTask completed -> active clears completedAt
deleteCompletedTasks removes only completed tasks
migrateAllBeforeToday moves old active tasks to today
migrateAllBeforeToday keeps future tasks
```

### 6.2 okrSlice

应测：

```text
addObjective creates active objective
addKeyResult adds KR under objective
scheduleKR sets scheduled and linkedTaskId
unscheduleKR clears scheduled and linkedTaskId
completeKR sets completed true
uncompleteKR sets completed false
deleteObjective removes objective and related inbox items
addQuickInboxItem creates inbox item
removeFromInbox deletes item
```

### 6.3 abilitySlice

应测：

```text
addAbility creates id
incrementScore increments score
incrementScore caps at maxScore
collectAbilityTaskToInbox creates inbox item with ability metadata
collectAbilityTaskToInbox does not duplicate existing inbox item
```

### 6.4 reflectionSlice

应测：

```text
saveReflection creates new date record
saveReflection updates existing date record
updateReflection updates updatedAt
deleteReflection removes by id
getReflectionByDate returns expected record
```

### 6.5 archiveSlice

应测：

```text
archiveObjective creates snapshot
archiveObjective copies KR list
archiveObjective uses obj.completedAt or now
deleteArchive removes archive
```

### 6.6 moduleSlice / layoutSlice

应测：

```text
core modules cannot be disabled
optional modules can toggle
layout setters persist new arrays
unknown panel ids are filtered at render level
```

## 7. Integration tests

### 7.1 Inbox → Task

```text
Given inbox item exists
When convert to task for today
Then task is created with source inbox
And inbox item is removed
```

### 7.2 Inbox → Objective

```text
Given inbox item exists
When drop on OKR
Then objective is created
And inbox item is removed
```

### 7.3 KR → Task → KR completed

```text
Given objective with KR
When schedule KR to today
Then linked task is created
And KR.scheduled = true
When complete linked task
Then KR.completed = true
```

### 7.4 All KRs → Archive

```text
Given objective has two KRs
When both linked tasks completed
Then objective archive is created
And objective is removed from active objectives
```

### 7.5 Reflection upsert

```text
Given no reflection today
When save reflection
Then create record
When save reflection today again
Then update same record, not duplicate
```

### 7.6 Module toggle affects UI

```text
Given mood module enabled
When user disables mood
Then MoodTrackerPanel no longer renders
```

## 8. Component tests

建议优先测试：

### 8.1 QuickInbox

- 输入非空 Enter 创建 item；
- 输入空白 Enter 不创建；
- 点击 `[x]` 删除；
- 空状态显示；
- draggable attributes 存在。

### 8.2 TaskCard

- active 显示 `☐`；
- completed 显示 `☑` 和删除线；
- hover 显示 actions；
- inline edit Enter 保存；
- Escape 取消；
- ability label 显示；
- `[KR]` label 显示。

### 8.3 ModuleManager

- 按 phase 分组；
- core label 显示；
- core toggle disabled；
- optional toggle 调用 action。

### 8.4 ReflectionForm

- required question 校验；
- 不同 question type 渲染；
- 保存 answers；
- objective link 选择。

## 9. DnD 验收

DnD 自动化成本较高，MVP 可先手动验收。

### 9.1 Task DnD

- [ ] task 在同一列内排序。
- [ ] task 拖到另一日期列。
- [ ] task 拖到空列。
- [ ] 拖拽取消不改变状态。

### 9.2 Inbox DnD

- [ ] inbox item 拖到 WeekBoard 创建 task。
- [ ] inbox item 拖到 OKR 创建 objective。
- [ ] inbox item 拖到 Principles 创建 principle。
- [ ] inbox item 拖到 Calendar 创建 event。
- [ ] inbox item 拖到 Habit 创建 habit。
- [ ] inbox item 拖到 Entertainment 创建 entertainment。
- [ ] inbox item 拖到 TimeBlocks 创建 timeblock。
- [ ] inbox item 拖到 Inspiration 创建 inspiration。
- [ ] 成功转换后 inbox item 移除。

### 9.3 KR DnD

- [ ] KR 拖到某日创建 linked task。
- [ ] KR 重新拖到另一日删除旧 task 并创建新 task。
- [ ] KR drop 到无效区域不产生副作用。

### 9.4 Panel DnD

- [ ] ActionDesk main panel 可排序。
- [ ] System 左列内部可排序。
- [ ] System 右列内部可排序。
- [ ] System 不跨列移动。

## 10. Electron 验收

### 10.1 基础启动

- [ ] 打包应用可打开。
- [ ] BrowserWindow 尺寸合理。
- [ ] `app://resources` 图片加载。
- [ ] preload 注入 `window.electronAPI`。

### 10.2 数据保存

- [ ] 新增 task 后等待 debounce。
- [ ] 关闭应用。
- [ ] 重新打开。
- [ ] task 仍存在。

### 10.3 backup recovery

手动验收：

1. 找到 `alo-data.json` 和 `.bak`。
2. 保留 `.bak`。
3. 人为破坏主文件 JSON。
4. 打开应用。
5. 应尝试从 `.bak` 恢复。

### 10.4 before quit flush

- [ ] 修改数据后立即关闭应用。
- [ ] 重新打开数据仍存在。
- [ ] main process 发送 `app-before-quit`。

### 10.5 fallback

- [ ] Vite dev/browser 环境没有 electronAPI 时使用 localStorage。

## 11. Migration 验收

准备 legacy fixtures：

- 缺 `reflectionTemplates`；
- 旧 reflection 使用 `template` 而非 `templateId`；
- task 缺 `source`；
- task 缺 `linkedKrId`；
- layout 缺失；
- enabledModules 缺 core modules；
- app `__version` 旧版本。

验收：

- [ ] 加载后不崩溃。
- [ ] 默认模板补齐。
- [ ] layout 补齐。
- [ ] core modules 补齐。
- [ ] migration 幂等。
- [ ] 数据尽量不丢失。

## 12. DataHealth 验收

### 12.1 OK

```text
Given state fields complete
And no orphaned refs
And size <= 4.5MB
Then status = ok
```

### 12.2 Missing fields

```text
Given required field missing
Then status = error
And details contain missing field
```

### 12.3 Orphan KR

```text
Given task.linkedKrId points to missing KR
Then status = warn
And orphanedCount increments
```

### 12.4 Orphan template

```text
Given reflection.templateId missing
Then status = warn
And details mention reflection date
```

### 12.5 Large data

```text
Given state JSON size > 4.5MB
Then status = warn
And details contain size warning
```

## 13. Visual / accessibility 验收

### 13.1 Theme

- [ ] Dark theme 默认可读。
- [ ] Light theme 可读。
- [ ] Theme 切换有平滑过渡。
- [ ] 刷新后 theme 保留。

### 13.2 Contrast

```bash
npm run audit:contrast
```

必须通过。

### 13.3 Motion

- [ ] reduced motion 下 duration 归零或显著降低。
- [ ] DnD / modal / hover 不依赖长动画理解。

### 13.4 Keyboard

- [ ] QuickInbox Enter 提交。
- [ ] inline edit Enter 保存。
- [ ] inline edit Escape 取消。
- [ ] modal Escape 关闭。

## 14. Manual smoke test

每次重要改动后跑：

1. 启动应用。
2. 切换三页。
3. 切换主题。
4. 新增 inbox item。
5. inbox item 转今日 task。
6. 新增 objective + KR。
7. KR 拖到 taskboard。
8. 完成 linked task。
9. 检查 KR completed。
10. 完成所有 KRs。
11. 检查 ObjectiveArchive。
12. 保存今日 reflection。
13. 查看 reflection detail。
14. 关闭并重启应用。
15. 检查数据仍存在。
16. 打开 System。
17. 运行 DataHealth。
18. 检查 UpdatePanel。

## 15. Release acceptance checklist

### Code

- [ ] `npm run build` passed。
- [ ] `npm run lint` passed 或遗留已记录。
- [ ] `npm run audit:contrast` passed。
- [ ] `npm run electron:build` passed。

### Product

- [ ] README 与当前实现一致。
- [ ] docs/alo 更新。
- [ ] 未挂载能力没有被写成上线能力。
- [ ] CHANGELOG 更新。
- [ ] RELEASE_NOTES 更新。

### Data

- [ ] 新用户默认状态可用。
- [ ] 老用户迁移可用。
- [ ] 数据保存恢复可用。
- [ ] DataHealth 可运行。

### Packaging

- [ ] Windows portable 可打开。
- [ ] macOS dmg/zip 可打开。
- [ ] version 正确。
- [ ] release artifacts 命名正确。

## 16. 测试数据建议

准备以下 fixture：

```text
fixtures/
├── empty-user.json
├── basic-user.json
├── old-version-0.1.json
├── corrupt-primary-valid-backup/
├── orphaned-kr.json
├── orphaned-template.json
├── large-data-warning.json
└── full-flow-user.json
```

用途：

- migration；
- DataHealth；
- storage recovery；
- manual smoke test。

## 17. 不应声称的质量能力

除非实际补齐，否则不要在 README/PRD 中声称：

- 已有自动化单元测试；
- 已有 E2E 测试；
- 已有完整备份恢复测试；
- 已有 Electron dev 验证脚本；
- 已有云同步安全测试；
- 已有跨平台完整 QA。
