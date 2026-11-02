import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface MobileKeyboardBarProps {
  onInsertText: (text: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const KEYS = [
  'Tab', '{', '}', '(', ')', '[', ']', '<', '>', ';', ':', '=', 
  '"', "'", '/', '\\', '$', '_', '-', '+', '*', '&', '|', '!', '?', 
  '=>', '==', '!=', '&&', '||', '.', ','
];

export const MobileKeyboardBar: React.FC<MobileKeyboardBarProps> = ({
  onInsertText,
  onUndo,
  onRedo,
}) => {
  const handleKeyClick = (key: string) => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(8); } catch (e) {}
    }
    
    if (key === 'Tab') {
      onInsertText('  '); // 2 spaces
    } else {
      onInsertText(key);
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#181818] border-t border-[#2b2b2b] overflow-x-auto select-none no-scrollbar shadow-inner z-20">
      {/* Undo / Redo Actions */}
      <button
        onClick={onUndo}
        className="flex items-center justify-center min-w-[36px] h-8 px-2 bg-[#252526] hover:bg-[#333333] active:bg-[#007acc] text-[#cccccc] rounded border border-[#3c3c3c] text-xs font-mono transition-colors"
        title="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRedo}
        className="flex items-center justify-center min-w-[36px] h-8 px-2 bg-[#252526] hover:bg-[#333333] active:bg-[#007acc] text-[#cccccc] rounded border border-[#3c3c3c] text-xs font-mono transition-colors"
        title="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-5 bg-[#3c3c3c] mx-0.5 shrink-0" />

      {/* Symbol keys */}
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => handleKeyClick(key)}
          className="flex items-center justify-center min-w-[34px] h-8 px-2 bg-[#252526] hover:bg-[#333333] active:bg-[#007acc] active:text-white text-[#d4d4d4] rounded border border-[#383838] text-xs font-mono font-semibold transition-colors shrink-0"
        >
          {key}
        </button>
      ))}
    </div>
  );
};
