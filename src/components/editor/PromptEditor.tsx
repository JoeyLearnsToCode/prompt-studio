import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import Editor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import { useSettingsStore } from '@/store/settingsStore';
import { useI18nStore } from '@/store/i18nStore';
import { Icons } from '@/components/icons/Icons';
import { colors } from '@/styles/tokens';

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

const PromptEditor = forwardRef<PromptEditorRef, PromptEditorProps>(
  ({ value, onChange, onSave, onSaveInPlace, onFocusVersionName, readOnly = false }, ref) => {
    const { editorFontSize, editorLineHeight } = useSettingsStore();
    const currentLocale = useI18nStore((state) => state.currentLocale);
    const editorRef = useRef<any | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs',
      },
      'vs/nls': {
        availableLanguages: {
          '*': currentLocale === 'zh-CN' ? 'zh-cn' : 'en',
        },
      },
    });

    const onSaveRef = useRef(onSave);
    const onSaveInPlaceRef = useRef(onSaveInPlace);
    const onFocusVersionNameRef = useRef(onFocusVersionName);

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

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (editorRef.current) {
            editorRef.current.focus();
            const model = editorRef.current.getModel();
            if (model) {
              const lastLine = model.getLineCount();
              const lastColumn = model.getLineMaxColumn(lastLine);
              editorRef.current.setPosition({ lineNumber: lastLine, column: lastColumn });
            }
          }
        },
      }),
      []
    );

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Updated M3/Sage Theme
      // Note: Background must match the card background (surface/surface-dark)
      const isDark = document.documentElement.classList.contains('dark');
      // Using explicit values from tokens.js
      const surfaceColor = isDark ? colors.surface.dark : colors.surface.DEFAULT;
      const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
      const lineNumberColor = isDark ? colors.text.dark.muted : colors.text.light.muted;
      const gutterColor = isDark ? colors.surface.dark : colors.surface.variant; // Slightly diff logic in original but mapped to tokens

      monaco.editor.defineTheme('prompt-studio-theme', {
        base: isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
          {
            token: '',
            foreground: textColor,
            background: surfaceColor,
          },
        ],
        colors: {
          'editor.background': surfaceColor,
          'editor.foreground': textColor,
          'editorCursor.foreground': colors.primary.DEFAULT,
          'editor.selectionBackground': colors.primary.selection,
          'editorLineNumber.foreground': lineNumberColor,
          'editorGutter.background': gutterColor,
          'editor.lineHighlightBackground': colors.primary.editorBackground,
        },
      });

      monaco.editor.setTheme('prompt-studio-theme');

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (onSaveInPlaceRef.current) onSaveInPlaceRef.current();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        if (onSaveRef.current) onSaveRef.current();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (onSaveInPlaceRef.current) onSaveInPlaceRef.current();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => {
        if (onSaveRef.current) onSaveRef.current();
      });

      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Tab, () => {
        if (onFocusVersionNameRef.current) onFocusVersionNameRef.current();
      });
    };

    return (
      <div className="h-full w-full relative overflow-hidden rounded-b-xl">
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
            padding: { top: 5, bottom: 10 },
            lineNumbers: 'on',
            lineNumbersMinChars: 2,
            renderLineHighlight: 'none', // Cleaner look
            folding: false,
            scrollbar: {
              verticalScrollbarSize: 7,
              horizontalScrollbarSize: 7,
              useShadows: false,
            },
            overviewRulerLanes: 1,
            overviewRulerBorder: false,
          }}
        />
        {isTouchDevice && (
          <div className="absolute right-5 top-[60%] flex flex-col gap-3 p-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl z-50">
            <button
              onClick={handleSelectAll}
              className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
              title="Select All"
            >
              <Icons.TextSelect className="w-6 h-6" />
            </button>
            <button
              onClick={handleSelectLine}
              className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
              title="Select Line"
            >
              <Icons.RowSelect />
            </button>
            <button
              onClick={handleCopy}
              className="p-3 text-gray-600 bg-white/40 rounded-xl transition-all active:scale-95 shadow-sm"
              title="Copy"
            >
              <Icons.Copy className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default PromptEditor;
