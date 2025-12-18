import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import { ImagePreview } from '@/components/common/ImagePreview';
import { Icons } from '@/components/icons/Icons';
import { useTranslation } from '@/i18n/I18nContext';
import { VersionMetaCard } from './VersionMetaCard';
import { useVersionStore } from '@/store/versionStore';
import { MinimalButton } from '@/components/common/MinimalButton';

interface AttachmentGalleryProps {
  versionId: string;
  attachments: Attachment[];
  onAttachmentsChange: () => void;
  readonly?: boolean;
  onUpload?: (files: FileList) => Promise<void>;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  versionId,
  attachments,
  onAttachmentsChange,
  readonly = false,
  onUpload,
}) => {
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从version store获取当前版本的评分和备注
  const currentVersion = useVersionStore((state) =>
    versionId ? state.versions.find((v) => v.id === versionId) : null
  );
  const score = currentVersion?.score || 0;
  const notes = currentVersion?.notes || '';

  // 过滤出可预览的图片
  const previewableAttachments = attachments.filter(
    (att) => !att.isMissing && att.fileType.startsWith('image/')
  );

  // 当前正在预览的附件对象
  const currentPreviewAttachment =
    previewIndex !== null ? previewableAttachments[previewIndex] : null;
  const previewUrl = currentPreviewAttachment
    ? attachmentManager.getPreviewUrl(currentPreviewAttachment)
    : null;

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (onUpload) {
        await onUpload(files);
        onAttachmentsChange();
        return;
      }
      // Fallback internal upload logic if needed...
    },
    [onAttachmentsChange, onUpload]
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

  const handlePreview = (attachment: Attachment) => {
    const index = previewableAttachments.findIndex((a) => a.id === attachment.id);
    if (index !== -1) {
      setPreviewIndex(index);
    } else {
      // 视频或其他不支持预览的类型，或者文件丢失
      if (attachment.isMissing) {
        alert(t('components.attachmentGallery.fileMissing'));
      }
    }
  };

  const handleDownload = useCallback(
    async (attachment: Attachment) => {
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
    },
    [t]
  );

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {/* Upload Box */}
        {!readonly && (
          <div
            className={`
              w-25 h-25 sm:w-32 sm:h-32 flex-shrink-0
              border-2 border-dashed rounded-xl
              transition-all duration-200 cursor-pointer
              flex flex-col items-center justify-center text-center
              group
              ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-primary hover:bg-primary/5'
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
            <div className="flex flex-col items-center gap-2 p-2">
              <span
                className={`material-symbols-outlined text-2xl sm:text-3xl text-surface-onVariant/60 group-hover:text-primary transition-colors`}
              >
                cloud_upload
              </span>
              <p className="text-xs text-surface-onVariant font-medium">
                {t('components.attachmentGallery.clickToUpload')}
                <br />
                <span className="text-[10px] opacity-70 font-normal">
                  {t('components.attachmentGallery.maxSize')}
                </span>
              </p>
            </div>
          </div>
        )}
        {/* Version Meta Card - now integrated */}
        <VersionMetaCard versionId={versionId} score={score} notes={notes} readonly={readonly} />

        {/* Attachment Items */}
        <AnimatePresence>
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`
                relative group w-25 h-25 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border border-border dark:border-border-dark
                shadow-sm hover:shadow-md transition-all bg-background dark:bg-zinc-800
                ${attachment.isMissing ? 'border-error/50' : ''}
              `}
            >
              {/* Main Content Area - Click to Preview */}
              <div
                className={`w-full h-full ${attachment.isMissing ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                onClick={() =>
                  !attachment.isMissing && isImage(attachment.fileType) && handlePreview(attachment)
                }
              >
                {attachment.isMissing ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-error/5">
                    <Icons.Warning size={20} className="text-error mb-1" />
                    <div className="text-xs text-error font-medium">
                      {t('components.attachmentGallery.attachmentMissing')}
                    </div>
                  </div>
                ) : (
                  <>
                    {isImage(attachment.fileType) && (
                      <img
                        src={attachmentManager.getPreviewUrl(attachment) || ''}
                        alt={attachment.fileName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isVideo(attachment.fileType) && (
                      <div className="w-full h-full flex items-center justify-center bg-black/5 relative">
                        <video
                          src={attachmentManager.getPreviewUrl(attachment) || ''}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-white/80 drop-shadow-md">
                            play_circle
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Top Actions Overlay - Visible on Hover */}
              {!attachment.isMissing && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {isImage(attachment.fileType) && (
                    <MinimalButton
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(attachment);
                      }}
                      className="p-1.5 bg-surface-containerHighest text-surface-onSurface rounded-md shadow-sm "
                      title={t('components.attachmentGallery.preview')}
                    >
                      <Icons.Eye size={12} />
                    </MinimalButton>
                  )}
                  <MinimalButton
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(attachment);
                    }}
                    className="p-1.5 bg-surface-containerHighest text-surface-onSurface rounded-md shadow-sm "
                    title={t('components.attachmentGallery.download')}
                  >
                    <Icons.Download size={12} />
                  </MinimalButton>
                  {!readonly && (
                    <MinimalButton
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(attachment.id);
                      }}
                      className="p-1.5 bg-surface-containerHighest hover:bg-surface-containerHighest"
                      title={t('common.delete')}
                    >
                      <Icons.Trash size={12} />
                    </MinimalButton>
                  )}
                </div>
              )}

              {/* File Name Footer */}
              {!attachment.isMissing && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] p-2 pt-6 truncate pointer-events-none">
                  {attachment.fileName}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ImagePreview
        isOpen={previewIndex !== null}
        imageUrl={previewUrl}
        fileName={currentPreviewAttachment?.fileName}
        onClose={() => setPreviewIndex(null)}
        hasPrev={previewIndex !== null && previewIndex > 0}
        hasNext={previewIndex !== null && previewIndex < previewableAttachments.length - 1}
        onPrev={() => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() =>
          setPreviewIndex((prev) =>
            prev !== null && prev < previewableAttachments.length - 1 ? prev + 1 : prev
          )
        }
      />
    </div>
  );
};
