# Implementation Plan: Monaco Editor 编辑器替换

**Branch**: `003-monaco-editor` | **Date**: 2025-11-18 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-monaco-editor/spec.md`

## Summary

将应用中的 CodeMirror 编辑器组件和 Diff 对比视图替换为 Monaco Editor，以提升视觉体验和用户界面的现代感。技术方案采用 `@monaco-editor/react` 作为 React 集成包，保持所有现有功能（快捷键、搜索、语法高亮、只读模式）的同时，改善编辑器和版本对比的视觉质量。

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: React 18.2.0 (Hooks), TailwindCSS 3.4.0, Vite 5.0.8  
**Editor Dependencies**: 
- **移除**: @codemirror/lang-markdown, @codemirror/merge, @codemirror/search, @codemirror/state, @codemirror/view, @uiw/react-codemirror
- **添加**: monaco-editor (^0.45.0), @monaco-editor/react (^4.6.0)

**Storage**: IndexedDB (via Dexie.js)  
**Testing**: Vitest (unit/component), React Testing Library, Browser E2E (chrome-devtools-mcp 优先)  
**Target Platform**: 现代浏览器（Chrome/Edge/Firefox） + Cloudflare Workers / Deno Deploy  
**Project Type**: Web Application (纯前端 SPA)  

**Performance Goals**: 
- 编辑器首次渲染时间 < 500ms
- 支持 10,000 行以上内容时无明显卡顿
- Diff 对比视图加载时间 < 1s

**Constraints**: 
- 必须保持 Material Design 3 主题风格
- 必须支持现有所有快捷键（Ctrl+Enter, Ctrl+Shift+Enter, Ctrl+F）
- 必须支持响应式布局和窗口大小自适应
- 必须支持用户自定义字体大小和行高设置

**Scale/Scope**: 
- 替换 2 个主要组件：PromptEditor 和 CompareModal/DiffViewer
- 更新 1 个服务模块：diffService
- 影响范围：编辑页面、版本对比页面、Diff 视图
- 移除 6 个 CodeMirror 依赖包，添加 2 个 Monaco Editor 依赖包

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **本地优先验证**: 所有功能在客户端完成，无后端依赖 ✅ Monaco Editor 完全在浏览器运行
- [x] **Material Design 3 合规**: UI 组件遵循 M3 规范，色彩对比度达标 ✅ 需要自定义 Monaco 主题以匹配 M3 色彩方案
- [x] **平台无关性**: 核心逻辑与 UI 分离，部署适配层最小化 ✅ Monaco Editor 是纯前端库，无平台依赖
- [x] **扁平化数据**: 数据模型以扁平数组存储，ID 引用关联 ✅ 此功能不涉及数据模型变更
- [x] **可访问性标准**: 键盘导航、屏幕阅读器支持完整 ✅ Monaco Editor 原生支持键盘导航和可访问性
- [x] **轻量依赖**: 选择的库符合 YAGNI 原则，避免过度工程 ✅ Monaco Editor 虽然较大（~3MB），但功能强大且符合需求
- [x] **测试覆盖**: 单元测试 + 组件测试 + 浏览器 E2E 测试计划完整 ✅ 见下方测试计划

**Constitution 合规性说明**:
- Monaco Editor 包体积较大（约 3MB），但提供了完整的编辑器功能和优秀的视觉体验，符合用户需求
- 通过 Vite 的代码分割和懒加载优化，可以减少初始加载时间
- Monaco Editor 的可访问性和键盘支持优于 CodeMirror，符合"可访问性第一"原则

## Project Structure

### Documentation (this feature)

```text
specs/003-monaco-editor/
├── plan.md              # This file
├── research.md          # Phase 0 output - Monaco Editor 最佳实践研究
├── data-model.md        # Phase 1 output - 编辑器配置数据模型
├── quickstart.md        # Phase 1 output - 快速集成指南
├── contracts/           # Phase 1 output - 组件接口定义
│   └── editor-api.ts    # Monaco Editor 组件接口规范
└── checklists/
    └── requirements.md  # 功能需求检查清单
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── editor/
│   │   ├── PromptEditor.tsx          # [修改] 替换为 Monaco Editor
│   │   ├── MonacoEditor.tsx          # [新建] Monaco Editor 封装组件
│   │   ├── EditorToolbar.tsx         # [保持] 工具栏组件
│   │   └── editorTheme.ts            # [新建] Monaco M3 主题配置
│   └── version/
│       ├── CompareModal.tsx          # [修改] 使用 Monaco Diff Editor
│       ├── DiffViewer.tsx            # [修改] 使用 Monaco Diff Editor
│       └── MonacoDiffViewer.tsx      # [新建] Monaco Diff Editor 封装组件
├── services/
│   └── diffService.ts                # [修改] 移除 CodeMirror 依赖
├── store/
│   └── settingsStore.ts              # [保持] 字体大小、行高设置
└── styles/
    └── globals.css                   # [修改] 移除 CodeMirror 样式

