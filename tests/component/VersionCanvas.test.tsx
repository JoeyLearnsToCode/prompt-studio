import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VersionCanvas from '../../src/components/canvas/VersionCanvas';

// Mock all dependencies
vi.mock('../../src/store/versionStore', () => ({
  useVersionStore: () => ({
    versions: [],
    currentVersionId: null,
    deleteVersion: vi.fn(),
    createVersion: vi.fn(),
    loadVersions: vi.fn(),
    updateVersion: vi.fn(),
    setCurrentVersion: vi.fn(),
  }),
}));

vi.mock('../../src/services/canvasRenderer', () => ({
  CanvasRenderer: vi.fn().mockImplementation(() => ({
    resizeCanvas: vi.fn(),
    renderTree: vi.fn(),
    selectNode: vi.fn(),
    resetView: vi.fn(),
    zoom: vi.fn(),
  })),
}));

vi.mock('../../src/services/canvasInteraction', () => ({
  CanvasInteraction: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

describe('VersionCanvas', () => {
  it('应该在未选择项目时显示提示信息', () => {
    render(<VersionCanvas projectId={null} />);
    
    expect(screen.getByText(/请先选择项目/)).toBeInTheDocument();
  });

  it('应该在选择项目时渲染画布容器', () => {
    render(<VersionCanvas projectId="p1" />);
    
    const canvas = screen.getByTestId('version-canvas');
    expect(canvas).toBeInTheDocument();
  });
});
