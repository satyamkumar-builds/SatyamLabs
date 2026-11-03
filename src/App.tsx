import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import type { 
  FileItem, 
  TabItem, 
  ExecutionLog, 
  EditorSettings, 
  ActivePanel, 
  ViewMode 
} from './types';
import { STARTER_TEMPLATES, type ProjectTemplate } from './utils/starterTemplates';
import { getLanguageFromFilename } from './utils/fileIcons';
import { runCode, buildWebPreview } from './services/codeRunner';
import { THEME_CONFIGS } from './utils/themeHelper';
import { Navbar } from './components/Navbar';
import { ActivityBar } from './components/ActivityBar';
import { Sidebar } from './components/Sidebar';
import { EditorArea, type EditorAreaHandle } from './components/EditorArea';
import { MobileKeyboardBar } from './components/MobileKeyboardBar';
import { PreviewPanel } from './components/PreviewPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { MobileBottomBar } from './components/MobileBottomBar';

const STORAGE_KEY_FILES = 'satyamlabs_files';
const STORAGE_KEY_SETTINGS = 'satyamlabs_settings';

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  theme: 'dark-plus',
  fontFamily: 'Consolas',
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  autoRunWeb: true,
};

export function App() {
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return STARTER_TEMPLATES[0].files;
  });

  // Start with no file opened by default on app/web launch
  const [activeFileId, setActiveFileId] = useState<string>('');
  
  // Start with no tabs opened by default — launches directly to SatyamLabs Studio welcome screen
  const [tabs, setTabs] = useState<TabItem[]>([]);

  const [settings, setSettings] = useState<EditorSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      id: 'init-1',
      text: '🚀 SatyamLabs HyperIDE v2.5.0 initialized. Ready to compile and run.',
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      text: 'IntelliSense, Snippets, Offline Transpiler, and Interactive STDIN active.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const [stdin, setStdin] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('explorer');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const editorRef = useRef<EditorAreaHandle>(null);
  const themeConf = THEME_CONFIGS[settings.theme] || THEME_CONFIGS['dark-plus'];

  // Active file item with robust fallback
  const activeFile = useMemo(() => {
    if (tabs.length === 0) return null;
    if (activeFileId) {
      const found = files.find(f => f.id === activeFileId && !f.isFolder);
      if (found) return found;
    }
    const tabFile = files.find(f => f.id === tabs[0].fileId && !f.isFolder);
    return tabFile || null;
  }, [files, activeFileId, tabs]);

  // Keep activeFileId in sync with activeFile
  useEffect(() => {
    if (activeFile && activeFile.id !== activeFileId) {
      setActiveFileId(activeFile.id);
    } else if (!activeFile && activeFileId !== '') {
      setActiveFileId('');
    }
  }, [activeFile, activeFileId]);

  // Ensure activeFile is always in tabs when activeFile exists
  useEffect(() => {
    if (activeFile && !tabs.some(t => t.fileId === activeFile.id)) {
      setTabs(prev => [...prev, { fileId: activeFile.id }]);
    }
  }, [activeFile, tabs]);

  // Persist files and settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    } catch (e) {}
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Synchronize CSS variables across entire document when theme or font changes
  useEffect(() => {
    const conf = THEME_CONFIGS[settings.theme] || THEME_CONFIGS['dark-plus'];
    document.documentElement.style.setProperty('--editor-bg', conf.bg);
    document.documentElement.style.setProperty('--editor-text', conf.text);
    document.documentElement.style.setProperty('--editor-gutter-bg', conf.bg);
    document.documentElement.style.setProperty('--editor-gutter-text', conf.textMuted);
    document.documentElement.style.setProperty('--border-color', conf.border);
    document.documentElement.style.setProperty('--accent-color', conf.accent);
    document.documentElement.style.setProperty('--sidebar-bg', conf.sidebarBg);
    document.documentElement.style.setProperty('--navbar-bg', conf.navbarBg);
    document.documentElement.style.setProperty('--activity-bg', conf.activityBg);
    document.documentElement.style.setProperty('--status-bg', conf.statusBg);
    document.documentElement.style.setProperty('--editor-active-line', `${conf.accent}18`);
    document.documentElement.style.setProperty('--editor-font', settings.fontFamily || 'Consolas');
  }, [settings.theme, settings.fontFamily]);

  // Auto-close sidebar on mobile initial render
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const isWebProject = useMemo(() => {
    return files.some(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
  }, [files]);

  // Web Preview Document Generation
  const previewSrcDoc = useMemo(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFile = files.find(f => f.name.endsWith('.css'));
    const jsFile = files.find(f => f.name.endsWith('.js'));

    const html = htmlFile?.content || '<h2 style="font-family:sans-serif;padding:20px;">No HTML file found</h2>';
    const css = cssFile?.content || '';
    const js = jsFile?.content || '';

    return buildWebPreview(html, css, js);
  }, [files, previewRefreshKey]);

  // Run Active File or Web Project with STDIN support
  const handleRun = useCallback(async (customStdin?: string) => {
    if (!activeFile) return;

    setIsRunning(true);
    setIsTerminalOpen(true);

    const isWebFile = ['html', 'css', 'javascript'].includes(activeFile.language);

    if (isWebFile && (viewMode === 'editor' || viewMode === 'split')) {
      setPreviewRefreshKey(k => k + 1);
      if (window.innerWidth < 768) {
        setViewMode('preview');
      } else {
        setViewMode('split');
      }
    }

    const currentStdin = customStdin !== undefined ? customStdin : stdin;
    if (customStdin !== undefined) {
      setStdin(customStdin);
    }

    // Check if code has input methods but stdin is empty
    const needsInput = activeFile.content.includes('scanf') || 
                       activeFile.content.includes('cin >>') || 
                       activeFile.content.includes('input(') || 
                       activeFile.content.includes('Scanner');
    if (needsInput && !currentStdin.trim()) {
      setLogs(prev => [
        ...prev,
        {
          id: 'hint-' + Date.now(),
          text: '💡 Tip: Your code takes input (scanf/cin). Enter input in the Terminal below and press Enter!',
          type: 'info',
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    }

    await runCode(
      activeFile.language,
      activeFile.content,
      activeFile.name,
      (log) => {
        setLogs(prev => [...prev, log]);
      },
      currentStdin
    );

    setIsRunning(false);
  }, [activeFile, viewMode, stdin]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter -> Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+B -> Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Ctrl+` -> Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      // Ctrl+P / Cmd+P or F1 -> Command Palette
      if (((e.ctrlKey || e.metaKey) && e.key === 'p') || e.key === 'F1') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  // File Operations
  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    if (!tabs.some(t => t.fileId === fileId)) {
      setTabs(prev => [...prev, { fileId }]);
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const tabIndex = tabs.findIndex(t => t.fileId === fileId);
    const nextTabs = tabs.filter(t => t.fileId !== fileId);
    setTabs(nextTabs);
    if (activeFileId === fileId) {
      if (nextTabs.length > 0) {
        const nextIndex = Math.min(tabIndex, nextTabs.length - 1);
        setActiveFileId(nextTabs[nextIndex].fileId);
      } else {
        setActiveFileId('');
      }
    }
  };

  const handleChangeContent = (fileId: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent } : f));
  };

  const handleCreateFile = (name?: string, isFolder: boolean = false) => {
    const filename = name || prompt('Enter file name (e.g. main.cpp, script.py, index.html):');
    if (!filename || !filename.trim()) return;

    const newId = 'file-' + Date.now();
    const newFile: FileItem = {
      id: newId,
      name: filename.trim(),
      path: '/' + filename.trim(),
      content: '',
      isFolder,
      language: getLanguageFromFilename(filename.trim()),
    };
    setFiles(prev => [...prev, newFile]);
    if (!isFolder) {
      setActiveFileId(newId);
      setTabs(prev => [...prev, { fileId: newId }]);
    }
  };

  const handleImportFiles = (imported: { name: string; content: string }[]) => {
    const newFileItems: FileItem[] = imported.map((item) => ({
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: item.name,
      path: '/' + item.name,
      content: item.content,
      isFolder: false,
      language: getLanguageFromFilename(item.name),
    }));

    setFiles((prev) => [...prev, ...newFileItems]);
    if (newFileItems.length > 0) {
      setActiveFileId(newFileItems[0].id);
      setTabs((prev) => [
        ...prev,
        ...newFileItems.map((f) => ({ fileId: f.id })),
      ]);
      setLogs((prev) => [
        ...prev,
        {
          id: 'import-' + Date.now(),
          text: `[SatyamLabs] Imported ${newFileItems.length} file(s) into workspace successfully!`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      handleCloseTab(fileId);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { 
      ...f, 
      name: newName, 
      language: getLanguageFromFilename(newName) 
    } : f));
  };

  const handleLoadTemplate = (template: ProjectTemplate) => {
    // Only prompt for confirmation if user is already editing an active file
    if (activeFile && !confirm(`Load "${template.name}"? Current workspace will be replaced with ${template.name}.`)) {
      return;
    }
    setFiles(template.files);
    const first = template.files.find(f => !f.isFolder);
    if (first) {
      setActiveFileId(first.id);
      setTabs(template.files.filter(f => !f.isFolder).map(f => ({ fileId: f.id })));
    }
    setActivePanel('explorer');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    setLogs([
      {
        id: 'load-' + Date.now(),
        text: `[Workspace] Loaded "${template.name}" project template.`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    files.forEach(f => {
      if (!f.isFolder) {
        zip.file(f.name, f.content);
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SatyamLabs-Project-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="flex flex-col h-full w-full min-h-screen overflow-hidden font-sans select-none"
      style={{
        backgroundColor: themeConf.bg,
        color: themeConf.text,
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        projectName={activeFile?.name || 'Workspace'}
        isRunning={isRunning}
        onRun={() => handleRun()}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen(p => !p)}
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDownloadZip={handleDownloadZip}
        onOpenTemplates={() => { setActivePanel('templates'); setIsSidebarOpen(true); }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onCreateFile={() => handleCreateFile()}
        activeFileName={activeFile?.name}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar */}
        <ActivityBar
          activePanel={activePanel}
          onSelectPanel={setActivePanel}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(p => !p)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Sidebar with Import/Upload, Search, Templates */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onLoadTemplate={handleLoadTemplate}
          onImportFiles={handleImportFiles}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />

        {/* Center Workspace (Editor + Live Preview + Terminal) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor & Preview Split Area */}
          <div className="flex-1 flex overflow-hidden">
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <EditorArea
                  ref={editorRef}
                  files={files}
                  activeFile={activeFile}
                  tabs={tabs}
                  onSelectTab={setActiveFileId}
                  onCloseTab={handleCloseTab}
                  onChangeContent={handleChangeContent}
                  settings={settings}
                  onLoadTemplate={handleLoadTemplate}
                  onCreateFile={() => handleCreateFile()}
                />
              </div>
            )}

            {(viewMode === 'preview' || viewMode === 'split') && (
              <PreviewPanel
                srcDoc={previewSrcDoc}
                onRefresh={() => setPreviewRefreshKey(k => k + 1)}
              />
            )}
          </div>

          {/* Mobile Keyboard Bar for touch screens */}
          <MobileKeyboardBar
            onInsertText={(text) => editorRef.current?.insertText(text)}
            onUndo={() => editorRef.current?.undo()}
            onRedo={() => editorRef.current?.redo()}
          />

          {/* Bottom Integrated Terminal with STDIN */}
          <TerminalPanel
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            logs={logs}
            onClearLogs={() => setLogs([])}
            stdin={stdin}
            onChangeStdin={setStdin}
            onRunStdin={(val) => handleRun(val)}
          />
        </div>
      </div>

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomBar
        onToggleFiles={() => {
          if (!isSidebarOpen) {
            setActivePanel('explorer');
            setIsSidebarOpen(true);
          } else {
            setIsSidebarOpen(false);
          }
        }}
        isFilesOpen={isSidebarOpen}
        fileCount={files.filter(f => !f.isFolder).length}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isRunning={isRunning}
        onRun={() => handleRun()}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen(p => !p)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isWebProject={isWebProject}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onRun={() => handleRun()}
        onToggleTerminal={() => setIsTerminalOpen(p => !p)}
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTemplates={() => { setActivePanel('templates'); setIsSidebarOpen(true); }}
        onDownloadZip={handleDownloadZip}
        onCreateFile={() => handleCreateFile()}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
      />
    </div>
  );
}

export default App;
