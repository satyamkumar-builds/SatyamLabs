import { X, Moon, Type, Sliders, Check } from 'lucide-react';
import type { EditorSettings, ThemeId } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

const THEMES: { id: ThemeId; name: string; bg: string }[] = [
  { id: 'dark-plus', name: 'VS Code Dark+ (Default)', bg: '#1e1e1e' },
  { id: 'one-dark', name: 'One Dark Pro', bg: '#282c34' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36' },
  { id: 'monokai', name: 'Monokai', bg: '#272822' },
  { id: 'github-dark', name: 'GitHub Dark', bg: '#0d1117' },
  { id: 'light', name: 'VS Code Light', bg: '#ffffff' },
];

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] border border-[#333333] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[#cccccc]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b2b2b] bg-[#252526]">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Sliders className="w-4 h-4 text-[#007acc]" />
            <span>Editor Preferences</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Theme Section */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#58a6ff]" />
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ theme: theme.id })}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'border-[#007acc] bg-[#007acc]/10 text-white shadow-sm'
                        : 'border-[#333333] bg-[#252526] hover:border-[#444444] text-[#858585]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span>{theme.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#007acc]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Section */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                Font Size ({settings.fontSize}px)
              </span>
              <span className="text-[11px] text-[#858585]">Mobile Friendly</span>
            </label>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-[#007acc] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#666666] mt-1">
              <span>12px (Compact)</span>
              <span>16px (Normal)</span>
              <span>24px (Large Phone)</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#2b2b2b]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Word Wrap</div>
                <div className="text-[11px] text-[#858585]">Wrap long lines to fit mobile screen</div>
              </div>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                className="w-4 h-4 accent-[#007acc] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Line Numbers</div>
                <div className="text-[11px] text-[#858585]">Show line number gutter</div>
              </div>
              <input
                type="checkbox"
                checked={settings.lineNumbers}
                onChange={(e) => onUpdateSettings({ lineNumbers: e.target.checked })}
                className="w-4 h-4 accent-[#007acc] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Auto Run Web Preview</div>
                <div className="text-[11px] text-[#858585]">Instantly update preview on edits</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRunWeb}
                onChange={(e) => onUpdateSettings({ autoRunWeb: e.target.checked })}
                className="w-4 h-4 accent-[#007acc] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181818] border-t border-[#2b2b2b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
