# Tasks: 版本增强功能集

**Feature Branch**: `002-version-enhancements`  
**Input**: Design documents from `/specs/002-version-enhancements/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 本功能包含浏览器E2E测试(使用chrome-devtools-mcp),符合项目测试要求。

**Organization**: 任务按用户故事组织,每个故事可独立实现和测试。

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 所属用户故事(US1, US2, US3, US4, US5, US6)
- 包含精确的文件路径

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基础结构准备

**Constitution对齐**: 
- TypeScript 5.3.3 + React 18.2 + TailwindCSS 3.4 + Vite 5.0.8
- IndexedDB (Dexie.js 3.2.4) 作为唯一存储方案
- Material Design 3 色彩系统(种子色: rgb(207, 235, 131))
- 测试环境: Vitest 1.0.4 + React Testing Library 14.1.2 + chrome-devtools-mcp

- [X] T001 验证现有项目结构符合plan.md规范
- [X] T002 [P] 确认所有依赖已安装(@codemirror/merge, js-sha256, zustand等)
- [X] T003 [P] 配置localStorage辅助工具 in src/utils/storage.ts
- [X] T004 [P] 验证chrome-devtools-mcp浏览器测试工具可用

**Checkpoint**: 基础设施准备完毕,可以开始用户故事开发

---

## Phase 2: Foundational (阻塞性前置任务)

**目的**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事

- [X] T005 扩展VersionStore: 添加compareState状态 in src/store/versionStore.ts
- [X] T006 [P] 扩展UIStore: 添加layoutPreference状态 in src/store/uiStore.ts
- [X] T007 [P] 创建SearchStore: 定义searchState和操作 in src/store/searchStore.ts
- [X] T008 实现contentHash计算工具函数 in src/utils/hash.ts
- [X] T009 [P] 创建layoutManager服务框架 in src/services/layoutManager.ts

**Checkpoint**: Foundation ready - 用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 版本对比 (Priority: P1) 🎯 MVP

**Goal**: 实现全屏对比模态框,使用@codemirror/merge显示两个版本的并排Diff视图

**Independent Test**: 创建两个内容不同的版本,选中一个点击"对比",选择另一个,验证对比模态框正确展示差异

### 实现任务

- [X] T010 [P] [US1] 升级diffService: 集成@codemirror/merge的MergeView in src/services/diffService.ts
- [X] T011 [P] [US1] 创建useVersionCompare hook: 封装对比状态逻辑 in src/hooks/useVersionCompare.ts
- [X] T012 [US1] 实现CompareModal组件(按照contract规范) in src/components/version/CompareModal.tsx
- [X] T013 [US1] 扩展versionStore: 实现openCompare, setCompareTarget, closeCompare方法 in src/store/versionStore.ts
- [X] T014 [US1] 在EditorToolbar添加"对比"按钮 in src/components/editor/EditorToolbar.tsx (假设路径)
- [X] T015 [US1] 集成CompareModal到MainView in src/pages/MainView.tsx

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T016 [US1] E2E测试: 完整对比流程(打开对比→选择版本→查看Diff→关闭) in tests/e2e/version-compare.e2e.ts

**Checkpoint**: User Story 1完成 - 版本对比功能可独立使用

---

## Phase 4: User Story 2 - 重复内容提醒 (Priority: P2)

**Goal**: 在创建新版本时,检测contentHash重复并弹出提醒对话框

**Independent Test**: 创建一个版本,再次创建内容完全相同的子版本,验证系统弹出重复提醒

### 实现任务

- [X] T017 [P] [US2] 实现checkDuplicate方法 in src/store/versionStore.ts
- [X] T018 [US2] 在createVersion方法中集成去重检查逻辑 in src/store/versionStore.ts
- [X] T019 [US2] 创建DuplicateDialog组件(按照contract规范) in src/components/common/DuplicateDialog.tsx
- [X] T020 [US2] 集成DuplicateDialog到版本保存流程 in src/components/editor/EditorToolbar.tsx (或相关组件)

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T021 [US2] E2E测试: 重复提醒流程(创建版本→重复内容→弹出对话框→取消/仍然创建) in tests/e2e/duplicate-warning.e2e.ts

**Checkpoint**: User Story 2完成 - 重复提醒功能独立工作

---

## Phase 5: User Story 3 - 面板宽度调节 (Priority: P2)

**Goal**: 实现主画布与右侧面板之间的可拖动分隔符,支持宽度比例持久化

**Independent Test**: 拖动分隔符调整面板宽度,刷新页面验证宽度保持

### 实现任务

- [X] T022 [P] [US3] 创建useResizable hook: 封装拖动逻辑 in src/hooks/useResizable.ts
- [X] T023 [P] [US3] 实现layoutManager: localStorage读写 in src/services/layoutManager.ts
- [X] T024 [US3] 创建ResizableSplitter组件(按照contract规范) in src/components/common/ResizableSplitter.tsx
- [X] T025 [US3] 扩展uiStore: 实现setCanvasRatio, startDragging, stopDragging, loadLayoutPreference, saveLayoutPreference in src/store/uiStore.ts
- [X] T026 [US3] 重构MainView: 集成ResizableSplitter和响应式布局 in src/pages/MainView.tsx

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T027 [US3] E2E测试: 面板拖动和持久化(拖动分隔符→调整宽度→刷新页面→验证宽度保持) in tests/e2e/panel-resize.e2e.ts

**Checkpoint**: User Story 3完成 - 面板拖动功能独立工作

---

## Phase 6: User Story 5 - 版本树搜索 (Priority: P2)

**Goal**: 实现版本树全文搜索,支持关键词匹配高亮和结果导航

**Independent Test**: 创建多个包含不同关键词的版本,输入关键词验证匹配高亮和跳转

**注**: User Story 4(非叶子版本保存)优先级P3,放在User Story 5之后

### 实现任务

- [X] T028 [P] [US5] 创建searchService: 实现searchVersions和escapeQuery in src/services/searchService.ts
- [X] T029 [P] [US5] 实现searchStore: executeSearch, nextMatch, prevMatch, clearSearch, focusMatch in src/store/searchStore.ts
- [X] T030 [P] [US5] 创建useVersionSearch hook: 封装搜索状态逻辑 in src/hooks/useVersionSearch.ts
- [X] T031 [US5] 创建SearchBar组件(按照contract规范) in src/components/canvas/SearchBar.tsx
- [X] T032 [US5] 修改VersionCanvas: 集成SearchBar,实现高亮和跳转逻辑 in src/components/canvas/VersionCanvas.tsx

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T033 [US5] E2E测试: 搜索和导航流程(输入关键词→高亮匹配→跳转上一个/下一个→清空搜索) in tests/e2e/version-search.e2e.ts

**Checkpoint**: User Story 5完成 - 版本搜索功能独立工作

---

## Phase 7: User Story 4 - 非叶子版本原地保存 (Priority: P3)

**Goal**: 移除叶子节点限制,允许所有版本使用原地保存功能

**Independent Test**: 创建一个有子版本的父版本,修改父版本内容并使用原地保存,验证父版本内容更新且未创建新版本

### 实现任务

- [X] T034 [US4] 修改updateVersionInPlace: 移除叶子节点限制检查 in src/store/versionStore.ts
- [X] T035 [US4] 添加非叶子版本原地保存的UI警告提示(可选,首次使用时确认对话框) in src/pages/MainView.tsx

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T036 [US4] E2E测试: 非叶子版本原地保存流程(创建父子版本→修改父版本→原地保存→验证版本树未增加节点) in tests/e2e/non-leaf-save.e2e.ts

**Checkpoint**: User Story 4完成 - 非叶子版本保存功能工作

---

## Phase 8: User Story 6 - 版本树画布控制优化 (Priority: P3)

**Goal**: 移动画布控制按钮到右下角,移除操作提示文字

**Independent Test**: 检查右侧面板右下角是否有控制按钮,验证缩放/重置功能,确认左下角提示文字已移除

### 实现任务

- [X] T037 [US6] 修改VersionCanvas: 移动画布控制按钮(放大/缩小/重置)到右下角 in src/components/canvas/VersionCanvas.tsx
- [X] T038 [US6] 移除VersionCanvas左下角的操作提示文字 in src/components/canvas/VersionCanvas.tsx
- [X] T039 [US6] 优化控制按钮样式(M3 Filled Icon Button, 44x44px, elevation level 1) in src/components/canvas/VersionCanvas.tsx

### 浏览器E2E测试 (chrome-devtools-mcp)

- [X] T040 [US6] E2E测试: 画布控制按钮功能(点击放大→缩小→重置,验证画布缩放和位置变化) in tests/e2e/canvas-controls.e2e.ts

**Checkpoint**: User Story 6完成 - UI优化完成

---

## Phase 9: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和整体优化

- [X] T041 [P] 代码重构: 提取公共组件和工具函数
- [X] T042 [P] 性能优化: 搜索防抖(300ms), 面板拖动使用requestAnimationFrame
- [X] T043 [P] 可访问性增强: 确保所有按钮有aria-label, 支持键盘导航
- [X] T044 完整回归测试: 运行所有E2E测试套件 in tests/e2e/
- [X] T045 [P] 文档更新: 更新README和开发指南(如需要)
- [X] T046 代码审查: 确保符合Constitution Check所有要求
- [X] T047 性能验证: 确认所有性能指标达标(见spec.md成功标准)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - 阻塞所有用户故事
- **User Stories (Phase 3-8)**: 所有依赖Foundational完成
  - 用户故事可并行开发(如有人力)
  - 或按优先级顺序: US1(P1) → US2(P2) → US3(P2) → US5(P2) → US4(P3) → US6(P3)
- **Polish (Phase 9)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 3 (P2)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 5 (P2)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 4 (P3)**: Foundational完成后即可开始 - 无其他故事依赖
- **User Story 6 (P3)**: Foundational完成后即可开始 - 无其他故事依赖

### Within Each User Story

- 实现任务在E2E测试之前
- Store扩展 → Service实现 → 组件开发 → 集成 → E2E测试
- 标记[P]的任务可并行(不同文件,无依赖)

### Parallel Opportunities

**Setup Phase**:
- T002, T003, T004 可并行

**Foundational Phase**:
- T006, T007, T009 可并行(与T005无依赖)

**User Story 1**:
- T010, T011 可并行

**User Story 2**:
- T017可独立开始(T018依赖T017)

**User Story 3**:
- T022, T023 可并行

**User Story 5**:
- T028, T029, T030 可并行

**Polish Phase**:
- T041, T042, T043, T045 可并行

**多团队并行策略**:
- Foundational完成后:
  - 开发者A: User Story 1 (P1)
  - 开发者B: User Story 2 (P2)
  - 开发者C: User Story 3 (P2)
  - 开发者D: User Story 5 (P2)

---

## Parallel Example: User Story 1

```bash
# 并行启动实现任务:
Task: T010 [P] [US1] 升级diffService in src/services/diffService.ts
Task: T011 [P] [US1] 创建useVersionCompare hook in src/hooks/useVersionCompare.ts

