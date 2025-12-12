import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Icons } from '@/components/icons/Icons';
import { FolderTree } from './FolderTree';
import { useTranslation } from '@/i18n/I18nContext';

export const Sidebar: React.FC = () => {
  const t = useTranslation();
  const { sidebarCollapsed, sidebarTemporarilyExpanded } = useUiStore();
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

  // 如果侧边栏折叠且不是临时展开状态，则不显示
  if (sidebarCollapsed && !sidebarTemporarilyExpanded) {
    return null;
  }

  return (
    <div className="w-[18%] min-w-[160px] flex-shrink-0 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">{t('components.sidebar.projects')}</h2>
          <SidebarToggle />
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateFolder}
            className="w-fit aspect-square flex items-center justify-center relative"
            title={t('components.sidebar.createFolder')}
          >
            <Icons.Folder size={16} />
            <span className="absolute top-0 right-1 text-base leading-none font-bold opacity-70">+</span>
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateProject}
            className="w-fit aspect-square flex items-center justify-center relative"
            title={t('components.sidebar.createProject')}
          >
            <Icons.File size={16} />
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

export const SidebarToggle = () => {
  const t = useTranslation();
  const { toggleSidebar } = useUiStore();
  return (
    <button
      onClick={toggleSidebar}
      className="w-8 h-8 p-0 flex items-center justify-center rounded-m3-small transition-colors hover:bg-surface-containerHighest"
      aria-label={t('components.sidebar.collapseSidebar')}
    >
      <Icons.Menu size={20} />
    </button>
  );
};
