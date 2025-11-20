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
              <p className="text-xs text-surface-onVariant mb-1">点击上传</p>
              <p className="text-[10px] text-surface-onVariant/70 leading-tight">
                图片/视频
                <br />
                最大50MB
              </p>
            </div>
          </div>
        )}

        {/* 附件列表 */}
        <AnimatePresence>
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative group w-24 h-24 flex-shrink-0 bg-surface-container rounded-m3-medium overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
            >
              {/* 缩略图 - 点击主体预览 */}
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => isImage(attachment.fileType) && handlePreview(attachment)}
              >
                {isImage(attachment.fileType) && (
                  <img
                    src={attachmentManager.getPreviewUrl(attachment)}
                    alt={attachment.fileName}
                    className="w-full h-full object-contain bg-black/5"
                  />
                )}
                {isVideo(attachment.fileType) && (
                  <video
                    src={attachmentManager.getPreviewUrl(attachment)}
                    className="w-full h-full object-contain bg-black/5"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>

              {/* 顶部操作按钮 */}
              <div className="absolute top-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {isImage(attachment.fileType) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(attachment);
                    }}
                    className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors text-xs"
                    aria-label="预览"
                  >
                    👁
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(attachment.id);
                  }}
                  className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors text-xs"
                  aria-label="下载"
                >
                  ⬇
                </button>
                {!readonly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(attachment.id);
                    }}
                    className="w-6 h-6 bg-error/80 hover:bg-error rounded-full flex items-center justify-center text-white transition-colors text-xs"
                    aria-label="删除"
                  >
                    🗑
                  </button>
                )}
              </div>

              {/* 文件名提示 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                {attachment.fileName}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 无附件提示 */}
        {attachments.length === 0 && readonly && (
          <div className="text-center py-4 text-sm text-surface-onVariant w-full">
            暂无附件
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
