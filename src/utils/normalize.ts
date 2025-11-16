/**
 * 文本标准化工具
 * 用于统一文本格式,便于对比和哈希计算
 */

/**
 * 标准化文本内容
 * - 去除首尾空白
 * - 统一换行符为 \n
 * - 去除行尾空白
 * - 压缩多余空行为两行
 */
export function normalize(text: string): string {
  return text
    .trim() // 去除首尾空白
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\r/g, '\n')
    .replace(/\s+$/gm, '') // 去除行尾空白
    .replace(/\n{3,}/g, '\n\n'); // 多余空行压缩为两行
}
