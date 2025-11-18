# Prompt Studio - 下一步任务清单

**当前状态**: ✅ MVP 完成，核心功能可用 (v0.4 Beta)  
**完成度**: 约 75% (93/124 任务)

## 🔥 高优先级任务（建议 1-2 周内完成）

### 1. 补充单元测试 (T064, T083, T084, T096)
**目标**: 提升测试覆盖率到 80%+

**待测试 services**:
- [ ] `folderManager.ts` - 文件夹管理服务
  - 创建/重命名/删除文件夹
  - 级联删除逻辑
  - 孤儿节点处理

- [ ] `exportService.ts` - 导入导出服务
  - JSON 序列化和反序列化
  - ZIP 打包和解包
  - 数据验证

- [ ] `webdavService.ts` - WebDAV 服务
  - 连接测试
  - 上传/下载
  - 错误处理

- [ ] `attachmentManager.ts` - 附件管理服务
  - 文件上传验证
  - 缩略图生成
  - Blob 存储和检索

**文件路径**:
```
tests/unit/folderManager.test.ts
tests/unit/exportService.test.ts
tests/unit/webdavService.test.ts
tests/unit/attachmentManager.test.ts
```

**估算时间**: 2-3 天

### 2. 补充组件测试 (T065, T075, T097)
**目标**: 验证关键组件的渲染和交互

**待测试组件**:
- [ ] `FolderTree.tsx` - 文件夹树组件
  - 树形渲染
  - 展开/折叠
  - 右键菜单
  
- [ ] `AttachmentGallery.tsx` - 附件画廊组件
  - 缩略图显示
  - 图片预览
  - 删除操作

**文件路径**:
```
tests/component/FolderTree.test.tsx
tests/component/AttachmentGallery.test.tsx
```

**估算时间**: 1-2 天

### 3. 完善 E2E 测试 (T058, T066, T085, T098)
**目标**: 覆盖关键用户流程

**待创建测试**:
- [ ] `version-diff.e2e.ts` - 版本对比流程
  - 选择两个版本
  - 打开 Diff 视图
  - 验证高亮显示
  
- [ ] `folder-management.e2e.ts` - 文件夹管理流程
  - 创建多层文件夹
  - 拖拽移动项目（如果T071完成）
  - 删除文件夹验证级联

- [ ] `import-export.e2e.ts` - 导入导出流程
  - 导出项目为 ZIP
  - 导入 ZIP 验证数据恢复

- [ ] `attachment-management.e2e.ts` - 附件管理流程
  - 上传图片
  - 预览大图
  - 删除附件

**文件路径**:
```
tests/e2e/version-diff.e2e.ts
tests/e2e/folder-management.e2e.ts
tests/e2e/import-export.e2e.ts
tests/e2e/attachment-management.e2e.ts
```

**估算时间**: 2-3 天

### 4. 实现项目拖拽功能 (T071)
**目标**: 完成 Phase 6 (US4) 的最后一个任务

**实现内容**:
- [ ] 集成 `react-dnd` 或使用原生 HTML5 Drag & Drop API
- [ ] 实现项目拖拽到文件夹
- [ ] 实现文件夹拖拽到文件夹
- [ ] 添加拖拽视觉反馈
- [ ] 更新数据库中的 `folderId` 或 `parentId`

**涉及文件**:
- `src/components/layout/FolderTree.tsx`
- `src/components/layout/ProjectList.tsx`
- `src/services/projectManager.ts`
- `src/services/folderManager.ts`

**估算时间**: 1-2 天

---

## 📦 中优先级任务（建议 1 个月内完成）

### 5. 实现 Prompt 片段库 (Phase 7 - T074~T082)
**目标**: 提升用户效率，快速复用常用片段

**任务列表**:
- [ ] T074: 单元测试 `snippetManager.ts`
- [ ] T075: 组件测试 `SnippetPicker.tsx`
- [ ] T076: E2E 测试片段库流程
- [ ] T077: 实现 `snippetManager.ts` 服务
- [ ] T078: 实现 `SnippetPicker.tsx` 组件
- [ ] T079: 实现 `SnippetLibrary.tsx` 页面
- [ ] T080: 实现片段保存功能（从编辑器选中文本）
- [ ] T081: 实现片段插入功能（插入到 CodeMirror 光标位置）
- [ ] T082: 实现片段编辑/删除功能

**技术细节**:
- 使用 IndexedDB `snippets` 表
- CodeMirror 扩展：选中文本 → 保存片段
- CodeMirror 命令：插入片段到光标位置
- 片段管理界面：列表 + 搜索 + 编辑/删除

**估算时间**: 3-5 天

### 6. 性能优化 (Phase 10 - T107~T109)
**目标**: 支持大数据场景（200+ 版本，50+ 附件）

**优化任务**:
- [ ] T107: 实现存储配额监控 (`navigator.storage.estimate`)
- [ ] T108: 优化画布渲染性能
  - 虚拟滚动（仅渲染可见节点）
  - Canvas 降级（>500 节点时）
  - 节流缩放/平移事件（100ms）
  
- [ ] T109: 优化 IndexedDB 查询性能
  - 批量操作（`bulkAdd`, `bulkPut`）
  - 索引优化
  - 查询缓存

**技术方案**:
- `react-window` 或自定义虚拟滚动
- Canvas API 替代 SVG（大节点场景）
- Dexie.js 批量操作 API

