import React from 'react';
import { Button } from '@/components/common/Button';

interface EditorToolbarProps {
  onSave: () => void;
  onSaveInPlace: () => void;
  onCompare?: () => void;
  onSnippets?: () => void;
  canSaveInPlace: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onSaveInPlace,
  onCompare,
  onSnippets,
  canSaveInPlace,
}) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-surface-variant border-b border-surface-onVariant/20">
      <Button
        onClick={onSave}
        variant="filled"
        size="small"
        title="创建新版本 (Ctrl+Enter)"
      >
        💾 保存新版本
      </Button>

      <Button
        onClick={onSaveInPlace}
        variant="outlined"
        size="small"
        disabled={!canSaveInPlace}
        title="原地更新当前版本 (Ctrl+Shift+Enter)"
      >
        ✏️ 原地保存
      </Button>

      {onCompare && (
        <Button onClick={onCompare} variant="text" size="small" title="对比版本">
          🔍 对比
        </Button>
      )}

      {onSnippets && (
        <Button onClick={onSnippets} variant="text" size="small" title="片段库">
          📚 片段
        </Button>
      )}

      <div className="flex-1" />

      <div className="text-sm text-surface-onVariant">
        <kbd className="px-2 py-1 bg-surface rounded">Ctrl+Enter</kbd> 保存新版本 |{' '}
        <kbd className="px-2 py-1 bg-surface rounded">Ctrl+Shift+Enter</kbd> 原地保存
      </div>
    </div>
  );
};

export default EditorToolbar;
