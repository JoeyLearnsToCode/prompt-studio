import React from 'react';
import { Modal } from './Modal';
import { useTranslation } from '@/i18n/I18nContext';

export interface ImportModeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: 'merge' | 'overwrite') => void;
}

export const ImportModeDialog: React.FC<ImportModeDialogProps> = ({ open, onClose, onConfirm }) => {
  const t = useTranslation();

  const handleMerge = () => {
    onConfirm('merge');
  };

  const handleOverwrite = () => {
    onConfirm('overwrite');
  };

  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title={t('pages.settings.local.importMode.selectMode')}>
      <div className="space-y-4">
        <div className="space-y-3">
          {/* 这里保留大按钮样式，因为 MinimalButton 不适合承载复杂的内部布局 */}
          <button
            onClick={handleMerge}
            className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            autoFocus
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('pages.settings.local.importMode.mergeMode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('pages.settings.local.importMode.mergeModeDescription')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleOverwrite}
            className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-error transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('pages.settings.local.importMode.overwriteMode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('pages.settings.local.importMode.overwriteModeDescription')}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};
