import { useState, useRef, useEffect } from 'react';
import {
  X,
  Trash2,
  Copy,
  Check,
  Terminal as TerminalIcon,
  AlertCircle,
  CornerDownLeft,
  FileInput,
  ShieldAlert,
  Play,
} from 'lucide-react';
import type { ExecutionLog } from '../types';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExecutionLog[];
  onClearLogs: () => void;
  stdin: string;
  onChangeStdin: (val: string) => void;
  onRunStdin: (inputVal: string) => void;
}

export const TerminalPanel = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  stdin,
  onChangeStdin,
  onRunStdin,
}: TerminalPanelProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'terminal' | 'stdin' | 'problems'>('terminal');
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
    const text = logs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    const cmd = inputCommand.trim();
    setInputCommand('');
    // Run active file with this command as stdin input!
    onRunStdin(cmd);
  };

  // Filter error/warning logs for Problems tab
  const problemLogs = logs.filter((l) => l.type === 'stderr');

  return (
    <div className="h-64 max-h-[50vh] md:h-60 bg-[#1e1e1e] border-t border-[#2b2b2b] flex flex-col z-20 shrink-0 font-mono text-xs select-text shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 h-9 md:h-8 bg-[#181818] border-b border-[#2b2b2b] select-none shrink-0 font-sans">
        {/* Left Tabs */}
        <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider uppercase">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 h-8 border-b-2 transition-colors ${
              activeTab === 'terminal'
                ? 'text-white border-[#007acc]'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 h-8 border-b-2 transition-colors ${
              activeTab === 'output'
                ? 'text-white border-[#007acc]'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>OUTPUT</span>
          </button>

          <button
            onClick={() => setActiveTab('stdin')}
            className={`flex items-center gap-1.5 h-8 border-b-2 transition-colors ${
              activeTab === 'stdin'
                ? 'text-white border-[#007acc]'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <FileInput className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>INPUT (STDIN)</span>
            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#007acc]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 h-8 border-b-2 transition-colors ${
              activeTab === 'problems'
                ? 'text-white border-[#007acc]'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PROBLEMS</span>
            {problemLogs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#f85149] text-white rounded-full text-[9px]">
                {problemLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Copy All"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            title="Clear Console"
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

      {/* ─── TERMINAL / OUTPUT VIEW ─── */}
      {(activeTab === 'terminal' || activeTab === 'output') && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
          <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[12px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-[#666666] italic">
                Ready. Click &apos;Run&apos; (Ctrl+Enter) or type input below.
              </div>
            ) : (
              logs.map((log) => {
                let color = 'text-[#cccccc]';
                if (log.type === 'stderr') color = 'text-[#f85149]';
                if (log.type === 'system') color = 'text-[#58a6ff]';
                if (log.type === 'info') color = 'text-[#e3b341]';

                return (
                  <div key={log.id} className={`whitespace-pre-wrap break-all ${color}`}>
                    <span className="text-[#555555] text-[10px] select-none mr-2 font-mono">
                      [{log.timestamp}]
                    </span>
                    {log.text}
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Input Form */}
          <form
            onSubmit={handleTerminalSubmit}
            className="flex items-center px-3 py-1.5 border-t border-[#2b2b2b] bg-[#181818] shrink-0"
          >
            <span className="text-[#58a6ff] font-bold mr-2 select-none font-mono">➜</span>
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              placeholder="Enter program input (e.g. 5 for rows) and press Enter to run..."
              className="flex-1 bg-transparent text-white text-[12px] outline-none font-mono placeholder-[#666666]"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-[#007acc] hover:bg-[#0062a3] text-white text-[11px] rounded flex items-center gap-1 transition-colors ml-2"
              title="Submit & Run with this input"
            >
              <span>Send</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* ─── INPUT (STDIN) TAB ─── */}
      {activeTab === 'stdin' && (
        <div className="flex-1 flex flex-col p-3 bg-[#1e1e1e]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#858585]">
              Provide standard input (stdin) for programs that use <code className="text-[#58a6ff]">scanf</code>, <code className="text-[#58a6ff]">cin</code>, or <code className="text-[#58a6ff]">input()</code>:
            </span>
            <button
              onClick={() => onRunStdin(stdin)}
              className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run with this Input</span>
            </button>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => onChangeStdin(e.target.value)}
            placeholder="e.g.&#10;5&#10;or multiple lines:&#10;10&#10;20 30"
            className="flex-1 w-full bg-[#181818] text-[#cccccc] text-[12px] font-mono p-2.5 rounded border border-[#3c3c3c] focus:border-[#007acc] outline-none resize-none"
          />
        </div>
      )}

      {/* ─── PROBLEMS TAB ─── */}
      {activeTab === 'problems' && (
        <div className="flex-1 overflow-y-auto p-3 bg-[#1e1e1e]">
          {problemLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#858585]">
              ✓ No problems detected in the current workspace.
            </div>
          ) : (
            <div className="space-y-1.5">
              {problemLogs.map((p) => (
                <div
                  key={p.id}
                  className="p-2 bg-[#2d1b1b] border border-[#f85149]/30 rounded text-[#f85149] text-[11px] font-mono whitespace-pre-wrap"
                >
                  {p.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
