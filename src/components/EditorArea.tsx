import { useRef, useMemo, useImperativeHandle, forwardRef, useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { undo, redo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { X, ChevronRight, Keyboard, Command } from 'lucide-react';
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

export const EditorArea = forwardRef<EditorAreaHandle, EditorAreaProps>(
  ({ files, activeFile, tabs, onSelectTab, onCloseTab, onChangeContent, settings }, ref) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);
    const [cursorLine, setCursorLine] = useState(1);
    const [cursorCol, setCursorCol] = useState(1);

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

    // Cursor position tracker extension
    const cursorExtension = useMemo(
      () =>
        EditorView.updateListener.of((update) => {
          if (update.selectionSet || update.docChanged) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            setCursorLine(line.number);
            setCursorCol(pos - line.from + 1);
          }
        }),
      []
    );

    // CodeMirror theme styling - exact VS Code Dark+
    const customTheme = useMemo(() => {
      return EditorView.theme({
        '&': {
          height: '100%',
          backgroundColor: '#1e1e1e',
        },
        '.cm-content': {
          fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', 'Menlo', monospace",
          fontSize: `${settings.fontSize}px`,
          lineHeight: '1.6',
          caretColor: '#aeafad',
          padding: '0 0 0 4px',
        },
        '.cm-cursor': {
          borderLeftColor: '#aeafad',
          borderLeftWidth: '2px',
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
          backgroundColor: '#264f78 !important',
        },
        '.cm-gutters': {
          backgroundColor: '#1e1e1e',
          color: '#858585',
          borderRight: 'none',
          fontSize: `${Math.max(settings.fontSize - 1, 11)}px`,
          minWidth: '48px',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
          color: '#c6c6c6',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
        '.cm-matchingBracket': {
          backgroundColor: 'rgba(0, 100, 0, 0.2)',
          outline: '1px solid #888',
        },
        '.cm-foldGutter': {
          width: '12px',
        },
      });
    }, [settings.fontSize, settings.theme]);

    // Line/char counts
    const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;

    // Welcome screen when no file is active
    if (!activeFile) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-[#858585] p-8 text-center select-none">
          {/* VS Code style welcome */}
          <div className="max-w-sm">
            <h1 className="text-2xl font-light text-[#cccccc] mb-6">SatyamLabs IDE</h1>

            <div className="text-left mb-6">
              <h2 className="text-[13px] font-semibold text-[#cccccc] mb-3">Start</h2>
              <div className="space-y-1.5">
                {files.filter((f) => !f.isFolder).slice(0, 3).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => onSelectTab(file.id)}
                    className="flex items-center gap-2 text-[13px] text-[#3794ff] hover:underline w-full text-left py-0.5"
                  >
                    {getFileIcon(file.name, false)}
                    Open {file.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-left mb-6">
              <h2 className="text-[13px] font-semibold text-[#cccccc] mb-3">Keyboard Shortcuts</h2>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#cccccc] flex items-center gap-1.5">
                    <Command className="w-3 h-3" /> Run Code
                  </span>
                  <kbd className="text-[11px] px-1.5 py-0.5 bg-[#2d2d2d] rounded border border-[#3c3c3c] text-[#cccccc]">
                    Ctrl+Enter
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#cccccc] flex items-center gap-1.5">
                    <Keyboard className="w-3 h-3" /> Toggle Terminal
                  </span>
                  <kbd className="text-[11px] px-1.5 py-0.5 bg-[#2d2d2d] rounded border border-[#3c3c3c] text-[#cccccc]">
                    Ctrl+`
                  </kbd>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#666666]">
              v2.0.0 · VS Code Experience on Mobile & Web
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
        {/* ─── Tab Bar ─── */}
        <div className="flex items-center bg-[#181818] overflow-x-auto select-none no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const file = files.find((f) => f.id === tab.fileId);
            if (!file) return null;
            const isActive = file.id === activeFile.id;

            return (
              <div
                key={tab.fileId}
                onClick={() => onSelectTab(file.id)}
                className={`group flex items-center gap-1.5 pl-3 pr-2 h-[35px] text-[13px] cursor-pointer shrink-0 transition-colors border-r border-[#252526] ${
                  isActive
                    ? 'bg-[#1e1e1e] text-white'
                    : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#1e1e1e]/60'
                }`}
                style={isActive ? { borderTop: '1px solid #007acc', marginTop: '-1px' } : undefined}
              >
                {getFileIcon(file.name, false)}
                <span className="text-[13px]">{file.name}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className={`ml-1 p-0.5 rounded transition-colors ${
                    isActive
                      ? 'hover:bg-[#313131] text-[#cccccc]'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-[#313131] text-[#858585]'
                  }`}
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* ─── Breadcrumb Bar ─── */}
        <div className="h-[22px] flex items-center px-3 text-[11px] text-[#a9a9a9] bg-[#1e1e1e] border-b border-[#2b2b2b] shrink-0 select-none overflow-hidden">
          <span className="text-[#cccccc]">SATYAMLABS</span>
          <ChevronRight className="w-3 h-3 mx-1 text-[#666666] shrink-0" />
          <span className="flex items-center gap-1">
            {getFileIcon(activeFile.name, false)}
            <span className="text-[#cccccc]">{activeFile.name}</span>
          </span>
        </div>

        {/* ─── Code Editor ─── */}
        <div className="flex-1 overflow-hidden relative">
          <CodeMirror
            ref={cmRef}
            value={activeFile.content}
            height="100%"
            theme={oneDark}
            extensions={[
              ...languageExtensions,
              customTheme,
              cursorExtension,
              ...(settings.wordWrap ? [EditorView.lineWrapping] : []),
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
              crosshairCursor: false,
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

        {/* ─── VS Code Status Bar ─── */}
        <footer className="h-[22px] bg-[#007acc] text-white text-[12px] px-2.5 flex items-center justify-between select-none shrink-0 font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.5 2H9l-1 2H3.5L2 6h4l1-2h2l-1 2H6L4.5 8h4l1-2h2l-1 2H9L7.5 10h4l1-2h2l-1 2H12l-1.5 2H14l2-2V4l-1.5-2z" />
              </svg>
              main
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Ln {cursorLine}, Col {cursorCol}
            </span>
            <span className="hidden sm:inline">Spaces: {settings.tabSize}</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span className="uppercase font-medium">{activeFile.language}</span>
            <span className="hidden sm:inline text-[11px] opacity-75">{lineCount} lines</span>
          </div>
        </footer>
      </div>
    );
  }
);

EditorArea.displayName = 'EditorArea';
