import {
  Files,
  Search,
  GitBranch,
  Layers,
  Settings as SettingsIcon,
  User,
} from 'lucide-react';
import type { ActivePanel } from '../types';

interface ActivityBarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const ACTIVITY_ITEMS: { panel: ActivePanel; icon: typeof Files; label: string }[] = [
  { panel: 'explorer', icon: Files, label: 'Explorer' },
  { panel: 'search', icon: Search, label: 'Search' },
  { panel: 'templates', icon: Layers, label: 'Templates' },
  { panel: 'github', icon: GitBranch, label: 'Source Control' },
];

export const ActivityBar = ({
  activePanel,
  onSelectPanel,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}: ActivityBarProps) => {
  const handleClick = (panel: ActivePanel) => {
    if (activePanel === panel && isSidebarOpen) {
      onToggleSidebar(); // close sidebar if clicking same panel
    } else {
      onSelectPanel(panel);
      if (!isSidebarOpen) onToggleSidebar();
    }
  };

  return (
    <div 
      className="hidden md:flex w-12 border-r flex-col items-center justify-between py-1 select-none shrink-0 z-30"
      style={{
        backgroundColor: 'var(--activity-bg, #181818)',
        borderColor: 'var(--border-color, #2b2b2b)',
      }}
    >
      {/* Top icons */}
      <div className="flex flex-col items-center gap-0.5">
        {ACTIVITY_ITEMS.map(({ panel, icon: Icon, label }) => {
          const isActive = activePanel === panel && isSidebarOpen;
          return (
            <button
              key={panel}
              onClick={() => handleClick(panel)}
              className={`relative w-12 h-11 flex items-center justify-center transition-colors group ${
                isActive
                  ? 'text-white'
                  : 'text-[#858585] hover:text-white'
              }`}
              title={label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-white rounded-r" />
              )}
              <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-0.5">
        <a
          href="https://github.com/satyamkumar-builds/SatyamLabs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-11 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="GitHub"
        >
          <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </a>
        <button
          onClick={onOpenSettings}
          className="w-12 h-11 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
