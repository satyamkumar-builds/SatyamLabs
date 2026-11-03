import React from 'react';
import {
  FolderTree,
  Code2,
  Play,
  Square,
  Eye,
  Terminal,
  Settings,
} from 'lucide-react';
import type { ViewMode } from '../types';

interface MobileBottomBarProps {
  onToggleFiles: () => void;
  isFilesOpen: boolean;
  fileCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isRunning: boolean;
  onRun: () => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
  isWebProject: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onToggleFiles,
  isFilesOpen,
  fileCount,
  viewMode,
  onChangeViewMode,
  isRunning,
  onRun,
  isTerminalOpen,
  onToggleTerminal,
  onOpenSettings,
  isWebProject,
}) => {
  return (
    <nav className="md:hidden bg-[#18181b] border-t border-[#27272a] h-14 flex items-center justify-around px-2 select-none z-30 shrink-0 shadow-2xl safe-area-bottom">
      {/* 📁 Files / Explorer */}
      <button
        onClick={onToggleFiles}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 relative ${
          isFilesOpen
            ? 'text-blue-400 bg-blue-500/15'
            : 'text-[#a1a1aa] hover:text-white'
        }`}
        title="Open Files"
      >
        <FolderTree className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Files</span>
        {fileCount > 0 && (
          <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
            {fileCount > 9 ? '9+' : fileCount}
          </span>
        )}
      </button>

      {/* 📝 Editor / Code View */}
      <button
        onClick={() => {
          onChangeViewMode('editor');
        }}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
          viewMode === 'editor'
            ? 'text-blue-400 bg-blue-500/15'
            : 'text-[#a1a1aa] hover:text-white'
        }`}
        title="Code Editor"
      >
        <Code2 className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Editor</span>
      </button>

      {/* ▶️ Big Native Run Button (Hero Center Action) */}
      <button
        onClick={onRun}
        disabled={isRunning}
        className={`flex items-center justify-center gap-1.5 px-4 h-10 rounded-full font-bold text-xs text-white shadow-lg active:scale-90 transition-all ${
          isRunning
            ? 'bg-amber-600 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
        }`}
        title="Run Code"
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current animate-spin" />
            <span>Running</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Run</span>
          </>
        )}
      </button>

      {/* 🌐 Live Web Preview (if web file) OR Terminal Output */}
      {isWebProject ? (
        <button
          onClick={() => onChangeViewMode(viewMode === 'preview' ? 'editor' : 'preview')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
            viewMode === 'preview'
              ? 'text-cyan-400 bg-cyan-500/15 font-semibold'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
          title="Web Preview"
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Preview</span>
        </button>
      ) : (
        <button
          onClick={onToggleTerminal}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all active:scale-95 relative ${
            isTerminalOpen
              ? 'text-blue-400 bg-blue-500/15'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
          title="Console & STDIN"
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Console</span>
          {isTerminalOpen && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      )}

      {/* ⚙️ Preferences & Themes */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-[#a1a1aa] hover:text-white transition-all active:scale-95"
        title="Settings & Themes"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
