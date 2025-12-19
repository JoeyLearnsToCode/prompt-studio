import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import { Sidebar, SidebarToggle } from '@/components/layout/Sidebar';
import PromptEditor, { PromptEditorRef } from '@/components/editor/PromptEditor';
import { useUiStore } from '@/store/uiStore';
import { useTranslation } from '@/i18n/I18nContext';
import type { Version } from '@/models/Version';
import { MinimalButton } from '@/components/common/MinimalButton';
import VersionCanvas from '@/components/canvas/VersionCanvas';
import { AttachmentGallery } from '@/components/version/AttachmentGallery';
import { CompareModal } from '@/components/version/CompareModal';

import { DuplicateDialog } from '@/components/common/DuplicateDialog';
import { ResizableSplitter } from '@/components/common/ResizableSplitter';
import { VerticalResizableSplitter } from '@/components/common/VerticalResizableSplitter';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Icons } from '@/components/icons/Icons';

const MainView: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { currentProjectId } = useProjectStore();
  const {
    versions,
    currentVersionId,
    loadVersions,
    createVersion,
    updateVersionInPlace,
    setCurrentVersion,
    compareState,
    compareMode,
  } = useVersionStore();

  // 布局偏好设置
  const {
    layoutPreference,
    setCanvasRatio,
    setEditorHeightRatio,
    startDragging,
    stopDragging,
    sidebarCollapsed,
    sidebarTemporarilyExpanded,
    setTemporarilyExpanded,
  } = useUiStore();

  const [editorContent, setEditorContent] = useState('');
  const [versionName, setVersionName] = useState('');
  const [canSaveInPlace, setCanSaveInPlace] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const mainSplitContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PromptEditorRef>(null);
  const versionNameInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateVersion, setDuplicateVersion] = useState<Version | null>(null);
  const [pendingSaveData, setPendingSaveData] = useState<{
    projectId: string;
    content: string;
    parentId: string | null;
  } | null>(null);

  const [isDraggingAttachments, setIsDraggingAttachments] = useState(false);

  // 面板折叠状态
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(
    () => window.innerWidth < 1024
  );
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(
    () => window.innerWidth < 1024
  );

  // 处理版本树中的节点点击
  const handleVersionNodeClick = (versionId: string) => {
    if (compareMode && compareState.sourceVersionId && versionId !== compareState.sourceVersionId) {
      useVersionStore.getState().setCompareTarget(versionId);
    } else {
      setCurrentVersion(versionId);
    }
  };

  useEffect(() => {
    if (currentProjectId) {
      setCurrentVersion(null);
      loadVersions(currentProjectId);
      setTimeout(() => {
        editorRef.current?.focus();
      }, 200);
    }
  }, [currentProjectId, loadVersions, setCurrentVersion]);

  useEffect(() => {
    if (!currentProjectId && !sidebarTemporarilyExpanded) {
      if (sidebarCollapsed) {
        setTemporarilyExpanded(true);
      }
    }
  }, [currentProjectId, sidebarCollapsed, sidebarTemporarilyExpanded, setTemporarilyExpanded]);

  useEffect(() => {
    if (currentProjectId && sidebarTemporarilyExpanded) {
      setTemporarilyExpanded(false);
    }
  }, [currentProjectId, sidebarTemporarilyExpanded, setTemporarilyExpanded]);

  useEffect(() => {
    if (currentProjectId && versions.length > 0) {
      const currentVersion = currentVersionId
        ? versions.find((v) => v.id === currentVersionId)
        : null;
      if (!currentVersionId || !currentVersion || currentVersion.projectId !== currentProjectId) {
        const projectVersions = versions.filter((v) => v.projectId === currentProjectId);
        const sortedVersions = [...projectVersions].sort((a, b) => b.updatedAt - a.updatedAt);
        if (sortedVersions.length > 0) {
          setCurrentVersion(sortedVersions[0].id);
        }
      }
    }
  }, [currentProjectId, versions, currentVersionId, setCurrentVersion]);

  useEffect(() => {
    if (currentVersionId && currentProjectId) {
      const version = versions.find((v) => v.id === currentVersionId);
      if (version) {
        setEditorContent(version.content);
        setVersionName(version.name || '');
        setCanSaveInPlace(true);
        loadAttachments(currentVersionId);
        setTimeout(() => {
          editorRef.current?.focus();
        }, 100);
      }
    } else {
      setEditorContent('');
      setVersionName('');
      setAttachments([]);
      setCanSaveInPlace(false);
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  }, [currentVersionId, versions, currentProjectId]);

  const loadAttachments = async (versionId: string) => {
    try {
      const att = await attachmentManager.getAttachmentsByVersion(versionId);
      setAttachments(att);
    } catch (error) {
      console.error(t('pages.mainView.errors.loadAttachmentsFailed'), error);
    }
  };

  const handleSave = async () => {
    if (!currentProjectId) {
      alert(t('pages.mainView.errors.selectProjectFirst'));
      return;
    }
    try {
      const versionId = await createVersion(
        currentProjectId,
        editorContent,
        currentVersionId,
        true,
        versionName
      );
      setCurrentVersion(versionId);
      await loadVersions(currentProjectId);
    } catch (error) {
      alert(`${t('pages.mainView.errors.saveFailed')}: ${error}`);
    }
  };

  const handleConfirmDuplicateCreate = async () => {
    if (!pendingSaveData) return;
    try {
      const versionId = await createVersion(
        pendingSaveData.projectId,
        pendingSaveData.content,
        pendingSaveData.parentId,
        true,
        versionName
      );
      setCurrentVersion(versionId);
      await loadVersions(pendingSaveData.projectId);
      setShowDuplicateDialog(false);
      setDuplicateVersion(null);
      setPendingSaveData(null);
    } catch (error) {
      alert(`${t('pages.mainView.errors.saveFailed')}: ${error}`);
    }
  };

  const handleCancelDuplicateCreate = () => {
    setShowDuplicateDialog(false);
    setDuplicateVersion(null);
    setPendingSaveData(null);
  };

  const handleSaveInPlace = async () => {
    if (!currentVersionId) {
      alert(t('pages.mainView.errors.selectVersionFirst'));
      return;
    }
    try {
      await updateVersionInPlace(currentVersionId, editorContent, versionName);
      await loadVersions(currentProjectId!);
    } catch (error) {
      alert(`${t('pages.mainView.errors.saveFailed')}: ${error}`);
    }
  };

  const handleUploadFiles = async (files: FileList) => {
    setIsDraggingAttachments(false);
    if (!currentVersionId) return;

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        alert(`${t('components.attachmentGallery.unsupportedType')}: ${file.type}`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`${t('components.attachmentGallery.fileTooLarge')}: ${file.name}`);
        continue;
      }
      try {
        await attachmentManager.uploadAttachment(currentVersionId, file);
      } catch (error) {
        console.error('上传附件失败:', error);
        alert(`${t('components.attachmentGallery.uploadFailed')}: ${file.name}`);
      }
    }
    loadAttachments(currentVersionId);
  };

  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAttachments(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAttachmentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAttachments(true);
  };

  const handleAttachmentDragLeave = () => {
    setIsDraggingAttachments(false);
  };

  return (
    <div className="h-dynamic-screen flex flex-col bg-background dark:bg-background-dark text-surface-onSurface transition-colors duration-200">
      {/* 顶部标题栏 - Updated Style */}
      <header className="h-12 bg-primary text-white px-6 shrink-0 shadow-md z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icon-192.svg" className="h-8 w-8" alt="logo" />
          <h1 className="text-lg font-bold tracking-wide hidden sm:inline">Prompt Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          <a
            href="https://github.com/JoeyLearnsToCode/prompt-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg transition-colors duration-200 font-medium h-9 w-9 bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="GitHub Repository"
          >
            <Icons.GitHub className="h-5 w-5" />
          </a>

          <MinimalButton
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="h-9 w-9 !text-white/90 !hover:text-white hover:bg-white/10"
            aria-label={t('common.settings')}
          >
            <Icons.Settings className="h-5 w-5" />
          </MinimalButton>
        </div>
      </header>

      {/* 主要内容区域 - Updated Layout with Gap and Padding */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 中央和右侧区域包装器 */}
        <div className="flex-1 flex overflow-hidden w-0 min-w-0" ref={mainSplitContainerRef}>
          {/* 中央编辑区 */}
          <div
            className="flex flex-col gap-2"
            style={{
              width: isRightPanelCollapsed
                ? '100%'
                : `${layoutPreference.canvasPanelWidthRatio * 100}%`,
            }}
          >
            {/* Version Name Toolbar - Card Style */}
            {currentProjectId && currentVersionId && (
              <div
                ref={toolbarRef}
                className="bg-surface dark:bg-surface-dark rounded-xl px-3 shadow-card border border-border dark:border-border-dark flex items-center justify-between flex-wrap gap-2 min-h-[4rem] shrink-0 z-10 @container"
              >
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {sidebarCollapsed && !sidebarTemporarilyExpanded && (
                    <div className="flex-shrink-0">
                      <SidebarToggle className="text-sm" />
                    </div>
                  )}
                  <label
                    htmlFor="version-name"
                    className="text-sm font-medium text-surface-onVariant whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                    style={{ flexShrink: 3 }}
                    title={t('pages.mainView.versionName')}
                  >
                    <span className="hidden @sm:inline">
                      {t('pages.mainView.versionName') + ':'}
                    </span>
                  </label>
                  <input
                    ref={versionNameInputRef}
                    id="version-name"
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    onKeyDown={(e) => {
                      // 处理保存快捷键
                      if (e.ctrlKey && e.key === 'Enter') {
                        if (e.shiftKey) {
                          // Ctrl+Shift+Enter: 保存新版本
                          handleSave();
                        } else {
                          // Ctrl+Enter: 原地保存
                          handleSaveInPlace();
                        }
                      } else if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        if (e.shiftKey) {
                          // Ctrl+Shift+S: 保存新版本
                          handleSave();
                        } else {
                          // Ctrl+S: 原地保存
                          handleSaveInPlace();
                        }
                      } else if (e.key === 'Tab' && !e.shiftKey) {
                        // Tab: 切换到编辑器
                        e.preventDefault();
                        editorRef.current?.focus();
                      }
                    }}
                    placeholder={t('pages.mainView.versionNamePlaceholder')}
                    className="flex-1 px-2 py-2 text-sm bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-md px-3 py-1.5 text-sm text-surface-onSurface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow min-w-[10px]"
                    style={{ flexShrink: 1 }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <MinimalButton
                    variant="default"
                    onClick={handleSaveInPlace}
                    disabled={!canSaveInPlace || !currentProjectId}
                    title={`${t('components.toolbar.saveInPlace')} (Ctrl+S / Ctrl+Enter)`}
                    className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-sm"
                  >
                    <span className="inline @xs:hidden">
                      <Icons.Save />
                    </span>
                    <span className="hidden @xs:inline">{t('components.toolbar.saveInPlace')}</span>
                  </MinimalButton>
                  <MinimalButton
                    variant="default"
                    onClick={handleSave}
                    disabled={!currentProjectId}
                    title={`${t('components.toolbar.saveNew')} (Ctrl+Shift+S / Ctrl+Shift+Enter)`}
                    className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-sm"
                  >
                    <span className="inline @xs:hidden">
                      <Icons.SaveNew />
                    </span>
                    <span className="hidden @xs:inline">{t('components.toolbar.saveNew')}</span>
                  </MinimalButton>
                </div>
              </div>
            )}

            {/* Editor & Attachment Container - Vertical Layout */}
            <div className="flex-1 flex flex-col overflow-hidden" ref={editorContainerRef}>
              {currentProjectId ? (
                <>
                  <div
                    className="overflow-hidden bg-surface dark:bg-surface-dark rounded-xl shadow-card border border-border dark:border-border-dark flex flex-col relative"
                    style={{
                      height: isBottomPanelCollapsed
                        ? '100%'
                        : `${layoutPreference.editorHeightRatio * 100}%`,
                    }}
                  >
                    {/* Line numbers fake gutter handled by Monaco, but we ensure wrapper is clean */}
                    <div className="flex-1 overflow-hidden p-0">
                      <PromptEditor
                        ref={editorRef}
                        value={editorContent}
                        onChange={setEditorContent}
                        onSave={handleSave}
                        onSaveInPlace={handleSaveInPlace}
                        onFocusVersionName={() => versionNameInputRef.current?.focus()}
                      />
                    </div>
                  </div>

                  {/* Vertical Splitter */}
                  {currentVersionId && (
                    <VerticalResizableSplitter
                      ratio={layoutPreference.editorHeightRatio}
                      onRatioChange={setEditorHeightRatio}
                      onDragStart={startDragging}
                      onDragEnd={stopDragging}
                      minRatio={0.3}
                      maxRatio={0.9}
                      containerRef={editorContainerRef}
                      isCollapsed={isBottomPanelCollapsed}
                      onCollapse={() => setIsBottomPanelCollapsed(!isBottomPanelCollapsed)}
                    />
                  )}

                  {/* Attachments Area */}
                  {currentVersionId && (
                    <div
                      className={`
                        bg-surface dark:bg-surface-dark rounded-xl shadow-card border border-border dark:border-border-dark p-4 flex flex-col
                        ${isDraggingAttachments ? 'ring-2 ring-primary bg-primary/5' : ''}
                      `}
                      style={{
                        height: isBottomPanelCollapsed
                          ? '0px'
                          : `${(1 - layoutPreference.editorHeightRatio) * 100}%`,
                        display: isBottomPanelCollapsed ? 'none' : 'flex',
                      }}
                      onDrop={handleAttachmentDrop}
                      onDragOver={handleAttachmentDragOver}
                      onDragLeave={handleAttachmentDragLeave}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icons.Attachment size={16} className="text-surface-onVariant" />
                        <h3 className="text-xs tracking-wider font-bold text-surface-onVariant uppercase">
                          {t('pages.mainView.attachments')}
                        </h3>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <AttachmentGallery
                          versionId={currentVersionId}
                          attachments={attachments}
                          onAttachmentsChange={() => loadAttachments(currentVersionId)}
                          readonly={false}
                          onUpload={handleUploadFiles}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-surface-onVariant bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
                  <div className="text-center">
                    <p className="text-xl mb-2">👈 {t('pages.mainView.noProject')}</p>
                    <p className="text-sm">{t('pages.mainView.noProjectHint')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Splitter */}
          <ResizableSplitter
            ratio={layoutPreference.canvasPanelWidthRatio}
            onRatioChange={setCanvasRatio}
            onDragStart={startDragging}
            onDragEnd={stopDragging}
            minRatio={0.2}
            maxRatio={0.8}
            containerRef={mainSplitContainerRef}
            isCollapsed={isRightPanelCollapsed}
            onCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          />

          {/* Right Canvas Area - Card Style */}
          <div
            className="overflow-hidden bg-surface dark:bg-surface-dark rounded-xl shadow-card border border-border dark:border-border-dark flex flex-col relative"
            style={{
              width: isRightPanelCollapsed
                ? '0px'
                : `${(1 - layoutPreference.canvasPanelWidthRatio) * 100}%`,
              display: isRightPanelCollapsed ? 'none' : 'flex',
            }}
          >
            <VersionCanvas
              projectId={currentProjectId}
              onNodeClick={handleVersionNodeClick}
              hasProject={!!currentProjectId}
              isCollapsed={isRightPanelCollapsed}
            />
          </div>
        </div>
      </div>

      <CompareModal
        isOpen={compareState.isOpen}
        sourceVersion={versions.find((v) => v.id === compareState.sourceVersionId) || null}
        targetVersion={versions.find((v) => v.id === compareState.targetVersionId) || null}
        onClose={() => useVersionStore.getState().closeCompare()}
      />

      <DuplicateDialog
        isOpen={showDuplicateDialog}
        duplicateVersion={duplicateVersion}
        onConfirm={handleConfirmDuplicateCreate}
        onCancel={handleCancelDuplicateCreate}
      />
    </div>
  );
};

export default MainView;
