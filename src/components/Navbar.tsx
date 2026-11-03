import { 
  Play, 
  Square, 
  Terminal as TerminalIcon, 
  Eye, 
  Columns, 
  Code2, 
  Download, 
  Settings as SettingsIcon,
  Menu,
  Layers
} from 'lucide-react';
import type { ViewMode } from '../types';

interface NavbarProps {
  projectName: string;
  isRunning: boolean;
  onRun: () => void;
  onStop?: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onDownloadZip: () => void;
  onOpenTemplates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  isRunning,
  onRun,
  viewMode,
  onChangeViewMode,
  isTerminalOpen,
  onToggleTerminal,
  onToggleSidebar,
  onOpenSettings,
  onDownloadZip,
  onOpenTemplates,
}) => {
  return (
    <header 
      className="bg-[#181818] border-b border-[#2b2b2b] flex items-center justify-between px-2 text-[#cccccc] select-none z-30 shrink-0"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: 'calc(44px + env(safe-area-inset-top, 0px))',
      }}
    >
      {/* Left side: Hamburger + Logo + Project Name */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-[#2a2d2e] active:bg-[#094771] rounded text-[#cccccc] transition-colors"
          title="Toggle Explorer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-semibold text-sm">
          <img src="./logo.svg" alt="SatyamLabs" className="w-5 h-5" />
          <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
            SatyamLabs
          </span>
          <span className="text-[10px] bg-[#007acc]/30 text-[#58a6ff] px-1.5 py-0.5 rounded font-mono font-normal">
            v1.1.0
          </span>
          <span className="hidden md:inline text-xs text-[#858585] font-normal">/ {projectName}</span>
        </div>

        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1 px-2 py-1 bg-[#252526] hover:bg-[#2d2d2d] text-xs rounded border border-[#3c3c3c] text-[#9cdcfe] transition-colors ml-1"
          title="Switch Template / Language"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Templates</span>
        </button>
      </div>

      {/* Center: Run Button + View Mode Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold text-white shadow-sm transition-all ${
            isRunning 
              ? 'bg-amber-600 animate-pulse cursor-wait' 
              : 'bg-[#238636] hover:bg-[#2ea043] active:scale-95'
          }`}
          title="Run Active File (Ctrl+Enter)"
        >
          {isRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* View mode toggle (Code / Split / Preview) */}
        <div className="hidden sm:flex items-center bg-[#252526] p-0.5 rounded border border-[#3c3c3c]">
          <button
            onClick={() => onChangeViewMode('editor')}
            className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'editor' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Editor Only"
          >
            <Code2 className="w-3 h-3" />
            <span className="hidden md:inline">Code</span>
          </button>

          <button
            onClick={() => onChangeViewMode('split')}
            className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'split' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Split Code & Preview"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden md:inline">Split</span>
          </button>

          <button
            onClick={() => onChangeViewMode('preview')}
            className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'preview' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Preview Only"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Right side: Terminal Toggle, Export ZIP, Settings, GitHub */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTerminal}
          className={`p-1.5 rounded transition-colors ${
            isTerminalOpen ? 'bg-[#007acc] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'
          }`}
          title="Toggle Terminal"
        >
          <TerminalIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onDownloadZip}
          className="p-1.5 hover:bg-[#2a2d2e] rounded text-[#cccccc] transition-colors"
          title="Download Project ZIP"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-[#2a2d2e] rounded text-[#cccccc] transition-colors"
          title="Editor Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <a
          href="https://github.com/satyamkumar-builds/SatyamLabs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex p-1.5 hover:bg-[#2a2d2e] rounded text-[#cccccc] transition-colors"
          title="GitHub Repository"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
