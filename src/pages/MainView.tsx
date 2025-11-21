import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import Sidebar from '@/components/layout/Sidebar';
import PromptEditor, { PromptEditorRef } from '@/components/editor/PromptEditor';
import EditorToolbar from '@/components/editor/EditorToolbar';
import VersionCanvas from '@/components/canvas/VersionCanvas';
import { AttachmentGallery } from '@/components/version/AttachmentGallery';
import { CompareModal } from '@/components/version/CompareModal';

import { DuplicateDialog } from '@/components/common/DuplicateDialog';
import { ResizableSplitter } from '@/components/common/ResizableSplitter';
import { VerticalResizableSplitter } from '@/components/common/VerticalResizableSplitter';
import { useUiStore } from '@/store/uiStore';
import type { Version } from '@/models/Version';

const MainView: React.FC = () => {
  const navigate = useNavigate();
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
  } = useUiStore();

  const [editorContent, setEditorContent] = useState('');
  const [versionName, setVersionName] = useState('');
  const [canSaveInPlace, setCanSaveInPlace] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // 编辑区容器的 ref，用于垂直分隔条计算
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // 编辑器的 ref，用于聚焦
  const editorRef = useRef<PromptEditorRef>(null);
  
  // 版本名称输入框的 ref，用于焦点切换
  const versionNameInputRef = useRef<HTMLInputElement>(null);

  // 重复提醒对话框状态
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateVersion, setDuplicateVersion] = useState<Version | null>(null);
  const [pendingSaveData, setPendingSaveData] = useState<{
    projectId: string;
    content: string;
    parentId: string | null;
  } | null>(null);

  

  // 处理版本树中的节点点击，考虑对比模式
  const handleVersionNodeClick = (versionId: string) => {
    if (compareMode && compareState.sourceVersionId && versionId !== compareState.sourceVersionId) {
      // 在对比模式下，点击不同版本则进行对比
      // 不改变当前选中的版本，保持对比前的状态
      useVersionStore.getState().setCompareTarget(versionId);
    } else {
      // 非对比模式或点击同一版本，则正常切换版本
      setCurrentVersion(versionId);
    }
  };

  // 加载项目的版本
  useEffect(() => {
    if (currentProjectId) {
      // 切换项目时，先清空当前版本ID
      setCurrentVersion(null);
      loadVersions(currentProjectId);
      
      // 聚焦到编辑器
      setTimeout(() => {
        editorRef.current?.focus();
      }, 200); // 稍微延迟一点时间，确保版本加载完成
    }
  }, [currentProjectId, loadVersions, setCurrentVersion]);

  // 更新编辑器内容和附件，自动选择最近更新的版本
  useEffect(() => {
    if (currentProjectId && versions.length > 0) {
      // 如果没有选中版本，或当前选中的版本不属于当前项目，自动选择最近更新的版本
      const currentVersion = currentVersionId ? versions.find(v => v.id === currentVersionId) : null;
      if (!currentVersionId || !currentVersion || currentVersion.projectId !== currentProjectId) {
        const projectVersions = versions.filter(v => v.projectId === currentProjectId);
        // 按updatedAt降序排序，获取最近更新的版本
        const sortedVersions = [...projectVersions].sort((a, b) => b.updatedAt - a.updatedAt);
        if (sortedVersions.length > 0) {
          setCurrentVersion(sortedVersions[0].id);
        }
      }
    }
  }, [currentProjectId, versions, currentVersionId, setCurrentVersion]);

  // 加载当前版本内容
  useEffect(() => {
    if (currentVersionId && currentProjectId) {
      const version = versions.find((v) => v.id === currentVersionId);
      if (version) {
        setEditorContent(version.content);
        setVersionName(version.name || ''); // 加载版本名称
        
        // User Story 4: 所有版本都可以原地保存
        setCanSaveInPlace(true);

        // 加载附件
        loadAttachments(currentVersionId);
        
        // 聚焦到编辑器
        setTimeout(() => {
          editorRef.current?.focus();
        }, 100);
      }
    } else {
      setEditorContent('');
      setVersionName('');
      setAttachments([]);
      setCanSaveInPlace(false);
      
      // 聚焦到编辑器
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
      console.error('加载附件失败:', error);
    }
  };

  const handleSave = async () => {
    if (!currentProjectId) {
      alert('请先选择或创建项目');
      return;
    }

    try {
      const versionId = await createVersion(
        currentProjectId,
        editorContent,
        currentVersionId,
        true, // 跳过重复检测
        versionName
      );
      setCurrentVersion(versionId);
      await loadVersions(currentProjectId);
    } catch (error) {
      alert(`保存失败: ${error}`);
    }
  };

  const handleConfirmDuplicateCreate = async () => {
    // 此函数已不再使用，因为移除了重复检测功能
    // 保留以防万一
    if (!pendingSaveData) return;

    try {
      // 强制创建(跳过重复检测)
      const versionId = await createVersion(
        pendingSaveData.projectId,
        pendingSaveData.content,
        pendingSaveData.parentId,
        true, // 跳过重复检测
        versionName
      );
      setCurrentVersion(versionId);
      await loadVersions(pendingSaveData.projectId);
      
      // 清理状态
      setShowDuplicateDialog(false);
      setDuplicateVersion(null);
      setPendingSaveData(null);
    } catch (error) {
      alert(`保存失败: ${error}`);
    }
  };

  const handleCancelDuplicateCreate = () => {
    setShowDuplicateDialog(false);
    setDuplicateVersion(null);
    setPendingSaveData(null);
  };

  const handleSaveInPlace = async () => {
    if (!currentVersionId) {
      alert('请先创建或选择一个版本');
      return;
    }

    // User Story 4: 允许所有版本原地保存，不需要任何提示
    try {
      await updateVersionInPlace(currentVersionId, editorContent, versionName);
      await loadVersions(currentProjectId!);
    } catch (error) {
      alert(`保存失败: ${error}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* 顶部标题栏 */}
      <header className="bg-primary text-onPrimary px-6 py-1 shadow-m3-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-full hover:bg-onPrimary/20 transition-colors"
          aria-label="设置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 中央编辑区 */}
        <div 
          className="flex flex-col"
          style={{ width: `${layoutPreference.canvasPanelWidthRatio * 100}%` }}
        >
          <EditorToolbar
            onSave={handleSave}
            onSaveInPlace={handleSaveInPlace}
            canSaveInPlace={canSaveInPlace}
            hasProject={!!currentProjectId}
          />

          {/* 版本名称输入框 */}
          {currentProjectId && currentVersionId && (
            <div className="px-4 py-2 bg-surface-variant border-b border-surface-onVariant/20">
              <div className="flex items-center gap-2">
                <label htmlFor="version-name" className="text-sm font-medium text-surface-onVariant">
                  版本名称:
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
                  placeholder="(可选) 为版本添加名称"
                  className="flex-1 px-3 py-1.5 text-sm bg-surface border border-surface-onVariant/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden" ref={editorContainerRef}>
            {currentProjectId ? (
              <>
                <div 
                  className="overflow-hidden"
                  style={{ height: `${layoutPreference.editorHeightRatio * 100}%` }}
                >
                  <PromptEditor
                    ref={editorRef}
                    value={editorContent}
                    onChange={setEditorContent}
                    onSave={handleSave}
                    onSaveInPlace={handleSaveInPlace}
                    onFocusVersionName={() => versionNameInputRef.current?.focus()}
                  />
                </div>
                
                {/* 垂直分隔条 */}
                {currentVersionId && (
                  <VerticalResizableSplitter
                    ratio={layoutPreference.editorHeightRatio}
                    onRatioChange={setEditorHeightRatio}
                    onDragStart={startDragging}
                    onDragEnd={stopDragging}
                    minRatio={0.3}
                    maxRatio={0.9}
                    containerRef={editorContainerRef}
                  />
                )}
                
                {/* 附件区域 */}
                {currentVersionId && (
                  <div 
                    className="p-4 overflow-y-auto bg-surface-container-low"
                    style={{ height: `${(1 - layoutPreference.editorHeightRatio) * 100}%` }}
                  >
                    <h3 className="text-sm font-semibold mb-3">📎 附件</h3>
                    <AttachmentGallery
                      versionId={currentVersionId}
                      attachments={attachments}
                      onAttachmentsChange={() => loadAttachments(currentVersionId)}
                      readonly={false}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-onVariant">
                <div className="text-center">
                  <p className="text-xl mb-2">👈 请先选择或创建项目</p>
                  <p className="text-sm">点击左侧"创建项目"按钮开始</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 可拖动分隔符 */}
        <ResizableSplitter
          ratio={layoutPreference.canvasPanelWidthRatio}
          onRatioChange={setCanvasRatio}
          onDragStart={startDragging}
          onDragEnd={stopDragging}
          minRatio={0.2}
          maxRatio={0.8}
        />

        {/* 右侧画布区 - 版本树可视化 */}
        <div 
          className="border-l border-surface-onVariant/20 overflow-hidden"
          style={{ width: `${(1 - layoutPreference.canvasPanelWidthRatio) * 100}%` }}
        >
          <VersionCanvas
            projectId={currentProjectId}
            onNodeClick={handleVersionNodeClick}
            hasProject={!!currentProjectId}
          />
        </div>
      </div>

      {/* 版本对比模态框 */}
      <CompareModal
        isOpen={compareState.isOpen}
        sourceVersion={versions.find(v => v.id === compareState.sourceVersionId) || null}
        targetVersion={versions.find(v => v.id === compareState.targetVersionId) || null}
        onClose={() => useVersionStore.getState().closeCompare()}
      />

      {/* 重复内容提醒对话框 */}
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
