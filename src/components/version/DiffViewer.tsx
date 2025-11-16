import React, { useMemo } from 'react';
import { diffService, type DiffResult } from '@/services/diffService';

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel?: string;
  rightLabel?: string;
  mode?: 'side-by-side' | 'inline';
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  leftContent,
  rightContent,
  leftLabel = 'Original',
  rightLabel = 'Modified',
  mode = 'side-by-side',
}) => {
  const diffs = useMemo(() => {
    return diffService.computeDiff(leftContent, rightContent);
  }, [leftContent, rightContent]);

  const similarity = useMemo(() => {
    return diffService.computeSimilarity(leftContent, rightContent);
  }, [leftContent, rightContent]);

  const renderDiffLine = (diff: DiffResult, index: number) => {
    const bgColor =
      diff.operation === 'insert'
        ? 'bg-green-100'
        : diff.operation === 'delete'
        ? 'bg-red-100'
        : 'bg-transparent';

    const textColor =
      diff.operation === 'insert'
        ? 'text-green-800'
        : diff.operation === 'delete'
        ? 'text-red-800'
        : 'text-surface-onSurface';

    return (
      <span key={index} className={`${bgColor} ${textColor}`}>
        {diff.text}
      </span>
    );
  };

  if (mode === 'inline') {
    return (
      <div className="h-full flex flex-col bg-surface">
        {/* 相似度指示器 */}
        <div className="p-4 bg-surface-variant border-b border-surface-onVariant/20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">版本对比</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-onVariant">相似度:</span>
              <span className="font-bold text-primary">{similarity}%</span>
            </div>
          </div>
        </div>

        {/* Inline Diff 视图 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-surface border border-surface-variant rounded-m3-medium p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {diffs.map((diff, index) => renderDiffLine(diff, index))}
          </div>
        </div>

        {/* 图例 */}
        <div className="p-4 bg-surface-variant border-t border-surface-onVariant/20 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
            <span>新增</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
            <span>删除</span>
          </div>
        </div>
      </div>
    );
  }

  // Side-by-side 视图
  const leftLines: JSX.Element[] = [];
  const rightLines: JSX.Element[] = [];

  diffs.forEach((diff, index) => {
    if (diff.operation === 'delete') {
      leftLines.push(
        <div key={`left-${index}`} className="bg-red-100 text-red-800 px-2 py-0.5">
          {diff.text}
        </div>
      );
    } else if (diff.operation === 'insert') {
      rightLines.push(
        <div key={`right-${index}`} className="bg-green-100 text-green-800 px-2 py-0.5">
          {diff.text}
        </div>
      );
    } else {
      leftLines.push(
        <div key={`left-${index}`} className="px-2 py-0.5">
          {diff.text}
        </div>
      );
      rightLines.push(
        <div key={`right-${index}`} className="px-2 py-0.5">
          {diff.text}
        </div>
      );
    }
  });

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* 相似度指示器 */}
      <div className="p-4 bg-surface-variant border-b border-surface-onVariant/20">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">版本对比 (并排视图)</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-onVariant">相似度:</span>
            <span className="font-bold text-primary">{similarity}%</span>
          </div>
        </div>
      </div>

      {/* Side-by-side Diff 视图 */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left Panel */}
        <div className="flex flex-col border-r border-surface-variant">
          <div className="bg-surface-variant px-4 py-2 font-bold text-sm border-b border-surface-onVariant/20">
            {leftLabel}
          </div>
          <div className="flex-1 overflow-auto p-2 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {leftLines}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col">
          <div className="bg-surface-variant px-4 py-2 font-bold text-sm border-b border-surface-onVariant/20">
            {rightLabel}
          </div>
          <div className="flex-1 overflow-auto p-2 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {rightLines}
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="p-4 bg-surface-variant border-t border-surface-onVariant/20 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
          <span>新增</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
          <span>删除</span>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
