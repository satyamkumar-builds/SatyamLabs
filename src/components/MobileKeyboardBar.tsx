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
      try { navigator.vibrate(12); } catch (e) {}
    }
    
    if (key === 'Tab') {
      onInsertText('  '); // 2 spaces
    } else {
      onInsertText(key);
    }
  };

  return (
    <div 
      className="flex md:hidden items-center gap-1.5 px-2 py-1.5 border-t overflow-x-auto select-none no-scrollbar shrink-0 shadow-lg"
      style={{
        backgroundColor: 'var(--activity-bg, #141414)',
        borderColor: 'var(--border-color, #262626)',
      }}
    >
      {/* Undo / Redo Actions */}
      <button
        onClick={onUndo}
        className="flex items-center justify-center min-w-[40px] h-9 px-2 bg-[#222222] active:bg-[#007acc] text-[#cccccc] active:text-white rounded-lg border border-[#333333] text-xs font-mono transition-transform active:scale-95 shrink-0"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={onRedo}
        className="flex items-center justify-center min-w-[40px] h-9 px-2 bg-[#222222] active:bg-[#007acc] text-[#cccccc] active:text-white rounded-lg border border-[#333333] text-xs font-mono transition-transform active:scale-95 shrink-0"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-[#333333] mx-0.5 shrink-0" />

      {/* Symbol keys */}
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => handleKeyClick(key)}
          className="flex items-center justify-center min-w-[36px] h-9 px-2.5 bg-[#222222] active:bg-[#007acc] active:text-white text-[#e0e0e0] rounded-lg border border-[#333333] text-[13px] font-mono font-semibold transition-transform active:scale-95 shrink-0 shadow-2xs"
        >
          {key}
        </button>
      ))}
    </div>
  );
};
