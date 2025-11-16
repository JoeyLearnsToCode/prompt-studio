import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VersionCard } from '../../src/components/version/VersionCard';
import type { Version } from '../../src/models/Version';

describe('VersionCard', () => {
  const mockVersion: Version = {
    id: 'v1',
    projectId: 'p1',
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: '这是测试内容\n第二行文本\n第三行文本',
    normalizedContent: '这是测试内容\n第二行文本\n第三行文本',
    contentHash: 'abc123',
  };

  it('应该渲染版本卡片', () => {
    render(<VersionCard version={mockVersion} />);
    
    expect(screen.getByText(/这是测试内容/)).toBeInTheDocument();
  });

  it('应该显示前两行内容预览', () => {
    render(<VersionCard version={mockVersion} />);
    
    expect(screen.getByText(/这是测试内容/)).toBeInTheDocument();
    expect(screen.getByText(/第二行文本/)).toBeInTheDocument();
  });

  it('应该在选中时显示高亮样式', () => {
    const { container } = render(<VersionCard version={mockVersion} isSelected={true} />);
    
    const card = container.querySelector('[data-testid="version-card"]');
    expect(card).toHaveClass('ring-2');
    expect(card).toHaveClass('ring-primary');
  });

  it('应该在非选中时不显示高亮样式', () => {
    const { container } = render(<VersionCard version={mockVersion} isSelected={false} />);
    
    const card = container.querySelector('[data-testid="version-card"]');
    expect(card).not.toHaveClass('ring-2');
  });

  it('应该在点击时调用 onClick 回调', () => {
    const handleClick = vi.fn();
    render(<VersionCard version={mockVersion} onClick={handleClick} />);
    
    const card = screen.getByTestId('version-card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith(mockVersion);
  });

  it('应该显示评分（如果存在）', () => {
    const versionWithScore: Version = { ...mockVersion, score: 4 };
    render(<VersionCard version={versionWithScore} />);
    
    // 应该显示 4 个实心星星
    const stars = screen.getAllByTestId(/star-/);
    expect(stars.filter(s => s.classList.contains('text-yellow-500'))).toHaveLength(4);
    expect(stars.filter(s => s.classList.contains('text-gray-300'))).toHaveLength(1);
  });

  it('应该格式化显示创建时间', () => {
    const specificTime = new Date('2025-11-16T10:30:00').getTime();
    const versionWithTime: Version = { ...mockVersion, createdAt: specificTime };
    
    render(<VersionCard version={versionWithTime} />);
    
    // 应该显示格式化的时间（支持多种格式）
    const container = screen.getByTestId('version-card');
    expect(container.textContent).toMatch(/2025/);
    expect(container.textContent).toMatch(/11/);
    expect(container.textContent).toMatch(/16/);
  });

  it('应该处理长文本内容的截断', () => {
    const longContent = 'A'.repeat(500);
    const longVersion: Version = {
      ...mockVersion,
      content: longContent,
      normalizedContent: longContent,
    };
    
    render(<VersionCard version={longVersion} />);
    
    const card = screen.getByTestId('version-card');
    const text = card.textContent || '';
    
    // 应该被截断（不超过200个字符）
    expect(text.length).toBeLessThan(300);
  });

  it('应该在叶子节点时显示特殊标记', () => {
    render(<VersionCard version={mockVersion} isLeaf={true} />);
    
    const leafIndicator = screen.getByTestId('leaf-indicator');
    expect(leafIndicator).toBeInTheDocument();
  });

  it('应该处理空内容', () => {
    const emptyVersion: Version = {
      ...mockVersion,
      content: '',
      normalizedContent: '',
    };
    
    render(<VersionCard version={emptyVersion} />);
    
    expect(screen.getByText(/空内容/)).toBeInTheDocument();
  });
});
