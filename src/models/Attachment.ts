export interface Attachment {
  id: string;
  versionId: string;
  fileName: string;
  fileType: string;
  blob?: Blob; // 改为可选，因为导入时可能暂时缺失
  isMissing?: boolean; // 标记附件是否缺失
}
