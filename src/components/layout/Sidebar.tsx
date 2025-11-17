import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { FolderTree } from './FolderTree';

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { loadFolders, loadProjects, createFolder, createProject, selectProject } = useProjectStore();

  useEffect(() => {
    loadFolders();
    loadProjects();
  }, [loadFolders, loadProjects]);

  const handleCreateFolder = async () => {
    const folderName = prompt('请输入文件夹名称:');
    if (folderName && folderName.trim()) {
      await createFolder(folderName.trim(), null);
      await loadFolders();
    }
  };

  const handleCreateProject = async () => {
    const projectName = prompt('请输入项目名称:');
    if (projectName && projectName.trim()) {
      // 查找或创建默认根文件夹
      const rootFolderId = 'root';
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
      <div className="w-16 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-primary-container rounded-m3-small"
          aria-label="展开侧边栏"
        >
          →
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col">
      <div className="p-4 border-b border-surface-onVariant/20 flex items-center justify-between">
        <h2 className="font-bold text-lg">项目</h2>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-primary-container rounded-m3-small"
          aria-label="折叠侧边栏"
        >
          ←
        </button>
      </div>

      <div className="p-4 flex gap-2">
        <Button onClick={handleCreateFolder} className="flex-1 text-sm">
          📁 新建文件夹
        </Button>
        <Button onClick={handleCreateProject} className="flex-1 text-sm">
          📄 新建项目
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <FolderTree />
      </div>
    </div>
  );
};

export default Sidebar;
