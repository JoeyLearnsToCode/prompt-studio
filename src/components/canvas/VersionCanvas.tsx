import React, { useEffect, useRef } from 'react';
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

  const { versions } = useVersionStore();

  // 初始化 Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasRenderer(canvasRef.current);
    const interaction = new CanvasInteraction(
      renderer,
      canvasRef.current,
      onNodeClick
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
  }, [onNodeClick]);

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
        style={{ display: 'block' }}
      />

      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex gap-2">
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
      <div className="absolute bottom-4 left-4 bg-surface/90 px-3 py-2 rounded-m3-small text-sm text-surface-onVariant shadow-m3-1">
        <p>🖱️ 拖拽画布平移 | 🔍 滚轮缩放</p>
        <p>💡 点击节点查看版本内容</p>
      </div>
    </div>
  );
};

export default VersionCanvas;
