/**
 * 片段管理服务
 */

import { db } from '@/db/schema';
import type { Snippet } from '@/models/Snippet';
import { nanoid } from 'nanoid';

export class SnippetManager {
  /**
   * 创建片段
   */
  async createSnippet(name: string, content: string): Promise<string> {
    const snippet: Snippet = {
      id: nanoid(),
      name,
      content,
      createdAt: Date.now(),
    };

    await db.snippets.add(snippet);
    return snippet.id;
  }

  /**
   * 更新片段
   */
  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<void> {
    await db.snippets.update(id, updates);
  }

  /**
   * 删除片段
   */
  async deleteSnippet(id: string): Promise<void> {
    await db.snippets.delete(id);
  }

  /**
   * 获取所有片段
   */
  async getAllSnippets(): Promise<Snippet[]> {
    return await db.snippets.toArray();
  }

  /**
   * 按标签搜索（已移除标签功能）
   */
  async searchByTag(): Promise<Snippet[]> {
    return [];
  }

  /**
   * 搜索片段
   */
  async searchSnippets(query: string): Promise<Snippet[]> {
    const all = await this.getAllSnippets();
    const lowerQuery = query.toLowerCase();

    return all.filter(
      (snippet) =>
        snippet.name.toLowerCase().includes(lowerQuery) ||
        snippet.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const snippetManager = new SnippetManager();
