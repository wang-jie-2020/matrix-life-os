# 当前实现

本文档从产品结构层面描述当前实现。它不是产品范围定义；产品需求以 `docs/PRD.md` 为准。

## 运行形态

Matrix Life OS 是一个本地优先的 React 应用，并以 Electron 作为桌面打包目标。

- 前端：React、TypeScript、Vite。
- 状态：Zustand 和持久化应用状态。
- 桌面外壳：Electron。
- 拖拽：`@dnd-kit`，用于任务跨日移动和同日重排。

应用有三个顶层区域：

- **Action**：Capture Notes、Weekly Task Board 和 Goal Notes。
- **Review**：带日期的 Reflections。
- **System**：功能显示控制、本地数据状态、版本信息和简短帮助。

## 源码地图

- `src/App.tsx`：顶层导航、主题切换和保存警告横幅。
- `src/pages/ActionDesk.tsx`：Action Area 组合和任务拖拽处理。
- `src/pages/ReviewArchive.tsx`：Review Area 组合。
- `src/pages/System.tsx`：System Area 组合。
- `src/features/capture/CaptureNotesPanel.tsx`：Capture Note CRUD 界面。
- `src/features/tasks/TaskBoard.tsx`：Weekly Task Board。
- `src/features/tasks/TaskColumn.tsx`：按日期创建任务和渲染任务列。
- `src/features/tasks/TaskCard.tsx`：任务编辑、完成、取消完成和删除行为。
- `src/features/goals/GoalNotesPanel.tsx`：Goal Note CRUD 界面。
- `src/features/reflections/ReflectionForm.tsx`：Reflection 创建和编辑表单。
- `src/features/reflections/ReflectionGrid.tsx`：Reflection 列表。
- `src/features/reflections/ReflectionDetailModal.tsx`：Reflection 详情、编辑和删除界面。
- `src/features/system/DataHealthPanel.tsx`：用户可读的本地数据状态。
- `src/features/system/VersionPanel.tsx`：当前版本显示。
- `src/features/system/ManualPanel.tsx`：简短帮助。
- `src/features/modules/ModuleManager.tsx`：功能显示控制。
- `src/store/useAppStore.ts`：持久化 store 组合。
- `src/store/slices/`：记录和配置状态 slices。
- `src/types/index.ts`：核心产品数据类型。

## 持久化数据

当前持久化的应用状态包括：

- Tasks。
- Capture Notes。
- Goal Notes。
- Reflections。
- 用户配置。
- 已启用模块。
- 布局设置。
- 应用数据版本。

Electron 运行时通过 `electronStorage` 将数据存到应用的 user data 目录。浏览器或 Vite 开发回退使用 `localStorage`，键名为 `alo-storage`。

## 当前产品记录

### Task

Task 是显示在 Weekly Task Board 上的带日期记录。Task 可以在指定日期下创建、编辑、删除、完成、取消完成、跨日移动，并可在同一天内重排。

### Capture Note

Capture Note 是还不属于 dated task 的松散记录。它支持创建、查看、编辑和删除。

### Goal Note

Goal Note 是简单的目标文本记录。它支持创建、查看、编辑和删除。

### Reflection

Reflection 是带日期的回顾记录。它支持创建、查看、查看单条、编辑、删除，并可分配到某一天。

## System Area

System Area 当前提供：

- Capture Notes、Weekly Task Board、Goal Notes、Reflections 和 Local Data Status 的功能显示控制。
- Local Data Status，展示已保存的核心记录数量、存储类型、保存状态和已保存记录大小。
- 版本显示。
- 简短帮助文本。

System Area 不把备份、导出、导入、恢复、云同步、账号、协作或更新检查宣传为当前产品功能。

## 验证

实现变更后使用这些检查：

```bash
npm run build
npm run lint
```

`package.json` 目前没有专用的 `test` 脚本。
