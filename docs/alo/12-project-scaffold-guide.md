# 新项目脚手架指南

> 反推日期：2026-07-07  
> 目标：指导从空仓库搭建 ALO Electron + React + TypeScript 项目。  
> 说明：命令和版本以当前项目为参照；实际新项目可按当时最新稳定版本调整。

## 1. 目标架构

```text
Vite + React + TypeScript renderer
        │
        ▼
Electron main/preload
        │
        ▼
Zustand persist
        │
        ▼
localStorage fallback / Electron JSON file storage
```

## 2. 前置要求

推荐：

- Node.js 20+
- npm
- Git
- Windows / macOS 开发环境

当前 release workflow 使用 Node 20。

## 3. 初始化项目

### 3.1 创建 Vite React TS 项目

```bash
npm create vite@latest ascii-life-os -- --template react-ts
cd ascii-life-os
npm install
```

### 3.2 安装运行依赖

```bash
npm install zustand date-fns @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3.3 安装开发依赖

```bash
npm install -D electron electron-builder @vitejs/plugin-react typescript eslint typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals @types/node @types/react @types/react-dom
```

如计划从一开始写测试，可补：

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

## 4. package.json 基础配置

建议脚本：

```json
{
  "name": "ascii-life-os",
  "private": true,
  "version": "0.1.0",
  "description": "A personal life management system with ASCII art terminal-style UI",
  "type": "module",
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "audit:contrast": "node scripts/audit-contrast.mjs",
    "electron:build": "npm run build && electron-builder"
  }
}
```

如添加测试：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 5. electron-builder 配置

加入 `package.json`：

```json
{
  "build": {
    "appId": "com.alo.app",
    "productName": "ASCII Life OS",
    "artifactName": "ASCII-Life-OS-${version}-${arch}.${ext}",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "portable"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.productivity"
    },
    "publish": null
  }
}
```

## 6. Vite 配置

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
```

说明：

- `base: './'` 适配 Electron 加载本地打包资源。
- `__APP_VERSION__` 供 update check / migration 使用。

## 7. TypeScript 配置

建议 `tsconfig.app.json` 至少包含：

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## 8. 目录结构

创建：

```text
ascii-life-os/
├── .github/
│   └── workflows/
│       └── release.yml
├── electron/
│   ├── main.cjs
│   └── preload.cjs
├── public/
├── scripts/
│   └── audit-contrast.mjs
├── src/
│   ├── components/
│   │   ├── AsciiBox.tsx
│   │   ├── AsciiButton.tsx
│   │   ├── AsciiProgress.tsx
│   │   └── DraggablePanel.tsx
│   ├── copy/
│   │   ├── alo-copy.ts
│   │   ├── system-copy.ts
│   │   ├── titles-copy.ts
│   │   └── monkQuotes.ts
│   ├── features/
│   │   ├── abilities/
│   │   ├── archive/
│   │   ├── calendar/
│   │   ├── data/
│   │   ├── entertainment/
│   │   ├── habits/
│   │   ├── inbox/
│   │   ├── inspiration/
│   │   ├── modules/
│   │   ├── mood/
│   │   ├── okr/
│   │   ├── principles/
│   │   ├── reflections/
│   │   ├── system/
│   │   ├── tasks/
│   │   └── timeblocks/
│   ├── hooks/
│   ├── pages/
│   │   ├── ActionDesk.tsx
│   │   ├── ReviewArchive.tsx
│   │   └── System.tsx
│   ├── store/
│   │   ├── slices/
│   │   └── useAppStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   └── alo/
├── package.json
├── vite.config.ts
└── README.md
```

## 9. React 入口

`src/main.tsx`：

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 10. 全局类型声明

`src/types/index.ts` 中需要声明 Electron API：

```ts
declare global {
  interface Window {
    electronAPI?: {
      loadDataSync: () => Record<string, string> | null;
      saveData: (data: Record<string, string>) => Promise<boolean>;
      getAppVersion: () => string;
      onBeforeQuit: (callback: () => void) => void;
    };
  }
}
```

如果使用 Vite 注入版本，还需声明：

```ts
declare const __APP_VERSION__: string;
```

可放在 `src/vite-env.d.ts`。

## 11. App shell scaffold

`src/App.tsx` 最小结构：

