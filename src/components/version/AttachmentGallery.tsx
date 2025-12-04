import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import { ImagePreview } from '@/components/common/ImagePreview';
import { useTranslation } from '@/i18n/I18nContext';

interface AttachmentGalleryProps {
  versionId: string;
  attachments: Attachment[];
  onAttachmentsChange: () => void;
  readonly?: boolean;
  extraCard?: React.ReactNode; // 额外的卡片，会显示在上传区后面
  onUpload?: (files: FileList) => Promise<void>;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  versionId,
  attachments,
  onAttachmentsChange,
  readonly = false,
  extraCard,
  onUpload,
}) => {
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (onUpload) {
        await onUpload(files);
        onAttachmentsChange();
        return;
      }

      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
      ];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 验证文件类型
        if (!validTypes.includes(file.type)) {
          alert(`${t('components.attachmentGallery.unsupportedType')}: ${file.type}`);
          continue;
        }

        // 验证文件大小（50MB）
        if (file.size > 50 * 1024 * 1024) {
          alert(`${t('components.attachmentGallery.fileTooLarge')}: ${file.name}`);
          continue;
        }

        try {
          await attachmentManager.uploadAttachment(versionId, file);
        } catch (error) {
          console.error('上传附件失败:', error);
          alert(`${t('components.attachmentGallery.uploadFailed')}: ${file.name}`);
        }
      }

      onAttachmentsChange();
    },
    [versionId, onAttachmentsChange, onUpload, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (readonly) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect, readonly]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDelete = useCallback(
    async (attachmentId: string) => {
      if (confirm(t('components.attachmentGallery.confirmDelete'))) {
        try {
          await attachmentManager.deleteAttachment(attachmentId);
          onAttachmentsChange();
        } catch (error) {
          console.error('删除附件失败:', error);
          alert(t('components.attachmentGallery.deleteFailed'));
        }
      }
    },
    [onAttachmentsChange, t]
  );

  const handlePreview = useCallback((attachment: Attachment) => {
    const url = attachmentManager.getPreviewUrl(attachment);
    if (url) {
      setPreviewImage({ url, fileName: attachment.fileName });
    } else {
      alert(t('components.attachmentGallery.fileMissing'));
    }
  }, [t]);

  const handleDownload = useCallback(async (attachment: Attachment) => {
    try {
      if (attachment.isMissing) {
        alert(t('components.attachmentGallery.fileMissing'));
        return;
      }
      await attachmentManager.downloadAttachment(attachment.id);
    } catch (error) {
      console.error('下载附件失败:', error);
      alert(t('components.attachmentGallery.downloadFailed'));
    }
  }, [t]);

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="w-full">
      {/* 附件网格 - 上传区域和附件在同一行 */}
      <div className="flex flex-wrap gap-3">
        {/* 上传区域 - 小正方形 */}
        {!readonly && (
          <div
            className={`
              w-24 h-24 flex-shrink-0
              border-2 border-dashed rounded-m3-medium
              transition-colors duration-200 cursor-pointer
              flex flex-col items-center justify-center
              ${
                isDragging
                  ? 'border-primary bg-primary-container'
                  : 'border-surface-onVariant/30 hover:border-primary/50 hover:bg-surface-containerHighest'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <div className="text-center px-2">
              <p className="text-xs text-surface-onVariant mb-1">{t('components.attachmentGallery.clickToUpload')}</p>
              <p className="text-[10px] text-surface-onVariant/70 leading-tight">
                {t('components.attachmentGallery.imageVideo')}
                <br />
                {t('components.attachmentGallery.maxSize')}
              </p>
            </div>
          </div>
        )}
        
        {/* 额外的卡片（如版本信息卡片） */}
        {extraCard}

        {/* 附件列表 */}
        <AnimatePresence>
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`
                relative group w-24 h-24 flex-shrink-0 rounded-m3-medium overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-shadow
                ${attachment.isMissing 
                  ? 'bg-error-container border border-error/50' 
                  : 'bg-surface-container'
                }
              `}
            >
              {/* 缩略图 - 点击主体预览 */}
              <div
                className={`w-full h-full ${
                  attachment.isMissing ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => !attachment.isMissing && isImage(attachment.fileType) && handlePreview(attachment)}
              >
                {attachment.isMissing ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <div className="text-2xl mb-1">⚠️</div>
                    <div className="text-xs text-error font-medium">{t('components.attachmentGallery.attachmentMissing')}</div>
                    <div className="text-[10px] text-onErrorContainer mt-1">
                      {attachment.fileName}
                    </div>
                  </div>
                ) : (
                  <>
                    {isImage(attachment.fileType) && (
                      <img
                        src={attachmentManager.getPreviewUrl(attachment) || ''}
                        alt={attachment.fileName}
                        className="w-full h-full object-contain bg-black/5"
                      />
                    )}
                    {isVideo(attachment.fileType) && (
                      <video
                        src={attachmentManager.getPreviewUrl(attachment) || ''}
                        className="w-full h-full object-contain bg-black/5"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </>
                )}
              </div>

              {/* 顶部操作按钮 */}
              <div className="absolute top-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {!attachment.isMissing && (
                  <>
                    {isImage(attachment.fileType) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(attachment);
                        }}
                        className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors text-xs"
                        aria-label={t('components.attachmentGallery.preview')}
                      >
                        👁
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors text-xs"
                      aria-label={t('components.attachmentGallery.download')}
                    >
                      ⬇
                    </button>
                  </>
                )}
                {!readonly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(attachment.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors text-xs ${
                      attachment.isMissing
                        ? 'bg-error/90 hover:bg-error'
                        : 'bg-error/80 hover:bg-error'
                    }`}
                    aria-label={t('common.delete')}
                  >
                    🗑
                  </button>
                )}
              </div>

              {/* 文件名提示 - 只对非缺失附件显示 */}
              {!attachment.isMissing && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                  {attachment.fileName}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 无附件提示 */}
        {attachments.length === 0 && readonly && (
          <div className="text-center py-4 text-sm text-surface-onVariant w-full">
            {t('components.attachmentGallery.noAttachments')}
          </div>
        )}
      </div>

      {/* 图片预览模态框 */}
      <ImagePreview
        isOpen={!!previewImage}
        imageUrl={previewImage?.url || null}
        fileName={previewImage?.fileName}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
