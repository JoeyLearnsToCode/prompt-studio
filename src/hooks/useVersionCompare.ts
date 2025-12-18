/**
 * 版本对比 Hook
 * 封装对比状态和操作逻辑
 */

import { useVersionStore } from '@/store/versionStore';
import type { Version } from '@/models/Version';

export function useVersionCompare() {
  const { versions, compareState, openCompare, setCompareTarget, closeCompare } = useVersionStore();

  const sourceVersion: Version | null =
    versions.find((v) => v.id === compareState.sourceVersionId) || null;

  const targetVersion: Version | null =
    versions.find((v) => v.id === compareState.targetVersionId) || null;

  const availableVersions = versions.filter((v) => v.id !== compareState.sourceVersionId);

  const handleOpenCompare = (versionId: string) => {
    openCompare(versionId);
  };

  const handleSelectTarget = (versionId: string) => {
    setCompareTarget(versionId);
  };

  return {
    isOpen: compareState.isOpen,
    sourceVersion,
    targetVersion,
    availableVersions,
    handleOpenCompare,
    handleSelectTarget,
    handleClose: closeCompare,
  };
}
