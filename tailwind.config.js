/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#76a866',
          container: '#76a866',
          onPrimary: '#1a2400', // 更深的文字色
          onContainer: '#2b3a00',
        },
        secondary: {
          DEFAULT: '#76a866', // 更深的绿色
          container: '#b8e3a9',
          onSecondary: '#0f2400',
          onContainer: '#1a3a0f',
        },
        tertiary: {
          DEFAULT: '#5a9bc4', // 更深的蓝色
          container: '#a3d1f0',
          onTertiary: '#072231',
          onContainer: '#0f2e42',
        },
        surface: {
          DEFAULT: '#fdfcf5',
          variant: '#e4e3d6',
          container: '#d4d3c6',
          'container-high': '#d4d3c6', // 更深的容器色，用于编辑器
          containerHighest: '#d4d3c6',
          onSurface: '#1b1c18',
          onVariant: '#2a2b24', // 更深的变体文字色，提高对比度
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          onError: '#ffffff',
          onContainer: '#410002',
        },
        outline: {
          DEFAULT: '#79747e',
          variant: '#cac4d0',
        },
      },
      borderRadius: {
        'm3-small': '8px',
        'm3-medium': '12px',
        'm3-large': '16px',
      },
      boxShadow: {
        'm3-1': '0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        'm3-2': '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        'm3-3': '0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)',
        'elevation-level1': '0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        'elevation-level2': '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        'elevation-level3': '0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
