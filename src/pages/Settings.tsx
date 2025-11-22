import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { webdavService, type WebDAVConfig } from '@/services/webdavService';
import { exportService } from '@/services/exportService';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';

const Settings: React.FC = () => {
  const navigate = useNavigate();
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
  const [restoreBackups, setRestoreBackups] = useState<
    Array<{ name: string; path: string; size: number; lastMod: string }>
  >([]);

  useEffect(() => {
    // 从 localStorage 加载配置
    const savedConfig = localStorage.getItem('webdav_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setWebdavConfig(config);
      webdavService.configure(config);
      loadBackups();
    }
  }, []);

  // 自动保存 WebDAV 配置到 localStorage
  useEffect(() => {
    if (webdavConfig.url || webdavConfig.username || webdavConfig.password) {
      localStorage.setItem('webdav_config', JSON.stringify(webdavConfig));
    }
  }, [webdavConfig]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      webdavService.configure(webdavConfig);
      const result = await webdavService.testConnection();
      setIsConnected(result);
      if (result) {
        alert('连接成功！');
        loadBackups();
      } else {
        alert('连接失败，请检查配置');
      }
    } catch (error) {
      alert(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      console.error('加载备份列表失败:', error);
    }
  };

  const handleBackup = async () => {
    if (!isConnected) {
      alert('请先配置并测试 WebDAV 连接');
      return;
    }

    setLoading(true);
    try {
      await webdavService.backupToWebDAV();
      alert('备份成功！');
      loadBackups();
    } catch (error) {
      alert(`备份失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestoreModal = async () => {
    if (!isConnected) {
      alert('请先配置并测试 WebDAV 连接');
      return;
    }

    setLoading(true);
    try {
      const list = await webdavService.listBackups();
      setRestoreBackups(list);
      setShowRestoreModal(true);
    } catch (error) {
      alert(`获取备份列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (remotePath: string) => {
    if (!confirm(`确定从此备份还原数据吗？`)) {
      return;
    }

    setShowRestoreModal(false);
    setLoading(true);
    try {
      await webdavService.restoreFromWebDAV(remotePath);
      alert('还原成功！请刷新页面查看数据。');
      window.location.reload();
    } catch (error) {
      alert(`还原失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (remotePath: string) => {
    if (!confirm(`确定删除此备份吗？`)) {
      return;
    }

    try {
      await webdavService.deleteBackup(remotePath);
      alert('删除成功！');
      // 更新备份列表和模态框中的备份列表
      loadBackups();
      setRestoreBackups(prev => prev.filter(b => b.path !== remotePath));
    } catch (error) {
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportService.exportAllAsZip();
    } catch (error) {
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
        alert('不支持的文件格式');
        return;
      }
      
      // 刷新数据而不是重新加载页面
      await loadFolders();
      await loadProjects();
      
      alert('导入成功！');
    } catch (error) {
      alert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
    <div className="min-h-screen bg-surface text-surface-onSurface">
      <header className="bg-primary text-onPrimary px-6 py-1 shadow-m3-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">设置</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-m3-medium hover:bg-onPrimary/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 本地导入导出 */}
          <section className="bg-surface-container rounded-m3-large p-6 shadow-m3-1">
            <h2 className="text-xl font-bold mb-4">本地备份</h2>
            <div className="space-y-4">
              <div>
                <Button onClick={handleExportJSON} className="w-full sm:w-auto">
                  📦 导出所有数据为 ZIP
                </Button>
                <p className="text-sm text-surface-onVariant mt-2">
                  导出包含项目、版本、附件的完整备份文件
                </p>
              </div>

              <div>
                <Button onClick={handleImportClick} className="w-full sm:w-auto">
                  📥 从 ZIP 文件导入
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
            <h2 className="text-xl font-bold mb-4">WebDAV 远程备份</h2>
            <div className="space-y-4">
              <Input
                label="WebDAV 服务器地址"
                placeholder="https://example.com/webdav"
                value={webdavConfig.url}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, url: e.target.value })
                }
              />
              <Input
                label="用户名"
                placeholder="username"
                value={webdavConfig.username}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, username: e.target.value })
                }
              />
              <Input
                label="密码"
                type="password"
                placeholder="password"
                value={webdavConfig.password}
                onChange={(e) =>
                  setWebdavConfig({ ...webdavConfig, password: e.target.value })
                }
              />

              <div className="flex gap-3">
                <Button onClick={handleTestConnection} disabled={testing}>
                  {testing ? '测试中...' : '测试连接'}
                </Button>
                {isConnected && (
                  <span className="flex items-center text-sm text-green-600">
                    ✓ 已连接
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
                    {loading ? '备份中...' : '🔄 备份到 WebDAV'}
                  </Button>
                  <Button
                    onClick={handleOpenRestoreModal}
                    disabled={!isConnected || loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? '加载中...' : '📥 从 WebDAV 还原'}
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
        title="从 WebDAV 还原备份"
        size="large"
      >
        <div className="space-y-4">
          {restoreBackups.length === 0 ? (
            <p className="text-center text-surface-onVariant py-8">
              暂无可用的备份文件
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {restoreBackups.map((backup) => (
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
                    还原
                  </Button>
                  <Button
                    onClick={() => handleDeleteBackup(backup.path)}
                    disabled={loading}
                    className="ml-4"
                  >
                    删除
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
