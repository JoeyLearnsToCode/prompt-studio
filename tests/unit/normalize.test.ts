import { describe, it, expect } from 'vitest';
import { normalize } from '@/utils/normalize';

describe('Normalize Utils', () => {
  it('应该去除首尾空白', () => {
    const result = normalize('  测试内容  ');
    expect(result).toBe('测试内容');
  });

  it('应该统一换行符', () => {
    const result1 = normalize('行1\r\n行2');
    const result2 = normalize('行1\n行2');
    
    expect(result1).toBe(result2);
  });

  it('应该去除行尾空白', () => {
    const result = normalize('行1  \n行2  ');
    expect(result).toBe('行1\n行2');
  });

  it('应该压缩多余空行', () => {
    const result = normalize('段落1\n\n\n\n段落2');
    expect(result).toBe('段落1\n\n段落2');
  });

  it('应该处理复杂文本', () => {
    const input = `  
      段落1  
      
      
      段落2  
    `;
    const result = normalize(input);
    
    expect(result).not.toContain('  段落');
    expect(result.split('\n\n')).toHaveLength(2);
  });
});
