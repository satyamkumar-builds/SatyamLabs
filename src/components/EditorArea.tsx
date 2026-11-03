import { useRef, useMemo, useImperativeHandle, forwardRef, useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { undo, redo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { X, ChevronRight, Sparkles, Plus } from 'lucide-react';
import type { FileItem, TabItem, EditorSettings } from '../types';
import { getFileIcon } from '../utils/fileIcons';
import { getCodeMirrorExtension } from '../utils/codeMirrorHelper';
import { getCodeMirrorTheme, THEME_CONFIGS } from '../utils/themeHelper';
import { getLanguageSnippets, getBoilerplateForFile } from '../utils/snippetHelper';
import { STARTER_TEMPLATES, type ProjectTemplate } from '../utils/starterTemplates';

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
  onLoadTemplate?: (template: ProjectTemplate) => void;
  onCreateFile?: () => void;
}

export const EditorArea = forwardRef<EditorAreaHandle, EditorAreaProps>(
  ({ files, activeFile, tabs, onSelectTab, onCloseTab, onChangeContent, settings, onLoadTemplate, onCreateFile }, ref) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);
    const [cursorLine, setCursorLine] = useState(1);
    const [cursorCol, setCursorCol] = useState(1);

    const themeConf = THEME_CONFIGS[settings.theme] || THEME_CONFIGS['dark-plus'];

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

    // Language syntax extensions
    const languageExtensions = useMemo(() => {
      if (!activeFile) return [];
      return getCodeMirrorExtension(activeFile.language);
    }, [activeFile?.language]);

    // Intelligent Snippets extension
    const snippetExtension = useMemo(() => {
      if (!activeFile) return [];
      return [getLanguageSnippets(activeFile.language)];
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

    // Dynamic theme extensions
    const dynamicThemeExtensions = useMemo(() => {
      return getCodeMirrorTheme(
        settings.theme,
        settings.fontSize,
        settings.fontFamily || 'Consolas'
      );
    }, [settings.theme, settings.fontSize, settings.fontFamily]);

    // Line/char counts
    const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
    const isFileEmpty = !activeFile?.content || activeFile.content.trim().length === 0;

    // Insert starter boilerplate for empty file
    const handleInsertBoilerplate = () => {
      if (!activeFile) return;
      const boilerplate = getBoilerplateForFile(activeFile.name);
      if (boilerplate) {
        onChangeContent(activeFile.id, boilerplate);
      }
    };

    // Welcome screen when no file is active
    if (!activeFile) {
      return (
        <div 
          className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none font-sans overflow-y-auto"
          style={{ backgroundColor: themeConf.bg, color: themeConf.text }}
        >
          <div className="max-w-md w-full my-auto py-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="./logo.svg" alt="SatyamLabs" className="w-12 h-12" />
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  SatyamLabs Studio
                </h1>
                <p className="text-[11px] opacity-75">Mobile & Web Native Coding Environment</p>
              </div>
            </div>

            <p className="text-xs mb-5 opacity-60">
              Select an existing file or launch a new programming lab:
            </p>

            {/* Quick 1-Tap Template Launchers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
              <button
                onClick={() => {
                  const tmpl = STARTER_TEMPLATES.find(t => t.id === 'c-lab');
                  if (tmpl && onLoadTemplate) onLoadTemplate(tmpl);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 hover:brightness-125 cursor-pointer"
                style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  C
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white">C Lab</div>
                  <div className="text-[10px] opacity-60 truncate">Pure C · GCC 14</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const tmpl = STARTER_TEMPLATES.find(t => t.id === 'cpp-lab');
                  if (tmpl && onLoadTemplate) onLoadTemplate(tmpl);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 hover:brightness-125 cursor-pointer"
                style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  C++
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white">C++ Lab</div>
                  <div className="text-[10px] opacity-60 truncate">GCC · Fast Compiling</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const tmpl = STARTER_TEMPLATES.find(t => t.id === 'java-lab');
                  if (tmpl && onLoadTemplate) onLoadTemplate(tmpl);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 hover:brightness-125 cursor-pointer"
                style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  Java
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white">Java OOP</div>
                  <div className="text-[10px] opacity-60 truncate">OpenJDK Engine</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const tmpl = STARTER_TEMPLATES.find(t => t.id === 'python-lab');
                  if (tmpl && onLoadTemplate) onLoadTemplate(tmpl);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 hover:brightness-125 cursor-pointer"
                style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  Py
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white">Python 3</div>
                  <div className="text-[10px] opacity-60 truncate">Online / In-Device</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const tmpl = STARTER_TEMPLATES.find(t => t.id === 'web-modern');
                  if (tmpl && onLoadTemplate) onLoadTemplate(tmpl);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 hover:brightness-125 cursor-pointer col-span-2 sm:col-span-1"
                style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  Web
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white">Web App</div>
                  <div className="text-[10px] opacity-60 truncate">HTML · CSS · JS</div>
                </div>
              </button>
            </div>

            {/* Existing Files in Workspace */}
            {files.filter(f => !f.isFolder).length > 0 && (
              <div className="text-left mb-4 p-3 rounded-xl border" style={{ backgroundColor: themeConf.sidebarBg, borderColor: themeConf.border }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: themeConf.accent }}>
                  Files In Workspace
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {files.filter(f => !f.isFolder).map((file) => (
                    <button
                      key={file.id}
                      onClick={() => onSelectTab(file.id)}
                      className="flex items-center justify-between w-full p-2 rounded-lg text-xs transition-colors hover:brightness-125 cursor-pointer"
                      style={{ backgroundColor: themeConf.bg, color: themeConf.text }}
                    >
                      <span className="flex items-center gap-2 font-mono truncate">
                        {getFileIcon(file.name, false)}
                        {file.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono opacity-60">
                        {file.language}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New File Button */}
            {onCreateFile && (
              <button
                onClick={onCreateFile}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                style={{ backgroundColor: themeConf.accent }}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Custom File</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div 
        className="flex-1 flex flex-col h-full overflow-hidden font-sans"
        style={{ backgroundColor: themeConf.bg, color: themeConf.text }}
      >
        {/* ─── Tab Bar ─── */}
        <div 
          className="flex items-center overflow-x-auto select-none no-scrollbar shrink-0 border-b"
          style={{ backgroundColor: themeConf.activityBg, borderColor: themeConf.border }}
        >
          {tabs.map((tab) => {
            const file = files.find((f) => f.id === tab.fileId);
            if (!file) return null;
            const isActive = file.id === activeFile.id;

            return (
              <div
                key={tab.fileId}
                onClick={() => onSelectTab(file.id)}
                className={`group flex items-center gap-2 pl-3 pr-2 h-9 text-xs cursor-pointer shrink-0 transition-colors border-r ${
                  isActive ? 'font-medium' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: isActive ? themeConf.tabActiveBg : themeConf.tabBg,
                  color: isActive ? themeConf.text : themeConf.textMuted,
                  borderColor: themeConf.border,
                  borderTop: isActive ? `2px solid ${themeConf.accent}` : 'none',
                }}
              >
                {getFileIcon(file.name, false)}
                <span className="text-xs font-mono">{file.name}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className={`ml-1 p-0.5 rounded transition-colors ${
                    isActive
                      ? 'opacity-80 hover:opacity-100 hover:bg-white/10'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-white/10'
                  }`}
                  title="Close Tab"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* ─── Breadcrumb Navigation Bar ─── */}
        <div 
          className="h-6 flex items-center justify-between px-3 text-[11px] border-b shrink-0 select-none overflow-hidden"
          style={{ 
            backgroundColor: themeConf.bg, 
            borderColor: themeConf.border, 
            color: themeConf.textMuted 
          }}
        >
          <div className="flex items-center gap-1 truncate">
            <span>SatyamLabs</span>
            <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
            <span className="flex items-center gap-1 font-mono text-xs" style={{ color: themeConf.text }}>
              {getFileIcon(activeFile.name, false)}
              {activeFile.name}
            </span>
          </div>

          {/* Quick Boilerplate Hint */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] hidden sm:inline" style={{ color: themeConf.accent }}>
              💡 Type <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono">!</kbd> or <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono">main</kbd> for snippets
            </span>
          </div>
        </div>

        {/* ─── Code Editor with Autocomplete & Snippets ─── */}
        <div className="flex-1 overflow-hidden relative">
          <CodeMirror
            ref={cmRef}
            value={activeFile.content}
            height="100%"
            theme={settings.theme === 'light' ? 'light' : 'dark'}
            extensions={[
              ...languageExtensions,
              ...snippetExtension,
              ...dynamicThemeExtensions,
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

          {/* 1-Tap Boilerplate Card if File is Empty */}
          {isFileEmpty && (
            <div className="absolute top-6 left-16 z-20 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl max-w-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: themeConf.accent }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Empty File Detected</span>
              </div>
              <p className="text-[11px] mb-2.5 opacity-80" style={{ color: themeConf.text }}>
                Start writing code, type <code className="font-mono text-cyan-400">!</code> or tap below to insert the starter boilerplate:
              </p>
              <button
                onClick={handleInsertBoilerplate}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-white transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                style={{ backgroundColor: themeConf.accent }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert {activeFile.language.toUpperCase()} Boilerplate</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── SatyamLabs Status Bar ─── */}
        <footer 
          className="h-5 text-white text-[11px] px-3 flex items-center justify-between select-none shrink-0 font-sans"
          style={{ backgroundColor: themeConf.statusBg }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SatyamLabs
            </span>
            <span className="hidden sm:inline opacity-90">main</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>Ln {cursorLine}, Col {cursorCol}</span>
            <span className="hidden sm:inline">Spaces: {settings.tabSize}</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span className="uppercase font-semibold">{activeFile.language}</span>
            <span className="hidden sm:inline opacity-75">{lineCount} lines</span>
          </div>
        </footer>
      </div>
    );
  }
);

EditorArea.displayName = 'EditorArea';
