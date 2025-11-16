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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col">
            {/* 顶部信息栏 */}
            {fileName && (
              <div className="absolute top-0 left-0 right-0 bg-black/50 text-white px-4 py-2 rounded-t-lg">
                <p className="text-sm truncate">{fileName}</p>
              </div>
            )}

            {/* 图片 */}
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

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="关闭预览"
            >
              ✕
            </button>

            {/* 底部提示 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              按 ESC 或点击空白处关闭
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
