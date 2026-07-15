# Matrix Life OS

Matrix Life OS 是一个本地优先的个人管理桌面应用，使用 React、TypeScript、Zustand、Vite 和 Electron 构建。

## 当前产品范围

标准产品范围见 [docs/PRD.md](docs/PRD.md)。

Matrix Life OS 支持四类核心记录：

- Task
- Capture Note
- Goal Note
- Reflection

应用有三个顶层区域：

- **Action**：Capture Notes、Weekly Task Board 和 Goal Notes。
- **Review**：创建和查看带日期的 Reflections。
- **System**：功能显示控制、本地数据状态、版本信息和简短帮助。

核心使用是本地优先的，不需要账号、云同步、协作或网络访问。

## 存储

应用状态通过 Zustand persist 持久化。

Electron 运行时：

- 数据文件：`app.getPath('userData')/alo-data.json`
- 临时写入文件：`alo-data.json.tmp`

浏览器或 Vite 开发回退：

- `localStorage`
- 持久化键：`alo-storage`

## 开发

安装依赖：

```bash
npm install
```

启动 Vite 开发服务器：

```bash
npm run dev
```

构建前端：

```bash
npm run build
```

运行 lint：

```bash
npm run lint
```

打包 Electron 应用：

```bash
npm run electron:build
```

`package.json` 目前没有专用的 `test` 脚本。

## 文档

重整后的项目文档位于 [docs/](docs/README.md)：

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [术语表](CONTEXT.md)

## 许可证

MIT。见 [LICENSE](LICENSE)。
