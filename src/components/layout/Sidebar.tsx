import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { duration, ease } from '@/styles/motion';
import { Icons } from '@/components/icons/Icons';
import { FolderTree } from './FolderTree';
import { GlobalSearchBar } from './GlobalSearchBar';
import { useTranslation } from '@/i18n/I18nContext';
import { MinimalButton } from '@/components/common/MinimalButton';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

export const Sidebar: React.FC = () => {
  const t = useTranslation();
  const { sidebarCollapsed, sidebarTemporarilyExpanded } = useUiStore();
  const { loadFolders, loadProjects, createFolder, createProject, selectProject } =
    useProjectStore();

  const [searchVisible, setSearchVisible] = useState(false);
  const [sidebarFocused, setSidebarFocused] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    currentIndex,
    total,
    isActive: searchActive,
    fuzzy: globalSearchFuzzy,
    handleQueryChange,
    handleNext,
    handlePrev,
    handleClear,
    getCurrentMatchId,
    handleToggleFuzzy,
  } = useGlobalSearch();

  const { selectProject: selectProjectAction, expandFolderPathToProject } = useProjectStore();

  useEffect(() => {
    loadFolders();
    loadProjects();
  }, [loadFolders, loadProjects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && sidebarFocused) {
        e.preventDefault();
        if (searchVisible) {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        } else {
          setSearchVisible(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarFocused, searchVisible]);

  useEffect(() => {
    if (!searchActive) return;

    const projectId = getCurrentMatchId();
    if (!projectId) return;

    selectProjectAction(projectId, { updateUrl: true });
    expandFolderPathToProject(projectId);
  }, [searchActive, currentIndex, getCurrentMatchId, selectProjectAction, expandFolderPathToProject]);

  const handleCloseSearch = () => {
    setSearchVisible(false);
    handleClear();
  };

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
      selectProject(projectId, { updateUrl: true });
    }
  };

  const isCollapsed = sidebarCollapsed && !sidebarTemporarilyExpanded;

  return (
    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.aside
          ref={sidebarRef}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '16rem', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: duration.standard, ease: ease.outExpo }}
          className="flex flex-col gap-2 shrink-0 overflow-hidden"
          tabIndex={-1}
          onFocus={() => setSidebarFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setSidebarFocused(false);
            }
          }}
        >
        {/* Sidebar Header Card */}
        <div className="bg-surface dark:bg-surface-dark rounded-xl px-4 shadow-card border border-border dark:border-border-dark flex items-center justify-between h-16 shrink-0">
          <h2 className="font-bold text-surface-onSurface dark:text-surface-onSurfaceDark">
            {t('components.sidebar.projects')}
          </h2>
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

          {/* Global Search Bar */}
          {searchVisible && (
            <div className="px-1 pb-1">
              <GlobalSearchBar
                ref={searchInputRef}
                query={query}
                currentIndex={currentIndex}
                total={total}
                onQueryChange={handleQueryChange}
                onNext={handleNext}
                onPrev={handlePrev}
                onClear={handleClear}
                onClose={handleCloseSearch}
                fuzzy={globalSearchFuzzy}
                onToggleFuzzy={handleToggleFuzzy}
              />
            </div>
          )}

          {/* Tree */}
          <div className="flex-1">
            <FolderTree />
          </div>
        </div>
        </motion.aside>
      )}
    </AnimatePresence>
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
