import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';

interface PreviewPanelProps {
  srcDoc: string;
  onRefresh: () => void;
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  srcDoc,
  onRefresh,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  const handleOpenExternal = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  let containerStyle = 'w-full h-full';
  if (deviceMode === 'mobile') {
    containerStyle = 'w-[375px] h-[667px] shadow-2xl rounded-2xl border-4 border-[#333333] overflow-hidden my-auto';
  } else if (deviceMode === 'tablet') {
    containerStyle = 'w-[768px] h-[90%] shadow-2xl rounded-2xl border-4 border-[#333333] overflow-hidden my-auto';
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] border-l border-[#2b2b2b] overflow-hidden select-none">
      {/* Preview Header */}
      <div className="h-9 px-3 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between text-xs text-[#cccccc] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wide">LIVE PREVIEW</span>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center bg-[#1e1e1e] p-0.5 rounded border border-[#3c3c3c]">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded transition-colors ${
              deviceMode === 'mobile' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Mobile View (375x667)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded transition-colors ${
              deviceMode === 'tablet' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded transition-colors ${
              deviceMode === 'desktop' ? 'bg-[#007acc] text-white' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Responsive Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Open In New Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[#121212] flex items-center justify-center p-2 overflow-auto">
        <div className={`transition-all duration-300 ${containerStyle}`}>
          <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
};
