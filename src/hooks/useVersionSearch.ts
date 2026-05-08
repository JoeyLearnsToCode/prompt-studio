import { useCallback, useEffect, useRef } from 'react';
import { useVersionSearchStore } from '@/store/versionSearchStore';
import { useVersionStore } from '@/store/versionStore';

export const useVersionSearch = () => {
  const {
    query,
    matches,
    currentIndex,
    total,
    isActive,
    fuzzy,
    setQuery,
    executeSearch,
    nextMatch,
    prevMatch,
    clearSearch,
    toggleFuzzy,
  } = useVersionSearchStore();

  const { versions } = useVersionStore();

  const prevFuzzy = useRef(fuzzy);
  useEffect(() => {
    if (prevFuzzy.current !== fuzzy && query.trim()) {
      executeSearch(versions, query);
    }
    prevFuzzy.current = fuzzy;
  }, [fuzzy, query, versions, executeSearch]);

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
    fuzzy,
    handleQueryChange,
    handleNext: nextMatch,
    handlePrev: prevMatch,
    handleClear,
    getCurrentMatchId,
    isVersionMatched,
    isCurrentMatch,
    handleToggleFuzzy: toggleFuzzy,
  };
};
