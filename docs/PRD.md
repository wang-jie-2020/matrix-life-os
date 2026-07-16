# PRD

## Interface Language

Matrix Life OS must support Interface Language as an application-level display preference.

The product must allow the user to switch application UI copy between:

- English (`en`)
- Simplified Chinese (`zh-CN`)

The language system must be designed so more interface languages can be added later without changing feature component logic.

Interface Language affects product UI copy, including navigation, commands, empty states, help text, system status, module names, and weekday labels. It must not translate, rewrite, or otherwise modify user-created Task, Capture Note, Goal Note, or Reflection content.

On first launch, Matrix Life OS must choose the initial Interface Language from the system/browser language. If the system language is unsupported, the initial language must be English. After the user chooses an Interface Language, the choice must be persisted and must not automatically change when the system language changes.

The top navigation must include an Interface Language menu. Selecting a language from the menu switches immediately and does not require confirmation.

All current product-scope user-visible UI copy must be provided through i18n keys. Components must not contain inline user-visible product copy, except for user-created content, generated dates or numbers, symbolic command glyphs, and internal technical literals.

For Simplified Chinese UI, product terms are translated as interface labels. Canonical domain terms remain English in the domain model, code, and architecture documentation.

Weekday labels follow Interface Language. Date and number formats remain unchanged in the first version.

本文档描述 Matrix Life OS 应该做什么。它不描述代码结构或实现细节。

## 产品概述

Matrix Life OS 是一个本地优先的个人管理工具，用于管理：

- Tasks。
- Capture Notes。
- Goal Notes。
- Reflections。

它服务于一个人管理自己的记录。它不是团队项目管理器、云端生产力套件或日历替代品。

## 核心记录

### Task

产品必须允许用户：

- 创建 Task。
- 在 Weekly Task Board 上查看 Tasks；该视图同时展示一周七天。
- 默认打开当前周的 Weekly Task Board。
- 将 Weekly Task Board 切换到上一周或下一周。
- 编辑 Task。
- 删除 Task。
- 将 Task 标记为完成。
- 将已完成的 Task 标记为未完成。
- 在 Weekly Task Board 上保留已完成 Tasks，并显示明确的完成状态。
- 在 Weekly Task Board 的指定日期下创建 Task。
- 在不同日期之间移动 Task。
- 在同一天内重排 Tasks。

每个 Task 必须属于某一天。不属于某一天的内容应记录为 Capture Note，而不是 Task。

### Capture Note

产品必须允许用户：

- 创建 Capture Note。
- 查看 Capture Notes。
- 编辑 Capture Note。
- 删除 Capture Note。

Capture Notes 不需要转换为 Tasks、Goals 或其他记录。

### Goal Note

产品必须允许用户：

- 创建 Goal Note。
- 查看 Goal Notes。
- 编辑 Goal Note。
- 删除 Goal Note。

Goal Notes 不需要 key results、task links、progress scoring 或 completion status。

### Reflection

产品必须允许用户：

- 创建 Reflection。
- 查看 Reflections。
- 查看单条 Reflection。
- 编辑 Reflection。
- 删除 Reflection。
- 将 Reflection 分配到某一天。

## 记录关系

产品不需要在四类核心记录之间建立链接。

- Capture Notes 不需要转换为 Tasks。
- Tasks 不需要链接到 Goal Notes。
- Goal Notes 不需要包含 Tasks 或 key results。
- Reflections 不需要链接到 Tasks 或 Goal Notes。

## 产品区域

### Action Area

Action Area 必须支持：

- Capture Notes。
- Weekly Task Board。
- Goal Note 区域。

任务视图必须让今天的 Tasks 易于识别。

### Review Area

Review Area 必须支持：

- 创建 Reflections。
- 查看过去的 Reflections。

### System Area

System Area 必须支持：

- 模块或功能显示控制。
- 用户能理解的数据状态信息。
- 版本信息。
- 简短帮助信息。

## 数据需求

产品必须在没有账号、云同步或网络访问的情况下工作。

核心记录必须在应用关闭并重新打开后仍然存在。

用户必须能够理解：

- 数据是否存储在本地。
- 数据在人的理解层面上存储在哪里。
- 保存了哪些数据。

如果核心记录无法保存，产品必须警告用户。

## 备份和恢复

手动备份和恢复不是当前阶段的需求。

除非以后把这些功能加入本文档，否则产品不得宣传 backup、export、import 或 recovery。

## 范围外

以下内容不是当前阶段的需求：

- 用户账号。
- 云同步。
- 协作。
- 团队工作区。
- 插件市场。
- 完整日历替代品。
- 完整习惯教练系统。
- 分析仪表盘。
- 手动备份和恢复。

除非以后加入本文档，否则其他记录类型或模块不应被视为需求。

## 验收标准

当用户可以完成以下操作时，产品是可接受的：

- 使用上文列出的 Task 操作管理 Tasks。
- 使用上文列出的 Capture Note 操作管理 Capture Notes。
- 使用上文列出的 Goal Note 操作管理 Goal Notes。
- 使用上文列出的 Reflection 操作管理 Reflections。
- 通过 System Area 控制隐藏或显示功能。
- 看到可理解的数据状态信息。
- 看到版本信息。
- 阅读简短帮助信息。
- 关闭并重新打开应用后不丢失核心记录。

如果出现以下情况，产品不可接受：

- 重启后丢失核心记录。
- 核心使用需要账号、云同步或网络访问。
- 在这些功能加入本文档之前宣传 backup、export、import 或 recovery。
