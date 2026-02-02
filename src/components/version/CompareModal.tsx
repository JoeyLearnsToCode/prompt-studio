/**
 * 版本对比模态框组件
 * 使用 @monaco-editor/react 实现并排Diff视图
 */

import { MinimalButton } from '@/components/common/MinimalButton';
import { Icons } from '@/components/icons/Icons';
import { useTranslation } from '@/i18n/I18nContext';
import type { Version } from '@/models/Version';
import { diffService } from '@/services/diffService';
import { useVersionStore } from '@/store/versionStore';
import { useI18nStore } from '@/store/i18nStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/styles/tokens';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';

/** 保存失败的提示函数 */
const showError = (message: string) => {
  if (typeof window !== 'undefined' && (window as any).toast?.error) {
    (window as any).toast.error(message);
  } else {
    alert(message);
  }
};

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

  /** 保存成功后的回调 */
  onSave?: () => void;
}

export function CompareModal({
  isOpen,
  sourceVersion,
  targetVersion,
  onClose,
  title,
  onSave,
}: CompareModalProps) {
  const t = useTranslation();
  const { editorFontSize, editorLineHeight } = useSettingsStore();
  const currentLocale = useI18nStore((state) => state.currentLocale);
  const modalTitle = title || t('components.compareModal.title');

  // 使用 ref 保存编辑器实例，避免重渲染
  const editorRef = useRef<{ originalEditor: editor.IStandaloneCodeEditor; modifiedEditor: editor.IStandaloneCodeEditor } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 计算相似度
  const similarity =
    sourceVersion && targetVersion
      ? diffService.computeSimilarity(sourceVersion.content, targetVersion.content)
      : 0;

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

  const handleEditorDidMount: DiffOnMount = (editor, monaco) => {
    // 保存编辑器实例引用
    editorRef.current = {
      originalEditor: editor.getOriginalEditor(),
      modifiedEditor: editor.getModifiedEditor(),
    };

    // 动态检测暗黑模式，确保 Diff 编辑器主题与主编辑器一致
    const isDark = document.documentElement.classList.contains('dark');
    // Using explicit values from tokens.js
    const surfaceColor = isDark ? colors.surface.dark : colors.surface.DEFAULT;
    const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
    const lineNumberColor = isDark ? colors.text.dark.muted : colors.text.light.muted;
    const gutterColor = isDark ? colors.surface.variantDark : colors.surface.variant;

    monaco.editor.defineTheme('prompt-studio-diff-theme', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        {
          token: '',
          foreground: textColor,
          background: surfaceColor,
        },
      ],
      colors: {
        'editor.background': surfaceColor,
        'editor.foreground': textColor,
        'editorCursor.foreground': colors.primary.DEFAULT,
        'editor.selectionBackground': colors.primary.selection,
        'editorLineNumber.foreground': lineNumberColor,
        'editorGutter.background': gutterColor,
        'editor.lineHighlightBackground': colors.primary.editorBackground,
      },
    });
    monaco.editor.setTheme('prompt-studio-diff-theme');
  };

  // 保存源版本
  const handleSaveSource = async () => {
    if (!sourceVersion || !editorRef.current) return;

    const contentToSave = editorRef.current.originalEditor.getValue();
    try {
      setIsSaving(true);
      const { updateVersionInPlace } = useVersionStore.getState();
      await updateVersionInPlace(sourceVersion.id, contentToSave);
      onSave?.();
    } catch (error) {
      showError(t('errors.saveFailed'));
      console.error('Failed to save source version:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 保存目标版本
  const handleSaveTarget = async () => {
    if (!targetVersion || !editorRef.current) return;

    const contentToSave = editorRef.current.modifiedEditor.getValue();
    try {
      setIsSaving(true);
      const { updateVersionInPlace } = useVersionStore.getState();
      await updateVersionInPlace(targetVersion.id, contentToSave);
      onSave?.();
    } catch (error) {
      showError(t('errors.saveFailed'));
      console.error('Failed to save target version:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[95vw] h-[90vh] bg-surface dark:bg-surface-dark rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-border dark:border-border-dark flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-surface-onSurface dark:text-surface-onSurfaceDark">
              {modalTitle}
            </h2>
            <MinimalButton
              variant="ghost"
              onClick={onClose}
              className="w-10 h-10 rounded-full"
              aria-label={t('components.compareModal.close')}
            >
              <Icons.Close className="w-6 h-6" />
            </MinimalButton>
          </div>

          {/* 相似度指示器 */}
          {sourceVersion && targetVersion && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-surface-onVariant dark:text-surface-onVariantDark">
                {t('components.compareModal.similarity')}:
              </span>
              <span className="font-bold text-blue-600">{similarity}%</span>
              <div className="flex-1 h-2 bg-surface-variant dark:bg-surface-variantDark rounded-full overflow-hidden ml-2">
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
                <h3 className="font-medium text-surface-onSurface dark:text-surface-onSurfaceDark">
                  {sourceVersion.name || `版本 ${sourceVersion.id.slice(0, 8)}`}
                </h3>
                <div className="text-xs text-surface-onVariant dark:text-surface-onVariantDark mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>
                      {t('components.versionCard.createdAt')}: {formatDate(sourceVersion.createdAt)}
                    </span>
                    <MinimalButton
                      variant="default"
                      onClick={handleSaveSource}
                      disabled={isSaving}
                      className="mr-10 p-1.5"
                      aria-label={t('common.save')}
                    >
                      <Icons.Save className="w-4 h-4" />
                    </MinimalButton>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      {t('components.versionCard.updatedAt')}: {formatDate(sourceVersion.updatedAt)}
                    </span>
                  </div>
                  {sourceVersion.score !== undefined && sourceVersion.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Icons.Star size={14} className="text-yellow-500" />
                      <span>
                        {t('components.compareModal.score')}: {sourceVersion.score}/10
                      </span>
                    </div>
                  )}
                  {sourceVersion.notes && (
                    <div className="mt-2 p-2 bg-surface-container-low dark:bg-surface-container-low-dark rounded text-xs">
                      <div className="font-medium mb-1">{t('components.compareModal.notes')}:</div>
                      <div className="text-surface-onVariant dark:text-surface-onVariantDark whitespace-pre-wrap line-clamp-2">
                        {sourceVersion.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-surface-onSurface dark:text-surface-onSurfaceDark">
                  {targetVersion.name || `版本 ${targetVersion.id.slice(0, 8)}`}
                </h3>
                <div className="text-xs text-surface-onVariant dark:text-surface-onVariantDark mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>
                      {t('components.versionCard.createdAt')}: {formatDate(targetVersion.createdAt)}
                    </span>
                    <MinimalButton
                      variant="default"
                      onClick={handleSaveTarget}
                      disabled={isSaving}
                      className="mr-10 p-1.5"
                      aria-label={t('common.save')}
                    >
                      <Icons.Save className="w-4 h-4" />
                    </MinimalButton>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      {t('components.versionCard.updatedAt')}: {formatDate(targetVersion.updatedAt)}
                    </span>
                  </div>
                  {targetVersion.score !== undefined && targetVersion.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Icons.Star size={14} className="text-yellow-500" />
                      <span>
                        {t('components.compareModal.score')}: {targetVersion.score}/10
                      </span>
                    </div>
                  )}
                  {targetVersion.notes && (
                    <div className="mt-2 p-2 bg-surface-container-low dark:bg-surface-container-low-dark rounded text-xs">
                      <div className="font-medium mb-1">{t('components.compareModal.notes')}:</div>
                      <div className="text-surface-onVariant dark:text-surface-onVariantDark whitespace-pre-wrap line-clamp-2">
                        {targetVersion.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Monaco Diff视图容器 */}
        <div className="flex-1 min-h-0 relative">
          {sourceVersion && targetVersion && (
            <DiffEditor
              key={currentLocale}
              height="100%"
              width="100%"
              language="markdown"
              original={sourceVersion.content}
              modified={targetVersion.content}
              onMount={handleEditorDidMount}
              keepCurrentModifiedModel={true}
              keepCurrentOriginalModel={true}
              options={{
                readOnly: false,
                originalEditable: true,
                fontSize: editorFontSize,
                lineHeight: Math.round(editorFontSize * editorLineHeight),
                fontFamily: 'ui-monospace, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                useInlineViewWhenSpaceIsLimited: false,
                automaticLayout: true,
                glyphMargin: false,
                padding: { top: 5, bottom: 10 },
                renderSideBySide: true,
                folding: false,
                renderLineHighlight: 'none',
                overviewRulerLanes: 0,
                overviewRulerBorder: false,
                wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?、，。；（）·！￥…—+【】：《》",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
