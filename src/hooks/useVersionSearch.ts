import { useCallback } from 'react';
import { useVersionSearchStore } from '@/store/versionSearchStore';
import { useVersionStore } from '@/store/versionStore';

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
  } = useVersionSearchStore();

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

  const getCurrentMatchId = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= matches.length) {
      return null;
    }
    return matches[currentIndex];
  }, [matches, currentIndex]);

  const isVersionMatched = useCallback(
    (versionId: string) => {
      return matches.includes(versionId);
    },
    [matches]
  );

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
