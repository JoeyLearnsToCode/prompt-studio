import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import Editor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import { useSettingsStore } from '@/store/settingsStore';
import { useI18nStore } from '@/store/i18nStore';
import { Icons } from '@/components/icons/Icons';
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

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.setSelection(model.getFullModelRange());
      }
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      let textToCopy = '';
      if (selection && !selection.isEmpty()) {
        textToCopy = editorRef.current.getModel()?.getValueInRange(selection) || '';
      } else {
        textToCopy = editorRef.current.getValue();
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).catch(console.error);
      }
      editorRef.current.focus();
    }
  };

  const handleSelectLine = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      const position = editorRef.current.getPosition();
      const model = editorRef.current.getModel();
      if (position && model) {
        const { lineNumber } = position;
        const lineContent = model.getLineContent(lineNumber);
        editorRef.current.setSelection({
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: lineContent.length + 1,
        });
      }
    }
  };

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
          padding: { top: 0, bottom: 10 },
          lineNumbers: 'on',
          lineNumbersMinChars: 2,
          renderLineHighlight: 'all',
          folding: false,
          scrollbar: {
            verticalScrollbarSize: 7,
            horizontalScrollbarSize: 7,
          },
        }}
      />
      {isTouchDevice && (
        <div className="absolute right-5 top-[60%] flex flex-col gap-3 p-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl z-50">
          <button
            onClick={handleSelectAll}
            className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Select All"
          >
            <Icons.TextSelect className="lucide lucide-text-select-icon lucide-text-select w-6 h-6" />
          </button>
          <button
            onClick={handleSelectLine}
            className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Select Line"
          >
            <Icons.RowSelect className="lucide lucide-row-select" />
          </button>
          <button
            onClick={handleCopy}
            className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Copy"
          >
            <Icons.Copy className="lucide lucide-copy-icon lucide-copy w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
});

export default PromptEditor;