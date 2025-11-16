import { describe, it, expect } from 'vitest';
import { computeContentHash } from '@/utils/hash';

describe('Hash Utils', () => {
  it('应该为相同内容生成相同哈希', () => {
    const hash1 = computeContentHash('测试内容');
    const hash2 = computeContentHash('测试内容');
    
    expect(hash1).toBe(hash2);
  });

  it('应该为不同内容生成不同哈希', () => {
    const hash1 = computeContentHash('内容A');
    const hash2 = computeContentHash('内容B');
    
    expect(hash1).not.toBe(hash2);
  });

  it('应该在标准化后生成相同哈希（忽略空白差异）', () => {
    const hash1 = computeContentHash('  测试\n\n内容  ');
    const hash2 = computeContentHash('测试\n内容');
    
    expect(hash1).toBe(hash2);
  });

  it('应该返回64字符十六进制字符串', () => {
    const hash = computeContentHash('测试');
    
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
