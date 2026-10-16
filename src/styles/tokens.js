/**
 * Design Tokens
 * 颜色系统的唯一事实来源
 * 被 tailwind.config.js 和 业务代码(TS/JS) 共同引用
 *
 * 视觉语言：印刷登记簿（Printed Ledger）
 * 纸本（亮）/ 暗房（暗）双模 · 墨黑报头 · 胭脂印章 · 细框线
 * 详见 design/brief.md
 */

export const colors = {
  /** 印章色：胭脂（印泥红）。全站唯一的强调色，只用在「选中 / 主操作 / 链接」上 */
  primary: {
    DEFAULT: '#A63359',
    hover: '#8E2A4B',

    container: '#F3E2E8',
    containerDark: '#3A1C28',

    onPrimary: '#FBF8F2',

    onContainer: '#6E1B38',
    onContainerDark: '#F0C9D6',

    /** 暗房模式下印章要提亮，否则压在深底上会失去对比 */
    darkAccent: '#E0688A',

    // 特殊用途：编辑器选区背景 (Primary + 30% opacity)，暗房下用提亮后的印章色
    selection: '#a633594d',
    selectionDark: '#e0688a4d',
    editorBackground: '#00000000',
  },
  surface: {
    // Light mode —— 纸面层级：桌面 < 卡纸 < 字段
    DEFAULT: '#FBF8F2', // 登记卡纸
    variant: '#F1EBE1',   // 输入框 / 次级容器
    onSurface: '#23201B', // 墨黑
    onVariant: '#5F594D', // 淡墨

    // Dark mode —— 暗房
    dark: '#1E1D19',
    variantDark: '#26251F',
    onSurfaceDark: '#EDE7DB',
    onVariantDark: '#A8A093',

    // 容器组件背景
    container: '#FBF8F2',
    containerDark: '#1E1D19',

    'container-low': '#F6F1E8',
    'container-low-dark': '#22201C',

    /**
     * 明度阶梯必须严格单调，否则以桌面色为底的元素 hover 时会消失：
     * 桌面 #E7E1D6 < 按下 #EAE3D6 < hover #EFE9DD < 输入框 #F1EBE1 < 卡纸 #FBF8F2
     */
    'container-high': '#EFE9DD',      // hover
    'container-high-dark': '#3A3830',

    'container-highest': '#EAE3D6',   // 按下
    'container-highest-dark': '#474438',
  },
  /** 应用最底层：桌面 / 打样台 */
  background: {
    DEFAULT: '#E7E1D6',
    dark: '#171613',
  },
  /** 报头：墨黑通栏（如报纸报头） */
  masthead: {
    DEFAULT: '#23201B',
    dark: '#0E0D0B',
    on: '#F1EBE1',
  },
  /** 框线：细而实，替代阴影建立边界。要压得住卡纸，不能淡到看不见 */
  border: {
    DEFAULT: '#CDC4B2',
    dark: '#464236',
  },
  /** 语义红：比印章色更深更褐（氧化后的印泥），避免两种红撞在一起 */
  error: {
    DEFAULT: '#8E2A14',
    /** 暗房下的语义红，必须单独提亮 */
    darkAccent: '#E3896E',
    container: '#F7E3DC',
    containerDark: '#3B1A12',

    onContainer: '#7A2312',
    onContainerDark: '#F4C7B8',
  },
  // 文本颜色 (用于非 Tailwind 环境，如 Canvas/Monaco)
  text: {
    light: {
      primary: '#23201B',   // 墨黑
      secondary: '#5F594D', // 淡墨
      muted: '#756D61',     // 最淡的一档，仍满足 4.5:1
    },
    dark: {
      primary: '#EDE7DB',
      secondary: '#A8A093',
      muted: '#8A8375',
    }
  },
  // 滚动条颜色
  scrollbar: {
    thumb: '#C9C0B0',
    thumbDark: '#45423A',
    thumbHover: '#A79E8D',
  }
};
