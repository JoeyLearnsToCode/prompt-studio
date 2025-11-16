import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import { ImagePreview } from '@/components/common/ImagePreview';

interface AttachmentGalleryProps {
  versionId: string;
  attachments: Attachment[];
  onAttachmentsChange: () => void;
  readonly?: boolean;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  versionId,
  attachments,
  onAttachmentsChange,
  readonly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

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
          alert(`不支持的文件类型: ${file.type}`);
          continue;
        }

        // 验证文件大小（50MB）
        if (file.size > 50 * 1024 * 1024) {
          alert(`文件 ${file.name} 超过 50MB 限制`);
          continue;
        }

        try {
          await attachmentManager.uploadAttachment(versionId, file);
        } catch (error) {
          console.error('上传附件失败:', error);
          alert(`上传 ${file.name} 失败`);
        }
      }

      onAttachmentsChange();
    },
    [versionId, onAttachmentsChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
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
      if (confirm('确定删除此附件吗？')) {
        try {
          await attachmentManager.deleteAttachment(attachmentId);
          onAttachmentsChange();
        } catch (error) {
          console.error('删除附件失败:', error);
          alert('删除失败');
        }
      }
    },
    [onAttachmentsChange]
  );

  const handlePreview = useCallback((attachment: Attachment) => {
    const url = attachmentManager.getPreviewUrl(attachment);
    setPreviewImage({ url, fileName: attachment.fileName });
  }, []);

  const handleDownload = useCallback(async (attachmentId: string) => {
    try {
      await attachmentManager.downloadAttachment(attachmentId);
    } catch (error) {
      console.error('下载附件失败:', error);
      alert('下载失败');
    }
  }, []);

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="w-full">
      {/* 上传区域 */}
      {!readonly && (
        <div
          className={`
            border-2 border-dashed rounded-m3-medium p-6 mb-4
            transition-colors duration-200 cursor-pointer
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
          <div className="text-center">
            <p className="text-sm mb-2">📎 点击上传或拖拽文件到此处</p>
            <p className="text-xs text-surface-onVariant">
              支持图片（JPG, PNG, GIF, WebP）和视频（MP4, WebM），单个文件最大 50MB
            </p>
          </div>
        </div>
      )}

      {/* 附件网格 */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group aspect-square bg-surface-container rounded-m3-medium overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
              >
                {/* 缩略图 */}
                {isImage(attachment.fileType) && (
                  <img
                    src={attachmentManager.getPreviewUrl(attachment)}
                    alt={attachment.fileName}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(attachment)}
                  />
                )}
                {isVideo(attachment.fileType) && (
                  <video
                    src={attachmentManager.getPreviewUrl(attachment)}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}

                {/* 悬浮操作按钮 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {isImage(attachment.fileType) && (
                    <button
                      onClick={() => handlePreview(attachment)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                      aria-label="预览"
                    >
                      👁
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(attachment.id)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="下载"
                  >
                    ⬇
                  </button>
                  {!readonly && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="w-8 h-8 bg-error/70 hover:bg-error rounded-full flex items-center justify-center text-white transition-colors"
                      aria-label="删除"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {/* 文件名提示 */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                  {attachment.fileName}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-surface-onVariant">
          暂无附件
        </div>
      )}

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
