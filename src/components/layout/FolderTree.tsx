import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import type { Folder } from '@/models/Folder';
import type { Project } from '@/models/Project';
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';
import { Icons } from '@/components/icons/Icons';
import { sortByName } from '@/utils/tree';

interface FolderTreeProps {
  onProjectSelect?: (projectId: string) => void;
}

interface TreeItemProps {
  folder: Folder;
  level: number;
  onContextMenu: (e: React.MouseEvent, item: Folder | Project) => void;
  onToggle: (folderId: string) => void;
  expanded: Set<string>;
  onProjectDrop: (projectId: string, folderId: string) => void;
  onCloseAllMenus?: () => void;
}

interface ProjectItemProps {
  project: Project;
  level: number;
  onContextMenu: (e: React.MouseEvent, project: Project) => void;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
  onCloseAllMenus?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  level,
  onContextMenu,
  isSelected,
  onSelect,
  onCloseAllMenus,
}) => {
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    touchTimerRef.current = setTimeout(() => {
      if (touchStartPosRef.current) {
        onCloseAllMenus?.();
        const syntheticEvent = {
          preventDefault: () => {},
          clientX: touchStartPosRef.current.x,
          clientY: touchStartPosRef.current.y,
        } as React.MouseEvent;
        onContextMenu(syntheticEvent, project);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchTimerRef.current && touchStartPosRef.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

      if (dx > 10 || dy > 10) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    touchStartPosRef.current = null;
  };

  // Updated Styling:
  // - Selected: Light green background, Primary text, Left border strip
  // - Hover: Light background hover
  return (
    <div className="relative group my-0.5">
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
      )}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg mx-1
          transition-all duration-150 text-sm
          ${
            isSelected
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-surface-onVariant hover:bg-background dark:hover:bg-zinc-700/50'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(project.id)}
        onContextMenu={(e) => {
          onCloseAllMenus?.();
          onContextMenu(e, project);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', `project:${project.id}`);
          e.dataTransfer.setData('projectName', project.name);
        }}
      >
        <Icons.File
          size={16}
          className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-surface-onVariant'}`}
        />
        <span className="truncate flex-1">{project.name}</span>
        {project.tags && project.tags.model && (
          <span className="text-[10px] px-1.5 py-0.5 bg-background dark:bg-zinc-800 rounded border border-border dark:border-border-dark text-surface-onVariant opacity-70">
            {project.tags.model}
          </span>
        )}
      </div>
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
  onCloseAllMenus,
}) => {
  const { folders, projects } = useProjectStore();
  const isExpanded = expanded.has(folder.id);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const childFolders = sortByName(folders.filter((f) => f.parentId === folder.id));
  const childProjects = sortByName(projects.filter((p) => p.folderId === folder.id));

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    touchTimerRef.current = setTimeout(() => {
      if (touchStartPosRef.current) {
        onCloseAllMenus?.();
        const syntheticEvent = {
          preventDefault: () => {},
          clientX: touchStartPosRef.current.x,
          clientY: touchStartPosRef.current.y,
        } as React.MouseEvent;
        onContextMenu(syntheticEvent, folder);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchTimerRef.current && touchStartPosRef.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

      if (dx > 10 || dy > 10) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    touchStartPosRef.current = null;
  };

  const getAllProjectsCount = useMemo(() => {
    const countProjectsInFolder = (folderId: string): number => {
      const directChildProjects = projects.filter((p) => p.folderId === folderId);
      let totalCount = directChildProjects.length;
      const childFoldersList = folders.filter((f) => f.parentId === folderId);
      for (const childFolder of childFoldersList) {
        totalCount += countProjectsInFolder(childFolder.id);
      }
      return totalCount;
    };
    return countProjectsInFolder(folder.id);
  }, [folders, projects, folder.id]);

  return (
    <div className="my-0.5">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-background dark:hover:bg-zinc-700/50 transition-colors duration-150 rounded-lg mx-1 text-sm text-surface-onVariant"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onToggle(folder.id)}
        onContextMenu={(e) => {
          onCloseAllMenus?.();
          onContextMenu(e, folder);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
        <span className="flex-shrink-0 text-surface-onVariant">
          {isExpanded ? <Icons.FolderOpen size={16} /> : <Icons.Folder size={16} />}
        </span>
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-xs opacity-50">{getAllProjectsCount}</span>
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
              onCloseAllMenus={onCloseAllMenus}
            />
          ))}
          {childProjects.map((project) => (
            <ProjectItemConnected
              key={project.id}
              project={project}
              level={level + 1}
              onCloseAllMenus={onCloseAllMenus}
              onContextMenu={(e, item) => onContextMenu(e, item as any)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectItemConnected: React.FC<{
  project: Project;
  level: number;
  onCloseAllMenus?: () => void;
  onContextMenu: (e: React.MouseEvent, item: Folder | Project) => void;
}> = ({ project, level, onCloseAllMenus, onContextMenu }) => {
  const { currentProjectId, selectProject } = useProjectStore();

  return (
    <ProjectItem
      project={project}
      level={level}
      onContextMenu={(e, p) => onContextMenu(e, p as any)}
      isSelected={currentProjectId === project.id}
      onSelect={selectProject}
      onCloseAllMenus={onCloseAllMenus}
    />
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ onProjectSelect: _onProjectSelect }) => {
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
    deleteProject,
    renameProject,
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

  const [folderContextMenu, setFolderContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    folder: Folder | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    folder: null,
  });

  const [projectContextMenu, setProjectContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    project: Project | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    project: null,
  });

  const handleCloseAllMenus = useCallback(() => {
    setFolderContextMenu((prev) => ({ ...prev, isOpen: false }));
    setProjectContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleFolderContextMenu = useCallback(
    (e: React.MouseEvent, folder: Folder) => {
      e.preventDefault();
      handleCloseAllMenus();
      setFolderContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        folder,
      });
    },
    [handleCloseAllMenus]
  );

  const handleProjectContextMenu = useCallback(
    (e: React.MouseEvent, project: Project) => {
      e.preventDefault();
      handleCloseAllMenus();
      setProjectContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        project,
      });
    },
    [handleCloseAllMenus]
  );

  const handleToggle = useCallback(
    (folderId: string) => {
      toggleFolder(folderId);
    },
    [toggleFolder]
  );

  const handleCreateSubfolder = useCallback(async () => {
    if (folderContextMenu.folder) {
      const name = prompt('请输入文件夹名称:');
      if (name) {
        await createFolder(name, folderContextMenu.folder.id);
        expandFolder(folderContextMenu.folder.id);
        await loadFolders();
      }
    }
  }, [folderContextMenu.folder, createFolder, expandFolder, loadFolders]);

  const handleFolderRename = useCallback(async () => {
    if (folderContextMenu.folder) {
      const newName = prompt('请输入新名称:', folderContextMenu.folder.name);
      if (newName) {
        await renameFolder(folderContextMenu.folder.id, newName);
        await loadFolders();
      }
    }
  }, [folderContextMenu.folder, renameFolder, loadFolders]);

  const handleFolderDelete = useCallback(async () => {
    if (
      folderContextMenu.folder &&
      confirm(`确定删除文件夹 "${folderContextMenu.folder.name}" 吗？`)
    ) {
      await deleteFolder(folderContextMenu.folder.id);
      await loadFolders();
      await loadProjects();
    }
  }, [folderContextMenu.folder, deleteFolder, loadFolders, loadProjects]);

  const handleProjectRename = useCallback(async () => {
    if (projectContextMenu.project) {
      const newName = prompt('请输入新名称:', projectContextMenu.project.name);
      if (newName && newName.trim()) {
        await renameProject(projectContextMenu.project.id, newName.trim());
      }
    }
  }, [projectContextMenu.project, renameProject]);

  const handleProjectDelete = useCallback(async () => {
    if (
      projectContextMenu.project &&
      confirm(`确定删除项目 "${projectContextMenu.project.name}" 吗？`)
    ) {
      await deleteProject(projectContextMenu.project.id);
    }
  }, [projectContextMenu.project, deleteProject]);

  const moveProjectToFolder = useCallback(
    async (projectId: string, folderId: string) => {
      try {
        await moveProject(projectId, folderId);
      } catch (error) {
        console.error('移动项目失败:', error);
        alert('移动项目失败');
      }
    },
    [moveProject]
  );

  const folderMenuItems: ContextMenuItem[] = [
    {
      label: '新建项目',
      icon: Icons.File,
      onClick: async () => {
        if (folderContextMenu.folder) {
          const projectName = prompt('请输入项目名称:');
          if (projectName && projectName.trim()) {
            const projectId = await createProject(projectName.trim(), folderContextMenu.folder.id);
            await loadProjects();
            selectProject(projectId);
            expandFolder(folderContextMenu.folder.id);
          }
        }
      },
    },
    {
      label: '新建子文件夹',
      icon: Icons.Folder,
      onClick: handleCreateSubfolder,
    },
    {
      label: '重命名',
      icon: Icons.Edit,
      onClick: handleFolderRename,
    },
    {
      label: '删除',
      icon: Icons.Trash,
      danger: true,
      onClick: handleFolderDelete,
    },
  ];

  const projectMenuItems: ContextMenuItem[] = [
    {
      label: '重命名',
      icon: Icons.Edit,
      onClick: handleProjectRename,
    },
    {
      label: '删除',
      icon: Icons.Trash,
      danger: true,
      onClick: handleProjectDelete,
    },
  ];

  const rootFolders = sortByName(folders.filter((f) => f.parentId === null));
  const rootProjects = sortByName(
    projects.filter((p) => p.folderId === null || p.folderId === 'root')
  );

  const handleItemContextMenu = useCallback(
    (e: React.MouseEvent, item: Folder | Project) => {
      if ('parentId' in item) {
        handleFolderContextMenu(e, item);
      } else {
        handleProjectContextMenu(e, item);
      }
    },
    [handleFolderContextMenu, handleProjectContextMenu]
  );

  return (
    <div className="flex flex-col h-full">
      {rootFolders.length === 0 && rootProjects.length === 0 ? (
        <div className="p-4 text-sm text-surface-onVariant text-center opacity-70">
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
              onContextMenu={handleItemContextMenu}
              onToggle={handleToggle}
              expanded={expanded}
              onProjectDrop={moveProjectToFolder}
              onCloseAllMenus={handleCloseAllMenus}
            />
          ))}
          {rootProjects.map((project) => (
            <ProjectItemConnected
              key={project.id}
              project={project}
              level={0}
              onCloseAllMenus={handleCloseAllMenus}
              onContextMenu={handleItemContextMenu}
            />
          ))}
        </div>
      )}

      <ContextMenu
        isOpen={folderContextMenu.isOpen}
        position={folderContextMenu.position}
        items={folderMenuItems}
        onClose={() => setFolderContextMenu({ ...folderContextMenu, isOpen: false })}
      />
      <ContextMenu
        isOpen={projectContextMenu.isOpen}
        position={projectContextMenu.position}
        items={projectMenuItems}
        onClose={() => setProjectContextMenu({ ...projectContextMenu, isOpen: false })}
      />
    </div>
  );
};
