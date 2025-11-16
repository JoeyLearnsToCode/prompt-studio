import React, { useEffect, useRef, useState } from 'react';
import { useVersionStore } from '@/store/versionStore';
import { CanvasRenderer } from '@/services/canvasRenderer';
import { CanvasInteraction } from '@/services/canvasInteraction';
import { Button } from '@/components/common/Button';

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

      {/* 版本操作按钮 - 浮现在选中版本上方 */}
      {selectedVersionId && (
        <div className="absolute top-4 left-4 flex gap-2 z-10">
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

      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="filled"
          size="small"
          onClick={handleZoomIn}
          title="放大 (Ctrl + 滚轮向上)"
        >
          🔍+
        </Button>
        <Button
          variant="filled"
          size="small"
          onClick={handleZoomOut}
          title="缩小 (Ctrl + 滚轮向下)"
        >
          🔍-
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleResetView}
          title="重置视图"
        >
          ↺ 重置
        </Button>
      </div>

      {/* 提示信息 */}
      <div className="absolute bottom-4 left-4 bg-surface/90 px-3 py-2 rounded-m3-small text-sm text-surface-onVariant shadow-m3-1 z-10">
        <p>🖱️ 拖拽画布平移 | 🔍 滚轮缩放</p>
        <p>💡 点击节点查看版本内容</p>
      </div>
    </div>
  );
};

export default VersionCanvas;
