import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import { Icons } from '@/components/icons/Icons';

interface GlobalSearchBarProps {
  query: string;
  currentIndex: number;
  total: number;
  onQueryChange: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
  onClose: () => void;
  placeholder?: string;
  currentMatchLabel?: string;
  fuzzy?: boolean;
  onToggleFuzzy?: () => void;
}

export const GlobalSearchBar = forwardRef<HTMLInputElement, GlobalSearchBarProps>((props, ref) => {
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
    placeholder = t('components.sidebar.searchPlaceholder'),
    fuzzy = false,
    onToggleFuzzy,
  } = props;

  const [localQuery, setLocalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, query, onQueryChange]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useImperativeHandle(ref, () => inputRef.current!, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          onPrev();
        } else {
          onNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onNext, onPrev, onClose]
  );

  const canNavigate = total > 1;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-surface-variant dark:bg-surface-containerHighDark rounded-lg shadow-sm">
      <Icons.Search className="w-4 h-4 text-surface-onVariant dark:text-surface-onVariantDark flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-surface-onVariant dark:text-surface-onSurfaceDark placeholder-surface-onVariant/60 dark:placeholder-surface-onVariantDark/60 text-xs min-w-0"
        aria-label={t('common.search')}
      />
      {/* 右侧控件：统一 inline-flex items-center 对齐 */}
      {total > 0 && (
        <span className="text-[10px] text-surface-onVariant dark:text-surface-onVariantDark font-medium flex-shrink-0 leading-none">
          {currentIndex + 1}/{total}
        </span>
      )}

      {onToggleFuzzy && (
        <button
          onClick={onToggleFuzzy}
          className={`p-0.5 rounded transition-colors duration-200 inline-flex items-center justify-center ${fuzzy ? 'text-primary dark:text-primary' : 'text-surface-onVariant dark:text-surface-onVariantDark hover:text-primary dark:hover:text-primary'}`}
          aria-label={fuzzy ? t('components.canvas.fuzzySearchOn') : t('components.canvas.fuzzySearchOff')}
          title={fuzzy ? t('components.canvas.fuzzySearchOn') : t('components.canvas.fuzzySearchOff')}
        >
          <Icons.FuzzySearch className="w-3.5 h-3.5" fill={fuzzy} />
        </button>
      )}

      {/* 上/下导航 - 垂直紧凑组 */}
      <div className="flex flex-col flex-shrink-0">
        <button
          onClick={onPrev}
          disabled={!canNavigate}
          className="p-0 rounded text-surface-onVariant dark:text-surface-onVariantDark hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          aria-label={t('components.canvas.prevResult')}
          title={t('components.canvas.prevResult')}
        >
          <Icons.UpArrow className="w-3 h-3" />
        </button>
        <button
          onClick={onNext}
          disabled={!canNavigate}
          className="p-0 rounded text-surface-onVariant dark:text-surface-onVariantDark hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          aria-label={t('components.canvas.nextResult')}
          title={t('components.canvas.nextResult')}
        >
          <Icons.DownArrow className="w-3 h-3" />
        </button>
      </div>

      {query && (
        <button
          onClick={onClear}
          className="p-0.5 rounded text-surface-onVariant dark:text-surface-onVariantDark hover:text-error/60 inline-flex items-center justify-center"
          aria-label={t('components.canvas.clearSearch')}
          title={t('components.canvas.clearSearch')}
        >
          <Icons.Clear className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={onClose}
        className="p-0.5 rounded text-surface-onVariant dark:text-surface-onVariantDark hover:text-error inline-flex items-center justify-center"
        aria-label={t('components.canvas.closeSearch')}
        title={t('components.canvas.closeSearch')}
      >
        <Icons.Close className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

GlobalSearchBar.displayName = 'GlobalSearchBar';
