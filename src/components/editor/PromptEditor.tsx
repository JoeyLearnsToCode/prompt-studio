import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import Editor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import { useSettingsStore } from '@/store/settingsStore';
import { useI18nStore } from '@/store/i18nStore';
// import { editor } from 'monaco-editor';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSaveInPlace?: () => void;
  onFocusVersionName?: () => void;
  readOnly?: boolean;
}

export interface PromptEditorRef {
  focus: () => void;
}

const PromptEditor = forwardRef<PromptEditorRef, PromptEditorProps>(({
  value,
  onChange,
  onSave,
  onSaveInPlace,
  onFocusVersionName,
  readOnly = false,
}, ref) => {
  const { editorFontSize, editorLineHeight } = useSettingsStore();
  const currentLocale = useI18nStore((state) => state.currentLocale);
  const editorRef = useRef<any | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Configure Monaco loader for i18n
  loader.config({
    paths: {
      // 显式指定 CDN 路径，防止 loader 使用默认的 0.55.1 版本（有问题）
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs',
    },
    'vs/nls': {
      availableLanguages: {
        '*': currentLocale === 'zh-CN' ? 'zh-cn' : 'en',
      },
    },
  });

  // Keep latest callbacks in refs to avoid stale closures in Monaco commands
  const onSaveRef = useRef(onSave);
  const onSaveInPlaceRef = useRef(onSaveInPlace);
  const onFocusVersionNameRef = useRef(onFocusVersionName);

  // Update refs when props change
  useEffect(() => {
    onSaveRef.current = onSave;
    onSaveInPlaceRef.current = onSaveInPlace;
    onFocusVersionNameRef.current = onFocusVersionName;
  }, [onSave, onSaveInPlace, onFocusVersionName]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
        // Move cursor to end
        const model = editorRef.current.getModel();
        if (model) {
          const lastLine = model.getLineCount();
          const lastColumn = model.getLineMaxColumn(lastLine);
          editorRef.current.setPosition({ lineNumber: lastLine, column: lastColumn });
        }
      }
    },
  }), []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define M3 Theme
    monaco.editor.defineTheme('m3-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', foreground: '1b1c18', background: 'fdfcf5' },
      ],
      colors: {
        'editor.background': '#fdfcf5',
        'editor.foreground': '#1b1c18',
        'editorCursor.foreground': '#a8c548',
        'editor.selectionBackground': '#d9f799',
        'editorLineNumber.foreground': '#2a2b24',
        'editorGutter.background': '#e4e3d6',
        'editor.lineHighlightBackground': '#00000000', // Transparent to match previous style or customize
        'editor.findMatchHighlightBackground': '#E1A95F66', // ~40% opacity
        'editor.findMatchBackground': '#E1A95F', // Solid or high opacity
      }
    });

    monaco.editor.setTheme('m3-theme');

    // Keybindings
    // Ctrl+Enter: Save In Place
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onSaveInPlaceRef.current) onSaveInPlaceRef.current();
    });

    // Ctrl+Shift+Enter: Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSaveRef.current) onSaveRef.current();
    });

    // Ctrl+S: Save In Place
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSaveInPlaceRef.current) onSaveInPlaceRef.current();
    });

    // Ctrl+Shift+S: Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => {
      if (onSaveRef.current) onSaveRef.current();
    });
    
    // Shift+Tab: Focus Version Name
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
      if (onFocusVersionNameRef.current) onFocusVersionNameRef.current();
    });
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      <Editor
        key={currentLocale}
        height="100%"
        width="100%"
        language="markdown"
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          fontSize: editorFontSize,
          lineHeight: Math.round(editorFontSize * editorLineHeight),
          fontFamily: 'ui-monospace, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          lineNumbersMinChars: 1,
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
});

export default PromptEditor;