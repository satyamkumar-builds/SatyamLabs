import { X, Palette, Type, Sliders, Check } from 'lucide-react';
import type { EditorSettings } from '../types';
import { THEME_CONFIGS } from '../utils/themeHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

const FONTS = [
  { id: 'Consolas', name: 'Consolas (Classic Clean)' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono (Developer Favorite)' },
  { id: 'Fira Code', name: 'Fira Code (Modern Ligatures)' },
  { id: 'Cascadia Code', name: 'Cascadia Code (Microsoft Studio)' },
  { id: 'Source Code Pro', name: 'Source Code Pro (Adobe Monospace)' },
];

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] border border-[#383838] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-[#cccccc] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2b2b2b] bg-[#252526]">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Sliders className="w-4 h-4 text-[#58a6ff]" />
            <span>SatyamLabs Preferences</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded-lg text-[#858585] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Theme Section */}
          <div>
            <label className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Color Theme ({Object.keys(THEME_CONFIGS).length} Pro Themes)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEME_CONFIGS).map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ theme: theme.id })}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'border-[#58a6ff] bg-[#58a6ff]/15 text-white shadow-sm ring-1 ring-[#58a6ff]'
                        : 'border-[#333333] bg-[#252526] hover:border-[#555555] text-[#888888]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span className="truncate">{theme.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#58a6ff] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Family Section */}
          <div>
            <label className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Editor Monospace Font</span>
            </label>
            <select
              value={settings.fontFamily || 'Consolas'}
              onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
              className="w-full bg-[#252526] text-white text-xs px-3 py-2 rounded-xl border border-[#383838] focus:border-[#58a6ff] outline-none font-mono"
            >
              {FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Section */}
          <div>
            <label className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-400" />
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
              className="w-full accent-[#58a6ff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#666666] mt-1 font-mono">
              <span>12px</span>
              <span>14px (Default)</span>
              <span>18px</span>
              <span>24px (Large)</span>
            </div>
          </div>

          {/* Tab Size Section */}
          <div>
            <label className="text-xs font-semibold text-white mb-2 block">
              Tab Indentation Size
            </label>
            <div className="flex gap-2">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ tabSize: size })}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                    settings.tabSize === size
                      ? 'bg-[#58a6ff] text-white border-[#58a6ff]'
                      : 'bg-[#252526] text-[#858585] border-[#383838] hover:text-white'
                  }`}
                >
                  {size} Spaces
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-3 border-t border-[#2b2b2b]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Word Wrap</div>
                <div className="text-[11px] text-[#858585]">Wrap long lines to fit mobile & small screens</div>
              </div>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                className="w-4 h-4 accent-[#58a6ff] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Line Numbers</div>
                <div className="text-[11px] text-[#858585]">Display line numbers in editor gutter</div>
              </div>
              <input
                type="checkbox"
                checked={settings.lineNumbers}
                onChange={(e) => onUpdateSettings({ lineNumbers: e.target.checked })}
                className="w-4 h-4 accent-[#58a6ff] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Auto Run Web Preview</div>
                <div className="text-[11px] text-[#858585]">Live instant preview updates on edit</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRunWeb}
                onChange={(e) => onUpdateSettings({ autoRunWeb: e.target.checked })}
                className="w-4 h-4 accent-[#58a6ff] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181818] border-t border-[#2b2b2b] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
