import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import { Icons } from '@/components/icons/Icons';

interface SearchBarProps {
  /** 搜索关键词 */
  query: string;
  
  /** 当前结果索引(0-based) */
  currentIndex: number;
  
  /** 总匹配数 */
  total: number;
  
  /** 搜索关键词变化回调 */
  onQueryChange: (query: string) => void;
  
  /** 跳转到下一个结果 */
  onNext: () => void;
  
  /** 跳转到上一个结果 */
  onPrev: () => void;
  
  /** 清空搜索 */
  onClear: () => void;
  
  /** 关闭搜索框 */
  onClose: () => void;
  
  /** 可选:占位文本 */
  placeholder?: string;
}

/**
 * 版本树搜索栏组件
 * 支持防抖输入、结果导航和键盘快捷键
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>((props, ref) => {
  const t = useTranslation();
  const {
    query,
    currentIndex,
    total,
    onQueryChange,
    onNext,
    onPrev,
    onClear,
    onClose,
    placeholder = t('components.canvas.searchPlaceholder'),
  } = props;
  
  const [localQuery, setLocalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // 防抖处理(300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, query, onQueryChange]);

  // 同步外部query变化
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // 聚焦输入框的方法
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // 选中所有文本，方便用户直接输入新的搜索内容
      inputRef.current.select();
    }
  }, []);

  // 暴露focus方法给父组件
  useImperativeHandle(ref, () => inputRef.current!, []);

  // 当组件挂载时聚焦输入框
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose(); // ESC键现在关闭搜索框
    }
  }, [onNext, onPrev, onClose]);

  const hasResults = total > 0;
  const canNavigate = total > 1;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface-variant rounded-lg shadow-sm">
      {/* 搜索图标 */}
      <Icons.Search className="w-5 h-5 text-surface-onVariant flex-shrink-0" />

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-surface-onVariant placeholder-surface-onVariant/60 text-sm"
        aria-label={t('components.canvas.search')}
      />

      {/* 结果计数 */}
      {hasResults && (
        <span className="text-sm text-surface-onVariant font-medium flex-shrink-0">
          {currentIndex + 1}/{total}
        </span>
      )}

      {/* 上一个结果按钮 */}
      <button
        onClick={onPrev}
        disabled={!canNavigate}
        className="p-1.5 rounded-full hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label={t('components.canvas.prevResult')}
        title={t('components.canvas.prevResult')}
      >
        <Icons.UpArrow className="w-4 h-4 text-surface-onVariant" />
      </button>

      {/* 下一个结果按钮 */}
      <button
        onClick={onNext}
        disabled={!canNavigate}
        className="p-1.5 rounded-full hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label={t('components.canvas.nextResult')}
        title={t('components.canvas.nextResult')}
      >
        <Icons.DownArrow className="w-4 h-4 text-surface-onVariant" />
      </button>

      {/* 清空按钮 */}
      {query && (
        <button
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-surface transition-colors"
          aria-label={t('components.canvas.clearSearch')}
          title={t('components.canvas.clearSearch')}
        >
          <Icons.Clear className="w-4 h-4 text-surface-onVariant" />
        </button>
      )}

      {/* 关闭搜索框按钮 */}
      <button
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-surface transition-colors"
        aria-label={t('components.canvas.closeSearch')}
        title={t('components.canvas.closeSearch')}
      >
        <Icons.Close className="w-4 h-4 text-surface-onVariant" />
      </button>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
