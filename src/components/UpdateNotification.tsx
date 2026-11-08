import { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export const CURRENT_VERSION = '3.1.5';
export const CURRENT_VERSION_CODE = 11;

interface VersionInfo {
  version: string;
  versionCode: number;
  title: string;
  changelog: string;
  downloadUrl: string;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState<VersionInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this browser/app session
    if (sessionStorage.getItem('satyamlabs_update_dismissed')) {
      return;
    }

    const checkUpdate = async () => {
      try {
        const res = await fetch(`https://satyamkumar-builds.github.io/SatyamLabs/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data: VersionInfo = await res.json();
          // If server version is newer than this build, or if we want to prompt update
          if (data.versionCode > CURRENT_VERSION_CODE || (data.versionCode === CURRENT_VERSION_CODE && localStorage.getItem('satyamlabs_installed_v') !== data.version)) {
            setUpdateAvailable(data);
          }
        }
      } catch (e) {
        // Silent fail if offline
      }
    };

    // Run check after a short 1.5s delay so it doesn't block initial render
    const timer = setTimeout(checkUpdate, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('satyamlabs_update_dismissed', 'true');
  };

  const handleUpdate = () => {
    if (!updateAvailable) return;
    window.open(updateAvailable.downloadUrl, '_blank');
    handleDismiss();
  };

  if (!updateAvailable || isDismissed) return null;

  return (
    <aside 
      aria-label="Update notification"
      className="fixed bottom-16 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#1e1e24] border border-blue-500/40 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom duration-300 backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <img
          src="./logo.png"
          alt="SatyamLabs Logo"
          className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1 shrink-0 shadow-xs border border-white/10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Update Available (v{updateAvailable.version})</span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-gray-300 font-medium leading-snug mb-1">
            {updateAvailable.title || 'Official new logo and compiler updates are available.'}
          </p>
          <p className="text-[10px] text-gray-400 line-clamp-2 mb-3">
            {updateAvailable.changelog}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Update APK</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-1.5 px-3 bg-white/10 hover:bg-white/15 text-gray-300 text-xs rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
