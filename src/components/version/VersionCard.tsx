import React from 'react';
import type { Version } from '@/models/Version';
import { useTranslation } from '@/i18n/I18nContext';

interface VersionCardProps {
  version: Version;
  isSelected?: boolean;
  isLeaf?: boolean;
  onClick?: (version: Version) => void;
}

export const VersionCard: React.FC<VersionCardProps> = ({
  version,
  isSelected = false,
  isLeaf = false,
  onClick,
}) => {
  const t = useTranslation();
  
  const handleClick = () => {
    onClick?.(version);
  };

  // 提取前两行作为预览
  const getPreview = (content: string): string => {
    if (!content) return t('components.versionCard.emptyContent');
    
    const lines = content.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 2).join('\n');
    
    // 限制长度为200个字符
    if (preview.length > 200) {
      return preview.substring(0, 200) + '...';
    }
    
    return preview;
  };

  // 格式化时间显示
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染星级评分
  const renderStars = (score?: number) => {
    if (!score) return null;
    
    return (
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            data-testid={`star-${star}`}
            className={`w-4 h-4 ${star <= score ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      data-testid="version-card"
      onClick={handleClick}
      className={`
        relative p-4 rounded-m3-medium bg-surface-container
        border border-outline
        transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary shadow-m3-2' : 'hover:shadow-m3-1'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* 叶子节点标记 */}
      {isLeaf && (
        <div
          data-testid="leaf-indicator"
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tertiary"
          title={t('components.versionCard.leafNode')}
        />
      )}

      {/* 内容预览 */}
      <div className="text-sm text-on-surface whitespace-pre-wrap break-words font-mono">
        {getPreview(version.content)}
      </div>

      {/* 评分 */}
      {renderStars(version.score)}

      {/* 创建时间 */}
      <div className="mt-3 text-xs text-on-surface-variant">
        {formatTime(version.createdAt)}
      </div>

      {/* 更新时间（如果不同于创建时间） */}
      {version.updatedAt !== version.createdAt && (
        <div className="text-xs text-on-surface-variant">
          {t('components.versionCard.updatedAt')}: {formatTime(version.updatedAt)}
        </div>
      )}
    </div>
  );
};
