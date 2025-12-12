import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVersionStore } from '@/store/versionStore';
import { Icons } from '@/components/icons/Icons';
import { useTranslation } from '@/i18n/I18nContext';

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
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖动

  // 同步外部 props 变化
  useEffect(() => {
    setLocalScore(score);
    setLocalNotes(notes);
  }, [score, notes]);

  const handleScoreChange = async (newScore: number) => {
    if (readonly) return;
    
    setLocalScore(newScore);
    setIsSaving(true);
    try {
      await updateVersionScore(versionId, newScore);
    } catch (error) {
      console.error('更新评分失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理鼠标按下
  const handleMouseDown = (num: number) => {
    if (readonly || isSaving) return;
    setIsDragging(true);
    handleScoreChange(num);
  };

  // 处理鼠标进入（拖动时）
  const handleMouseEnter = (num: number) => {
    if (isDragging && !readonly && !isSaving) {
      handleScoreChange(num);
    }
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 全局监听鼠标释放
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

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

  // ESC 关闭模态框
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
      {/* 卡片 - 显示在附件区 */}
      <div title={localNotes}
        onClick={() => !readonly && setIsModalOpen(true)}
        className={`
          relative group w-24 h-24 flex-shrink-0 rounded-m3-medium overflow-visible
          shadow-elevation-1 hover:shadow-elevation-2 transition-shadow
          bg-gradient-to-br from-primary/10 to-primary/5
          border-2 border-primary/30 hover:border-primary/50
          ${readonly ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          {/* 图标 */}
          <div className="mb-1">
            <Icons.Info size={24} />
          </div>
          
          {/* 评分显示 */}
            <div className="text-center">
              {localScore > 0 ? ( `${localScore}/10` ): ( t('components.compareModal.score') )}
            </div>
        </div>
      </div>

      {/* 模态框 - 编辑评分和备注 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-3xl shadow-elevation-3 w-full max-w-2xl mx-4"
            >
              {/* Header */}
              <div className="pt-6 pl-6 pr-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-surface-onVariant flex items-center gap-2">
                    <Icons.Info size={20} />
                    {t('components.compareModal.score')}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-containerHighest transition-colors"
                    aria-label={t('common.close')}
                  >
                    <Icons.Clear className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* 评分区域 */}
                <div>
                  <div className="flex items-center gap-1 flex-wrap select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onMouseDown={() => handleMouseDown(num)}
                        onMouseEnter={() => handleMouseEnter(num)}
                        onMouseUp={handleMouseUp}
                        disabled={readonly || isSaving}
                        className={`
                          w-10 h-10 rounded-xl text-sm font-medium transition-all flex-shrink-0
                          ${
                            num <= localScore
                              ? 'bg-primary text-onPrimary shadow-elevation-1'
                              : 'bg-surface-containerHighest text-surface-onVariant hover:bg-surface-container hover:shadow-elevation-1'
                          }
                          ${readonly || isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                          ${isDragging ? 'select-none' : ''}
                        `}
                        aria-label={`评分 ${num}`}
                      >
                        {num}
                      </button>
                    ))}
                    
                    {/* 清除评分按钮 - 放在10后面 */}
                    {!readonly && (
                      <button
                        onClick={() => handleScoreChange(0)}
                        disabled={isSaving}
                        className={`
                          w-10 h-10 rounded-xl text-sm transition-colors flex-shrink-0 flex items-center justify-center
                          ${localScore > 0 
                            ? 'bg-error/10 hover:bg-error/20 text-error' 
                            : 'bg-surface-containerHighest text-surface-onVariant/30 cursor-not-allowed'
                          }
                          ${isSaving ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                        aria-label={t('components.versionMeta.clearScore')}
                      >
                        <Icons.X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 备注区域 */}
                <div>
                  <label
                    htmlFor={`notes-${versionId}`}
                    className="text-base font-semibold text-surface-onVariant block mb-2 flex items-center gap-2"
                  >
                    <Icons.Note size={18} />
                    {t('components.compareModal.notes')}
                  </label>
                  <textarea
                    id={`notes-${versionId}`}
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    disabled={readonly || isSaving}
                    placeholder={readonly ? t('components.versionMeta.noNotes') : t('components.versionMeta.addNotes')}
                    className={`
                      w-full px-3 py-2 text-sm rounded-m3-medium border
                      bg-surface border-surface-onVariant/30
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                      resize-none
                      ${readonly || isSaving ? 'cursor-not-allowed opacity-70' : ''}
                    `}
                    rows={6}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pb-6 pr-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-primary text-onPrimary rounded-m3-medium hover:shadow-elevation-1 transition-shadow"
                >
                  {t('components.versionMeta.done')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};