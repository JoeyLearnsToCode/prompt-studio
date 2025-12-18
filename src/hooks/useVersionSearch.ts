import { useCallback } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useVersionStore } from '@/store/versionStore';

/**
 * 版本搜索Hook
 * 封装搜索状态逻辑和版本过滤
 */
export const useVersionSearch = () => {
  const {
    query,
    matches,
    currentIndex,
    total,
    isActive,
    setQuery,
    executeSearch,
    nextMatch,
    prevMatch,
    clearSearch,
  } = useSearchStore();

  const { versions } = useVersionStore();

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      executeSearch(versions, newQuery);
    },
    [versions, setQuery, executeSearch]
  );

  const handleClear = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  /**
   * 获取当前高亮的版本ID
   */
  const getCurrentMatchId = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= matches.length) {
      return null;
    }
    return matches[currentIndex];
  }, [matches, currentIndex]);

  /**
   * 检查指定版本是否匹配搜索
   */
  const isVersionMatched = useCallback(
    (versionId: string) => {
      return matches.includes(versionId);
    },
    [matches]
  );

  /**
   * 检查指定版本是否为当前高亮版本
   */
  const isCurrentMatch = useCallback(
    (versionId: string) => {
      return getCurrentMatchId() === versionId;
    },
    [getCurrentMatchId]
  );

  return {
    query,
    matches,
    currentIndex,
    total,
    isActive,
    handleQueryChange,
    handleNext: nextMatch,
    handlePrev: prevMatch,
    handleClear,
    getCurrentMatchId,
    isVersionMatched,
    isCurrentMatch,
  };
};
