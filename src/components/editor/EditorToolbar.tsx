import React from 'react';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/i18n/I18nContext';

interface EditorToolbarProps {
  onSave: () => void;
  onSaveInPlace: () => void;
  onSnippets?: () => void;
  canSaveInPlace: boolean;
  hasProject: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onSaveInPlace,
  onSnippets,
  canSaveInPlace,
  hasProject,
}) => {
  const t = useTranslation();
  return (
    <div className="flex items-center gap-2 p-3 bg-surface-variant border-b border-surface-onVariant/20">
      <Button
        onClick={onSaveInPlace}
        variant="outlined"
        size="small"
        disabled={!canSaveInPlace || !hasProject}
        title={`${t('components.toolbar.saveInPlace')} (Ctrl+S / Ctrl+Enter)`}
      >
        {t('components.toolbar.saveInPlace')}
      </Button>

      <Button
        onClick={onSave}
        variant="outlined"
        size="small"
        disabled={!hasProject}
        title={`${t('components.toolbar.saveNew')} (Ctrl+Shift+S / Ctrl+Shift+Enter)`}
      >
        {t('components.toolbar.saveNew')}
      </Button>

      {onSnippets && (
        <Button onClick={onSnippets} variant="outlined" size="small" title={t('components.toolbar.snippets')}>
          {t('components.toolbar.snippets')}
        </Button>
      )}

      <div className="flex-1" />
    </div>
  );
};

export default EditorToolbar;
