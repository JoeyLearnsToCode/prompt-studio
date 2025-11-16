/**
 * 附件管理服务
 */

import { db } from '@/db/schema';
import type { Attachment } from '@/models/Attachment';
import { nanoid } from 'nanoid';

export class AttachmentManager {
  /**
   * 上传附件
   */
  async uploadAttachment(
    versionId: string,
    file: File
  ): Promise<string> {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    const attachment: Attachment = {
      id: nanoid(),
      versionId,
      fileName: file.name,
      fileType: file.type,
      blob,
    };

    await db.attachments.add(attachment);
    return attachment.id;
  }

  /**
   * 获取版本的所有附件
   */
  async getAttachmentsByVersion(versionId: string): Promise<Attachment[]> {
    return await db.attachments.where('versionId').equals(versionId).toArray();
  }

  /**
   * 删除附件
   */
  async deleteAttachment(id: string): Promise<void> {
    await db.attachments.delete(id);
  }

  /**
   * 下载附件
   */
  async downloadAttachment(id: string): Promise<void> {
    const attachment = await db.attachments.get(id);
    if (!attachment) throw new Error('附件不存在');

    const url = URL.createObjectURL(attachment.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 获取附件预览 URL
   */
  getPreviewUrl(attachment: Attachment): string {
    return URL.createObjectURL(attachment.blob);
  }
}

export const attachmentManager = new AttachmentManager();
