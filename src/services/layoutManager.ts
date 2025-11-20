/**
 * 布局偏好管理服务
 * 负责持久化和恢复布局配置
 */

import { storage, STORAGE_KEYS } from '@/utils/storage';

export interface LayoutPreference {
  canvasPanelWidthRatio: number; // 主画布宽度占比 (0.2 - 0.8)
  editorHeightRatio: number; // 编辑器高度占比 (0.3 - 0.9)
  sidebarCollapsed?: boolean;
}

const DEFAULT_LAYOUT: LayoutPreference = {
  canvasPanelWidthRatio: 0.6,
  editorHeightRatio: 0.7,
  sidebarCollapsed: false,
};

/**
 * 验证并限制宽度比例
 */
export function validateLayoutRatio(ratio: number): number {
  if (typeof ratio !== 'number' || isNaN(ratio)) {
    return DEFAULT_LAYOUT.canvasPanelWidthRatio;
  }
  
  // 限制范围: 0.2 - 0.8
  return Math.max(0.2, Math.min(0.8, ratio));
}

/**
 * 验证并限制编辑器高度比例
 */
export function validateEditorHeightRatio(ratio: number): number {
  if (typeof ratio !== 'number' || isNaN(ratio)) {
    return DEFAULT_LAYOUT.editorHeightRatio;
  }
  
  // 限制范围: 0.3 - 0.9
  return Math.max(0.3, Math.min(0.9, ratio));
}

export const layoutManager = {
  /**
   * 加载布局偏好
   */
  loadPreference(): LayoutPreference {
    const ratio = storage.get(STORAGE_KEYS.CANVAS_RATIO, DEFAULT_LAYOUT.canvasPanelWidthRatio);
    const editorRatio = storage.get(STORAGE_KEYS.EDITOR_HEIGHT_RATIO, DEFAULT_LAYOUT.editorHeightRatio);
    const sidebarCollapsed = storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, DEFAULT_LAYOUT.sidebarCollapsed);

    return {
      canvasPanelWidthRatio: validateLayoutRatio(ratio),
      editorHeightRatio: validateEditorHeightRatio(editorRatio),
      sidebarCollapsed,
    };
  },

  /**
   * 保存宽度比例
   */
  saveCanvasRatio(ratio: number): void {
    const validatedRatio = validateLayoutRatio(ratio);
    storage.set(STORAGE_KEYS.CANVAS_RATIO, validatedRatio);
  },

  /**
   * 保存编辑器高度比例
   */
  saveEditorHeightRatio(ratio: number): void {
    const validatedRatio = validateEditorHeightRatio(ratio);
    storage.set(STORAGE_KEYS.EDITOR_HEIGHT_RATIO, validatedRatio);
  },

  /**
   * 保存侧边栏折叠状态
   */
  saveSidebarCollapsed(collapsed: boolean): void {
    storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  },

  /**
   * 重置为默认值
   */
  reset(): void {
    storage.remove(STORAGE_KEYS.CANVAS_RATIO);
    storage.remove(STORAGE_KEYS.EDITOR_HEIGHT_RATIO);
    storage.remove(STORAGE_KEYS.SIDEBAR_COLLAPSED);
  },
};