tests/
├── unit/
│   └── diffService.test.ts           # [修改] 更新测试用例
├── component/
│   ├── MonacoEditor.test.tsx         # [新建] 编辑器组件测试
│   └── MonacoDiffViewer.test.tsx     # [新建] Diff 组件测试
└── e2e/
    ├── editor-features.e2e.ts        # [新建] 编辑器功能端到端测试
    └── version-compare.e2e.ts        # [新建] 版本对比端到端测试
```

**Structure Decision**: 
采用现有的 Web Application 单项目结构，核心变更集中在 `src/components/editor` 和 `src/components/version` 目录。新增 Monaco Editor 相关的封装组件和主题配置文件，保持与现有代码组织结构的一致性。

## Complexity Tracking

**无 Constitution 违规项**

此功能完全符合项目章程的所有核心原则：
- 本地优先：Monaco Editor 是纯前端库
- M3 合规：通过自定义主题实现
- 平台无关：无平台特定依赖
- 数据模型：不涉及数据结构变更
- 可访问性：Monaco Editor 原生支持
- 轻量依赖：虽然包体积较大，但功能强大且是用户明确要求
- 测试覆盖：完整的三层测试计划

## Phase 0: Research & Decision Log

*将在 research.md 中详细记录*

### Research Tasks

1. **Monaco Editor React 集成最佳实践**
   - 研究 `@monaco-editor/react` 的最佳使用模式
   - 了解如何配置 Monaco Editor 的语言支持（Markdown）
   - 研究如何实现自定义快捷键绑定

2. **Monaco Diff Editor 使用模式**
   - 研究 Monaco Diff Editor 的配置选项
   - 了解如何实现同步滚动
   - 研究如何获取差异统计信息

3. **Material Design 3 主题适配**
   - 研究如何自定义 Monaco Editor 主题
   - 确定如何将 M3 色彩方案映射到 Monaco 主题定义
   - 研究字体、行高、间距的配置方式

4. **性能优化策略**
   - 研究如何实现 Monaco Editor 的懒加载
   - 了解如何优化大文件（10,000+ 行）的性能
   - 研究 Vite 中如何配置 Monaco Editor 的 Web Worker

5. **CodeMirror 迁移路径**
   - 识别所有使用 CodeMirror 的代码位置
   - 制定逐步替换策略
   - 确定如何保持功能对等（搜索、快捷键、只读模式）

## Phase 1: Design Artifacts

*将生成以下文件*

### data-model.md
定义 Monaco Editor 相关的配置数据结构：
- 主题配置对象结构
- 编辑器选项映射（字体大小、行高等）
- Diff Editor 配置选项

### contracts/editor-api.ts
定义组件接口规范：
- `MonacoEditor` 组件 Props 接口
- `MonacoDiffViewer` 组件 Props 接口
- 事件回调类型定义
- 主题配置类型定义

### quickstart.md
快速集成指南：
- Monaco Editor 依赖安装步骤
- Vite 配置调整（Web Worker 支持）
- 基础使用示例
- 常见问题解决

## Testing Strategy

### 单元测试 (Vitest)
**目标**: 验证核心逻辑和配置正确性

测试文件：`tests/unit/`
- `editorTheme.test.ts`: 验证 M3 主题配置正确生成
- `diffService.test.ts`: 更新测试以验证与 Monaco 的集成（相似度计算逻辑不变）

### 组件测试 (React Testing Library)
**目标**: 验证 React 组件的交互和状态管理

测试文件：`tests/component/`
- `MonacoEditor.test.tsx`:
  - 测试组件挂载和卸载
  - 测试内容变化的回调
  - 测试只读模式
  - 测试字体大小和行高配置生效
- `MonacoDiffViewer.test.tsx`:
  - 测试 Diff 视图渲染
  - 测试左右内容正确显示
  - 测试只读模式

### 浏览器端到端测试 (chrome-devtools-mcp)
**目标**: 验证完整用户流程和真实浏览器行为

测试文件：`tests/e2e/`
- `editor-features.e2e.ts`:
  - 场景1: 打开编辑器，验证 Monaco Editor 渲染
  - 场景2: 输入文本，验证 Markdown 语法高亮
  - 场景3: 按 Ctrl+F，验证搜索框打开
  - 场景4: 按 Ctrl+Enter，验证保存为新版本
  - 场景5: 按 Ctrl+Shift+Enter，验证原地保存
  - 场景6: 调整字体大小和行高，验证设置生效
  - 场景7: 输入 10,000 行内容，验证性能无卡顿

- `version-compare.e2e.ts`:
  - 场景1: 打开版本对比，验证 Monaco Diff Editor 渲染
  - 场景2: 验证差异高亮正确显示
  - 场景3: 滚动左侧，验证右侧同步滚动
  - 场景4: 验证相似度统计显示
  - 场景5: 切换并排/内联模式（如果支持）

**测试执行计划**:
- 本地开发：`pnpm run test` (单元+组件), `pnpm run test:e2e` (浏览器)
- 功能实现后立即执行浏览器测试验证
- 测试失败则阻止代码合并

## Migration Checklist

### 依赖管理
- [ ] 安装 monaco-editor 和 @monaco-editor/react
- [ ] 配置 Vite 支持 Monaco Editor Web Workers
- [ ] 移除 @codemirror/* 和 @uiw/react-codemirror 依赖
- [ ] 验证 package.json 和 pnpm-lock.yaml

### 组件替换
- [ ] 实现 MonacoEditor.tsx 封装组件
- [ ] 实现 editorTheme.ts M3 主题配置
- [ ] 更新 PromptEditor.tsx 使用 Monaco Editor
- [ ] 实现 MonacoDiffViewer.tsx 封装组件
- [ ] 更新 CompareModal.tsx 使用 Monaco Diff Editor
- [ ] 更新 DiffViewer.tsx 使用 Monaco Diff Editor

### 服务层更新
- [ ] 更新 diffService.ts，移除 CodeMirror 导入
- [ ] 验证相似度计算逻辑不受影响

### 样式调整
- [ ] 移除 globals.css 中的 CodeMirror 样式
- [ ] 添加 Monaco Editor 容器样式（如需要）
- [ ] 验证编辑器与周边 UI 的样式协调

### 测试覆盖
- [ ] 编写单元测试
- [ ] 编写组件测试
- [ ] 编写浏览器 E2E 测试
- [ ] 执行所有测试并确保通过

### 验证与优化
- [ ] 验证所有快捷键功能正常
- [ ] 验证搜索功能正常
- [ ] 验证只读模式正常
- [ ] 验证字体大小和行高设置生效
- [ ] 验证 Markdown 语法高亮正确
- [ ] 验证 Diff 视图差异显示清晰
- [ ] 性能测试（10,000 行内容）
- [ ] 响应式布局测试（窗口大小变化）

## Risk Assessment

### 高风险项
1. **Monaco Editor 包体积**
   - 风险：约 3MB 的体积可能影响首次加载时间
   - 缓解：使用 Vite 代码分割，懒加载 Monaco Editor，使用 CDN 缓存

2. **快捷键冲突**
   - 风险：Monaco Editor 内置快捷键可能与应用快捷键冲突
   - 缓解：仔细配置 Monaco Editor 的键盘映射，禁用冲突的内置快捷键

### 中风险项
1. **主题适配复杂度**
   - 风险：Monaco Editor 主题配置可能无法完全匹配 M3 色彩方案
   - 缓解：详细研究 Monaco 主题 API，进行精细调整

2. **Diff Editor 功能对等**
   - 风险：Monaco Diff Editor 的功能可能与 CodeMirror Merge View 不完全一致
   - 缓解：提前研究 Monaco Diff Editor API，确认功能覆盖

### 低风险项
1. **TypeScript 类型定义**
   - 风险：Monaco Editor 类型定义可能需要额外配置
   - 缓解：`@monaco-editor/react` 提供了完整的 TypeScript 支持

## Success Metrics

根据 spec.md 中的 Success Criteria 定义：

- **SC-001**: 用户视觉满意度提升 → 通过用户反馈验证
- **SC-002**: 编辑器渲染 < 500ms → 通过性能测试验证
- **SC-003**: 所有功能 100% 正常 → 通过 E2E 测试验证
- **SC-004**: Diff 视图清晰度提升 → 通过视觉对比验证
- **SC-005**: 对比操作 < 3s → 通过性能测试验证
- **SC-006**: 10,000 行无卡顿 → 通过性能测试验证
- **SC-007**: 完全移除 CodeMirror → 通过依赖检查验证
- **SC-008**: M3 风格一致 → 通过视觉审查验证

## Next Steps

1. 执行 Phase 0 研究，生成 `research.md`
2. 执行 Phase 1 设计，生成 `data-model.md`, `contracts/`, `quickstart.md`
3. 更新 agent context (`.specify/memory/codebuddy.md` 或对应文件)
4. 进入 Phase 2，使用 `/speckit.tasks` 生成详细任务分解
