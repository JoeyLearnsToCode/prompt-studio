import React, { useState, useRef } from 'react';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { search, openSearchPanel, closeSearchPanel } from '@codemirror/search';
import { Prec } from '@codemirror/state';
import { useSettingsStore } from '@/store/settingsStore';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSaveInPlace?: () => void;
  readOnly?: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  value,
  onChange,
  onSave,
  onSaveInPlace,
  readOnly = false,
}) => {
  const { editorFontSize, editorLineHeight } = useSettingsStore();
  const [view, setView] = useState<EditorView | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // M3 主题 - 填满父区域，使用浏览器默认等宽字体
  const theme = EditorView.theme({
    '&': {
      color: '#1b1c18',
      backgroundColor: '#fdfcf5',
      fontSize: `${editorFontSize}px`,
      lineHeight: editorLineHeight.toString(),
      height: '100%',
      width: '100%',
    },
    '.cm-editor': {
      height: '100%',
      width: '100%',
      fontFamily: 'ui-monospace, monospace',
    },
    '.cm-scroller': {
      overflow: 'auto',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#a8c548',
      padding: '1rem',
      minHeight: '100%',
      boxSizing: 'border-box',
    },
    '.cm-cursor': {
      borderLeftColor: '#a8c548',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: '#d9f799 !important',
    },
    '.cm-focused .cm-selectionBackground': {
      backgroundColor: '#d9f799 !important',
    },
    '.cm-gutters': {
      backgroundColor: '#e4e3d6',
      color: '#2a2b24',
      border: 'none',
      fontFamily: 'ui-monospace, monospace',
    },
    '.cm-line': {
      padding: '0 0',
    },
    '.cm-lineNumbers': {
      fontFamily: 'ui-monospace, monospace',
    },
    
    // 搜索高亮效果
    '.cm-searchMatch': {
      backgroundColor: 'rgba(168, 197, 72, 0.3)',
      borderRadius: '2px',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'rgba(168, 197, 72, 0.5)',
    },
    
    // 美化原生搜索面板
    '.cm-panels': {
      backgroundColor: 'var(--md-sys-color-surface-container-high)',
      borderTop: '1px solid var(--md-sys-color-outline-variant)',
      boxShadow: 'var(--md-sys-elevation-level2)',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '1px solid var(--md-sys-color-outline-variant)',
    },
    '.cm-panel.cm-search': {
      padding: '12px 16px',
      backgroundColor: 'transparent',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    
    // 输入框样式
    '.cm-textfield': {
      height: '40px',
      padding: '8px 12px',
      backgroundColor: 'var(--md-sys-color-surface)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: '8px',
      fontFamily: 'ui-monospace, monospace',
      fontSize: '14px',
      color: 'var(--md-sys-color-on-surface)',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '40%',
    },
    '.cm-textfield:focus': {
      borderColor: 'var(--md-sys-color-primary)',
      boxShadow: '0 0 0 3px var(--md-sys-color-primary-container)',
    },
    
    // Material Design 3 按钮样式 - Filled Tonal
    '.cm-button': {
      height: '40px',
      padding: '10px 24px',
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--md-sys-color-on-secondary-container)',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      letterSpacing: '0.1px',
      boxShadow: 'none',
    },
    '.cm-button:hover': {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      boxShadow: 'var(--md-sys-elevation-level1)',
    },
    '.cm-button:active': {
      boxShadow: 'none',
    },
    
    // 关闭按钮 - Icon Button
    'button[name="close"]': {
      width: '48px',
      height: '48px',
      minWidth: '48px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: 'none',
      color: 'var(--md-sys-color-on-surface-variant)',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '32px !important',
    },
    
    // 自定义按钮文本
    'button[name="replaceAll"]': {
      fontSize: '0 !important',
    },
    'button[name="replaceAll"]::before': {
      content: '"all"',
      fontSize: '14px',
      fontWeight: '500',
    },
    
    // 选项按钮（Match case、RegExp、By word）- 改为图标开关
    'input[type="checkbox"]': {
      appearance: 'none',
      width: '40px',
      height: '40px',
      margin: '0',
      cursor: 'pointer',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: 'none',
      position: 'relative',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: '0',
    },
    'input[type="checkbox"]:hover': {
      backgroundColor: 'var(--md-sys-color-surface-container-high)',
    },
    'input[type="checkbox"]:checked': {
      backgroundColor: 'transparent',
    },
    'input[type="checkbox"]:checked:hover': {
      backgroundColor: 'var(--md-sys-color-surface-container-high)',
    },
    
    // 隐藏 checkbox 的 label 文字，只显示 checkbox 本身（通过 ::before 添加图标）
    'label:has(input[type="checkbox"])': {
      fontSize: '0 !important',
      lineHeight: '0 !important',
      display: 'inline-flex !important',
      alignItems: 'center !important',
      verticalAlign: 'middle !important',
    },
    
    // Match case - Aa 图标
    'input[name="case"]::before': {
      content: '"Aa"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '16px',
      fontWeight: '400',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      color: 'var(--md-sys-color-outline)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'input[name="case"]:checked::before': {
      fontWeight: '700',
      color: 'var(--md-sys-color-on-surface)',
    },
    
    // RegExp - .* 图标
    'input[name="re"]::before': {
      content: '".*"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '16px',
      fontWeight: '400',
      fontFamily: 'ui-monospace, monospace',
      color: 'var(--md-sys-color-outline)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'input[name="re"]:checked::before': {
      fontWeight: '700',
      color: 'var(--md-sys-color-on-surface)',
    },
    
    // By word - "W" 图标
    'input[name="word"]::before': {
      content: '"W"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '16px',
      fontWeight: '400',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      color: 'var(--md-sys-color-outline)',
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    'input[name="word"]:checked::before': {
      fontWeight: '700',
      color: 'var(--md-sys-color-on-surface)',
      textDecorationThickness: '2px',
    },
  });

  // 自定义键盘快捷键 - 使用高优先级
  const customKeymap = Prec.highest(keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => {
        if (onSave) {
          onSave();
          return true;
        }
        return false;
      },
    },
    {
      key: 'Ctrl-Shift-Enter',
      run: () => {
        if (onSaveInPlace) {
          onSaveInPlace();
          return true;
        }
        return false;
      },
    },
    {
      key: 'Ctrl-f',
      run: (view) => {
        // 打开搜索面板
        openSearchPanel(view);
        return true;
      },
    },
    {
      key: 'Escape',
      run: (view) => {
        closeSearchPanel(view);
        return true;
      },
    },
  ]));

  return (
    <div className="h-full w-full relative overflow-hidden" ref={editorRef}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[markdown(), search({ top: false }), customKeymap, theme]}
        readOnly={readOnly}
        className="h-full w-full"
        onCreateEditor={(editor) => setView(editor)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: false, // 禁用默认搜索键，使用自定义的
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};

export default PromptEditor;
