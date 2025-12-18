/**
 * 导入相关类型定义
 */

/**
 * 导入模式
 */
export type ImportMode = 'merge' | 'overwrite';

/**
 * 导入选项
 */
export interface ImportOptions {
  mode: ImportMode; // 导入模式：合并或覆盖
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    projects: number;
    folders: number;
    versions: number;
    snippets: number;
    attachments: number;
  };
}

export type ImportProgress = {
  current: number;
  total: number;
  stage: 'projects' | 'folders' | 'versions' | 'snippets' | 'attachments' | 'settings';
  message: string;
};

/**
 * 导入进度回调
 */
export type ImportProgressCallback = (progress: ImportProgress) => void;
