import { sha256 } from 'js-sha256';
import { normalize } from './normalize';

/**
 * SHA-256 哈希计算工具
 */

/**
 * 计算内容哈希值
 * @param content 原始文本内容
 * @returns 64 字符十六进制哈希字符串
 */
export function computeContentHash(content: string): string {
  const normalized = normalize(content);
  return sha256(normalized);
}