**估算时间**: 3-4 天

### 7. 可访问性增强 (Phase 10 - T110~T112)
**目标**: 符合 WCAG 2.1 AA 标准

**增强任务**:
- [ ] T110: 完善键盘导航
  - Tab/Shift+Tab 焦点顺序
  - Enter/Space 触发按钮
  - Arrow Keys 导航列表/树
  - Esc 关闭模态框
  
- [ ] T111: 添加 ARIA 标签
  - `aria-label` 图标按钮
  - `aria-expanded` 折叠状态
  - `aria-selected` 选中状态
  - `role` 语义化元素
  
- [ ] T112: 验证色彩对比度
  - 所有文本至少 4.5:1 对比度
  - 交互元素至少 3:1 对比度
  - 使用对比度检查工具验证

**工具**:
- axe DevTools (浏览器扩展)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse 可访问性审计

**估算时间**: 2-3 天

### 8. 错误处理和用户提示 (Phase 10 - T113~T115)
**目标**: 提升应用健壮性和用户体验

**任务列表**:
- [ ] T113: 实现全局错误边界 (React Error Boundary)
- [ ] T114: 实现数据完整性验证
  - 启动时检查孤儿数据
  - 自动修复引用错误
  - 错误日志记录
  
- [ ] T115: 实现用户友好的错误提示
  - Toast 通知组件
  - 错误消息本地化
  - 错误恢复建议

**技术方案**:
- `react-error-boundary` 库
- 启动时运行 `validateDataIntegrity()`
- `react-hot-toast` 或自定义 Toast 组件

**估算时间**: 2 天

---

## 🌟 低优先级任务（建议 2-3 个月内完成）

### 9. 文档和部署 (Phase 10 - T116~T120)
- [ ] T116: 编写用户文档 (`README.md`)
- [ ] T117: 编写开发者文档 (`docs/ARCHITECTURE.md`)
- [ ] T118: 验证 `quickstart.md` 指南
- [ ] T119: 配置生产构建优化
- [ ] T120: 准备部署配置 (Cloudflare Workers / Deno Deploy)

### 10. 测试验证 (Phase 10 - T121~T124)
- [ ] T121: 执行完整测试套件
- [ ] T122: 浏览器兼容性测试 (Chrome, Firefox, Safari, Edge)
- [ ] T123: 离线功能验证
- [ ] T124: 数据持久化压力测试 (200 版本 + 50 附件)

---

## 📅 建议时间表

### 第 1-2 周：高优先级任务
- **周 1**: 补充单元测试 (T064, T083, T084, T096) + 组件测试 (T065, T097)
- **周 2**: E2E 测试 (T058, T066, T085, T098) + 项目拖拽 (T071)

**里程碑**: ✅ 测试覆盖率达到 80%+，Phase 6 完全完成

### 第 3-4 周：中优先级任务（第一批）
- **周 3**: 实现 Prompt 片段库 (T077~T082)
- **周 4**: 性能优化 (T107~T109)

**里程碑**: ✅ Phase 7 完成，支持大数据场景

### 第 5-6 周：中优先级任务（第二批）
- **周 5**: 可访问性增强 (T110~T112)
- **周 6**: 错误处理和用户提示 (T113~T115)

**里程碑**: ✅ 应用健壮性和可访问性达标

### 第 7-8 周：低优先级任务
- **周 7**: 文档和部署 (T116~T120)
- **周 8**: 测试验证和发布准备 (T121~T124)

**里程碑**: ✅ v1.0 稳定版发布

---

## 🎯 关键决策点

### 是否需要项目拖拽？
**建议**: **是**，这是文件夹组织功能的重要补充，提升用户体验。

**替代方案**: 如果时间紧张，可以先通过右键菜单"移动到"功能实现。

### 是否需要 Prompt 片段库？
**建议**: **中优先级**，对重度用户很有价值，但不影响核心流程。

**替代方案**: 用户可以暂时通过复制粘贴常用片段。

### 是否需要完整的性能优化？
**建议**: **按需实现**，先观察真实用户数据量：
- 如果大多数用户 < 50 版本，可延后
- 如果有用户反馈性能问题，优先实现

### 是否需要完整的可访问性？
**建议**: **分阶段实现**：
- **Phase 1**: 键盘导航（T110）- 高优先级
- **Phase 2**: ARIA 标签（T111）- 中优先级
- **Phase 3**: 色彩对比度验证（T112）- 低优先级（已基本符合）

---

## ✅ 验收标准

### 发布 v0.5 Beta 的最低要求
- [x] MVP 功能完整（US1 + US2）
- [x] 核心扩展功能可用（US3, US4, US6, US7）
- [ ] 测试覆盖率 >= 80%
- [ ] 无严重 bug
- [ ] 基本文档完成

### 发布 v1.0 稳定版的要求
- [ ] 所有 P1-P3 功能完成
- [ ] 测试覆盖率 >= 90%
- [ ] 通过浏览器兼容性测试
- [ ] 通过性能压力测试
- [ ] 符合 WCAG 2.1 AA 标准
- [ ] 完整用户文档和开发者文档

---

**优先执行**: 高优先级任务 1-4  
**时间预估**: 6-8 天  
**预期成果**: 测试覆盖率达标，Phase 6 完成，项目质量显著提升

🚀 **立即开始**: 从任务 1（补充单元测试）开始！
