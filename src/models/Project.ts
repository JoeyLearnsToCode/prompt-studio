export interface Project {
  id: string;
  folderId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  tags?: {
    model?: string;
    platform?: string;
    type?: string;
  };
}
