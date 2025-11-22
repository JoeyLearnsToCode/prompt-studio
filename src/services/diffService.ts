/**
 * Diff 对比服务
 * 基于 diff-match-patch 算法和 @codemirror/merge
 */

import DiffMatchPatch from 'diff-match-patch';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';

export interface DiffResult {
  operation: 'equal' | 'insert' | 'delete';
  text: string;
}

/**
 * CodeMirror扩展配置
 * 用于Diff视图的只读编辑器
 */
export function createDiffEditorExtensions(): Extension[] {
  return [
    markdown(),
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    EditorView.lineWrapping,
  ];
}

export class DiffService {
  private dmp: DiffMatchPatch;

  constructor() {
    this.dmp = new DiffMatchPatch();
  }

  /**
   * 计算两个文本的差异
   */
  computeDiff(text1: string, text2: string): DiffResult[] {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);

    return diffs.map(([op, text]) => ({
      operation: op === 1 ? 'insert' : op === -1 ? 'delete' : 'equal',
      text,
    }));
  }

  /**
   * 计算相似度（0-100%）
   */
  computeSimilarity(text1: string, text2: string): number {
    const diffs = this.dmp.diff_main(text1, text2);
    const levenshtein = this.dmp.diff_levenshtein(diffs);
    const maxLength = Math.max(text1.length, text2.length);
    
    if (maxLength === 0) return 100;
    
    return Math.round(((maxLength - levenshtein) / maxLength) * 100);
  }

  /**
   * 生成统一格式的 Diff (类似 Git Diff)
   */
  generateUnifiedDiff(
    text1: string,
    text2: string
  ): string {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);

    const patches = this.dmp.patch_make(text1, text2, diffs);
    return this.dmp.patch_toText(patches);
  }

  /**
   * 应用补丁
   */
  applyPatch(text: string, patch: string): string {
    const patches = this.dmp.patch_fromText(patch);
    const [result] = this.dmp.patch_apply(patches, text);
    return result;
  }
}

export const diffService = new DiffService();
