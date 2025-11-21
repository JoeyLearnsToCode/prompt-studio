import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  // Global ignores from .eslintignore
  {
    ignores: [
      // Build outputs
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      
      // Config files
      '*.config.js',
      '*.config.ts',
      
      // Generated files
      '*.min.js',
      '*.bundle.js',
      
      // Test outputs
      'test-results/**',
      'playwright-report/**',
    ],
  },
  // Source code configuration
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        es2020: true,
        // DOM globals
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLSelectElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        FocusEvent: 'readonly',
        ClipboardEvent: 'readonly',
        DragEvent: 'readonly',
        // Browser timing functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Console
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      'no-useless-eslint-disable-comments': 'off',
      'no-unused-disable-directives': 'off',
    },
  },
  // Test files configuration
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        es2020: true,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        // Playwright globals
        page: 'writable',
        context: 'writable',
        browser: 'writable',
        browserName: 'readonly',
        deviceName: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      'no-useless-eslint-disable-comments': 'off',
      'no-unused-disable-directives': 'off',
    },
  },
  // Config files
  {
    files: ['vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      'no-useless-eslint-disable-comments': 'off',
      'no-unused-disable-directives': 'off',
    },
  },
];