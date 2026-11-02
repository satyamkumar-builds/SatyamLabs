import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Terminal as TerminalIcon, 
  AlertCircle,
  CornerDownLeft
} from 'lucide-react';
import type { ExecutionLog } from '../types';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExecutionLog[];
  onClearLogs: () => void;
  onSendCommand?: (command: string) => void;
}

export const TerminalPanel = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onSendCommand,
}: TerminalPanelProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');
  const [copied, setCopied] = useState(false);
  const [inputCommand, setInputCommand] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    if (onSendCommand) {
      onSendCommand(inputCommand.trim());
    }
    setInputCommand('');
  };

  return (
    <div className="h-56 bg-[#181818] border-t border-[#2b2b2b] flex flex-col z-20 shrink-0 font-mono text-xs select-text">
      {/* Terminal Tab Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1f1f1f] border-b border-[#2b2b2b] select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'output' ? 'text-white border-b-2 border-[#007acc] pb-0.5' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>OUTPUT</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'terminal' ? 'text-white border-b-2 border-[#007acc] pb-0.5' : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Stream Output */}
      <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {logs.length === 0 ? (
          <div className="text-[#666666] italic">Ready. Click 'Run' to execute code or test preview.</div>
        ) : (
          logs.map((log) => {
            let color = 'text-[#cccccc]';
            if (log.type === 'stderr') color = 'text-[#f85149]';
            if (log.type === 'system') color = 'text-[#58a6ff]';
            if (log.type === 'info') color = 'text-[#d29922]';

            return (
              <div key={log.id} className={`leading-relaxed whitespace-pre-wrap break-all ${color}`}>
                <span className="text-[#555555] text-[10px] select-none mr-2">[{log.timestamp}]</span>
                {log.text}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Interactive Input */}
      {activeTab === 'terminal' && (
        <form onSubmit={handleInputSubmit} className="flex items-center px-3 py-1.5 border-t border-[#2b2b2b] bg-[#141414]">
          <span className="text-emerald-400 font-bold mr-2 select-none">$</span>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            placeholder="Type standard input or expression..."
            className="flex-1 bg-transparent text-[#cccccc] text-xs outline-none"
          />
          <button type="submit" className="text-[#858585] hover:text-[#cccccc]">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
