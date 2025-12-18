/**
 * 应用初始化组件
 * 负责初始化示例数据并自动加载到UI
 */

import { useEffect, useState, useRef } from 'react';
import { initializeSampleData } from '@/services/initializeSampleData';
import { useProjectStore } from '@/store/projectStore';
import { useVersionStore } from '@/store/versionStore';
import { storage, STORAGE_KEYS } from '@/utils/storage';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { loadProjects, setCurrentProject, loadFolders } = useProjectStore();
  const { loadVersions } = useVersionStore();

  // 使用 ref 确保初始化只执行一次（防止 React 18 严格模式下的双重调用）
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 如果已经初始化过，直接返回
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initialize = async () => {
      // 初始化示例数据
      const sampleProjectId = await initializeSampleData();

      // 如果创建了示例项目，自动加载和选择它
      if (sampleProjectId) {
        await loadFolders();
        await loadProjects();
        setCurrentProject(sampleProjectId);
        await loadVersions(sampleProjectId);
      }

      if (storage.get(STORAGE_KEYS.FIRST_OPEN_TIME, null) === null) {
        // 记录首次打开时间
        storage.set(STORAGE_KEYS.FIRST_OPEN_TIME, Date.now());
      }

      setIsInitialized(true);
    };

    initialize();
  }, [loadProjects, loadFolders, setCurrentProject, loadVersions]);

  // 在初始化完成前，可以显示一个简单的加载提示
  if (!isInitialized) {
    return null; // 或者可以显示一个加载动画
  }

  return <>{children}</>;
};
