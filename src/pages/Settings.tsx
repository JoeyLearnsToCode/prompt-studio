import React, { useState, useEffect } from 'react';
import { webdavService, type WebDAVConfig } from '@/services/webdavService';
import { exportService } from '@/services/exportService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

const Settings: React.FC = () => {
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

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      webdavService.configure(webdavConfig);
      const result = await webdavService.testConnection();
      setIsConnected(result);
      if (result) {
        alert('连接成功！');
        // 保存配置
        localStorage.setItem('webdav_config', JSON.stringify(webdavConfig));
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

  const handleRestore = async (remotePath: string) => {
    if (!confirm(`确定从此备份还原数据吗？
${remotePath}`)) {
      return;
    }

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
    if (!confirm(`确定删除此备份吗？
${remotePath}`)) {
      return;
    }

    try {
      await webdavService.deleteBackup(remotePath);
      alert('删除成功！');
      loadBackups();
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
      alert('导入成功！请刷新页面查看数据。');
      window.location.reload();
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
      <header className="bg-primary text-onPrimary px-6 py-4 shadow-m3-1">
        <h1 className="text-2xl font-bold">设置</h1>
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
                <label className="block">
                  <Button className="w-full sm:w-auto cursor-pointer">
                    📥 从文件导入
                  </Button>
                  <input
                    type="file"
                    accept=".json,.zip"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
                <p className="text-sm text-surface-onVariant mt-2">
                  支持 JSON 和 ZIP 格式的备份文件
                </p>
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
                <Button
                  onClick={handleBackup}
                  disabled={!isConnected || loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? '备份中...' : '🔄 备份到 WebDAV'}
                </Button>
              </div>
            </div>
          </section>

          {/* 备份列表 */}
          {backups.length > 0 && (
            <section className="bg-surface-container rounded-m3-large p-6 shadow-m3-1">
              <h2 className="text-xl font-bold mb-4">远程备份列表</h2>
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div
                    key={backup.path}
                    className="flex items-center justify-between p-3 bg-surface-containerHighest rounded-m3-medium"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {backup.name}
                      </p>
                      <p className="text-xs text-surface-onVariant">
                        {formatDate(backup.lastMod)} • {formatFileSize(backup.size)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleRestore(backup.path)}
                        className="px-3 py-1 text-sm bg-primary text-onPrimary rounded-m3-small hover:bg-primary/90 transition-colors"
                        disabled={loading}
                      >
                        还原
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.path)}
                        className="px-3 py-1 text-sm bg-error text-onError rounded-m3-small hover:bg-error/90 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
