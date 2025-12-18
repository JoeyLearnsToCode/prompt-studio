/**
 * Design Tokens
 * 颜色系统的唯一事实来源
 * 被 tailwind.config.js 和 业务代码(TS/JS) 共同引用
 */

export const colors = {
  primary: {
    DEFAULT: '#749E68', // Sage Green
    hover: '#638a58',
    container: '#e8f5e9',
    onPrimary: '#ffffff',
    onContainer: '#1a3a0f',
    // 特殊用途：编辑器选区背景 (Primary + 25% opacity)
    selection: '#749E6840',
    editorBackground: '#00000000',
    // 特殊用途：Diff新增背景 (Primary + 20% opacity)
    diffInserted: '#749E6833',
  },
  surface: {
    DEFAULT: '#ffffff', // Light mode card background
    dark: '#27272a',    // Dark mode card background (Zinc 800)
    variant: '#f4f4f5', // Zinc 100
    onSurface: '#27272a', // Zinc 800
    onVariant: '#71717a', // Zinc 500
    // 容器组件背景
    container: '#ffffff', // Default surface container
    containerLow: '#f4f4f5', 
    containerHigh: '#ececee',
    containerHighest: '#e4e4e7',
  },
  background: {
    DEFAULT: '#F0F2EB', // Soft muted beige/grey
    dark: '#18181b',    // Zinc 950
  },
  border: {
    DEFAULT: '#e4e4e7', // Zinc 200
    dark: '#3f3f46',    // Zinc 700
  },
  error: {
    DEFAULT: '#ef4444',
    container: '#fee2e2',
    onContainer: '#991b1b',
    // 特殊用途：Diff删除背景 (Error + 20% opacity)
    diffRemoved: '#ef444433',
  },
  // 文本颜色 (用于非 Tailwind 环境，如 Canvas/Monaco)
  text: {
    light: {
      primary: '#27272a',   // Zinc 800
      secondary: '#71717a', // Zinc 500
      muted: '#a1a1aa',     // Zinc 400
    },
    dark: {
      primary: '#f4f4f5',   // Zinc 100
      secondary: '#a1a1aa', // Zinc 400
      muted: '#71717a',     // Zinc 500
    }
  },
  // 滚动条颜色
  scrollbar: {
    thumb: '#d4d4d8',      // Zinc 300
    thumbDark: '#52525b',  // Zinc 600
    thumbHover: '#a1a1aa', // Zinc 400
  }
};
