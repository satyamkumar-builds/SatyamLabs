import { useState, useRef } from 'react';
import {
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  Search,
  Smartphone,
  Upload,
  FolderUp,
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
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onLoadTemplate,
  onImportFiles,
  activePanel,
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
  const folderInputRef = useRef<HTMLInputElement>(null);

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

  // Handle uploaded files
  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const imported: { name: string; content: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      try {
        const text = await f.text();
        imported.push({ name: f.name, content: text });
      } catch (err) {}
    }
    if (imported.length > 0) {
      onImportFiles(imported);
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
      try {
        const text = await f.text();
        imported.push({ name: f.name, content: text });
      } catch (err) {}
    }
    if (imported.length > 0) {
      onImportFiles(imported);
    }
  };

  const panelTitle = activePanel === 'explorer'
    ? 'EXPLORER'
    : activePanel === 'search'
    ? 'SEARCH'
    : activePanel === 'templates'
    ? 'TEMPLATES'
    : activePanel === 'github'
    ? 'SOURCE CONTROL'
    : 'EXPLORER';

  const searchResults = searchQuery.trim()
    ? files.filter(
        (f) =>
          !f.isFolder &&
          (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <aside 
      className={`w-64 bg-[#252526] flex flex-col h-full select-none shrink-0 z-20 overflow-hidden relative transition-colors ${
        isDragging ? 'bg-[#1a2333] border-2 border-dashed border-[#58a6ff]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file & folder upload inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesChosen}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
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

      {/* Panel Header */}
      <div className="h-9 flex items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-widest text-[#bbbbbb] shrink-0 border-b border-[#2b2b2b]">
        <span>{panelTitle}</span>
        {activePanel === 'explorer' && (
          <div className="flex items-center gap-1 text-[#858585]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
              title="Import / Upload Files"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
              title="Import / Upload Folder"
            >
              <FolderUp className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─── EXPLORER ─── */}
      {activePanel === 'explorer' && (
        <div className="flex-1 overflow-y-auto flex flex-col text-[13px]">
          {/* Collapsible Workspace Section */}
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#cccccc] hover:bg-[#2a2d2e] w-full text-left">
            <button
              onClick={() => setIsProjectOpen((p) => !p)}
              className="flex items-center gap-1 flex-1 min-w-0"
            >
              {isProjectOpen ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">WORKSPACE</span>
            </button>

            {/* Quick action buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => {
                  setIsCreatingFile(true);
                  setIsCreatingFolder(false);
                }}
                className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
                title="New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(true);
                  setIsCreatingFile(false);
                }}
                className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:bg-[#3c3c3c] rounded text-[#cccccc]"
                title="Upload Files"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isProjectOpen && (
            <>
              {/* New file/folder input form */}
              {(isCreatingFile || isCreatingFolder) && (
                <form onSubmit={handleCreateSubmit} className="px-4 py-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder={isCreatingFolder ? 'Folder name...' : 'filename.ext'}
                    value={newEntryName}
                    onChange={(e) => setNewEntryName(e.target.value)}
                    onBlur={() => {
                      if (!newEntryName.trim()) {
                        setIsCreatingFile(false);
                        setIsCreatingFolder(false);
                      }
                    }}
                    className="w-full bg-[#3c3c3c] text-white text-[12px] px-2 py-0.5 outline-none border border-[#007acc] rounded"
                  />
                </form>
              )}

              {/* File Tree List */}
              <div className="flex-1 py-0.5">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  const isRenaming = renamingId === file.id;
                  const indent = file.isFolder ? 'pl-3' : 'pl-5';

                  return (
                    <div
                      key={file.id}
                      onClick={() => !file.isFolder && onSelectFile(file.id)}
                      className={`group flex items-center justify-between ${indent} pr-2 h-[26px] cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#37373d] text-white font-medium'
                          : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
                        {file.isFolder && (
                          <ChevronRight className="w-3 h-3 shrink-0 text-[#858585]" />
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
                              className="w-full bg-[#3c3c3c] text-white text-[12px] px-1 outline-none border border-[#007acc] rounded-xs"
                            />
                          </form>
                        ) : (
                          <span className="truncate text-xs font-mono">{file.name}</span>
                        )}
                      </div>

                      {/* Rename and Delete on hover */}
                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 text-[#858585]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(file.id);
                            setRenameValue(file.name);
                          }}
                          className="p-1 hover:text-white rounded"
                          title="Rename"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          className="p-1 hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upload Action Bar */}
              <div className="border-t border-[#2b2b2b] p-2 flex gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] rounded border border-[#3c3c3c] transition-colors"
                  title="Upload Files from Computer / Phone"
                >
                  <Upload className="w-3 h-3 text-[#58a6ff]" />
                  <span>Upload Files</span>
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] rounded border border-[#3c3c3c] transition-colors"
                  title="Upload Entire Folder"
                >
                  <FolderUp className="w-3 h-3 text-amber-400" />
                  <span>Upload Folder</span>
                </button>
              </div>
            </>
          )}

          {/* Android Mobile App Card */}
          <div className="p-3 mx-2 my-2 rounded-xl bg-gradient-to-br from-[#1b2333] to-[#121824] border border-[#26354f]">
            <div className="flex items-center gap-1.5 text-[#58a6ff] text-xs font-semibold mb-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>SatyamLabs Android</span>
            </div>
            <p className="text-[11px] text-[#8b949e] mb-2 leading-relaxed">
              Ultra-fast mobile coding app with zero latency and full offline support.
            </p>
            <a
              href="https://github.com/satyamkumar-builds/SatyamLabs/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Get Android APK
            </a>
          </div>
        </div>
      )}

      {/* ─── SEARCH ─── */}
      {activePanel === 'search' && (
        <div className="flex-1 p-3 flex flex-col overflow-hidden">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-[8px] text-[#858585]" />
            <input
              type="text"
              autoFocus
              placeholder="Search in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] text-white text-xs pl-8 pr-2 py-1.5 rounded border border-[#3c3c3c] focus:border-[#007acc] outline-none font-sans"
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
                onClick={() => onSelectFile(file.id)}
                className="p-2 hover:bg-[#2a2d2e] rounded cursor-pointer mb-1 border border-transparent hover:border-[#3c3c3c]"
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

      {/* ─── TEMPLATES ─── */}
      {activePanel === 'templates' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          <div className="text-[11px] font-semibold text-[#858585] uppercase tracking-wider mb-2">
            Starter Projects
          </div>
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onLoadTemplate(tmpl)}
              className="p-2.5 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3c3c3c] hover:border-[#007acc] rounded-xl cursor-pointer transition-all"
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

      {/* ─── SOURCE CONTROL ─── */}
      {activePanel === 'github' && (
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 mb-3 text-[#58a6ff]">
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white mb-1">SatyamLabs</p>
          <p className="text-xs text-[#858585] mb-3">Open-Source HyperIDE</p>
          <a
            href="https://github.com/satyamkumar-builds/SatyamLabs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      )}
    </aside>
  );
};
