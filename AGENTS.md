# Prompt Studio — Agent Guide

开发命令

| 操作 | 命令 | 备注 |
|------|------|------|
| 启动开发服务器 | `pnpm dev` | 端口 5173 |
| 构建（含类型检查） | `pnpm build` | `tsc && vite build` |
| 构建（跳过类型检查） | `pnpm build:nocheck` | 仅 `vite build` |
| 全量 lint | `pnpm lint` | 扁平 ESLint 配置，`--max-warnings 0` |
| 单元／组件测试 | `pnpm test` | Vitest，`fake-indexeddb` 模拟数据库 |
| E2E 测试 | `pnpm test:e2e` | Playwright，自动启动开发服务器 |
| 格式化 | `pnpm format` | Prettier，作用于 `src/**/*.{ts,tsx,css}` |

技术架构

**React 18 + TypeScript + Vite + Tailwind CSS 3**。class 策略实现暗色模式。

- **状态管理**：Zustand，每个 store 一个扁平文件，位于 `src/store/`
- **数据库**：Dexie.js（IndexedDB），`src/db/schema.ts` 定义 3 个版本
- **路由**：`createHashRouter`，基于 hash，无服务端路由
- **路径别名**：`@/` → `src/`（Vite + TypeScript 配置）
- **入口**：`src/main.tsx`，渲染前调用 `runMigrations()`
- **国际化**：自定义 Context，`src/i18n/`，zh-CN + en-US
- **设计令牌**：`src/styles/tokens.js`，Tailwind 和业务代码共同引用
- **PWA**：`vite-plugin-pwa` + Workbox，自动更新，运行时缓存 Monaco CDN 和 Google Fonts

编码约定

- **导入**：所有内部导入使用 `@/` 别名
- **ESLint**：扁平配置 `eslint.config.js`，源码中 `no-unused-vars` 关闭，`react-refresh/only-export-components` 仅 warn
- **ID**：统一使用 `crypto.randomUUID()`
- **时间戳**：`Date.now()`（Unix 毫秒）
- **哈希**：`src/utils/hash.ts` 计算 `computeContentHash`；`src/utils/normalize.ts` 去除空白和标点后再哈希
- **Store 模式**：Zustand `create()` 一次定义状态和动作，直接写入 IndexedDB，不使用 Zustand persist 中间件
- **重复检测**：`checkDuplicate()` 按 `contentHash` 比对；忽略新建根版本时的错误 `'每个项目只能有一个根版本'`

测试

**单元测试**：`tests/unit/`，Vitest + jsdom。

**组件测试**：`tests/component/`，Vitest + Testing Library + `fake-indexeddb/auto`。

**E2E 测试**：`tests/e2e/`，Playwright（Chromium + Firefox）。

**设置文件**：`src/test/setup.ts` 导入 `@testing-library/jest-dom` 和 `fake-indexeddb/auto`。

**数据库模拟**：`fake-indexeddb` 直接配合 `src/db/schema.ts` 中的真实 Dexie 定义。

路由结构

- `#/` → MainView（项目树 + 版本画布）
- `#/project/:projectId` → MainView（指定项目）
- `#/settings` → 设置页

杂项

- Playwright 检测到 `CI` 环境变量时不复用已有开发服务器
- 自定义字体：Noto Sans SC（Google Fonts）+ Material Symbols，后备栈见 `tailwind.config.js`
- 部署：Cloudflare Pages，`.github/workflows/deploy.yml`（pnpm 9、Node 22）
- 两套 ESLint 配置共存：`eslint.config.js`（扁平配置，当前使用）和 `.eslintrc.cjs`（旧版，已忽略）
