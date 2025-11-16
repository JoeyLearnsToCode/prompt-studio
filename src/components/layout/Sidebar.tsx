import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import ProjectList from './ProjectList';

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { loadFolders, loadProjects, createFolder, createProject } = useProjectStore();

  useEffect(() => {
    loadFolders();
    loadProjects();
  }, [loadFolders, loadProjects]);

  const handleCreateProject = async () => {
    // 创建默认根文件夹（如果不存在）
    const rootFolderId = await createFolder('我的项目', null);
    const projectName = prompt('请输入项目名称:');
    if (projectName) {
      await createProject(projectName, rootFolderId);
      await loadProjects();
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

      <div className="p-4">
        <Button onClick={handleCreateProject} className="w-full">
          创建项目
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ProjectList />
      </div>
    </div>
  );
};

export default Sidebar;
