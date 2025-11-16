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
