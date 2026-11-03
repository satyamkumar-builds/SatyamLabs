import { useState } from 'react';
import {
  Play,
  Square,
  Eye,
  Columns,
  Code2,
  Menu,
  PanelBottom,
  Search,
  Settings as SettingsIcon,
  LayoutTemplate,
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
  onOpenCommandPalette: () => void;
  onCreateFile: () => void;
  activeFileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  onOpenCommandPalette,
  onCreateFile,
  activeFileName,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <header
      className="border-b flex items-center justify-between select-none z-40 shrink-0 h-11 md:h-9 px-3 text-[12px] font-sans relative"
      style={{
        backgroundColor: 'var(--navbar-bg, #1f1f1f)',
        borderColor: 'var(--border-color, #2b2b2b)',
        color: 'var(--editor-text, #cccccc)',
      }}
    >
      {/* ─── Left: Brand & Menus ─── */}
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Mobile Sidebar Hamburger (Large touch target) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-[#2a2d2e] active:bg-[#007acc] rounded-lg text-white transition-colors"
          title="Open Project Explorer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Icon & Active File */}
        <div className="flex items-center gap-1.5 font-semibold text-white shrink-0">
          <img src="./logo.svg" alt="SatyamLabs" className="w-4 h-4" />
          <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold text-[13px]">
            SatyamLabs
          </span>
        </div>

        {/* Active File Name Badge on Mobile */}
        {activeFileName && (
          <div className="flex md:hidden items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[#cccccc] truncate max-w-[120px]">
            <span className="truncate">{activeFileName}</span>
          </div>
        )}

        {/* VS Code Classic Menus (Desktop/Tablet) */}
        <div className="hidden lg:flex items-center text-[#cccccc] relative">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('File')}
              className={`px-2 py-1 rounded-xs hover:bg-[#2a2d2e] transition-colors ${
                activeMenu === 'File' ? 'bg-[#094771] text-white' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'File' && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded shadow-2xl py-1 z-50 text-[12px]"
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { onCreateFile(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between"
                >
                  <span>New File</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+N</span>
                </button>
                <button
                  onClick={() => { onOpenTemplates(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Starter Templates...
                </button>
                <div className="h-[1px] bg-[#3c3c3c] my-1" />
                <button
                  onClick={() => { onDownloadZip(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Download Project ZIP
                </button>
                <div className="h-[1px] bg-[#3c3c3c] my-1" />
                <button
                  onClick={() => { onOpenSettings(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between"
                >
                  <span>Preferences</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+,</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('Edit')}
              className={`px-2 py-1 rounded-xs hover:bg-[#2a2d2e] transition-colors ${
                activeMenu === 'Edit' ? 'bg-[#094771] text-white' : ''
              }`}
            >
              Edit
            </button>
            {activeMenu === 'Edit' && (
              <div
                className="absolute top-full left-0 mt-1 w-44 bg-[#252526] border border-[#454545] rounded shadow-2xl py-1 z-50 text-[12px]"
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { onOpenCommandPalette(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between"
                >
                  <span>Find in Files</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+F</span>
                </button>
                <button
                  onClick={() => { onOpenCommandPalette(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Command Palette...
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('View')}
              className={`px-2 py-1 rounded-xs hover:bg-[#2a2d2e] transition-colors ${
                activeMenu === 'View' ? 'bg-[#094771] text-white' : ''
              }`}
            >
              View
            </button>
            {activeMenu === 'View' && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded shadow-2xl py-1 z-50 text-[12px]"
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { onToggleSidebar(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between"
                >
                  <span>Primary Side Bar</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+B</span>
                </button>
                <button
                  onClick={() => { onToggleTerminal(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between"
                >
                  <span>Terminal Panel</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+`</span>
                </button>
                <div className="h-[1px] bg-[#3c3c3c] my-1" />
                <button
                  onClick={() => { onChangeViewMode('editor'); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Editor Only
                </button>
                <button
                  onClick={() => { onChangeViewMode('split'); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Split Code & Preview
                </button>
                <button
                  onClick={() => { onChangeViewMode('preview'); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Web Preview
                </button>
              </div>
            )}
          </div>

          {/* Run Menu */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('Run')}
              className={`px-2 py-1 rounded-xs hover:bg-[#2a2d2e] transition-colors ${
                activeMenu === 'Run' ? 'bg-[#094771] text-white' : ''
              }`}
            >
              Run
            </button>
            {activeMenu === 'Run' && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#454545] rounded shadow-2xl py-1 z-50 text-[12px]"
                onMouseLeave={closeMenu}
              >
                <button
                  onClick={() => { onRun(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex justify-between font-semibold"
                >
                  <span>Run Without Debugging</span>
                  <span className="text-[#858585] text-[10px]">Ctrl+Enter</span>
                </button>
                <button
                  onClick={() => { onToggleTerminal(); closeMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white"
                >
                  Open Standard Input (stdin)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Center: Command Palette Trigger Search Box (Desktop Only) ─── */}
      <div className="hidden md:flex flex-1 max-w-xs md:max-w-md mx-2">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-6 px-2.5 bg-[#2a2d2e] hover:bg-[#323638] text-[#cccccc] text-[11px] rounded flex items-center justify-between border border-[#3c3c3c] transition-colors group"
          title="Search files and run commands (Ctrl+P)"
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Search className="w-3 h-3 text-[#858585] shrink-0" />
            <span className="truncate text-[#999999]">
              {activeFileName ? `SatyamLabs - ${activeFileName}` : 'SatyamLabs IDE'}
            </span>
          </div>
          <kbd className="hidden sm:inline text-[9px] bg-[#1e1e1e] text-[#858585] px-1 py-0.2 rounded border border-[#3c3c3c] font-mono shrink-0 ml-1">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* ─── Right: Run Button + View Switcher + Panels ─── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Mobile Starter Templates Button */}
        <button
          onClick={onOpenTemplates}
          className="md:hidden p-2 hover:bg-[#2a2d2e] active:bg-[#007acc] rounded-lg text-cyan-400 transition-colors"
          title="Starter Templates"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>

        {/* RUN CODE BUTTON */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 md:py-1 rounded-lg md:rounded text-xs font-semibold text-white shadow-sm transition-all ${
            isRunning
              ? 'bg-amber-600 animate-pulse cursor-wait'
              : 'bg-[#238636] hover:bg-[#2ea043] active:scale-95'
          }`}
          title="Run Active File (Ctrl+Enter)"
        >
          {isRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current animate-spin" />
              <span>Running</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* View mode toggle (Code / Split / Preview) */}
        <div className="hidden md:flex items-center bg-[#252526] p-0.5 rounded border border-[#3c3c3c]">
          <button
            onClick={() => onChangeViewMode('editor')}
            className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1 ${
              viewMode === 'editor' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Editor"
          >
            <Code2 className="w-3 h-3" />
            <span>Code</span>
          </button>

          <button
            onClick={() => onChangeViewMode('split')}
            className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1 ${
              viewMode === 'split' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Split Code & Preview"
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>

          <button
            onClick={() => onChangeViewMode('preview')}
            className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1 ${
              viewMode === 'preview' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Live Preview"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

        {/* Terminal panel toggle */}
        <button
          onClick={onToggleTerminal}
          className={`p-1.5 rounded transition-colors ${
            isTerminalOpen ? 'bg-[#007acc] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'
          }`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <PanelBottom className="w-3.5 h-3.5" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-[#2a2d2e] rounded text-[#cccccc] transition-colors"
          title="Settings (Ctrl+,)"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
