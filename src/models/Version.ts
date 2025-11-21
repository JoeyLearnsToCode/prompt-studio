export interface Version {
  id: string;
  projectId: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content: string;
  contentHash: string;
  name?: string; // 版本名称，可选
  score?: number;
  
  // 运行时计算属性，不保存到数据库
  normalizedContent?: string; // 标准化后的内容，由 content 计算得出
}
