# Issue tracker：GitHub

本仓库的 issues 和 PRDs 存在 GitHub Issues 中。所有操作都使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`
- **读取 issue**：`gh issue view <number> --comments`
- **列出 issues**：`gh issue list --state open --json number,title,body,labels,comments`
- **评论 issue**：`gh issue comment <number> --body "..."`
- **添加或移除标签**：`gh issue edit <number> --add-label "..."` / `gh issue edit <number> --remove-label "..."`
- **关闭 issue**：`gh issue close <number> --comment "..."`

仓库从 `git remote -v` 推断；在这个 clone 内运行时，`gh` 会自动处理。

## Pull requests 作为 triage 入口

**PRs as a request surface: no.**

如果以后改为 `yes`，PRs 应使用对应的 `gh pr` 命令，走与 issues 相同的标签和状态。

## 当技能说“发布到 issue tracker”

创建一个 GitHub issue。

## 当技能说“获取相关 ticket”

运行 `gh issue view <number> --comments`。

## Wayfinding 操作

供 wayfinder 类技能使用。地图是一个单独 issue，子 issue 作为 tickets。

- **Map**：一个标记为 `wayfinder:map` 的 issue，保存笔记、目前决策和开放问题。
- **Child ticket**：在 GitHub 支持时，将 issue 作为 map 的 sub-issue 关联。未启用 sub-issues 时，在 map 正文中加入任务列表，并在 child body 顶部写 `Part of #<map>`。
- **Blocking**：可用时使用 GitHub 原生 issue dependencies。不可用时，在 child body 顶部回退为 `Blocked by: #<n>, #<n>`。
- **Frontier query**：列出 map 中打开的 children，去掉被 blocked 或已 assigned 的项，按 map 顺序取第一个可用项。
- **Claim**：把 issue 分配给负责推进的开发者。
- **Resolve**：评论答案，关闭 issue，并更新 map 中的决策。
