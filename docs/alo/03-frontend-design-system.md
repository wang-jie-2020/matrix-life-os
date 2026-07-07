# 前端设计系统

> 反推日期：2026-07-07  
> 范围：当前 React + Electron 桌面版 ALO  
> 主要依据：`src/index.css`、`src/components/*`、`src/App.tsx`、`src/pages/*`

## 1. 设计方向

ALO 的视觉方向是：

```text
The Monastic Terminal (Scriptorium Parchment)
```

关键词：

- ASCII
- Terminal
- Monastic
- Scriptorium
- Parchment
- 本地工具感
- 高密度信息
- 克制动效
- 低装饰
- 带一点黑色幽默

产品不追求现代 SaaS 的柔和圆角、渐变卡片和复杂图标库，而是像一个“数字抄写室”：深色背景、羊皮纸文字、ASCII 边界、金色强调、等宽字体。

## 2. 设计原则

### 2.1 文本优先

界面表达优先使用文字、符号和 ASCII 结构，而不是图标库。

推荐：

```text
[保存] [删除] [x] [✎] ☑ ☐ [KR] ⤴ 来自昨日
```

避免：

- 大量彩色图标；
- Material 风格按钮；
- 圆角卡片和阴影堆叠；
- 非必要插画。

### 2.2 高密度但不拥挤

ALO 是桌面生产力工具，不是移动端轻内容流。布局可以信息密集，但必须靠：

- 明确边框；
- 统一间距；
- 文本层级；
- 金色焦点；
- hover 显示次级操作；

来保持可扫描性。

### 2.3 克制的仪式感

视觉风格可以有仪式感，但不能影响执行效率。任何装饰都应服从：

1. 快速捕捉；
2. 快速判断；
3. 快速执行；
4. 快速复盘。

### 2.4 本地工具感

ALO 的 UI 应让用户感到“这是我的本地系统”，而不是云端平台。

设计上应避免：

- 社交 feed 感；
- 团队协作入口；
- 账户中心式界面；
- 营销化 dashboard。

## 3. Design Tokens

核心 tokens 定义在 `src/index.css`。

### 3.1 颜色

#### 暗色主题默认色

| Token | 当前值 | 用途 |
|---|---|---|
| `--bg-primary` | `#16120e` | 页面主背景 |
| `--bg-secondary` | `#211a13` | 面板背景 |
| `--bg-tertiary` | `#2d251b` | 列表项 / task card 背景 |
| `--text-primary` | `#eadfc8` | 主文本 |
| `--text-secondary` | `#c8b99d` | 次级文本 |
| `--text-muted` | `#a79a83` | 弱提示、空状态 |
| `--accent-gold` | `#d3a642` | 当前项、焦点、强调、drop target |
| `--accent-success` | `#8bbf8f` | 完成、成功、进度 |
| `--accent-danger` | `#d67770` | 删除、危险、警告 |
| `--border-primary` | `#6f604c` | 默认边框 |
| `--border-hover` | `#9a876b` | hover 边框 |

#### 颜色使用规则

- 金色只用于当前、焦点、强调、选中、拖拽目标，不要滥用。
- 红色只用于危险、删除、错误、警告。
- 绿色只用于成功、完成、进度。
- 默认结构靠 1px 边框，而不是阴影。

### 3.2 亮色主题

亮色主题通过：

```css
html[data-theme="light"]
```

将同名变量映射到 light tokens。组件不应判断当前主题，而应只使用 `var(--*)`。

主题状态来自 `config.theme`，由 `src/App.tsx` 写入 `document.documentElement.dataset.theme`。

### 3.3 字体

核心字体 token：

```css
--font-mono: 'JetBrains Mono', 'Sarasa Mono SC', 'Maple Mono NF CN', 'Microsoft YaHei UI', Consolas, monospace;
--font-reading: 'Sarasa Mono SC', 'Maple Mono NF CN', 'Microsoft YaHei UI', 'JetBrains Mono', monospace;
```

使用规则：

- 命令、按钮、导航、数据使用 `--font-mono`。
- 较长中文正文可使用 `--font-reading`。
- 不引入额外装饰字体。

### 3.4 文本层级

当前全局工具类：

| Class | 用途 |
|---|---|
| `.font-display` | 应用标题 / 大标题 |
| `.font-h1` | 一级标题 |
| `.font-h2` | 面板标题 / 导航项 |
| `.font-h3` | 小标题 |
| `.font-body` | 正文 |
| `.font-caption` | 辅助说明 / 小按钮 |
| `.font-mono-data` | 数据、进度、数值 |

规则：

- 标题可 uppercase。
- 不依赖字号巨大化制造层级。
- 标题和状态优先使用颜色与符号区分。

### 3.5 间距

