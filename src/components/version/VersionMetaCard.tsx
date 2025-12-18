import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersionStore } from '@/store/versionStore';
import { Icons } from '@/components/icons/Icons';
import { useTranslation } from '@/i18n/I18nContext';
import { MinimalButton } from '@/components/common/MinimalButton';

interface VersionMetaCardProps {
  versionId: string;
  score?: number;
  notes?: string;
  readonly?: boolean;
}

/**
 * 版本元数据卡片组件
 * 作为附件区的第二个特殊卡片显示，点击打开模态框编辑
 */
export const VersionMetaCard: React.FC<VersionMetaCardProps> = ({
  versionId,
  score = 0,
  notes = '',
  readonly = false,
}) => {
  const t = useTranslation();
  const { updateVersionScore, updateVersionNotes } = useVersionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localScore, setLocalScore] = useState(score);
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 使用 ref 追踪最新的分数，以便在闭包中使用
  const localScoreRef = useRef(localScore);

  // 同步外部 props 变化
  useEffect(() => {
    setLocalScore(score);
  }, [score]);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    localScoreRef.current = localScore;
  }, [localScore]);

  const saveScore = async (newScore: number) => {
    if (readonly) return;

    setIsSaving(true);
    try {
      await updateVersionScore(versionId, newScore);
    } catch (error) {
      console.error('更新评分失败:', error);
      // 失败时回滚
      setLocalScore(score);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseDown = (num: number) => {
    if (readonly || isSaving) return;
    setIsDragging(true);
    setLocalScore(num);
  };

  const handleMouseEnter = (num: number) => {
    if (isDragging && !readonly && !isSaving) {
      setLocalScore(num);
    }
  };

  // 处理直接点击清除按钮的情况
  const handleClearScore = () => {
    if (readonly || isSaving) return;
    setLocalScore(0);
    saveScore(0);
  };

  // 全局鼠标释放监听，用于结束拖拽并保存
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      // 拖拽结束时保存最终的分数
      if (localScoreRef.current !== score) {
        saveScore(localScoreRef.current);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, score]); // 依赖 score 用于比较是否变化

  const handleNotesBlur = async () => {
    if (readonly || localNotes === notes) return;

    setIsSaving(true);
    try {
      await updateVersionNotes(versionId, localNotes);
    } catch (error) {
      console.error('更新备注失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      {/* 卡片 - 与附件卡片样式保持一致 */}
      <div
        title={localNotes || t('components.compareModal.score')}
        onClick={() => !readonly && setIsModalOpen(true)}
        className={`
          relative group w-25 h-25 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden
          border border-border dark:border-border-dark
          bg-surface-container-low dark:bg-zinc-800/50
          hover:border-primary hover:bg-primary/5
          transition-all duration-200
          ${readonly ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
          {/* 图标 */}
          <div className="text-surface-onVariant/60 group-hover:text-primary transition-colors text-2xl sm:text-[28px]">
            <Icons.Info size={20} />
          </div>

          {/* 评分显示 */}
          <div className="text-sm font-medium text-surface-onSurface group-hover:text-primary transition-colors">
            {localScore > 0 ? (
              <span className="text-lg font-bold">
                {localScore}
                <span className="text-xs font-normal opacity-60">/10</span>
              </span>
            ) : (
              t('components.compareModal.score')
            )}
          </div>

          {/* 备注指示器 */}
          {localNotes && (
            <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-primary/60"></div>
          )}
        </div>
      </div>

      {/* 模态框 - 编辑评分和备注 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl shadow-elevation-3 w-full max-w-lg mx-4 overflow-hidden border border-border/50"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-surface-container-low">
                <h3 className="text-lg font-bold text-surface-onSurface flex items-center gap-2">
                  <Icons.Info size={20} className="text-primary" />
                  {t('components.compareModal.score')}
                </h3>
                <MinimalButton
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full"
                  aria-label={t('common.close')}
                >
                  <Icons.Close size={20} />
                </MinimalButton>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* 评分区域 */}
                <div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap sm:flex-nowrap select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onMouseDown={() => handleMouseDown(num)}
                        onMouseEnter={() => handleMouseEnter(num)}
                        disabled={readonly || isSaving}
                        className={`
                          w-9 h-9 rounded-lg text-sm font-bold transition-all flex-shrink-0
                          border border-transparent
                          ${num <= localScore
                            ? `bg-primary-hover/60 text-onPrimary shadow-sm transform scale-105`
                            : 'bg-surface-containerHighest/60 text-surface-onVariant hover:bg-surface-container-high'
                          }
                          ${readonly || isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        `}
                        aria-label={`评分 ${num}`}
                      >
                        {num}
                      </button>
                    ))}

                    {/* 清除评分按钮 */}
                    {!readonly && (
                      <MinimalButton
                        variant="danger"
                        onClick={handleClearScore}
                        disabled={isSaving}
                        className="w-9 h-9 p-0 flex-shrink-0 ml-2"
                        title={t('components.versionMeta.clearScore')}
                        aria-label={t('components.versionMeta.clearScore')}
                      >
                        <Icons.Trash size={16} />
                      </MinimalButton>
                    )}
                  </div>
                </div>

                {/* 备注区域 */}
                <div>
                  <label
                    htmlFor={`notes-${versionId}`}
                    className="text-sm font-semibold text-surface-onVariant block mb-2 flex items-center gap-2"
                  >
                    <Icons.Note size={16} />
                    {t('components.compareModal.notes')}
                  </label>
                  <textarea
                    id={`notes-${versionId}`}
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    disabled={readonly || isSaving}
                    placeholder={
                      readonly
                        ? t('components.versionMeta.noNotes')
                        : t('components.versionMeta.addNotes')
                    }
                    className={`
                      w-full px-4 py-3 text-sm rounded-xl border
                      bg-surface-container-low border-border
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      resize-none transition-shadow
                      ${readonly || isSaving ? 'cursor-not-allowed opacity-70' : ''}
                    `}
                    rows={5}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-border/50 flex justify-end">
                <MinimalButton
                  variant="default"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm"
                >
                  {t('components.versionMeta.done')}
                </MinimalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
