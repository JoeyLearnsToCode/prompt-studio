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
  const [searchVisible, setSearchVisible] = useState(false); // 控制搜索框的显示状态
  const searchInputRef = useRef<HTMLInputElement>(null); // 搜索框引用，用于聚焦

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
    isVersionMatched,
    isCurrentMatch,
  } = useVersionSearch();

  // Canvas焦点状态跟踪
  const [canvasFocused, setCanvasFocused] = useState(false);

  // 键盘事件监听 - 捕获Ctrl+F显示搜索框并聚焦输入框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了Ctrl+F (or Cmd+F on Mac) 且canvas有焦点
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && canvasFocused) {
        e.preventDefault();
        setSearchVisible(true);
      }
    };

    // 只在canvas有焦点或鼠标在canvas区域时监听
    if (projectId) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [projectId, canvasFocused]);

  // 当搜索框显示时，聚焦到输入框
  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      // 使用setTimeout确保DOM更新后再聚焦
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 10);
    }
  }, [searchVisible]);

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

    // Canvas获取焦点事件
    const handleCanvasFocus = () => {
      setCanvasFocused(true);
    };
    
    // Canvas失去焦点事件
    const handleCanvasBlur = () => {
      setCanvasFocused(false);
    };

    // 窗口大小变化时重新调整
    const handleResize = () => {
      renderer.resizeCanvas();
    };
    
    // 添加事件监听器
    canvasRef.current.addEventListener('focus', handleCanvasFocus);
    canvasRef.current.addEventListener('blur', handleCanvasBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      interaction.destroy();
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('focus', handleCanvasFocus);
      canvasRef.current?.removeEventListener('blur', handleCanvasBlur);
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

  // 渲染版本树并自动定位到选中的版本
  useEffect(() => {
    if (!rendererRef.current || !projectId) return;

    const projectVersions = versions.filter((v) => v.projectId === projectId);
    rendererRef.current.renderTree(projectVersions);
    
    // 如果有选中的版本，自动定位并确保该版本靠近canvas下方
    if (currentVersionId) {
      // 延迟执行确保渲染完成后再定位
      setTimeout(() => {
        if (rendererRef.current) {
          // 先选中该版本
          rendererRef.current.selectNode(currentVersionId);
          // 将该版本定位在canvas的正中间
          rendererRef.current.centerNodeAtPosition(currentVersionId, 0.5, 0.5);
        }
      }, 100); // 短暂延迟确保渲染完成
    }
  }, [versions, projectId, currentVersionId]);

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
      try {
        await deleteVersion(selectedVersionId);
        setSelectedVersionId(null);
      } catch (error) {
        alert(`删除失败: ${error}`);
      }
    }
  };

  const handleCloseSearch = () => {
    setSearchVisible(false);
    handleClear(); // 同时清空搜索内容
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
    <div className="h-full flex flex-col bg-surface-variant" data-testid="version-canvas">
      {/* 顶部控制区域 - 固定高度，不与canvas重叠 */}
      <div className="p-3 space-y-3 bg-surface-variant">
        {/* 搜索栏 - 只在searchVisible为true时显示 */}
        {searchVisible && (
          <div className="max-w-md">
            <SearchBar
              ref={searchInputRef}
              query={query}
              currentIndex={currentIndex}
              total={total}
              onQueryChange={handleQueryChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onClear={handleClear}
              onClose={handleCloseSearch}
              placeholder="搜索版本内容..."
            />
          </div>
        )}

        {/* 版本操作按钮 */}
        {selectedVersionId && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeleteVersion}
              className="[&]:text-error [&]:hover:bg-error-container [&]:hover:border-transparent"
              title="删除此版本"
            >
              🗑️ 删除
            </Button>
          </div>
        )}
      </div>

      {/* Canvas容器 - 占据剩余空间，不与上方控制区域重叠 */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
          tabIndex={0} // 使canvas可以获得焦点
        />

        {/* 画布控制按钮 - 浮动在canvas上，但位置固定在右下角 */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <Button
            variant="outlined"
            size="small"
            onClick={handleZoomIn}
            title="放大"
            aria-label="放大画布"
          >
            🔍+
          </Button>
          <Button
            variant="outlined"
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
    </div>
  );
};

export default VersionCanvas;
