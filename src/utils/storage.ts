/**
 * localStorage 封装工具
 * 提供类型安全的读写接口
 */

export const storage = {
  /**
   * 设置值
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  },

  /**
   * 获取值
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultValue;
      
      return JSON.parse(saved) as T;
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * 删除值
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  },

  /**
   * 清空所有
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }
};

/**
 * localStorage 键常量
 */
export const STORAGE_KEYS = {
  CANVAS_RATIO: 'layout.canvasPanelWidthRatio',
  EDITOR_HEIGHT_RATIO: 'layout.editorHeightRatio',
  SIDEBAR_COLLAPSED: 'layout.sidebarCollapsed',
  SEARCH_LAST_QUERY: 'search.lastQuery',
} as const;
