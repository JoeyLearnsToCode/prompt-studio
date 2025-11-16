import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import Sidebar from '@/components/layout/Sidebar';
import PromptEditor from '@/components/editor/PromptEditor';
import EditorToolbar from '@/components/editor/EditorToolbar';
import VersionCanvas from '@/components/canvas/VersionCanvas';

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

  const [editorContent, setEditorContent] = useState('');
  const [canSaveInPlace, setCanSaveInPlace] = useState(false);

  // 加载项目的版本
  useEffect(() => {
    if (currentProjectId) {
      loadVersions(currentProjectId);
    }
  }, [currentProjectId, loadVersions]);

  // 更新编辑器内容
  useEffect(() => {
    if (currentVersionId) {
      const version = versions.find((v) => v.id === currentVersionId);
      if (version) {
        setEditorContent(version.content);
        
        // 检查是否可以原地保存（叶子节点）
        const children = versions.filter((v) => v.parentId === currentVersionId);
        setCanSaveInPlace(children.length === 0);
      }
    }
  }, [currentVersionId, versions]);

  const handleSave = async () => {
    if (!currentProjectId) {
      alert('请先选择或创建项目');
      return;
    }

    try {
      const versionId = await createVersion(
        currentProjectId,
        editorContent,
        currentVersionId
      );
      setCurrentVersion(versionId);
      await loadVersions(currentProjectId);
    } catch (error) {
      alert(`保存失败: ${error}`);
    }
  };

  const handleSaveInPlace = async () => {
    if (!currentVersionId) {
      alert('请先创建或选择一个版本');
      return;
    }

    if (!canSaveInPlace) {
      alert('只能原地更新叶子节点');
      return;
    }

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
        <div className="flex-1 flex flex-col">
          <EditorToolbar
            onSave={handleSave}
            onSaveInPlace={handleSaveInPlace}
            canSaveInPlace={canSaveInPlace}
          />

          <div className="flex-1 p-4">
            {currentProjectId ? (
              <PromptEditor
                value={editorContent}
                onChange={setEditorContent}
                onSave={handleSave}
                onSaveInPlace={handleSaveInPlace}
              />
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

        {/* 右侧画布区 - 版本树可视化 */}
        <div className="w-[500px] border-l border-surface-onVariant/20">
          <VersionCanvas
            projectId={currentProjectId}
            onNodeClick={(versionId) => setCurrentVersion(versionId)}
          />
        </div>
      </div>
    </div>
  );
};

export default MainView;
