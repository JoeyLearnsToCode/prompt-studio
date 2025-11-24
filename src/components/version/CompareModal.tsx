/**
 * 版本对比模态框组件
 * 使用 @codemirror/merge 实现并排Diff视图
 */

import { useEffect, useRef } from 'react';
import { MergeView } from '@codemirror/merge';
import type { Version } from '@/models/Version';
import { createDiffEditorExtensions, diffService } from '@/services/diffService';
import { useTranslation } from '@/i18n/I18nContext';

export interface CompareModalProps {
  /** 模态框是否打开 */
  isOpen: boolean;
  
  /** 源版本(左侧) */
  sourceVersion: Version | null;
  
  /** 目标版本(右侧) */
  targetVersion: Version | null;
  
  /** 关闭模态框的回调 */
  onClose: () => void;
  
  /** 可选:自定义标题 */
  title?: string;
}

export function CompareModal({
  isOpen,
  sourceVersion,
  targetVersion,
  onClose,
  title,
}: CompareModalProps) {
  const t = useTranslation();
  const modalTitle = title || t('components.compareModal.title');
  const mergeViewRef = useRef<MergeView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算相似度
  const similarity = sourceVersion && targetVersion
    ? diffService.computeSimilarity(sourceVersion.content, targetVersion.content)
    : 0;

  // 初始化和更新MergeView
  useEffect(() => {
    if (!isOpen || !containerRef.current || !sourceVersion || !targetVersion) {
      return;
    }

    // 清理旧实例
    if (mergeViewRef.current) {
      mergeViewRef.current.destroy();
      mergeViewRef.current = null;
    }

    // 创建新实例
    const extensions = createDiffEditorExtensions();
    mergeViewRef.current = new MergeView({
      a: {
        doc: sourceVersion.content,
        extensions,
      },
      b: {
        doc: targetVersion.content,
        extensions,
      },
      parent: containerRef.current,
    });

    return () => {
      if (mergeViewRef.current) {
        mergeViewRef.current.destroy();
        mergeViewRef.current = null;
      }
    };
  }, [isOpen, sourceVersion, targetVersion]);

  // ESC键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('components.compareModal.close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 相似度指示器 */}
          {sourceVersion && targetVersion && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('components.compareModal.similarity')}:</span>
              <span className="font-bold text-blue-600">{similarity}%</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden ml-2">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${similarity}%` }}
                />
              </div>
            </div>
          )}
          
          {/* 对比信息 */}
          {sourceVersion && targetVersion && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {sourceVersion.name || `版本 ${sourceVersion.id.slice(0, 8)}`}
                </h3>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  <div>{t('components.versionCard.createdAt')}: {formatDate(sourceVersion.createdAt)}</div>
                  <div>{t('components.versionCard.updatedAt')}: {formatDate(sourceVersion.updatedAt)}</div>
                  {sourceVersion.score !== undefined && sourceVersion.score > 0 && (
                    <div>{t('components.compareModal.score')}: ⭐ {sourceVersion.score}/10</div>
                  )}
                  {sourceVersion.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium mb-1">{t('components.compareModal.notes')}:</div>
                      <div className="text-gray-700 whitespace-pre-wrap line-clamp-2">{sourceVersion.notes}</div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {targetVersion.name || `版本 ${targetVersion.id.slice(0, 8)}`}
                </h3>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  <div>{t('components.versionCard.createdAt')}: {formatDate(targetVersion.createdAt)}</div>
                  <div>{t('components.versionCard.updatedAt')}: {formatDate(targetVersion.updatedAt)}</div>
                  {targetVersion.score !== undefined && targetVersion.score > 0 && (
                    <div>{t('components.compareModal.score')}: ⭐ {targetVersion.score}/10</div>
                  )}
                  {targetVersion.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium mb-1">{t('components.compareModal.notes')}:</div>
                      <div className="text-gray-700 whitespace-pre-wrap line-clamp-2">{targetVersion.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* CodeMirror Diff视图容器 - 占据剩余空间,允许内部滚动 */}
        <div className="flex-1 min-h-0">
          <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          />
        </div>
      </div>
    </div>
  );
}