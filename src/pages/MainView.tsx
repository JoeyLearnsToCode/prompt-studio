import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import { attachmentManager } from '@/services/attachmentManager';
import type { Attachment } from '@/models/Attachment';
import Sidebar from '@/components/layout/Sidebar';
import PromptEditor from '@/components/editor/PromptEditor';
import EditorToolbar from '@/components/editor/EditorToolbar';
import VersionCanvas from '@/components/canvas/VersionCanvas';
import { AttachmentGallery } from '@/components/version/AttachmentGallery';
import { CompareModal } from '@/components/version/CompareModal';
import { useVersionCompare } from '@/hooks/useVersionCompare';
import { DuplicateDialog } from '@/components/common/DuplicateDialog';
import { ResizableSplitter } from '@/components/common/ResizableSplitter';
import { VerticalResizableSplitter } from '@/components/common/VerticalResizableSplitter';
import { useUiStore } from '@/store/uiStore';
import type { Version } from '@/models/Version';

const MainView: React.FC = () => {
  const { currentProjectId } = useProjectStore();
  const {
    versions,
    currentVersionId,
    loadVersions,
    createVersion,
    updateVersionInPlace,
    setCurrentVersion,
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
  const [canSaveInPlace, setCanSaveInPlace] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // 编辑区容器的 ref，用于垂直分隔条计算
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // 重复提醒对话框状态
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateVersion, setDuplicateVersion] = useState<Version | null>(null);
  const [pendingSaveData, setPendingSaveData] = useState<{
    projectId: string;
    content: string;
    parentId: string | null;
  } | null>(null);

  // 版本对比hook
  const {
    isOpen: compareModalOpen,
    sourceVersion,
    targetVersion,
    availableVersions,
    handleOpenCompare,
    handleSelectTarget,
    handleClose: closeCompare,
  } = useVersionCompare();

  const handleCompare = () => {
    if (!currentVersionId) {
      alert('请先选择一个版本');
      return;
    }
    handleOpenCompare(currentVersionId);
  };

  // 加载项目的版本
  useEffect(() => {
    if (currentProjectId) {
      loadVersions(currentProjectId);
    }
  }, [currentProjectId, loadVersions]);

  // 更新编辑器内容和附件，自动选择最近更新的版本
  useEffect(() => {
    if (currentProjectId && versions.length > 0) {
      // 如果没有选中版本，自动选择最近更新的版本
      if (!currentVersionId) {
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
    if (currentVersionId) {
      const version = versions.find((v) => v.id === currentVersionId);
      if (version) {
        setEditorContent(version.content);
        
        // User Story 4: 所有版本都可以原地保存
        setCanSaveInPlace(true);

        // 加载附件
        loadAttachments(currentVersionId);
      }
    } else {
      setEditorContent('');
      setAttachments([]);
    }
  }, [currentVersionId, versions]);

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
        false // 不跳过重复检测
      );
      setCurrentVersion(versionId);
      await loadVersions(currentProjectId);
    } catch (error) {
      // 检查是否是重复检测错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('DUPLICATE_DETECTED:')) {
        const duplicateId = errorMessage.split(':')[1];
        const duplicate = versions.find(v => v.id === duplicateId);
        
        if (duplicate) {
          setDuplicateVersion(duplicate);
          setPendingSaveData({
            projectId: currentProjectId,
            content: editorContent,
            parentId: currentVersionId,
          });
          setShowDuplicateDialog(true);
        }
      } else {
        alert(`保存失败: ${error}`);
      }
    }
  };

  const handleConfirmDuplicateCreate = async () => {
    if (!pendingSaveData) return;

    try {
      // 强制创建(跳过重复检测)
      const versionId = await createVersion(
        pendingSaveData.projectId,
        pendingSaveData.content,
        pendingSaveData.parentId,
        true // 跳过重复检测
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
      await updateVersionInPlace(currentVersionId, editorContent);
      await loadVersions(currentProjectId!);
    } catch (error) {
      alert(`保存失败: ${error}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* 顶部标题栏 */}
      <header className="bg-primary text-onPrimary px-6 py-4 shadow-m3-1">
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
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
            onCompare={handleCompare}
            canSaveInPlace={canSaveInPlace}
          />

          <div className="flex-1 flex flex-col overflow-hidden" ref={editorContainerRef}>
            {currentProjectId ? (
              <>
                <div 
                  className="overflow-hidden"
                  style={{ height: `${layoutPreference.editorHeightRatio * 100}%` }}
                >
                  <PromptEditor
                    value={editorContent}
                    onChange={setEditorContent}
                    onSave={handleSave}
                    onSaveInPlace={handleSaveInPlace}
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
          className="border-l border-surface-onVariant/20"
          style={{ width: `${(1 - layoutPreference.canvasPanelWidthRatio) * 100}%` }}
        >
          <VersionCanvas
            projectId={currentProjectId}
            onNodeClick={(versionId) => setCurrentVersion(versionId)}
          />
        </div>
      </div>

      {/* 版本对比模态框 */}
      <CompareModal
        isOpen={compareModalOpen}
        sourceVersion={sourceVersion}
        targetVersion={targetVersion}
        availableVersions={availableVersions}
        onSelectTarget={handleSelectTarget}
        onClose={closeCompare}
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