```tsx
import { useEffect, useState } from 'react'
import ActionDesk from './pages/ActionDesk'
import ReviewArchive from './pages/ReviewArchive'
import System from './pages/System'
import { useAppStore } from './store/useAppStore'

function App() {
  const [page, setPage] = useState<'actionDesk' | 'reviewArchive' | 'system'>('actionDesk')
  const config = useAppStore((s) => s.config)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = config.theme ?? 'dark'
  }, [config.theme])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <nav>{/* tabs + theme */}</nav>
      <main>
        {page === 'actionDesk' && <ActionDesk />}
        {page === 'reviewArchive' && <ReviewArchive />}
        {page === 'system' && <System />}
      </main>
    </div>
  )
}

export default App
```

## 12. Zustand scaffold

### 12.1 Storage adapter first version

早期可先用 localStorage：

```ts
import { createJSONStorage } from 'zustand/middleware'

storage: createJSONStorage(() => localStorage)
```

后续替换为 `electronStorage`。

### 12.2 Store composition

`src/store/useAppStore.ts`：

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createTaskSlice, type TaskSlice } from './slices/taskSlice'
import { createConfigSlice, type ConfigSlice } from './slices/configSlice'
import type { AppState } from '../types'

export type AppStore = TaskSlice & ConfigSlice & {
  __version: string
}

export const useAppStore = create<AppStore>()(
  persist<AppStore, [], [], AppState>(
    (...args) => ({
      ...createTaskSlice(...args),
      ...createConfigSlice(...args),
      __version: __APP_VERSION__,
    }),
    {
      name: 'alo-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        config: state.config,
        __version: state.__version,
      }),
    }
  )
)
```

之后逐步加入 slices。

## 13. Electron main scaffold

`electron/main.cjs`：

```js
const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs')

const DATA_FILE = path.join(app.getPath('userData'), 'alo-data.json')
const BACKUP_FILE = DATA_FILE + '.bak'
const TEMP_FILE = DATA_FILE + '.tmp'
const PACKAGE_JSON = path.join(__dirname, '../package.json')

function readFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (e) {
    console.error(`Failed to read/parse ${filePath}:`, e)
  }
  return null
}

function readData() {
  let data = readFileSafe(DATA_FILE)
  if (data !== null) return data

  data = readFileSafe(BACKUP_FILE)
  if (data !== null) {
    try { fs.copyFileSync(BACKUP_FILE, DATA_FILE) } catch {}
    return data
  }

  return null
}

function writeData(data) {
  try {
    fs.writeFileSync(TEMP_FILE, JSON.stringify(data, null, 2), 'utf-8')
    fs.renameSync(TEMP_FILE, DATA_FILE)
    try { fs.copyFileSync(DATA_FILE, BACKUP_FILE) } catch {}
    return true
  } catch (e) {
    console.error('Failed to write data file:', e)
    try { if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE) } catch {}
    return false
  }
}

ipcMain.handle('save-data', (_event, data) => writeData(data))
ipcMain.on('load-data-sync', (event) => { event.returnValue = readData() })
ipcMain.on('get-app-version', (event) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'))
    event.returnValue = pkg.version || '0.0.0'
  } catch {
    event.returnValue = '0.0.0'
  }
})

let mainWindow = null
let isQuitting = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'ASCII LIFE OS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '')
    const filePath = path.normalize(`${__dirname}/../dist/${url}`)
    callback(filePath)
  })
  createWindow()
})

