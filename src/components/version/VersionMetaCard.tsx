import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { duration, ease } from '@/styles/motion';
import { useVersionStore } from '@/store/versionStore';
import { ScoreRating } from './ScoreRating';
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

  // 同步外部 props 变化
  useEffect(() => {
    setLocalScore(score);
  }, [score]);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

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

  // 拖动过程中只更新显示，不落库
  const handleScrub = (newScore: number) => {
    if (readonly || isSaving) return;
    setLocalScore(newScore);
  };

  // 松手 / 单击 / 键盘：分数落定才保存
  const handleCommit = (newScore: number) => {
    if (readonly || isSaving) return;
    setLocalScore(newScore);
    if (newScore !== score) {
      saveScore(newScore);
    }
  };

  const handleClearScore = () => {
    if (readonly || isSaving) return;
    setLocalScore(0);
    saveScore(0);
  };

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
          relative group w-full h-full aspect-square rounded-xl overflow-hidden
          border border-border dark:border-border-dark
          bg-surface-container-low dark:bg-zinc-800/50
          hover:border-primary hover:bg-primary/5
          transition-all duration-200
          ${readonly ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
          {/* 图标 - 修复暗色模式下的颜色 */}
          <div className="text-surface-onVariant dark:text-surface-onVariantDark/60 group-hover:text-primary transition-colors text-2xl sm:text-[28px]">
            <Icons.Info size={20} />
          </div>

          {/* 评分显示 - 修复暗色模式下的颜色 */}
          <div className="text-sm font-medium text-surface-onSurface dark:text-surface-onSurfaceDark group-hover:text-primary transition-colors">
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
            transition={{ duration: duration.fast, ease: ease.outExpo }}
            // 全屏 backdrop-blur 会在淡入的每一帧重算模糊，在编辑器页面上非常卡，去掉
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={(e: React.MouseEvent) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              // 位移代替缩放：scale 会让整块内容每帧重新栅格化
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: duration.standard, ease: ease.outExpo }}
              className="bg-surface dark:bg-surface-dark rounded-2xl shadow-elevation-3 w-full max-w-lg mx-4 overflow-hidden border border-border/50 dark:border-border-dark"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/50 dark:border-border-dark flex items-center justify-between bg-surface-container-low dark:bg-surface-container-low-dark">
                <h3 className="text-lg font-bold text-surface-onSurface dark:text-surface-onSurfaceDark flex items-center gap-2">
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
                <div className="space-y-3">
                  <ScoreRating
                    value={localScore}
                    onScrub={handleScrub}
                    onCommit={handleCommit}
                    readonly={readonly}
                    disabled={isSaving}
                    ariaLabel={t('components.compareModal.score')}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1 text-surface-onSurface dark:text-surface-onSurfaceDark">
                      <span className="text-2xl tabular-nums">
                        {localScore > 0 ? (<p font-bold>{localScore}</p>) : '-'}
                      </span>
                      <span className="text-xs text-surface-onVariant dark:text-surface-onVariantDark">
                        /10
                      </span>
                    </div>

                    {!readonly && (
                      <MinimalButton
                        variant="danger"
                        onClick={handleClearScore}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm gap-1.5"
                        title={t('components.versionMeta.clearScore')}
                        aria-label={t('components.versionMeta.clearScore')}
                      >
                        <Icons.Sweep size={14} />
                        {t('components.versionMeta.clearScore')}
                      </MinimalButton>
                    )}
                  </div>
                </div>

                {/* 备注区域 */}
                <div>
                  <label
                    htmlFor={`notes-${versionId}`}
                    className="text-sm font-semibold text-surface-onVariant dark:text-surface-onVariantDark block mb-2 flex items-center gap-2"
                  >
                    <Icons.Note size={16} />
                    {t('components.compareModal.notes')}
                  </label>
                  {/* 修复：暗色模式下使用 background.dark 作为输入框背景，避免过亮 */}
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
                      bg-surface-variant dark:bg-background-dark 
                      border-border dark:border-border-dark
                      text-surface-onSurface dark:text-surface-onSurfaceDark
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      resize-none transition-shadow
                      ${readonly || isSaving ? 'cursor-not-allowed opacity-70' : ''}
                    `}
                    rows={5}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-surface-container-low dark:bg-surface-container-low-dark border-t border-border/50 dark:border-border-dark flex justify-end">
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
