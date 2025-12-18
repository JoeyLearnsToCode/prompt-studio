import React from 'react';
import { MinimalButton } from '@/components/common/MinimalButton';
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
      <MinimalButton
        onClick={onSaveInPlace}
        variant="default"
        disabled={!canSaveInPlace || !hasProject}
        title={`${t('components.toolbar.saveInPlace')} (Ctrl+S / Ctrl+Enter)`}
      >
        {t('components.toolbar.saveInPlace')}
      </MinimalButton>

      <MinimalButton
        onClick={onSave}
        variant="default"
        disabled={!hasProject}
        title={`${t('components.toolbar.saveNew')} (Ctrl+Shift+S / Ctrl+Shift+Enter)`}
      >
        {t('components.toolbar.saveNew')}
      </MinimalButton>

      {onSnippets && (
        <MinimalButton
          onClick={onSnippets}
          variant="default"
          title={t('components.toolbar.snippets')}
        >
          {t('components.toolbar.snippets')}
        </MinimalButton>
      )}

      <div className="flex-1" />
    </div>
  );
};

export default EditorToolbar;
