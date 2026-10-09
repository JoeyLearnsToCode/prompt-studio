import { colors } from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 直接使用 tokens.js 中的颜色定义
      // Tailwind 会自动处理嵌套对象（如 primary.DEFAULT, surface.dark）
      colors: colors,
      // 动效 token：数值与 src/styles/motion.ts 保持一致
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap': 'cubic-bezier(0, 0.55, 0.45, 1)',
      },
      transitionDuration: {
        instant: '90ms',
        fast: '160ms',
        standard: '300ms',
        gentle: '450ms',
      },
      borderRadius: {
        'm3-small': '0.375rem',  // 6px
        'm3-medium': '0.5rem',   // 8px
        'm3-large': '0.75rem',   // 12px
        'm3-xl': '1rem',         // 16px
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',        // Google Fonts (Web)
          '"Source Han Sans CN"',  // 本地思源黑体 (CN)
          '"Source Han Sans SC"',  // 本地思源黑体 (SC)
          '"Microsoft YaHei"',     // Windows 微软雅黑
          '"PingFang SC"',         // macOS 苹方
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // 编辑器专用等宽字体栈 (PromptEditor 使用)
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
