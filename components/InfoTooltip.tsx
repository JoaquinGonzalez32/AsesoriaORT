import React, { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 flex items-center justify-center text-[11px] font-bold transition-colors shrink-0"
        aria-label="Información"
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs leading-relaxed rounded-xl px-4 py-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
