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
      let rootFolderId = 'root';
      const folders = await loadFolders();
      
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
          className="w-8 h-8 p-0 flex items-center justify-center rounded-m3-small transition-colors hover:bg-surface-containerHighest"
          aria-label="展开侧边栏"
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
    <div className="w-64 bg-surface-variant border-r border-surface-onVariant/20 flex flex-col">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">项目</h2>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 p-0 flex items-center justify-center rounded-m3-small transition-colors hover:bg-surface-containerHighest"
            aria-label="折叠侧边栏"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outlined" size="small" onClick={handleCreateFolder} className="w-10 h-10 p-0 flex items-center justify-center" title="新建文件夹">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </Button>
          <Button variant="outlined" size="small" onClick={handleCreateProject} className="w-10 h-10 p-0 flex items-center justify-center" title="新建项目">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
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
