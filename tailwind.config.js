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
      /**
       * 印刷登记簿的形状语言：裁切过的纸是直角的。
       * 面板（rounded-md）= 0，控件（sm/lg）= 2px —— 只有两档，多一档在屏上都分辨不出来。
       * 压掉默认档位，整站一起变"硬"，不需要逐个改类名。
       */
      borderRadius: {
        none: '0',
        DEFAULT: '0',
        md: '0',
        sm: '2px',
        lg: '2px',
        xl: '3px',
        '2xl': '4px',
        '3xl': '6px',
      },
      /**
       * 不用模糊阴影 —— 油墨压进纸面是硬边的。
       * 颜色走 CSS 变量，亮/暗两套在 globals.css 里换。
       */
      boxShadow: {
        'card': '2px 2px 0 0 var(--plate-shadow)',
        'card-hover': '3px 3px 0 0 var(--plate-shadow-strong)',
        'float': '2px 2px 0 0 var(--plate-shadow-strong)',
        'press': '0 0 0 1px var(--plate-border)',
        'm3-1': '1px 1px 0 0 var(--plate-shadow)',
        'm3-2': '2px 2px 0 0 var(--plate-shadow)',
        'm3-3': '3px 3px 0 0 var(--plate-shadow-strong)',
        'elevation-2': '2px 2px 0 0 var(--plate-shadow-strong)',
        'elevation-3': '3px 3px 0 0 var(--plate-shadow-strong)',
      },
      letterSpacing: {
        'label': '0.12em',
        'wordmark': '0.02em',
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
        /**
         * 等宽只用于编号 / 标签 / 元数据（"技术精确"这一层）。
         * 中文字形在等宽栈里不存在，因此把中文族放在通用 monospace 之前，
         * 让汉字回到 Noto Sans SC，而不是掉进系统默认的等宽回退。
         */
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '"Microsoft YaHei"',
          '"PingFang SC"',
          'monospace',
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