间距是 4px scale：

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
--space-10: 128px;
```

使用规则：

- 紧凑控件：`space-1` / `space-2`。
- 面板内部：`space-3`。
- 模块之间：`space-4`。
- 页面级 padding：`space-6`。
- 大屏布局 gap：`space-8` / `space-10`。

### 3.6 Motion

动效 tokens：

- `--duration-instant: 150ms`
- `--duration-fast: 200ms`
- `--duration-normal: 300ms`
- `--duration-slow: 400ms`
- `--duration-cursor: 1200ms`

缓动：

- `--ease-settle`
- `--ease-confirm`
- `--ease-instant`
- `--ease-spring`
- `--ease-reorder`

规则：

- 动效只用于颜色、边框、背景、透明度、轻微位移。
- 不使用弹跳式大位移。
- reduced motion 下应关闭主要 duration。

## 4. 应用布局

### 4.1 App Shell

根容器：

- `minHeight: 100vh`
- `backgroundColor: var(--bg-primary)`
- `color: var(--text-primary)`
- `fontFamily: var(--font-mono)`

顶部导航：

- 高度 48px；
- 底部 1px border；
- 左侧品牌；
- 右侧页面导航 + 主题按钮；
- 当前页为金色并用方括号表达。

主内容：

- 默认 padding：`var(--space-6)`。

源码依据：`src/App.tsx`。

### 4.2 顶层 IA

一级页面固定为：

```text
[行动台] [回顾档案] [◇ 系统] [◐/◑]
```

规则：

- 不轻易新增一级导航。
- 新功能应优先挂到已有三页之一。
- 当前页使用 `--accent-gold`。
- 非当前页使用 `--text-secondary`，hover 到 `--text-primary`。

### 4.3 ActionDesk 布局

结构：

1. Sarcastic monologue banner；
2. QuickInbox；
3. TaskBoard；
4. 下半区：
   - 主区：OKR 固定在上，可拖拽 panels 在下；
   - 侧栏：TodayProgress、Principles、Calendar、Entertainment、Mood、Inspiration。

比例：

- 主区约 61.8%；
- 侧栏约 38.2%。

规则：

- QuickInbox 和 TaskBoard 是行动台顶部核心，不应被可选模块挤压。
- OKR 固定在主区顶部，不作为普通 draggable panel。
- 可选模块受 `enabledModules` 控制。

### 4.4 ReviewArchive 布局

结构：

- Row 1：左侧 Reflection + ObjectiveArchive，右侧 Abilities。
- Row 2：Mood trend（如果 mood 模块启用）。

规则：

- 回顾页是沉淀页，不是执行页。
- 不应把高频输入/捕捉入口大量放入此页。

### 4.5 System 布局

结构：

- 两列，最大宽度约 1200px。
- 左列：ModuleManager。
- 右列：About、MonkQuote、ReflectionTemplateManager、DataHealthPanel、UpdatePanel、ManualPanel。
- 支持同列内部拖拽排序。

规则：

- System 承载低频配置。
- 不应把日常执行功能塞入 System。

## 5. 核心组件规范

### 5.1 AsciiBox

源码：`src/components/AsciiBox.tsx`

职责：标准面板容器。

结构：

- 外层 `.ascii-box`
- 标题 `.ascii-box-title`
- 内容 `.ascii-box-content`

视觉：

- 1px `--border-primary`；
- 背景 `--bg-secondary`；
- 标题金色；
- 标题底部 border；
- hover 时边框变为 `--border-hover`；
- 内容 padding 为 `space-3`。

使用规则：

- 新增面板优先使用 AsciiBox。
- 不要在面板外再套现代 card。
- 面板标题尽量短，允许带 ASCII 符号。

### 5.2 AsciiButton

源码：`src/components/AsciiButton.tsx`

职责：标准命令按钮。

视觉：

```text
[  保存  ]
```

规则：

- 默认无边框、无背景。
- hover：背景变 `--text-primary`，文字变 `--bg-primary`。
- active：背景变 `--accent-gold`。
- disabled：opacity 0.5，cursor not-allowed。

使用规则：

- 操作型按钮优先使用方括号。
- 删除类按钮使用 danger 色。
- 避免大面积填充按钮。

### 5.3 AsciiProgress

源码：`src/components/AsciiProgress.tsx`

职责：ASCII 进度条。

样式：

```text
[████░░░░░░] 40%
```

规则：

- 进度条使用 `█` 和 `░`。
- 进度部分使用 success 色。
- 适合任务进度、能力进度、完成率。

### 5.4 DraggablePanel

源码：`src/components/DraggablePanel.tsx`

职责：可排序面板 wrapper。

交互：

- 使用 `@dnd-kit/sortable`。
- hover 后右上角显示 `⠿⠿⠿` handle。
- handle hover 金色。
- dragging 时 panel opacity 降低。

规则：

- 只有可重排模块应使用 DraggablePanel。
- 不应让所有面板都可拖，避免破坏信息架构。
- 拖拽 handle 默认隐藏，减少视觉噪音。

## 6. 交互规范

### 6.1 Hover / Active

常见模式：

- 文本变亮；
- 边框变亮；
- 背景反相；
- hover 后显示隐藏操作；
- active 使用金色确认。

全局辅助类：

- `.invert-hover`
- `.btn-invert`

规则：

- hover 不应引入复杂动画。
- hover 显示编辑/删除操作适用于列表项和 task card。

### 6.2 输入

输入样式：

- 背景透明；
- 无 outline；
- 常用底边框；
- focus / editing 用金色；
- caret 使用金色；
- 字体使用 mono。

键盘规则：

- Enter：确认 / 保存；
- Escape：取消 / 关闭；
- blur：在部分 inline edit 场景保存或退出。

### 6.3 拖拽

DnD 是 ALO 的核心交互，不只是排序。

当前类型：

1. Inbox item 拖拽澄清；
2. KR 拖到任务板生成 linked task；
3. Task 在周看板跨日移动或列内排序；
4. Dashboard / System 面板排序。

Drop 反馈：

- 金色 inset outline；
- drag overlay 使用 `--bg-secondary` 背景、金色边框、轻微阴影；
- 指针命中优先用于 inbox / KR drop。

规则：

- DnD 不应打破 GTD 单向流。
- 转换型 DnD 必须定义源对象是否保留、删除或链接。
- DnD 失败时不应产生副作用。

### 6.4 Modal / Popup

通用模式：

- fixed overlay；
- 暗色半透明背景；
- 可用 backdrop blur；
- 1px border；
- 金色标题；
- 无圆角；
- ESC 关闭；
- 点击外部关闭；
- 内容区域限制最大宽高。

源码参考：

- `src/components/ManualModal.tsx`
- `src/features/reflections/ReflectionDetailModal.tsx`
- `src/components/MiniCalendar.tsx`
- `src/features/modules/ModulePicker.tsx`

规则：

- 模态层用于低频查看/编辑，不用于高频任务勾选。
- 弹窗内仍应使用 ASCII 风格按钮和输入。

### 6.5 状态符号

推荐符号：

| 符号 | 含义 |
|---|---|
| `☐` | 未完成 |
| `☑` | 已完成 |
| `[x]` | 删除 / 关闭 |
| `[✎]` | 编辑 |
| `[+]` | 新增 |
| `[→]` | 安排 / 转换 |
| `▾` / `▸` | 展开 / 折叠 |
| `[KR]` | KR 来源任务 |
| `⤴ 来自昨日` | 迁移任务 |
| `★` / `☆` | 评分 / 重要性 |

规则：

- 优先使用文本符号，不引入图标库。
- 状态符号颜色应符合语义：完成 green，危险 red，强调 gold。

## 7. 响应式策略

当前项目是桌面优先。

主要规则：

- 超宽屏增大任务列宽和 dashboard gap。
- 中窄屏降低 dashboard 主/侧比例差异。
- 移动宽度下 dashboard 纵向堆叠。
- TaskBoard 保持横向滚动，不把七天列强行压扁。
- Reflection grid 在窄屏变为单列。

源码依据：`src/index.css` 的 responsive section。

设计原则：

- 桌面是主体验。
- 移动适配应保证可读和可滚动，但不要求完全等同原生移动 app。
- 若未来做微信小程序，应重做移动端信息架构，而不是直接压缩当前桌面 UI。

## 8. 文案语气

ALO 的文案不是温柔陪伴型，而是：

- 带刺的镜子；
- 黑色幽默；
- 自我拷问；
- 低废话；
- 允许一点“修道院室友式吐槽”。

源码参考：

- `src/copy/alo-copy.ts`
- `src/copy/system-copy.ts`
- `src/copy/monkQuotes.ts`
- `src/hooks/useSarcasticMonologue.ts`

规则：

- 文案可以刻薄，但不能影响用户理解。
- 错误和危险操作应清晰直接，不用玩笑掩盖风险。
- 空状态文案可带性格，但要说明下一步。

## 9. 新 UI 开发检查清单

新增一个 UI 模块前，检查：

- [ ] 是否属于三页之一，而不是新增一级导航？
- [ ] 是否使用 `var(--*)` token，而不是硬编码颜色？
- [ ] 是否优先使用 AsciiBox / AsciiButton / DraggablePanel？
- [ ] 是否符合方括号命令语言？
- [ ] hover / active 是否使用现有反相模式？
- [ ] 输入是否支持 Enter / Escape？
- [ ] 如果有 modal，是否支持 ESC 或外部点击关闭？
- [ ] 如果有 DnD，是否明确源对象和目标对象的副作用？
- [ ] 是否尊重 reduced motion？
- [ ] 是否会破坏桌面高密度布局？
- [ ] 是否需要更新本文档？
