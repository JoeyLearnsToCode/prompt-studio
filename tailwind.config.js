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
          DEFAULT: '#cfe783',
          container: '#d9f799',
          onPrimary: '#2b3a00',
          onContainer: '#3d5200',
        },
        secondary: {
          DEFAULT: '#9ec891',
          container: '#b8e3a9',
          onSecondary: '#1a3a0f',
          onContainer: '#2a4a1f',
        },
        tertiary: {
          DEFAULT: '#8cbcd9',
          container: '#a3d1f0',
          onTertiary: '#0f2e42',
          onContainer: '#1f3e52',
        },
        surface: {
          DEFAULT: '#fdfcf5',
          variant: '#e4e3d6',
          onSurface: '#1b1c18',
          onVariant: '#46483f',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          onError: '#ffffff',
          onContainer: '#410002',
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
      },
    },
  },
  plugins: [],
}
