import React, { HTMLAttributes, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { Icons } from '@/components/icons/Icons';
import { FolderTree } from './FolderTree';
import { useTranslation } from '@/i18n/I18nContext';
import { MinimalButton } from '@/components/common/MinimalButton';

export const Sidebar: React.FC = () => {
  const t = useTranslation();
  const { sidebarCollapsed, sidebarTemporarilyExpanded } = useUiStore();
  const { loadFolders, loadProjects, createFolder, createProject, selectProject } =
    useProjectStore();

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
      let rootFolderId = 'root';
      await loadFolders();
      const projectId = await createProject(projectName.trim(), rootFolderId);
      await loadProjects();
      selectProject(projectId);
    }
  };

  if (sidebarCollapsed && !sidebarTemporarilyExpanded) {
    return null;
  }

  return (
    <aside className="w-64 min-w-[200px] flex flex-col gap-2 shrink-0">
      {/* Sidebar Header Card */}
      <div className="bg-surface dark:bg-surface-dark rounded-xl px-4 shadow-card border border-border dark:border-border-dark flex items-center justify-between h-16 shrink-0">
        <h2 className="font-bold text-surface-onSurface">{t('components.sidebar.projects')}</h2>
        <SidebarToggle />
      </div>

      {/* Projects List Card */}
      <div className="flex-1 bg-surface dark:bg-surface-dark rounded-xl shadow-card border border-border dark:border-border-dark overflow-y-auto p-1 flex flex-col">
        {/* Action Buttons */}
        <div className="flex gap-2 mb-1 p-2">
          <MinimalButton
            variant="default"
            onClick={handleCreateFolder}
            className="flex-1 gap-2 py-2 text-sm"
            title={t('components.sidebar.createFolder')}
          >
            <Icons.FolderPlus size={20} />
          </MinimalButton>
          <MinimalButton
            variant="default"
            onClick={handleCreateProject}
            className="flex-1 gap-2 py-2 text-sm"
            title={t('components.sidebar.createProject')}
          >
            <Icons.FilePlus size={20} />
          </MinimalButton>
        </div>

        {/* Tree */}
        <div className="flex-1">
          <FolderTree />
        </div>
      </div>
    </aside>
  );
};

export const SidebarToggle: React.FC<HTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  ...props
}) => {
  const t = useTranslation();
  const { toggleSidebar } = useUiStore();
  const { sidebarCollapsed, sidebarTemporarilyExpanded } = useUiStore();
  return (
    <MinimalButton
      variant="ghost"
      onClick={toggleSidebar}
      className={`p-1 ${className}`}
      aria-label={t('components.sidebar.collapseSidebar')}
      {...props}
    >
      {sidebarCollapsed && !sidebarTemporarilyExpanded ? (
        <Icons.MenuClosed size={22} />
      ) : (
        <Icons.MenuOpen size={22} />
      )}
    </MinimalButton>
  );
};
