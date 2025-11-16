import React from 'react';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { search } from '@codemirror/search';
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

  // M3 主题 - 提高对比度
  const theme = EditorView.theme({
    '&': {
      color: '#1b1c18',
      backgroundColor: '#fdfcf5',
      fontSize: `${editorFontSize}px`,
      lineHeight: editorLineHeight.toString(),
    },
    '.cm-content': {
      caretColor: '#a8c548',
      padding: '1rem',
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
  ]));

  return (
    <div className="h-full flex flex-col border border-surface-variant rounded-m3-medium overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[markdown(), search(), customKeymap, theme]}
        readOnly={readOnly}
        className="flex-1 overflow-auto"
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
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};

export default PromptEditor;
