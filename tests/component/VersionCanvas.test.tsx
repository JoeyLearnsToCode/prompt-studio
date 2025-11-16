import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VersionCanvas from '@/components/canvas/VersionCanvas';

describe('VersionCanvas 组件', () => {
  it('应该渲染画布容器', () => {
    render(<VersionCanvas projectId="test-project" />);
    expect(screen.getByTestId('version-canvas')).toBeInTheDocument();
  });

  it('应该处理空项目', () => {
    render(<VersionCanvas projectId={null} />);
    expect(screen.getByText(/请先选择项目/i)).toBeInTheDocument();
  });
});
