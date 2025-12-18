import { colors } from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用暗黑模式支持
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        surface: colors.surface,
        background: colors.background,
        border: colors.border,
        error: colors.error,
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
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
