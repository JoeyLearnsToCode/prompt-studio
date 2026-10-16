import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { duration, ease } from '@/styles/motion';
import { Icons } from '@/components/icons/Icons';
import { MinimalButton } from './MinimalButton';

interface ImagePreviewProps {
  isOpen: boolean;
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  imageUrl,
  fileName,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: ease.outExpo }}
          // 灯箱：两种主题下都是暗的，用 masthead 而不是语义背景色
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-masthead/95"
          onClick={onClose}
        >
          {/* 顶部信息栏 */}
          <div
            className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-masthead/70 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-masthead-on/90 font-medium truncate px-4">{fileName}</p>
            <MinimalButton
              variant="ghost"
              onClick={onClose}
              className="p-2 !text-masthead-on/90 hover:!text-masthead-on hover:!bg-masthead-on/15 !rounded-full"
              aria-label="关闭"
            >
              <Icons.Close size={24} />
            </MinimalButton>
          </div>

          {/* 左侧切换按钮 */}
          <MinimalButton
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onPrev?.();
            }}
            disabled={!hasPrev}
            className="absolute left-4 p-3 !rounded-full !text-masthead-on/90 hover:!text-masthead-on hover:!bg-masthead-on/15 z-10"
            aria-label="上一张"
          >
            <Icons.LeftArrow size={32} />
          </MinimalButton>

          {/* 右侧切换按钮 */}
          <MinimalButton
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            disabled={!hasNext}
            className="absolute right-4 p-3 !rounded-full !text-masthead-on/90 hover:!text-masthead-on hover:!bg-masthead-on/15 z-10"
            aria-label="下一张"
          >
            <Icons.RightArrow size={32} />
          </MinimalButton>

          {/* 图片容器 */}
          <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
            <motion.img
              key={imageUrl} // key 变化触发动画
              // 只淡入：scale 会让整张图每帧重新栅格化
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.standard, ease: ease.outExpo }}
              src={imageUrl}
              alt={fileName || '预览'}
              className="max-w-full max-h-full object-contain"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
