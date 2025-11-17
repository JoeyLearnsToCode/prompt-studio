/**
 * 文本标准化工具
 * 用于统一文本格式,便于对比和哈希计算
 */

/**
 * 标准化文本内容
 * - 去除所有空白字符和不可见字符
 * - 去除标点符号: ,.--，。/\()[]{}、（）【】|@；;"
 * - 转为小写
 */
export function normalize(text: string): string {
  return text
    .toLowerCase() // 转小写
    .replace(/[\s\u0000-\u001F\u007F-\u009F\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, '') // 去除所有空白和不可见字符
    .replace(/[,.\-，。/\\()[\]{}、（）【】|@；;"]/g, '') // 去除指定标点符号
    .trim();
}
