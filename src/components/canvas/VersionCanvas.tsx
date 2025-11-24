import React, { useEffect, useRef, useState } from 'react';
import { useVersionStore } from '@/store/versionStore';
import { CanvasRenderer } from '@/services/canvasRenderer';
import { CanvasInteraction } from '@/services/canvasInteraction';
import { Button } from '@/components/common/Button';
import { SearchBar } from '@/components/canvas/SearchBar';
import { useVersionSearch } from '@/hooks/useVersionSearch';
import { useTranslation } from '@/i18n/I18nContext';

interface VersionCanvasProps {
  projectId: string | null;
  onNodeClick?: (versionId: string) => void;
  hasProject?: boolean;
}

const VersionCanvas: React.FC<VersionCanvasProps> = ({
  projectId,
  onNodeClick,
  hasProject = false,
}) => {
  const t = useTranslation();
  
  // 对比模式下的处理函数
  const handleCompare = () => {
    if (compareMode) {
      toggleCompareMode(); // 退出对比模式
    } else if (currentVersionId) {
      toggleCompareMode(currentVersionId); // 进入对比模式，使用当前版本作为源版本
    }
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  const { versions, currentVersionId, deleteVersion, compareMode, toggleCompareMode, compareState } = useVersionStore();
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
      // 如果在对比模式，且点击的不是源版本，则不改变选中状态
      if (compareMode && compareState.sourceVersionId && versionId !== compareState.sourceVersionId) {
        // 在对比模式下点击不同版本，只触发对比，不改变选中状态
        if (onNodeClickRef.current) {
          onNodeClickRef.current(versionId);
        }
        return;
      }
      
      // 非对比模式或对比模式下点击源版本，更新选中状态
      setSelectedVersionId(versionId);
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

    // 使用 ResizeObserver 监听 canvas 容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      renderer.resizeCanvas();
    });
    
    // 监听 canvas 的父容器
    if (canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      interaction.destroy();
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('focus', handleCanvasFocus);
      canvasRef.current?.removeEventListener('blur', handleCanvasBlur);
      resizeObserver.disconnect();
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

  // 确保在对比模式切换时，版本树的选中状态正确
  useEffect(() => {
    if (compareMode && compareState.sourceVersionId) {
      // 进入对比模式时，确保版本树选中源版本（当前版本）
      setSelectedVersionId(compareState.sourceVersionId);
      if (rendererRef.current) {
        rendererRef.current.selectNode(compareState.sourceVersionId);
      }
    } else if (!compareMode && currentVersionId) {
      // 退出对比模式时，确保版本树选中当前版本
      setSelectedVersionId(currentVersionId);
      if (rendererRef.current) {
        rendererRef.current.selectNode(currentVersionId);
      }
    }
  }, [compareMode, currentVersionId, compareState.sourceVersionId]);

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
      // 将匹配的版本定位到canvas中间，复用现有的定位逻辑
      rendererRef.current.centerNodeAtPosition(currentMatchId, 0.5, 0.5);
    }
  }, [searchActive, currentIndex, getCurrentMatchId]);

  const handleResetView = () => {
    if (!rendererRef.current) return;
    
    // 重置缩放和平移
    rendererRef.current.resetView();
    
    // 如果有当前版本，定位到canvas正中间
    if (currentVersionId) {
      // 使用 setTimeout 确保 resetView 完成后再定位
      setTimeout(() => {
        if (rendererRef.current) {
          rendererRef.current.centerNodeAtPosition(currentVersionId, 0.5, 0.5);
        }
      }, 50);
    }
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
    
    if (confirm(t('components.canvas.confirmDelete'))) {
      try {
        await deleteVersion(selectedVersionId);
        setSelectedVersionId(null);
      } catch (error) {
        alert(`${t('components.canvas.deleteFailed')}: ${error}`);
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
        <p>{t('components.canvas.selectProject')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-variant" data-testid="version-canvas">
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
            />
          </div>
        )}

        {/* 版本操作按钮 */}
        {selectedVersionId && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={handleCompare}
              disabled={!hasProject || !currentVersionId}
              title={compareMode ? t('components.canvas.exitCompare') : t('components.canvas.enterCompare')}
              className={compareMode ? "bg-primary-container border-primary" : ""}
            >
              {compareMode ? t('components.canvas.exitCompare') : t('components.canvas.compare')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeleteVersion}
              title={t('components.canvas.deleteVersion')}
            >
              🗑️ {t('common.delete')}
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
            variant="canvasControl"
            size="small"
            onClick={handleZoomIn}
            title={t('components.canvas.zoomIn')}
            aria-label={t('components.canvas.zoomIn')}
          >
            🔍+
          </Button>
          <Button
            variant="canvasControl"
            size="small"
            onClick={handleZoomOut}
            title={t('components.canvas.zoomOut')}
            aria-label={t('components.canvas.zoomOut')}
          >
            🔍-
          </Button>
          <Button
            variant="canvasControl"
            size="small"
            onClick={handleResetView}
            title={t('components.canvas.resetView')}
            aria-label={t('components.canvas.resetView')}
          >
            ↺
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VersionCanvas;
