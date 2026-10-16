import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { MinimalButton } from '@/components/common/MinimalButton';
import { duration, ease } from '@/styles/motion';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // 两个图标叠放做交叉淡入 + 旋转，而不是瞬间换一个字形
  const layerTransition = {
    transitionDuration: `${duration.fast * 1000}ms`,
    transitionTimingFunction: `cubic-bezier(${ease.outExpo.join(',')})`,
  };
  const iconState = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transform: `rotate(${visible ? 0 : -90}deg) scale(${visible ? 1 : 0.6})`,
  });

  return (
    <MinimalButton
      variant="ghost"
      onClick={toggleTheme}
      className="relative h-9 w-9 overflow-hidden !text-masthead-on/75 hover:!text-masthead-on hover:!bg-masthead-on/10"
      title="Toggle Theme"
      aria-label="Toggle Theme"
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-[opacity,transform]"
        style={{ ...iconState(!isDark), ...layerTransition }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          light_mode
        </span>
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-[opacity,transform]"
        style={{ ...iconState(isDark), ...layerTransition }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          dark_mode
        </span>
      </span>
    </MinimalButton>
  );
};
