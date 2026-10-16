/**
 * 版本搜索服务
 * 提供全文搜索和结果管理功能
 */

import type { Version } from '@/models/Version';

export interface SearchResult {
  matches: string[];
  total: number;
}

/**
 * 转义特殊字符(正则元字符)
 */
export function escapeQuery(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 在版本列表中搜索关键词
 * 使用简单的不区分大小写文本匹配
 */
export function searchVersions(versions: Version[], query: string): SearchResult {
  if (!query.trim()) {
    return { matches: [], total: 0 };
  }

  const lowerQuery = query.toLowerCase();
  const matches = versions
    .filter((v) => v.content.toLowerCase().includes(lowerQuery))
    .map((v) => v.id);

  return { matches, total: matches.length };
}

/**
 * 高亮匹配文本(用于UI显示)
 * 返回带HTML标记的字符串
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: string[] = [];
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery);
  while (index !== -1) {
    // 添加匹配前的文本
    parts.push(escapeHtml(text.substring(lastIndex, index)));

    // 添加高亮的匹配文本
    const matchedText = text.substring(index, index + query.length);
    // 命中高亮：印章色的浅底 + 细框，而不是记号笔的黄
    parts.push(
      // 命中走墨色（下划线 + 淡墨底），印章色留给"选中"独占，两者不抢同一通道
      `<mark class="bg-masthead/10 dark:bg-masthead-on/15 text-surface-onSurface dark:text-surface-onSurfaceDark underline decoration-1 decoration-masthead/40 underline-offset-2 px-0.5">${escapeHtml(matchedText)}</mark>`
    );

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // 添加剩余文本
  parts.push(escapeHtml(text.substring(lastIndex)));

  return parts.join('');
}

/**
 * HTML转义(防止XSS)
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
