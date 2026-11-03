import { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  Search,
  Upload,
  X,
  FolderTree,
  LayoutTemplate,
} from 'lucide-react';
import type { FileItem, ActivePanel } from '../types';
import { getFileIcon } from '../utils/fileIcons';
import { STARTER_TEMPLATES, type ProjectTemplate } from '../utils/starterTemplates';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, isFolder: boolean, parentPath?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onLoadTemplate: (template: ProjectTemplate) => void;
  onImportFiles: (importedFiles: { name: string; content: string }[]) => void;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onLoadTemplate,
  onImportFiles,
  activePanel,
  setActivePanel,
}: SidebarProps) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryName.trim()) return;
    onCreateFile(newEntryName.trim(), isCreatingFolder);
    setNewEntryName('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameFile(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  // Handle uploaded files (supports individual code files & .zip archives)
  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const imported: { name: string; content: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(f);
          for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir) {
              const text = await zipEntry.async('string');
              const fileName = relativePath.split('/').pop() || relativePath;
              if (fileName && !fileName.startsWith('.')) {
                imported.push({ name: fileName, content: text });
              }
            }
          }
        } catch (err) {
          console.error('Failed to unpack zip file:', err);
        }
      } else {
        try {
          const text = await f.text();
          imported.push({ name: f.name, content: text });
        } catch (err) {
          console.error('Failed to read file:', err);
        }
      }
    }

    if (imported.length > 0) {
      onImportFiles(imported);
      setActivePanel('explorer');
    }
    e.target.value = '';
  };

  // Drag & drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const imported: { name: string; content: string }[] = [];
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const f = e.dataTransfer.files[i];
      if (f.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(f);
          for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir) {
              const text = await zipEntry.async('string');
              const fileName = relativePath.split('/').pop() || relativePath;
              if (fileName && !fileName.startsWith('.')) {
                imported.push({ name: fileName, content: text });
              }
            }
          }
        } catch (err) {}
      } else {
        try {
          const text = await f.text();
          imported.push({ name: f.name, content: text });
        } catch (err) {}
      }
    }
    if (imported.length > 0) {
      onImportFiles(imported);
      setActivePanel('explorer');
    }
  };

  const searchResults = searchQuery.trim()
    ? files.filter(
        (f) =>
          !f.isFolder &&
          (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        onClick={onClose}
      />

      <aside 
        className={`fixed md:relative inset-y-0 left-0 w-80 max-w-[85vw] md:w-64 bg-[#252526] flex flex-col h-full select-none shrink-0 z-50 md:z-20 overflow-hidden shadow-2xl md:shadow-none transition-transform animate-in slide-in-from-left duration-200 ${
          isDragging ? 'bg-[#1a2333] border-2 border-dashed border-[#58a6ff]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden file upload input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          onChange={handleFilesChosen}
          className="hidden"
        />

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 pointer-events-none p-4 text-center">
            <Upload className="w-8 h-8 mb-2 animate-bounce text-cyan-300" />
            <span className="font-semibold text-xs">Drop files to import into SatyamLabs</span>
          </div>
        )}

        {/* ─── Navigation Tabs Strip (Never get stuck in Templates) ─── */}
        <div className="h-12 md:h-10 flex items-center justify-between px-2 bg-[#1e1e24] border-b border-[#2d2d30] shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActivePanel('explorer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'explorer'
                  ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-xs'
                  : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/5'
              }`}
              title="View Workspace Files"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>

            <button
              onClick={() => setActivePanel('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'templates'
                  ? 'bg-cyan-600/25 text-cyan-400 border border-cyan-500/40 shadow-xs'
                  : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/5'
              }`}
              title="Starter Templates"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActivePanel('search')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activePanel === 'search'
                  ? 'bg-purple-600/25 text-purple-400 border border-purple-500/40 shadow-xs'
                  : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/5'
              }`}
              title="Search Code"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg text-[#858585] hover:text-white"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── EXPLORER PANEL ─── */}
        {activePanel === 'explorer' && (
          <div className="flex-1 overflow-y-auto flex flex-col text-[13px]">
            {/* Quick Action Buttons Bar - Large comfortable touch targets */}
            <div className="p-2.5 border-b border-[#2b2b2b] grid grid-cols-3 gap-1.5 bg-[#1b1b1e]">
              <button
                onClick={() => {
                  setIsCreatingFile(true);
                  setIsCreatingFolder(false);
                }}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 active:scale-95 text-xs font-medium transition-all cursor-pointer"
                title="Create New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>+ File</span>
              </button>

              <button
                onClick={() => {
                  setIsCreatingFolder(true);
                  setIsCreatingFile(false);
                }}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-white/5 text-[#cccccc] border border-white/10 hover:bg-white/10 active:scale-95 text-xs font-medium transition-all cursor-pointer"
                title="Create New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Folder</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 active:scale-95 text-xs font-medium transition-all cursor-pointer"
                title="Upload Files or ZIP Project"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>

            {/* Collapsible Workspace Section Header */}
            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#cccccc] hover:bg-[#2a2d2e] w-full text-left">
              <button
                onClick={() => setIsProjectOpen((p) => !p)}
                className="flex items-center gap-1 flex-1 min-w-0"
              >
                {isProjectOpen ? (
                  <ChevronDown className="w-4 h-4 shrink-0 text-[#858585]" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#858585]" />
                )}
                <span className="truncate">WORKSPACE ({files.filter(f => !f.isFolder).length} files)</span>
              </button>
            </div>

            {isProjectOpen && (
              <>
                {/* New file/folder input form */}
                {(isCreatingFile || isCreatingFolder) && (
                  <form onSubmit={handleCreateSubmit} className="px-3 py-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder={isCreatingFolder ? 'Folder name...' : 'filename.ext (e.g. main.cpp)'}
                      value={newEntryName}
                      onChange={(e) => setNewEntryName(e.target.value)}
                      onBlur={() => {
                        if (!newEntryName.trim()) {
                          setIsCreatingFile(false);
                          setIsCreatingFolder(false);
                        }
                      }}
                      className="w-full bg-[#3c3c3c] text-white text-xs px-2.5 py-1.5 outline-none border border-[#007acc] rounded-lg font-mono shadow-xs"
                    />
                  </form>
                )}

                {/* File Tree List */}
                <div className="flex-1 py-1">
                  {files.map((file) => {
                    const isActive = file.id === activeFileId;
                    const isRenaming = renamingId === file.id;
                    const indent = file.isFolder ? 'pl-3' : 'pl-4';

                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          if (!file.isFolder) {
                            onSelectFile(file.id);
                            if (window.innerWidth < 768) onClose();
                          }
                        }}
                        className={`group flex items-center justify-between ${indent} pr-2.5 h-10 md:h-8 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#37373d] text-white font-medium border-l-2 border-blue-400'
                            : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                          {file.isFolder && (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#858585]" />
                          )}
                          {getFileIcon(file.name, file.isFolder)}
                          {isRenaming ? (
                            <form
                              onSubmit={(e) => handleRenameSubmit(e, file.id)}
                              className="flex-1 min-w-0"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={(e) => handleRenameSubmit(e, file.id)}
                                className="w-full bg-[#3c3c3c] text-white text-xs px-1.5 py-0.5 outline-none border border-[#007acc] rounded font-mono"
                              />
                            </form>
                          ) : (
                            <span className="truncate text-xs font-mono">{file.name}</span>
                          )}
                        </div>

                        {/* Rename and Delete actions (visible on mobile tap & desktop hover) */}
                        <div className="flex md:hidden md:group-hover:flex items-center gap-1 shrink-0 text-[#858585]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(file.id);
                              setRenameValue(file.name);
                            }}
                            className="p-1 hover:text-white rounded"
                            title="Rename"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile(file.id);
                            }}
                            className="p-1 hover:text-red-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── SEARCH PANEL ─── */}
        {activePanel === 'search' && (
          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-[9px] text-[#858585]" />
              <input
                type="text"
                autoFocus
                placeholder="Search across files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] text-white text-xs pl-8 pr-2 py-2 rounded-lg border border-[#3c3c3c] focus:border-[#007acc] outline-none font-sans"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() && (
                <div className="text-[11px] text-[#858585] mb-2 px-1">
                  {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
                </div>
              )}
              {searchResults.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className="p-2.5 hover:bg-[#2a2d2e] rounded-lg cursor-pointer mb-1 border border-transparent hover:border-[#3c3c3c] transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs text-white mb-0.5">
                    {getFileIcon(file.name, false)}
                    <span className="font-mono">{file.name}</span>
                  </div>
                  <div className="text-[11px] text-[#858585] font-mono pl-5 truncate">
                    {file.content.slice(0, 80)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── STARTER TEMPLATES PANEL ─── */}
        {activePanel === 'templates' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[#858585] uppercase tracking-wider">
                Choose a Starter Project
              </span>
              <button
                onClick={() => setActivePanel('explorer')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                ← Back to Files
              </button>
            </div>
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  onLoadTemplate(tmpl);
                  setActivePanel('explorer');
                  if (window.innerWidth < 768) onClose();
                }}
                className="p-3 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3c3c3c] hover:border-[#007acc] rounded-xl cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{tmpl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#007acc]/20 text-[#58a6ff] font-medium">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#858585] line-clamp-2">{tmpl.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── SOURCE CONTROL / ABOUT ─── */}
        {activePanel === 'github' && (
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-white mb-1">SatyamLabs</p>
            <p className="text-xs text-[#858585] mb-3">Hyper-Performance Mobile & Web IDE</p>
            <button
              onClick={() => setActivePanel('explorer')}
              className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Back to Workspace Files
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
