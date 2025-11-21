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
  async downloadAttachment(attachment: string | { id: string; isMissing?: boolean }): Promise<void> {
    const id = typeof attachment === 'string' ? attachment : attachment.id;
    
    // 如果是附件对象且标记为缺失，则抛出错误
    if (typeof attachment === 'object' && attachment.isMissing) {
      throw new Error('附件文件已丢失或损坏');
    }
    
    const attachmentData = await db.attachments.get(id);
    if (!attachmentData || !attachmentData.blob) {
      throw new Error('附件不存在或数据不完整');
    }

    const url = URL.createObjectURL(attachmentData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachmentData.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

/**
 * 获取附件预览 URL
 */
  getPreviewUrl(attachment: Attachment): string | null {
    // 如果附件缺失或 blob 不存在，返回 null
    if (!attachment.blob || attachment.isMissing) {
      return null;
    }
    return URL.createObjectURL(attachment.blob);
  }
}

export const attachmentManager = new AttachmentManager();
