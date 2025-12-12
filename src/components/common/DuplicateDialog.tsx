/**
 * 重复内容提醒对话框
 * 当检测到相同内容的版本时显示
 */

import { useEffect } from 'react';
import type { Version } from '@/models/Version';
import { Icons } from '@/components/icons/Icons';

export interface DuplicateDialogProps {
  /** 对话框是否打开 */
  isOpen: boolean;

  /** 已存在的重复版本 */
  duplicateVersion: Version | null;

  /** 用户选择"仍然创建"的回调 */
  onConfirm: () => void;

  /** 用户选择"取消"的回调 */
  onCancel: () => void;
}

export function DuplicateDialog({
  isOpen,
  duplicateVersion,
  onConfirm,
  onCancel,
}: DuplicateDialogProps) {
  // ESC键和Enter键快捷键
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen || !duplicateVersion) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* 图标和标题 */}
        <div className="flex items-center gap-3 mb-4">
          <Icons.Warning className="w-8 h-8 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900">检测到重复内容</h2>
        </div>

        {/* 内容 */}
        <div className="mb-6">
          <p className="text-gray-700 mb-3">已存在相同内容的版本:</p>

          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <p className="text-sm mb-1">
              <span className="font-semibold text-gray-900">版本 ID:</span>{' '}
              <span className="text-gray-700 font-mono">
                {duplicateVersion.id.slice(0, 8)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              创建于 {formatDate(duplicateVersion.createdAt)}
            </p>
            {duplicateVersion.score !== undefined && (
              <p className="text-sm text-gray-600 mt-1">
                评分: {duplicateVersion.score}/5
              </p>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-4">是否仍要创建新版本?</p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            仍然创建
          </button>
        </div>
      </div>
    </div>
  );
}
