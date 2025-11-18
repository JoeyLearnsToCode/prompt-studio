/**
 * Monaco Editor 组件接口契约
 * 
 * 本文件定义了 Monaco Editor 相关组件的 TypeScript 接口规范
 * 用于确保组件之间的类型安全和 API 一致性
 */

import type { editor, Monaco } from 'monaco-editor';

// ============================================================================
// 编辑器组件 Props 接口
// ============================================================================

/**
 * MonacoEditor 组件 Props
 * 
 * 主编辑器组件的属性接口，用于替换 PromptEditor
 */
export interface MonacoEditorProps {
  /** 编辑器内容 */
  value: string;
  
  /** 内容变化回调 */
  onChange: (value: string) => void;
  
  /** 保存为新版本回调（Ctrl+Enter） */
  onSave?: () => void;
  
  /** 原地保存回调（Ctrl+Shift+Enter） */
  onSaveInPlace?: () => void;
  
  /** 是否只读 */
  readOnly?: boolean;
  
  /** 自定义编辑器选项（可选） */
  options?: Partial<editor.IStandaloneEditorConstructionOptions>;
  
  /** 编辑器挂载完成回调 */
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  
  /** 编辑器挂载前回调 */
  beforeMount?: (monaco: Monaco) => void;
  
  /** 自定义类名 */
  className?: string;
  
  /** 编辑器高度 */
  height?: string | number;
}

/**
 * MonacoDiffViewer 组件 Props
 * 
 * Diff 编辑器组件的属性接口，用于版本对比
 */
export interface MonacoDiffViewerProps {
  /** 左侧（原始）内容 */
  leftContent: string;
  
  /** 右侧（修改后）内容 */
  rightContent: string;
  
  /** 左侧标签 */
  leftLabel?: string;
  
  /** 右侧标签 */
  rightLabel?: string;
  
  /** 显示模式：并排或内联 */
  mode?: 'side-by-side' | 'inline';
  
  /** 是否显示相似度统计 */
  showSimilarity?: boolean;
  
  /** 自定义 Diff 编辑器选项 */
  options?: Partial<editor.IStandaloneDiffEditorConstructionOptions>;
  
  /** Diff 编辑器挂载完成回调 */
  onMount?: (diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) => void;
  
  /** 自定义类名 */
  className?: string;
  
  /** 编辑器高度 */
  height?: string | number;
}

// ============================================================================
// 主题配置接口
// ============================================================================

/**
 * M3 色彩常量
 */
export interface M3Colors {
  // Surface 层级
  readonly surface: string;
  readonly surfaceVariant: string;
  readonly onSurface: string;
  readonly onSurfaceVariant: string;
  
  // Primary 主色
  readonly primary: string;
  readonly primaryContainer: string;
  readonly onPrimary: string;
  
  // Secondary 辅助色
  readonly secondary: string;
  readonly secondaryContainer: string;
  
  // Tertiary 第三色
  readonly tertiary: string;
  readonly tertiaryContainer: string;
  
  // Error 错误色
  readonly error: string;
  readonly errorContainer: string;
  
  // Outline 边框
  readonly outline: string;
  readonly outlineVariant: string;
  
  // Diff 颜色
  readonly diffInserted: string;
  readonly diffRemoved: string;
  
  // 功能色
  readonly searchMatch: string;
  readonly link: string;
  readonly code: string;
}

/**
 * M3 编辑器主题配置
 */
export interface M3EditorTheme extends editor.IStandaloneThemeData {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: editor.ITokenThemeRule[];
  colors: editor.IColors;
}

// ============================================================================
// 编辑器选项接口
// ============================================================================

/**
 * 应用编辑器选项
 * 
 * 从应用设置映射到 Monaco 编辑器选项
 */
export interface AppEditorOptions {
  /** 字体大小（像素） */
  fontSize: number;
  
  /** 行高（像素） */
  lineHeight: number;
  
  /** 是否只读 */
  readOnly: boolean;
}

/**
 * 完整编辑器选项
 * 
 * 继承 Monaco 原生选项并添加应用特定配置
 */
export interface EditorOptions extends editor.IStandaloneEditorConstructionOptions {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  readOnly: boolean;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  minimap: {
    enabled: boolean;
  };
  scrollBeyondLastLine: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  folding: boolean;
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
  automaticLayout: boolean;
}

/**
 * Diff 编辑器选项
 */
export interface DiffEditorOptions extends editor.IStandaloneDiffEditorConstructionOptions {
  renderSideBySide: boolean;
  readOnly: boolean;
  enableSplitViewResizing: boolean;
  ignoreTrimWhitespace: boolean;
  renderOverviewRuler: boolean;
  originalEditable: boolean;
  fontSize: number;
  lineHeight: number;
}

// ============================================================================
// 快捷键配置接口
// ============================================================================

/**
 * 快捷键配置
 */
export interface KeyBindingConfig {
  /** 快捷键组合（KeyMod + KeyCode） */
  keybinding: number;
  
  /** 执行的命令 */
  handler: () => void;
  
  /** 快捷键上下文（可选） */
  context?: string;
  
  /** 快捷键描述（用于文档） */
  description?: string;
}

