import React, { useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import type { Folder } from '@/models/Folder';
import type { Project } from '@/models/Project';
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';

interface FolderTreeProps {
  onProjectSelect?: (projectId: string) => void;
}

interface TreeItemProps {
  folder: Folder;
  level: number;
  onContextMenu: (e: React.MouseEvent, folder: Folder) => void;
  onToggle: (folderId: string) => void;
  expanded: Set<string>;
  onProjectDrop: (projectId: string, folderId: string) => void;
}

interface ProjectItemProps {
  project: Project;
  level: number;
  onContextMenu: (e: React.MouseEvent, project: Project) => void;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  level,
  onContextMenu,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 cursor-pointer
        transition-colors duration-150
        ${isSelected ? 'bg-primary-container' : 'hover:bg-surface-containerHighest'}
      `}
      style={{ paddingLeft: `${level * 16 + 16}px` }}
      onClick={() => onSelect(project.id)}
      onContextMenu={(e) => onContextMenu(e, project)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', `project:${project.id}`);
        e.dataTransfer.setData('projectName', project.name);
      }}
    >
      <span className="text-sm">📄</span>
      <span className="text-sm truncate flex-1">{project.name}</span>
      {project.tags && (
        <div className="flex gap-1">
          {project.tags.model && (
            <span className="text-xs px-1.5 py-0.5 bg-tertiary-container rounded text-tertiary-onContainer">
              {project.tags.model}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const FolderItem: React.FC<TreeItemProps> = ({
  folder,
  level,
  onContextMenu,
  onToggle,
  expanded,
  onProjectDrop,
}) => {
  const { folders, projects } = useProjectStore();
  const isExpanded = expanded.has(folder.id);
  
  const childFolders = folders.filter((f) => f.parentId === folder.id);
  const childProjects = projects.filter((p) => p.folderId === folder.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-surface-containerHighest transition-colors duration-150"
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={() => onToggle(folder.id)}
        onContextMenu={(e) => onContextMenu(e, folder)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const data = e.dataTransfer.getData('text/plain');
          if (data.startsWith('project:')) {
            const projectId = data.split(':')[1];
            onProjectDrop(projectId, folder.id);
          }
        }}
      >
        <span className="text-sm select-none">
          {isExpanded ? '📂' : '📁'}
        </span>
        <span className="text-sm flex-1 truncate">{folder.name}</span>
        <span className="text-xs text-surface-onVariant">
          {childProjects.length}
        </span>
      </div>
      
      {isExpanded && (
        <div>
          {childFolders.map((childFolder) => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              onContextMenu={onContextMenu}
              onToggle={onToggle}
              expanded={expanded}
              onProjectDrop={onProjectDrop}
            />
          ))}
          {childProjects.map((project) => (
            <ProjectItemConnected
              key={project.id}
              project={project}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectItemConnected: React.FC<{ project: Project; level: number }> = ({
  project,
  level,
}) => {
  const { currentProjectId, selectProject, deleteProject, renameProject } = useProjectStore();
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    project: Project | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    project: null,
  });

  const handleContextMenu = useCallback((e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      project,
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (contextMenu.project && confirm(`确定删除项目 "${contextMenu.project.name}" 吗？`)) {
      await deleteProject(contextMenu.project.id);
    }
  }, [contextMenu.project, deleteProject]);

  const projectMenuItems: ContextMenuItem[] = [
    {
      label: '重命名',
      icon: '✏️',
      onClick: async () => {
        const newName = prompt('请输入新名称:', contextMenu.project?.name);
        if (newName && newName.trim() && contextMenu.project) {
          await renameProject(contextMenu.project.id, newName.trim());
        }
      },
    },
    {
      label: '删除',
      icon: '🗑️',
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <>
      <ProjectItem
        project={project}
        level={level}
        onContextMenu={handleContextMenu}
        isSelected={currentProjectId === project.id}
        onSelect={selectProject}
      />
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={projectMenuItems}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
    </>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ onProjectSelect }) => {
  const {
    folders,
    projects,
    loadFolders,
    loadProjects,
    createFolder,
    deleteFolder,
    renameFolder,
    createProject,
    selectProject,
    moveProject,
  } = useProjectStore();
  
  const { expandedFolders, toggleFolder, expandFolder } = useUiStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFolders();
    loadProjects();
  }, [loadFolders, loadProjects]);

  useEffect(() => {
    setExpanded(new Set(expandedFolders));
  }, [expandedFolders]);

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    folder: Folder | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    folder: null,
  });

  const handleContextMenu = useCallback((e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      folder,
    });
  }, []);

  const handleToggle = useCallback(
    (folderId: string) => {
      toggleFolder(folderId);
    },
    [toggleFolder]
  );

  const handleCreateSubfolder = useCallback(async () => {
    if (contextMenu.folder) {
      const name = prompt('请输入文件夹名称:');
      if (name) {
        await createFolder(name, contextMenu.folder.id);
        expandFolder(contextMenu.folder.id);
        await loadFolders();
      }
    }
  }, [contextMenu.folder, createFolder, expandFolder, loadFolders]);

  const handleRename = useCallback(async () => {
    if (contextMenu.folder) {
      const newName = prompt('请输入新名称:', contextMenu.folder.name);
      if (newName) {
        await renameFolder(contextMenu.folder.id, newName);
        await loadFolders();
      }
    }
  }, [contextMenu.folder, renameFolder, loadFolders]);

  const handleDelete = useCallback(async () => {
    if (contextMenu.folder && confirm(`确定删除文件夹 "${contextMenu.folder.name}" 吗？`)) {
      await deleteFolder(contextMenu.folder.id);
      await loadFolders();
      await loadProjects();
    }
  }, [contextMenu.folder, deleteFolder, loadFolders, loadProjects]);

  const moveProjectToFolder = useCallback(async (projectId: string, folderId: string) => {
    try {
      await moveProject(projectId, folderId);
    } catch (error) {
      console.error('移动项目失败:', error);
      alert('移动项目失败');
    }
  }, [moveProject]);

  const folderMenuItems: ContextMenuItem[] = [
    {
      label: '新建项目',
      icon: '📄',
      onClick: async () => {
        if (contextMenu.folder) {
          const projectName = prompt('请输入项目名称:');
          if (projectName && projectName.trim()) {
            const projectId = await createProject(projectName.trim(), contextMenu.folder.id);
            await loadProjects();
            selectProject(projectId);
            expandFolder(contextMenu.folder.id);
          }
        }
      },
    },
    {
      label: '新建子文件夹',
      icon: '📁',
      onClick: handleCreateSubfolder,
    },
    {
      label: '重命名',
      icon: '✏️',
      onClick: handleRename,
    },
    {
      label: '删除',
      icon: '🗑️',
      danger: true,
      onClick: handleDelete,
    },
  ];

  const rootFolders = folders.filter((f) => f.parentId === null);
  const rootProjects = projects.filter((p) => p.folderId === null || p.folderId === 'root');

  return (
    <div className="flex flex-col h-full">
      {rootFolders.length === 0 && rootProjects.length === 0 ? (
        <div className="p-4 text-sm text-surface-onVariant text-center">
          暂无项目，点击上方按钮创建
        </div>
      ) : (
        <div 
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const data = e.dataTransfer.getData('text/plain');
          if (data.startsWith('project:')) {
            const projectId = data.split(':')[1];
            moveProjectToFolder(projectId, 'root');
          }
        }}
        >
          {rootFolders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              level={0}
              onContextMenu={handleContextMenu}
              onToggle={handleToggle}
              expanded={expanded}
              onProjectDrop={moveProjectToFolder}
            />
          ))}
          {rootProjects.map((project) => (
            <ProjectItemConnected key={project.id} project={project} level={0} />
          ))}
        </div>
      )}

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={folderMenuItems}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
    </div>
  );
};