app.on('before-quit', (event) => {
  if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
    isQuitting = true
    event.preventDefault()
    try { mainWindow.webContents.send('app-before-quit') } catch {}
    setTimeout(() => app.quit(), 500)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
```

## 14. Electron preload scaffold

`electron/preload.cjs`：

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadDataSync: () => ipcRenderer.sendSync('load-data-sync'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),
  onBeforeQuit: (callback) => ipcRenderer.on('app-before-quit', callback),
})
```

## 15. electronStorage scaffold

`src/utils/electronStorage.ts` 应实现 Zustand `PersistStorage`：

功能要求：

- Electron 下使用 `window.electronAPI`；
- fallback 到 localStorage；
- cache；
- dirty flag；
- debounce write；
- retry；
- before quit flush；
- localStorage → Electron file 一次性迁移。

实现可参考当前项目 `src/utils/electronStorage.ts`。

## 16. GitHub Actions release scaffold

`.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  build-win:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build & Package
        run: npm run electron:build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: release/*.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build & Package
        run: npm run electron:build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: macos-build
          path: |
            release/*.dmg
            release/*.zip

  release:
    needs: [build-win, build-mac]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Download Windows build
        uses: actions/download-artifact@v4
        with:
          name: windows-build
          path: dist/win
      - name: Download macOS build
        uses: actions/download-artifact@v4
        with:
          name: macos-build
          path: dist/mac
      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/win/*.exe
            dist/mac/*.dmg
            dist/mac/*.zip
          body_path: RELEASE_NOTES.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 17. Contrast audit scaffold

`scripts/audit-contrast.mjs` 应：

- 读取 `src/index.css`；
- 提取颜色 tokens；
- 检查 foreground/background 对比度；
- 不达标时 `process.exit(1)`。

早期也可以先只保留脚本占位，等设计 tokens 稳定后补实现。

## 18. .gitignore 建议

```gitignore
node_modules
dist
release
*.local
.DS_Store
.env
.env.*
```

不要提交：

- API keys；
- 本地数据文件；
- release 产物；
- node_modules。

## 19. 文档 scaffold

新项目一开始就创建：

```text
docs/alo/
├── 00-index.md
├── 01-product-prd.md
├── 02-user-stories-and-flows.md
├── 03-frontend-design-system.md
├── 04-technical-architecture.md
├── 05-implementation-notes-and-gaps.md
├── 06-mvp-roadmap.md
├── 07-page-specs.md
├── 08-data-schema.md
├── 09-state-machines-and-business-rules.md
├── 10-implementation-plan.md
├── 11-test-and-acceptance-plan.md
└── 12-project-scaffold-guide.md
```

README 末尾可链接：

```md
详细设计文档见 `docs/alo/`。
```

## 20. 首日落地顺序

如果从空仓库开始，第一天建议只做：

1. Vite React TS 初始化；
2. 安装 dependencies；
3. 建目录；
4. 写 `index.css` tokens 初版；
5. 写 `AsciiBox` / `AsciiButton`；
6. 写 `App` 三页壳；
7. 写 `types` 最小 Task/Inbox/Config；
8. 写 Zustand store + localStorage persist；
9. 页面显示 store 中的 theme；
10. `npm run build` 通过。

不要第一天做：

- Electron；
- DnD；
- OKR；
- migration；
- release workflow。

## 21. 第一周建议目标

### Day 1

- skeleton + App shell + tokens。

### Day 2

- Zustand + config + task/inbox model。

### Day 3

- QuickInbox + TaskBoard static。

### Day 4

- Task CRUD + localStorage persist。

### Day 5

- basic Inbox → Task + day migration。

### Day 6

- DnD task move/reorder。

### Day 7

- review, docs, build/lint。

## 22. 第二周建议目标

- Objective/KR model。
- OKRPanel。
- KR → Task。
- Task complete → KR complete。
- Archive。
- ReviewArchive skeleton。

## 23. 第三周建议目标

- Reflection templates。
- Reflection form/grid/detail。
- Module registry。
- System page。
- ModuleManager。
- DataHealth basic。

## 24. 第四周建议目标

- Electron storage。
- main/preload。
- atomic write + backup。
- update panel。
- contrast audit。
- release workflow。
- manual acceptance。

## 25. Scaffold 验收 checklist

### 基础

- [ ] `npm install` 成功。
- [ ] `npm run dev` 成功。
- [ ] `npm run build` 成功。
- [ ] `npm run lint` 可运行。

### Renderer

- [ ] App 三页可切换。
- [ ] Theme 可切换。
- [ ] Store 可保存。
- [ ] 刷新后状态保留。

### Electron

- [ ] `npm run electron:build` 成功。
- [ ] 打包应用可打开。
- [ ] `window.electronAPI` 可用。
- [ ] 本地 JSON 文件写入。
- [ ] `.bak` 创建。

### Docs

- [ ] README 链接 docs。
- [ ] docs/alo 结构完整。
- [ ] gap 文档记录未实现能力。

## 26. 常见错误

### 26.1 忘记 `base: './'`

症状：Electron 打包后资源路径错误。

解决：Vite 配置 `base: './'`。

### 26.2 Renderer 直接用 Node API

症状：contextIsolation 下报错。

解决：通过 preload 暴露受控 API。

### 26.3 新字段未加入 partialize

症状：刷新/重启后数据丢失。

解决：更新 `src/store/useAppStore.ts` 的 `partialize`。

### 26.4 只在 Vite dev 验证存储

症状：Electron 真实文件存储未验证。

解决：打包或增加 Electron dev script。

### 26.5 把未挂载组件写进 README

症状：用户找不到功能。

解决：以 `src/pages/*` 和 layout 为准，未挂载能力写入 gap 文档。
