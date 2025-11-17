import React, { useEffect, useRef, useState } from 'react';
import { useVersionStore } from '@/store/versionStore';
import { CanvasRenderer } from '@/services/canvasRenderer';
import { CanvasInteraction } from '@/services/canvasInteraction';
import { Button } from '@/components/common/Button';
import { SearchBar } from '@/components/canvas/SearchBar';
import { useVersionSearch } from '@/hooks/useVersionSearch';

interface VersionCanvasProps {
  projectId: string | null;
  onNodeClick?: (versionId: string) => void;
}

const VersionCanvas: React.FC<VersionCanvasProps> = ({
  projectId,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  const { versions, currentVersionId, deleteVersion, createVersion } = useVersionStore();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // 版本搜索
  const {
    query,
    currentIndex,
    total,
    isActive: searchActive,
    handleQueryChange,
    handleNext,
    handlePrev,
    handleClear,
    getCurrentMatchId,
  } = useVersionSearch();

  // 初始化 Canvas - 在canvas元素实际渲染后执行
  useEffect(() => {
    if (!canvasRef.current || !projectId) return;

    const renderer = new CanvasRenderer(canvasRef.current);
    
    // 包装 onNodeClick 以更新选中状态
    const handleNodeClick = (versionId: string) => {
      setSelectedVersionId(versionId);
      // 直接调用最新的onNodeClick,通过ref获取
      if (onNodeClickRef.current) {
        onNodeClickRef.current(versionId);
      }
    };
    
    const interaction = new CanvasInteraction(
      renderer,
      canvasRef.current,
      handleNodeClick
    );

    rendererRef.current = renderer;
    interactionRef.current = interaction;

    // 窗口大小变化时重新调整
    const handleResize = () => {
      renderer.resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      interaction.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [projectId]); // 依赖projectId,在项目选中后初始化

  // 使用ref保存最新的onNodeClick
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // 同步选中状态到 renderer
  useEffect(() => {
    if (rendererRef.current && currentVersionId) {
      rendererRef.current.selectNode(currentVersionId);
      setSelectedVersionId(currentVersionId);
    }
  }, [currentVersionId]);

  // 渲染版本树
  useEffect(() => {
    if (!rendererRef.current || !projectId) return;

    const projectVersions = versions.filter((v) => v.projectId === projectId);
    rendererRef.current.renderTree(projectVersions);
  }, [versions, projectId]);

  // 搜索结果高亮和自动滚动
  useEffect(() => {
    if (!rendererRef.current || !searchActive) return;

    const currentMatchId = getCurrentMatchId();
    if (currentMatchId) {
      // 选中当前匹配的版本
      rendererRef.current.selectNode(currentMatchId);
      // 可以添加高亮效果到渲染器(需要扩展CanvasRenderer)
    }
  }, [searchActive, currentIndex, getCurrentMatchId]);

  const handleResetView = () => {
    rendererRef.current?.resetView();
  };

  const handleZoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    rendererRef.current.zoom(0.2, centerX, centerY);
  };

  const handleZoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    rendererRef.current.zoom(-0.2, centerX, centerY);
  };

  const handleDeleteVersion = async () => {
    if (!selectedVersionId) return;
    
    if (confirm('确定删除此版本吗？子版本将连接到父版本。')) {
      await deleteVersion(selectedVersionId);
      setSelectedVersionId(null);
    }
  };

  const handleCreateChild = async () => {
    if (!selectedVersionId || !projectId) return;
    
    const parentVersion = versions.find((v) => v.id === selectedVersionId);
    if (!parentVersion) return;
    
    // 创建子版本，复制父版本内容
    const newVersionId = await createVersion(
      projectId,
      parentVersion.content,
      selectedVersionId
    );
    
    if (onNodeClick) {
      onNodeClick(newVersionId);
    }
  };

  if (!projectId) {
    return (
      <div
        className="h-full flex items-center justify-center bg-surface-variant text-surface-onVariant"
        data-testid="version-canvas"
      >
        <p>请先选择项目</p>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-surface-variant" data-testid="version-canvas">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block', position: 'relative', zIndex: 1 }}
      />

      {/* 搜索栏 */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
        <SearchBar
          query={query}
          currentIndex={currentIndex}
          total={total}
          onQueryChange={handleQueryChange}
          onNext={handleNext}
          onPrev={handlePrev}
          onClear={handleClear}
          placeholder="搜索版本内容..."
        />
      </div>

      {/* 版本操作按钮 */}
      {selectedVersionId && (
        <div className="absolute top-20 left-4 flex gap-2 z-10">
          <Button
            variant="filled"
            size="small"
            onClick={handleCreateChild}
            title="创建子版本（复制内容）"
          >
            ➕ 创建子版本
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDeleteVersion}
            title="删除此版本"
          >
            🗑️ 删除
          </Button>
        </div>
      )}

      {/* 画布控制按钮 - 移至右下角 (US6) */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <Button
          variant="filled"
          size="small"
          onClick={handleZoomIn}
          title="放大"
          aria-label="放大画布"
        >
          🔍+
        </Button>
        <Button
          variant="filled"
          size="small"
          onClick={handleZoomOut}
          title="缩小"
          aria-label="缩小画布"
        >
          🔍-
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleResetView}
          title="重置视图"
          aria-label="重置画布视图"
        >
          ↺
        </Button>
      </div>
    </div>
  );
};

export default VersionCanvas;
