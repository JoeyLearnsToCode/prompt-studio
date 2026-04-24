import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import { Icons } from '@/components/icons/Icons';
import { MinimalButton } from '@/components/common/MinimalButton';

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
      {total > 0 && (
        <span className="text-xs text-surface-onVariant dark:text-surface-onVariantDark font-medium flex-shrink-0">
          {currentIndex + 1}/{total}
        </span>
      )}
      <MinimalButton
        variant="ghost"
        onClick={onPrev}
        disabled={!canNavigate}
        className="p-1 rounded-full"
        aria-label={t('components.canvas.prevResult')}
        title={t('components.canvas.prevResult')}
      >
        <Icons.UpArrow className="w-3.5 h-3.5" />
      </MinimalButton>
      <MinimalButton
        variant="ghost"
        onClick={onNext}
        disabled={!canNavigate}
        className="p-1 rounded-full"
        aria-label={t('components.canvas.nextResult')}
        title={t('components.canvas.nextResult')}
      >
        <Icons.DownArrow className="w-3.5 h-3.5" />
      </MinimalButton>
      {query && (
        <MinimalButton
          variant="ghost"
          onClick={onClear}
          className="p-1 rounded-full hover:text-error/60"
          aria-label={t('components.canvas.clearSearch')}
          title={t('components.canvas.clearSearch')}
        >
          <Icons.Clear className="w-3.5 h-3.5" />
        </MinimalButton>
      )}
      <MinimalButton
        variant="ghost"
        onClick={onClose}
        className="p-1 rounded-full hover:text-error"
        aria-label={t('components.canvas.closeSearch')}
        title={t('components.canvas.closeSearch')}
      >
        <Icons.Close className="w-3.5 h-3.5" />
      </MinimalButton>
    </div>
  );
});

GlobalSearchBar.displayName = 'GlobalSearchBar';
