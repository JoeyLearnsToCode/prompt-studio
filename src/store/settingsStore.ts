import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // WebDAV
  webdavUrl: string;
  webdavUsername: string;
  webdavPassword: string;
  setWebdavConfig: (url: string, username: string, password: string) => void;

  // Theme
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // Editor
  editorFontSize: number;
  editorLineHeight: number;
  setEditorSettings: (fontSize: number, lineHeight: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      webdavUrl: '',
      webdavUsername: '',
      webdavPassword: '',
      setWebdavConfig: (url, username, password) =>
        set({ webdavUrl: url, webdavUsername: username, webdavPassword: password }),

      theme: 'auto',
      setTheme: (theme) => set({ theme }),

      editorFontSize: 14,
      editorLineHeight: 1.5,
      setEditorSettings: (fontSize, lineHeight) =>
        set({ editorFontSize: fontSize, editorLineHeight: lineHeight }),
    }),
    {
      name: 'prompt-studio-settings',
    }
  )
);
