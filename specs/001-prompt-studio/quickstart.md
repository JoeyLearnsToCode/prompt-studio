# Prompt Studio - 快速开始指南

**Version**: 1.0  
**Date**: 2025-11-16  
**Target Audience**: 开发者

## 概览

Prompt Studio 是一款本地优先的 AI 提示词版本管理与编辑工具。本指南将帮助您在 10 分钟内搭建开发环境并运行应用。

---

## 前置条件

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **pnpm**: >= 8.0.0
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **操作系统**: Windows 11, macOS 10.15+, Linux（Ubuntu 20.04+）

---

## 步骤 1: 初始化项目

```bash
# 创建项目目录
mkdir prompt-studio
cd prompt-studio

# 初始化 npm 项目
npm init -y

# 安装 Vite 和 TypeScript
npm install -D vite @vitejs/plugin-react typescript

# 安装核心依赖
npm install react react-dom

# 安装状态管理和数据库
npm install zustand dexie

# 安装编辑器和 UI 库
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/search @codemirror/merge
npm install @headlessui/react framer-motion

# 安装工具库
npm install react-router-dom react-zoom-pan-pinch js-sha256 jszip webdav

# 安装 TypeScript 类型定义
npm install -D @types/react @types/react-dom @types/js-sha256

# 安装 TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装测试库
npm install -D vitest @testing-library/react @testing-library/jest-dom fake-indexeddb msw
npm install -D @playwright/test
```

---

## 步骤 2: 配置文件

### 2.1 `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### 2.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.3 `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#cfe783',
          container: '#d9f799',
          onPrimary: '#2b3a00',
          onContainer: '#3d5200',
        },
        secondary: {
          DEFAULT: '#9ec891',
          container: '#b8e3a9',
          onSecondary: '#1a3a0f',
          onContainer: '#2a4a1f',
        },
        tertiary: {
          DEFAULT: '#8cbcd9',
          container: '#a3d1f0',
          onTertiary: '#0f2e42',
          onContainer: '#1f3e52',
        },
        surface: {
          DEFAULT: '#fdfcf5',
          variant: '#e4e3d6',
          onSurface: '#1b1c18',
          onVariant: '#46483f',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          onError: '#ffffff',
          onContainer: '#410002',
        },
      },
      borderRadius: {
        'm3-small': '8px',
        'm3-medium': '12px',
        'm3-large': '16px',
      },
      boxShadow: {
        'm3-1': '0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        'm3-2': '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        'm3-3': '0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
```

### 2.4 `package.json` 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 2.5 `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 2.6 `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 步骤 3: 创建基础文件结构

```bash
# 创建目录结构
mkdir -p src/{components,services,store,db,models,utils,hooks,pages,styles}
mkdir -p src/components/{layout,version,editor,common,canvas}
mkdir -p tests/{unit,component,e2e}

# 创建基础文件
touch src/App.tsx src/main.tsx src/router.tsx
touch src/styles/globals.css
touch public/index.html
```

---

## 步骤 4: 核心代码实现

### 4.1 `public/index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prompt Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 4.2 `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 4.3 `src/db/schema.ts`

```typescript
import Dexie, { Table } from 'dexie';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface Project {
  id: string;
  folderId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  tags?: {
    model?: string;
    platform?: string;
    type?: string;
  };
}

export interface Version {
  id: string;
  projectId: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content: string;
  normalizedContent: string;
  contentHash: string;
  score?: number;
}

export interface Snippet {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface Attachment {
  id: string;
  versionId: string;
  fileName: string;
  fileType: string;
  blob: Blob;
}

export class PromptStudioDB extends Dexie {
  folders!: Table<Folder>;
  projects!: Table<Project>;
  versions!: Table<Version>;
  snippets!: Table<Snippet>;
  attachments!: Table<Attachment>;

  constructor() {
    super('PromptStudioDB');
    this.version(1).stores({
      folders: 'id, parentId, createdAt',
      projects: 'id, folderId, updatedAt, createdAt',
      versions: 'id, projectId, parentId, contentHash, updatedAt, createdAt',
      snippets: 'id, name, createdAt',
      attachments: 'id, versionId',
    });
  }
}

export const db = new PromptStudioDB();
```

### 4.4 `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4.5 `src/App.tsx`

```typescript
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-primary text-on-primary p-4">
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
      </header>
      <main className="p-8">
        <p>欢迎使用 Prompt Studio！</p>
      </main>
    </div>
  );
}

export default App;
```

---

## 步骤 5: 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 浏览器自动打开 http://localhost:5173
```

您应该看到一个带有绿色标题栏的简单页面，显示 "Prompt Studio" 和 "欢迎使用 Prompt Studio！"。

---

## 步骤 6: 验证 IndexedDB

打开浏览器开发者工具（F12），切换到 "Application" 或 "存储" 标签：

1. 在左侧导航找到 "IndexedDB"
2. 展开 "PromptStudioDB"
3. 应该看到 5 个表：folders, projects, versions, snippets, attachments

---

## 步骤 7: 运行测试

```bash
# 运行单元测试
npm run test

# 运行浏览器端到端测试
npm run test:e2e
```

---

## 常见问题排查

### Q1: Vite 启动失败

**症状**: `Error: Cannot find module 'vite'`

**解决**:
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安装依赖
npm install
```

### Q2: TailwindCSS 样式不生效

**症状**: 页面没有样式或背景色不正确

**解决**:
1. 检查 `tailwind.config.js` 的 `content` 路径是否正确
2. 确保 `globals.css` 中包含 `@tailwind` 指令
3. 清除浏览器缓存并刷新页面

### Q3: IndexedDB 无法访问

**症状**: 控制台报错 `DOMException: The operation failed for reasons unrelated to the database itself`

**解决**:
1. 检查浏览器是否启用了 IndexedDB（隐私浏览模式可能禁用）
2. 清除浏览器存储（Settings → Privacy → Clear browsing data → Cookies and site data）
3. 使用 Chrome/Firefox 的标准模式（非隐私模式）

### Q4: TypeScript 类型错误

**症状**: `Cannot find module '@/...' or its corresponding type declarations`

**解决**:
1. 检查 `tsconfig.json` 中的 `paths` 配置
2. 重启 TypeScript 服务器（VS Code: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`）
3. 确保 `vite.config.ts` 中的 `resolve.alias` 与 `tsconfig.json` 一致

---

## 下一步

现在您已经成功搭建了开发环境，接下来可以：

1. **实现核心功能**: 参考 `data-model.md` 和 `contracts/` 目录实现业务逻辑
2. **开发 UI 组件**: 参考 `UI.md` 设计规范实现 Material Design 3 组件
3. **编写测试**: 参考测试章程编写单元测试和 E2E 测试
4. **查看示例代码**: 浏览 `research.md` 中的技术实现示例

---

## 有用的资源

- **Vite 文档**: https://vitejs.dev/
- **React 文档**: https://react.dev/
- **Dexie.js 文档**: https://dexie.org/
- **CodeMirror 6 文档**: https://codemirror.net/
- **TailwindCSS 文档**: https://tailwindcss.com/
- **Material Design 3**: https://m3.material.io/

---

**祝您开发愉快！** 🎉
