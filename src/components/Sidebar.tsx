import { useState } from 'react';
import { 
  FolderPlus, 
  FilePlus, 
  Trash2, 
  Edit3, 
  X,
  Search,
  Smartphone
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
  activePanel,
  setActivePanel,
}: SidebarProps) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtered files for search
  const searchResults = searchQuery.trim()
    ? files.filter(f => !f.isFolder && (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  return (
    <aside className="w-72 bg-[#1e1e1e] border-r border-[#2b2b2b] flex flex-col h-full select-none shrink-0 z-20">
      {/* Panel Tabs Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2b2b2b] bg-[#252526]">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wider font-semibold text-[#858585]">
          <button
            onClick={() => setActivePanel('explorer')}
            className={`transition-colors ${activePanel === 'explorer' ? 'text-white border-b-2 border-[#007acc] pb-0.5' : 'hover:text-[#cccccc]'}`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActivePanel('search')}
            className={`transition-colors ${activePanel === 'search' ? 'text-white border-b-2 border-[#007acc] pb-0.5' : 'hover:text-[#cccccc]'}`}
          >
            Search
          </button>
          <button
            onClick={() => setActivePanel('templates')}
            className={`transition-colors ${activePanel === 'templates' ? 'text-white border-b-2 border-[#007acc] pb-0.5' : 'hover:text-[#cccccc]'}`}
          >
            Templates
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-[#cccccc]"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Explorer Content */}
      {activePanel === 'explorer' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#858585] bg-[#181818] border-b border-[#2b2b2b]">
            <span className="font-semibold uppercase tracking-wider">PROJECT FILES</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); }}
                className="p-1 hover:bg-[#2d2d2d] rounded text-[#cccccc]"
                title="New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); }}
                className="p-1 hover:bg-[#2d2d2d] rounded text-[#cccccc]"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New Item Input Form */}
          {(isCreatingFile || isCreatingFolder) && (
            <form onSubmit={handleCreateSubmit} className="p-2 bg-[#252526] border-b border-[#007acc]">
              <input
                type="text"
                autoFocus
                placeholder={isCreatingFolder ? "Folder name..." : "file.js, index.html..."}
                value={newEntryName}
                onChange={(e) => setNewEntryName(e.target.value)}
                onBlur={() => { if (!newEntryName.trim()) { setIsCreatingFile(false); setIsCreatingFolder(false); } }}
                className="w-full bg-[#181818] text-[#cccccc] text-xs px-2 py-1 rounded border border-[#007acc] outline-none"
              />
            </form>
          )}

          {/* File Tree List */}
          <div className="flex-1 py-1">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              const isRenaming = renamingId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => !file.isFolder && onSelectFile(file.id)}
                  className={`group flex items-center justify-between px-3 py-1 text-xs cursor-pointer transition-colors ${
                    isActive ? 'bg-[#37373d] text-white font-medium' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                    {getFileIcon(file.name, file.isFolder)}
                    
                    {isRenaming ? (
                      <form onSubmit={(e) => handleRenameSubmit(e, file.id)} className="flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={(e) => handleRenameSubmit(e, file.id)}
                          className="w-full bg-[#1e1e1e] text-white text-xs px-1 rounded border border-[#007acc] outline-none"
                        />
                      </form>
                    ) : (
                      <span className="truncate">{file.name}</span>
                    )}
                  </div>

                  {/* Rename & Delete quick buttons */}
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-[#858585]">
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

          {/* Android APK Download Card */}
          <div className="p-3 m-2 rounded-xl bg-gradient-to-br from-[#1a2333] to-[#161a22] border border-[#2b3a55]">
            <div className="flex items-center gap-2 text-[#58a6ff] text-xs font-semibold mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Android App Available</span>
            </div>
            <p className="text-[11px] text-[#8b949e] mb-2 leading-relaxed">
              Use this IDE on your Android phone with zero latency and full offline support.
            </p>
            <a
              href="https://github.com/satyamkumar-builds/SatyamLabs/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-medium rounded-lg transition-colors"
            >
              Download APK Release
            </a>
          </div>
        </div>
      )}

      {/* Search Content */}
      {activePanel === 'search' && (
        <div className="flex-1 p-3 flex flex-col">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#858585]" />
            <input
              type="text"
              placeholder="Search in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] text-[#cccccc] text-xs pl-8 pr-3 py-1.5 rounded border border-[#3c3c3c] focus:border-[#007acc] outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim() && (
              <div className="text-xs text-[#858585] mb-2">
                {searchResults.length} {searchResults.length === 1 ? 'file' : 'files'} found
              </div>
            )}
            {searchResults.map((file) => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className="p-2 mb-1.5 bg-[#252526] hover:bg-[#2d2d2d] rounded cursor-pointer border border-[#3c3c3c]"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                  {getFileIcon(file.name, false)}
                  <span>{file.name}</span>
                </div>
                <div className="text-[11px] text-[#8b949e] line-clamp-2 font-mono bg-[#181818] p-1 rounded">
                  {file.content.slice(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Content */}
      {activePanel === 'templates' && (
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="text-xs font-semibold text-[#858585] uppercase tracking-wider mb-2">
            STARTER TEMPLATES
          </div>

          <div className="space-y-2">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onLoadTemplate(tmpl)}
                className="p-2.5 bg-[#252526] hover:bg-[#2d2d2d] border border-[#3c3c3c] hover:border-[#007acc] rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{tmpl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#007acc]/20 text-[#58a6ff] font-medium">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#858585] line-clamp-2">
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
