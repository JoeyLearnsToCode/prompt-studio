import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { FolderTree } from './FolderTree';
import { useTranslation } from '@/i18n/I18nContext';

const Sidebar: React.FC = () => {
  const t = useTranslation();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { loadFolders, loadProjects, createFolder, createProject, selectProject } = useProjectStore();

  useEffect(() => {
    loadFolders();
    loadProjects();
  }, [loadFolders, loadProjects]);

  const handleCreateFolder = async () => {
    const folderName = prompt(t('components.sidebar.folderName'));
    if (folderName && folderName.trim()) {
      await createFolder(folderName.trim(), null);
      await loadFolders();
    }
  };

  const handleCreateProject = async () => {
    const projectName = prompt(t('components.sidebar.projectName'));
    if (projectName && projectName.trim()) {
      // 查找或创建默认根文件夹
      let rootFolderId = 'root';
      await loadFolders();
      
      // 创建项目和初始根版本
      const projectId = await createProject(projectName.trim(), rootFolderId);
      await loadProjects();
      
      // 自动选择新创建的项目
      selectProject(projectId);
    }
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-16 flex-shrink-0 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 p-0 flex items-center justify-center rounded-m3-small transition-colors hover:bg-surface-containerHighest"
          aria-label={t('components.sidebar.expandSidebar')}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-[18%] min-w-[160px] flex-shrink-0 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">{t('components.sidebar.projects')}</h2>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 p-0 flex items-center justify-center rounded-m3-small transition-colors hover:bg-surface-containerHighest"
            aria-label={t('components.sidebar.collapseSidebar')}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateFolder}
            className="w-10 h-10 p-0 flex items-center justify-center relative"
            title={t('components.sidebar.createFolder')}
          >
            <span className="text-base leading-none">📁</span>
            <span className="absolute top-0 right-1 text-base leading-none font-bold opacity-70">+</span>
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateProject}
            className="w-10 h-10 p-0 flex items-center justify-center relative"
            title={t('components.sidebar.createProject')}
          >
            <span className="text-base leading-none">📄</span>
            <span className="absolute top-0 right-1 text-base leading-none font-bold opacity-70">+</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <FolderTree />
      </div>
    </div>
  );
};

export default Sidebar;
