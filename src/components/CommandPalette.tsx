import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  FilePlus,
  Terminal,
  FolderTree,
  Download,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { FileItem } from '../types';
import { getFileIcon } from '../utils/fileIcons';

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  category?: string;
  icon: typeof Play;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onSelectFile: (fileId: string) => void;
  onRun: () => void;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onDownloadZip: () => void;
  onCreateFile: () => void;
}

export const CommandPalette = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onRun,
  onToggleTerminal,
  onToggleSidebar,
  onOpenSettings,
  onOpenTemplates,
  onDownloadZip,
  onCreateFile,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'cmd-run',
      label: 'Run Code: Execute Active File',
      shortcut: 'Ctrl+Enter',
      category: 'Runner',
      icon: Play,
      action: () => { onRun(); onClose(); },
    },
    {
      id: 'cmd-newfile',
      label: 'File: Create New File',
      category: 'File',
      icon: FilePlus,
      action: () => { onCreateFile(); onClose(); },
    },
    {
      id: 'cmd-terminal',
      label: 'View: Toggle Terminal / Output Panel',
      shortcut: 'Ctrl+`',
      category: 'View',
      icon: Terminal,
      action: () => { onToggleTerminal(); onClose(); },
    },
    {
      id: 'cmd-sidebar',
      label: 'View: Toggle Primary Side Bar',
      shortcut: 'Ctrl+B',
      category: 'View',
      icon: FolderTree,
      action: () => { onToggleSidebar(); onClose(); },
    },
    {
      id: 'cmd-templates',
      label: 'Preferences: Open Starter Templates',
      category: 'Templates',
      icon: Layers,
      action: () => { onOpenTemplates(); onClose(); },
    },
    {
      id: 'cmd-settings',
      label: 'Preferences: Open Settings (UI)',
      shortcut: 'Ctrl+,',
      category: 'Preferences',
      icon: Settings,
      action: () => { onOpenSettings(); onClose(); },
    },
    {
      id: 'cmd-download',
      label: 'Export: Download Project as ZIP',
      category: 'Export',
      icon: Download,
      action: () => { onDownloadZip(); onClose(); },
    },
  ];

  // Filter commands and files based on query
  const isCommandMode = query.startsWith('>');
  const cleanQuery = isCommandMode ? query.slice(1).trim().toLowerCase() : query.trim().toLowerCase();

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(cleanQuery)
  );

  const filteredFiles = files
    .filter((f) => !f.isFolder)
    .filter((f) => f.name.toLowerCase().includes(cleanQuery));

  type ListItem =
    | { type: 'cmd'; item: CommandItem }
    | { type: 'file'; item: FileItem };

  let combinedList: ListItem[] = [];
  if (isCommandMode) {
    combinedList = filteredCommands.map((c) => ({ type: 'cmd', item: c }));
  } else if (!cleanQuery) {
    combinedList = [
      ...files.filter((f) => !f.isFolder).map((f) => ({ type: 'file' as const, item: f })),
      ...commands.map((c) => ({ type: 'cmd' as const, item: c })),
    ];
  } else {
    combinedList = [
      ...filteredFiles.map((f) => ({ type: 'file' as const, item: f })),
      ...filteredCommands.map((c) => ({ type: 'cmd' as const, item: c })),
    ];
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedList.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedList.length) % Math.max(1, combinedList.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = combinedList[selectedIndex];
      if (current) {
        if (current.type === 'cmd') {
          current.item.action();
        } else {
          onSelectFile(current.item.id);
          onClose();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-8 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden text-[#cccccc] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 py-2 border-b border-[#3c3c3c] bg-[#1e1e1e]">
          <Search className="w-4 h-4 text-[#858585] mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type '>' for commands or file name to search..."
            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder-[#858585]"
          />
          <span className="text-[10px] bg-[#333333] text-[#888888] px-1.5 py-0.5 rounded font-mono">
            ESC to close
          </span>
        </div>

        {/* List of items */}
        <div className="max-h-72 overflow-y-auto py-1">
          {combinedList.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-[#858585]">
              No matching commands or files found.
            </div>
          ) : (
            combinedList.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              if (entry.type === 'cmd') {
                const cmd = entry.item;
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#094771] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Icon className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                      <span className="truncate">{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] bg-[#1e1e1e] text-[#cccccc] px-1.5 py-0.5 rounded border border-[#3c3c3c] font-mono shrink-0 ml-2">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              } else {
                const file = entry.item;
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      onSelectFile(file.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#094771] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(file.name, false)}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[11px] text-[#858585] uppercase font-mono">
                      {file.language}
                    </span>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-3 py-1 bg-[#1e1e1e] border-t border-[#3c3c3c] flex items-center justify-between text-[11px] text-[#858585]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Open & Command Palette
          </span>
          <span>Tip: type &gt; for commands</span>
        </div>
      </div>
    </div>
  );
};