# 等待上述完成后:
Task: T012 [US1] 实现CompareModal组件 in src/components/version/CompareModal.tsx
```

---

## Implementation Strategy

### MVP First (仅User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 - 版本对比
4. **STOP and VALIDATE**: 独立测试User Story 1
5. 准备就绪可部署/演示

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. Add User Story 2 → 独立测试 → 部署/演示
4. Add User Story 3 → 独立测试 → 部署/演示
5. Add User Story 5 → 独立测试 → 部署/演示
6. Add User Story 4 → 独立测试 → 部署/演示
7. Add User Story 6 → 独立测试 → 部署/演示
8. 每个故事增加价值而不破坏之前的故事

### 建议开发顺序 (单开发者)

**Week 1 (3天)**: Setup + Foundational + User Story 1 (版本对比 - P1, MVP核心)  
**Week 2 (2天)**: User Story 2 (重复提醒 - P2)  
**Week 2 (2天)**: User Story 3 (面板拖动 - P2)  
**Week 3 (3天)**: User Story 5 (版本搜索 - P2)  
**Week 3 (1天)**: User Story 4 (非叶子保存 - P3)  
**Week 3 (1天)**: User Story 6 (UI优化 - P3)  
**Week 4 (2天)**: Polish & 完整测试

**Total**: 约14天 (符合quickstart.md的10-15天估算)

---

## Task Statistics

**Total Tasks**: 47
- Setup: 4 tasks
- Foundational: 5 tasks
- User Story 1 (P1): 7 tasks (包含1个E2E测试)
- User Story 2 (P2): 5 tasks (包含1个E2E测试)
- User Story 3 (P2): 6 tasks (包含1个E2E测试)
- User Story 5 (P2): 6 tasks (包含1个E2E测试)
- User Story 4 (P3): 3 tasks (包含1个E2E测试)
- User Story 6 (P3): 4 tasks (包含1个E2E测试)
- Polish: 7 tasks

**Parallel Tasks**: 18 tasks marked [P]

**E2E Tests**: 6 tests (每个用户故事1个)

**File Modifications**:
- 新增文件: ~15个 (组件、hooks、services、stores)
- 修改文件: ~8个 (现有stores、组件、pages)

**MVP Scope**: User Story 1 only (7 tasks, 3天估算)

---

## Format Validation

✅ **ALL tasks follow checklist format**:
- Checkbox: `- [ ]`
- Task ID: T001-T047
- [P] marker: 18 tasks
- [Story] label: US1-US6 (仅用户故事阶段)
- Description: 包含精确文件路径

✅ **User Story Organization**: 每个故事独立可测试

✅ **Dependencies Clear**: 阻塞性任务明确标注

---

## Constitution Check Alignment

- ✅ **本地优先**: 所有功能纯客户端,无后端依赖
- ✅ **Material Design 3**: 所有组件遵循M3规范
- ✅ **平台无关性**: 核心逻辑与UI分离
- ✅ **扁平化数据**: 所有状态扁平结构,ID引用
- ✅ **可访问性**: 键盘导航、aria-label、触控支持
- ✅ **轻量依赖**: 零新增npm包,复用现有技术栈
- ✅ **测试覆盖**: 每个用户故事1个E2E测试,使用chrome-devtools-mcp

---

**Generated**: 2025-11-16  
**Status**: Ready for Implementation  
**Branch**: `002-version-enhancements`

**开始开发**: `git checkout 002-version-enhancements && pnpm dev`
