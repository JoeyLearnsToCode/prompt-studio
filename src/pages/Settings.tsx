import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { webdavService, type WebDAVConfig } from '@/services/webdavService';
import { exportService } from '@/services/exportService';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Icons } from '@/components/icons/Icons';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { useTranslation } from '@/i18n/I18nContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { loadFolders, loadProjects } = useProjectStore();
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>({
    url: '',
    username: '',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [backups, setBackups] = useState<
    Array<{ name: string; path: string; size: number; lastMod: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载配置
    const config = storage.get<WebDAVConfig | null>(STORAGE_KEYS.WEBDAV_CONFIG, null);
    if (config) {
      setWebdavConfig(config);
      webdavService.configure(config);
      loadBackups();
    }
  }, []);

  // 自动保存 WebDAV 配置到 localStorage
  useEffect(() => {
    if (webdavConfig.url || webdavConfig.username || webdavConfig.password) {
      storage.set(STORAGE_KEYS.WEBDAV_CONFIG, webdavConfig);
    }
  }, [webdavConfig]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      webdavService.configure(webdavConfig);
      const result = await webdavService.testConnection();
      setIsConnected(result);
      if (result) {
        alert(t('pages.settings.webdav.connectionSuccess'));
        loadBackups();
      } else {
        alert(t('pages.settings.webdav.connectionFailed'));
      }
    } catch (error) {
      alert(`${t('pages.settings.webdav.connectionFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
      setIsConnected(false);
    } finally {
      setTesting(false);
    }
  };

  const loadBackups = async () => {
    try {
      const list = await webdavService.listBackups();
      setBackups(list);
    } catch (error) {
      console.error(t('pages.settings.errors.loadBackupsFailed'), error);
    }
  };

  const handleBackup = async () => {
    if (!isConnected) {
      alert(t('pages.settings.webdav.configureFirst'));
      return;
    }

    setLoading(true);
    try {
      await webdavService.backupToWebDAV();
      alert(t('pages.settings.webdav.backupSuccess'));
      loadBackups();
    } catch (error) {
      alert(`${t('pages.settings.webdav.backupFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestoreModal = async () => {
    if (!isConnected) {
      alert(t('pages.settings.webdav.configureFirst'));
      return;
    }

    setLoading(true);
    try {
      const list = await webdavService.listBackups();
      setBackups(list);
      setShowRestoreModal(true);
    } catch (error) {
      alert(`${t('pages.settings.errors.loadBackupsFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (remotePath: string) => {
    if (!confirm(t('pages.settings.webdav.confirmRestore'))) {
      return;
    }

    setShowRestoreModal(false);
    setLoading(true);
    try {
      await webdavService.restoreFromWebDAV(remotePath);
      alert(t('pages.settings.webdav.restoreSuccess'));
      window.location.reload();
    } catch (error) {
      alert(`${t('pages.settings.webdav.restoreFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (remotePath: string) => {
    if (!confirm(t('pages.settings.webdav.confirmDelete'))) {
      return;
    }

    try {
      await webdavService.deleteBackup(remotePath);
      alert(t('pages.settings.webdav.deleteSuccess'));
      // 更新备份列表和模态框中的备份列表
      loadBackups();
      setBackups(prev => prev.filter(b => b.path !== remotePath));
    } catch (error) {
      alert(`${t('pages.settings.webdav.deleteFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportService.exportAllAsZip();
    } catch (error) {
      alert(`${t('pages.settings.local.exportFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.zip')) {
        await exportService.importFromZip(file);
      } else if (file.name.endsWith('.json')) {
        await exportService.importFromJSON(file);
      } else {
        alert(t('pages.settings.local.unsupportedFormat'));
        return;
      }
      
      // 刷新数据而不是重新加载页面
      await loadFolders();
      await loadProjects();
      
      alert(t('pages.settings.local.importSuccess'));
    } catch (error) {
      alert(`${t('pages.settings.local.importFailed')}: ${error instanceof Error ? error.message : t('pages.settings.errors.unknown')}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-dynamic-screen bg-surface text-surface-onSurface">
      <header className="bg-primary text-onPrimary px-6 py-1 shadow-m3-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('pages.settings.title')}</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-m3-medium hover:bg-onPrimary/20 transition-colors"
        >
          <Icons.LeftArrow className="h-5 w-5" />
        </button>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 本地导入导出 */}
          <section className="bg-surface-container rounded-m3-large p-6 shadow-m3-1">
            <h2 className="text-xl font-bold mb-4">{t('pages.settings.local.title')}</h2>
            <div className="space-y-4">
              <div>
                <Button onClick={handleExportJSON} className="w-full sm:w-auto">
                  <Icons.Package size={16} />
                  <span className="ml-2">{t('pages.settings.local.exportZip')}</span>
                </Button>
                <p className="text-sm text-surface-onVariant mt-2">
                  {t('pages.settings.local.exportDescription')}
                </p>
              </div>

              <div>
                <Button onClick={handleImportClick} className="w-full sm:w-auto">
                  <Icons.Download size={16} />
                  <span className="ml-2">{t('pages.settings.local.importZip')}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </div>
          </section>

          {/* WebDAV 配置 */}
          <section className="bg-surface-container rounded-m3-large p-6 shadow-m3-1">
            <h2 className="text-xl font-bold mb-4">{t('pages.settings.webdav.title')}</h2>
            <div className="space-y-4">
              <Input
                label={t('pages.settings.webdav.serverUrl')}
                placeholder="https://example.com/webdav"
                value={webdavConfig.url}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, url: e.target.value })
                }
              />
              <Input
                label={t('pages.settings.webdav.username')}
                placeholder="username"
                value={webdavConfig.username}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, username: e.target.value })
                }
              />
              <Input
                label={t('pages.settings.webdav.password')}
                type="password"
                placeholder="password"
                value={webdavConfig.password}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, password: e.target.value })
                }
              />

              <div className="flex gap-3">
                <Button onClick={handleTestConnection} disabled={testing}>
                  {testing ? t('pages.settings.webdav.testing') : t('pages.settings.webdav.testConnection')}
                </Button>
                {isConnected && (
                  <span className="flex items-center text-sm text-green-600">
                    ✓ {t('pages.settings.webdav.connected')}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-surface-onVariant/20">
                <div className="flex gap-3">
                  <Button
                    onClick={handleBackup}
                    disabled={!isConnected || loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      t('pages.settings.webdav.backingUp')
                    ) : (
                      <>
                        <Icons.Refresh size={16} />
                        <span className="ml-2">{t('pages.settings.webdav.backupToWebdav')}</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleOpenRestoreModal}
                    disabled={!isConnected || loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      t('pages.settings.webdav.loading')
                    ) : (
                      <>
                        <Icons.Download size={16} />
                        <span className="ml-2">{t('pages.settings.webdav.restoreFromWebdav')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 从 WebDAV 还原模态框 */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title={t('pages.settings.webdav.restoreModalTitle')}
        size="large"
      >
        <div className="space-y-4">
          {backups.length === 0 ? (
            <p className="text-center text-surface-onVariant py-8">
              {t('pages.settings.webdav.noBackups')}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {backups.map((backup) => (
                <div
                  key={backup.path}
                  className="flex items-center justify-between p-4 bg-surface-containerHighest rounded-m3-medium hover:bg-surface-containerHigh transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {backup.name}
                    </p>
                    <p className="text-xs text-surface-onVariant mt-1">
                      {formatDate(backup.lastMod)} • {formatFileSize(backup.size)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRestore(backup.path)}
                    disabled={loading}
                    className="ml-4"
                  >
                    {t('pages.settings.webdav.restore')}
                  </Button>
                  <Button
                    onClick={() => handleDeleteBackup(backup.path)}
                    disabled={loading}
                    className="ml-4"
                  >
                    {t('pages.settings.webdav.delete')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Settings;