// ============================================================================
// 编辑器实例引用接口
// ============================================================================

/**
 * 编辑器实例引用
 */
export interface EditorRefs {
  /** Monaco 编辑器实例 */
  editor: editor.IStandaloneCodeEditor | null;
  
  /** Monaco 全局对象 */
  monaco: Monaco | null;
  
  /** Diff 编辑器实例 */
  diffEditor: editor.IStandaloneDiffEditor | null;
}

// ============================================================================
// 事件回调接口
// ============================================================================

/**
 * 编辑器事件回调
 */
export interface EditorEvents {
  /** 内容变化 */
  onChange?: (value: string) => void;
  
  /** 保存（Ctrl+Enter） */
  onSave?: () => void;
  
  /** 原地保存（Ctrl+Shift+Enter） */
  onSaveInPlace?: () => void;
  
  /** 编辑器挂载完成 */
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  
  /** 编辑器挂载前 */
  beforeMount?: (monaco: Monaco) => void;
  
  /** 编辑器卸载 */
  onUnmount?: () => void;
}

/**
 * Diff 编辑器事件回调
 */
export interface DiffEditorEvents {
  /** Diff 编辑器挂载完成 */
  onMount?: (diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) => void;
  
  /** Diff 编辑器挂载前 */
  beforeMount?: (monaco: Monaco) => void;
  
  /** Diff 编辑器卸载 */
  onUnmount?: () => void;
}

// ============================================================================
// Diff 相关接口
// ============================================================================

/**
 * Diff 操作类型
 */
export type DiffOperation = 'insert' | 'delete' | 'equal';

/**
 * Diff 结果项
 */
export interface DiffResult {
  operation: DiffOperation;
  text: string;
}

/**
 * 相似度统计
 */
export interface SimilarityStats {
  /** 相似度百分比 (0-100) */
  similarity: number;
  
  /** 插入行数 */
  insertedLines: number;
  
  /** 删除行数 */
  deletedLines: number;
  
  /** 相同行数 */
  equalLines: number;
  
  /** 总行数 */
  totalLines: number;
}

// ============================================================================
// 服务接口
// ============================================================================

/**
 * Diff 服务接口
 * 
 * 用于计算文本差异和相似度
 * 保持现有实现，不依赖 Monaco
 */
export interface DiffService {
  /**
   * 计算两个文本的差异
   * 
   * @param left 左侧文本
   * @param right 右侧文本
   * @returns Diff 结果数组
   */
  computeDiff(left: string, right: string): DiffResult[];
  
  /**
   * 计算相似度
   * 
   * @param left 左侧文本
   * @param right 右侧文本
   * @returns 相似度百分比 (0-100)
   */
  computeSimilarity(left: string, right: string): number;
  
  /**
   * 计算详细统计
   * 
   * @param left 左侧文本
   * @param right 右侧文本
   * @returns 详细统计信息
   */
  computeStats(left: string, right: string): SimilarityStats;
}

// ============================================================================
// 配置函数接口
// ============================================================================

/**
 * 设置映射函数类型
 */
export type MapSettingsToEditorOptions = (settings: AppEditorOptions) => EditorOptions;

/**
 * Diff 编辑器选项创建函数类型
 */
export type CreateDiffEditorOptions = (
  fontSize?: number,
  lineHeight?: number
) => DiffEditorOptions;

/**
 * 快捷键注册函数类型
 */
export type RegisterKeybindings = (
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  keybindings: KeyBindingConfig[]
) => void;

/**
 * 编辑器选项验证函数类型
 */
export type ValidateEditorOptions = (
  options: Partial<EditorOptions>
) => EditorOptions;

// ============================================================================
// 组件状态接口
// ============================================================================

/**
 * 编辑器组件内部状态
 */
export interface EditorComponentState {
  /** 编辑器是否已加载 */
  isLoaded: boolean;
  
  /** 编辑器是否正在加载 */
  isLoading: boolean;
  
  /** 当前编辑器值 */
  value: string;
  
  /** 错误状态 */
  error: Error | null;
}

/**
 * Diff 编辑器组件内部状态
 */
export interface DiffEditorComponentState {
  /** Diff 编辑器是否已加载 */
  isLoaded: boolean;
  
  /** 原始内容 */
  original: string;
  
  /** 修改后内容 */
  modified: string;
  
  /** 相似度统计 */
  stats: SimilarityStats | null;
  
  /** 错误状态 */
  error: Error | null;
}

// ============================================================================
// 验证配置接口
// ============================================================================

/**
 * 编辑器选项验证规则
 */
export interface EditorOptionsValidation {
  fontSize: {
    min: number;
    max: number;
    default: number;
  };
  lineHeight: {
    min: number;
    max: number;
    default: number;
  };
}

// ============================================================================
// 导出类型守卫
// ============================================================================

/**
 * 检查是否为有效的 Diff 操作
 */
export function isDiffOperation(value: string): value is DiffOperation {
  return value === 'insert' || value === 'delete' || value === 'equal';
}

/**
 * 检查是否为有效的显示模式
 */
export function isValidMode(value: string): value is 'side-by-side' | 'inline' {
  return value === 'side-by-side' || value === 'inline';
}
