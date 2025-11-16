import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DiffViewer from '../../src/components/version/DiffViewer';

// Mock diffService
vi.mock('../../src/services/diffService', () => ({
  diffService: {
    computeDiff: vi.fn(() => [
      { operation: 'equal', text: '相同内容' },
      { operation: 'delete', text: '删除内容' },
      { operation: 'insert', text: '新增内容' },
    ]),
    computeSimilarity: vi.fn(() => 75),
  },
}));

describe('DiffViewer', () => {
  it('应该渲染并排视图', () => {
    const { container } = render(
      <DiffViewer
        leftContent="原始内容"
        rightContent="修改后的内容"
        leftLabel="原始版本"
        rightLabel="当前版本"
        mode="side-by-side"
      />
    );
    
    expect(container.textContent).toContain('版本对比');
    expect(container.textContent).toContain('原始版本');
    expect(container.textContent).toContain('当前版本');
  });

  it('应该渲染内联视图', () => {
    const { container } = render(
      <DiffViewer
        leftContent="原始内容"
        rightContent="修改后的内容"
        mode="inline"
      />
    );
    
    expect(container.textContent).toContain('版本对比');
  });

  it('应该显示相似度', () => {
    const { container } = render(
      <DiffViewer
        leftContent="原始内容"
        rightContent="修改后的内容"
      />
    );
    
    expect(container.textContent).toContain('相似度');
    expect(container.textContent).toContain('75%');
  });
});