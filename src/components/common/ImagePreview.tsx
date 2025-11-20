import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePreviewProps {
  isOpen: boolean;
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  imageUrl,
  fileName,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          {/* 顶部信息栏 - 浮在图片外 */}
          <div className="w-full max-w-[90vw] mb-2">
            <div className="flex items-center justify-between px-4 py-2 bg-black/60 text-white rounded-lg backdrop-blur-sm">
              {fileName && (
                <p className="text-sm truncate flex-1 mr-4">{fileName}</p>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                aria-label="关闭预览"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 图片容器 */}
          <div className="flex-1 flex items-center justify-center max-w-[90vw] max-h-[calc(90vh-100px)]">
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={imageUrl}
              alt={fileName || '预览'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* 底部提示 - 浮在图片外 */}
          <div className="w-full max-w-[90vw] mt-2">
            <div className="text-center bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              按 ESC 或点击空白处关闭
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
