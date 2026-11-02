import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { undo, redo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { X, Circle } from 'lucide-react';
import type { FileItem, TabItem, EditorSettings } from '../types';
import { getFileIcon } from '../utils/fileIcons';
import { getCodeMirrorExtension } from '../utils/codeMirrorHelper';

export interface EditorAreaHandle {
  insertText: (text: string) => void;
  undo: () => void;
  redo: () => void;
}

interface EditorAreaProps {
  files: FileItem[];
  activeFile: FileItem | null;
  tabs: TabItem[];
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onChangeContent: (fileId: string, content: string) => void;
  settings: EditorSettings;
}

export const EditorArea = forwardRef<EditorAreaHandle, EditorAreaProps>(({
  files,
  activeFile,
  tabs,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  settings,
}, ref) => {
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  // Expose methods for the Mobile Keyboard Bar
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      const view = cmRef.current?.view;
      if (!view) return;
      const { state } = view;
      const { from, to } = state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    },
    undo: () => {
      const view = cmRef.current?.view;
      if (view) {
        undo(view);
        view.focus();
      }
    },
    redo: () => {
      const view = cmRef.current?.view;
      if (view) {
        redo(view);
        view.focus();
      }
    },
  }));

  // Resolve extensions for active language
  const languageExtensions = useMemo(() => {
    if (!activeFile) return [];
    return getCodeMirrorExtension(activeFile.language);
  }, [activeFile?.language]);

  // CodeMirror theme styling
  const customTheme = useMemo(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: '#1e1e1e',
      },
      '.cm-content': {
        fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', 'Menlo', monospace",
        fontSize: `${settings.fontSize}px`,
        caretColor: '#58a6ff',
      },
      '.cm-cursor': {
        borderLeftColor: '#58a6ff',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
        backgroundColor: '#264f78 !important',
      },
      '.cm-gutters': {
        backgroundColor: '#1e1e1e',
        color: '#858585',
        borderRight: '1px solid #2b2b2b',
        fontSize: `${Math.max(settings.fontSize - 2, 11)}px`,
      },
    });
  }, [settings.fontSize, settings.theme]);

  // Calculate lines and stats
  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
  const charCount = activeFile?.content ? activeFile.content.length : 0;

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-[#858585] p-6 text-center select-none">
        <img src="./logo.svg" alt="SatyamLabs" className="w-14 h-14 mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-white mb-1">SatyamLabs IDE</h3>
        <p className="text-xs max-w-xs text-[#666666] mb-4">
          Select a file from the explorer or choose a starter template from the top bar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Tabs Row */}
      <div className="flex items-center bg-[#252526] border-b border-[#2b2b2b] overflow-x-auto select-none no-scrollbar shrink-0">
        {tabs.map((tab) => {
          const file = files.find(f => f.id === tab.fileId);
          if (!file) return null;
          const isActive = file.id === activeFile.id;

          return (
            <div
              key={tab.fileId}
              onClick={() => onSelectTab(file.id)}
              className={`group flex items-center gap-2 px-3 py-2 text-xs border-r border-[#2b2b2b] cursor-pointer shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]'
                  : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#252526] hover:text-[#cccccc]'
              }`}
            >
              {getFileIcon(file.name, false)}
              <span className="font-mono text-xs">{file.name}</span>

              {tab.isDirty ? (
                <Circle className="w-2 h-2 fill-white text-white shrink-0 ml-1" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="p-0.5 hover:bg-[#333333] rounded text-[#858585] hover:text-white"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          ref={cmRef}
          value={activeFile.content}
          height="100%"
          theme={oneDark}
          extensions={[
            ...languageExtensions,
            customTheme,
            EditorView.lineWrapping,
          ]}
          onChange={(value) => onChangeContent(activeFile.id, value)}
          basicSetup={{
            lineNumbers: settings.lineNumbers,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          className="h-full"
        />
      </div>

      {/* VS Code Style Status Bar */}
      <footer className="h-5 bg-[#007acc] text-white text-[11px] px-3 flex items-center justify-between select-none shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <span>SatyamLabs</span>
          <span className="hidden sm:inline">Lines: {lineCount}</span>
          <span className="hidden sm:inline">Chars: {charCount}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="uppercase font-mono">{activeFile.language}</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">Spaces: {settings.tabSize}</span>
        </div>
      </footer>
    </div>
  );
});

EditorArea.displayName = 'EditorArea';
