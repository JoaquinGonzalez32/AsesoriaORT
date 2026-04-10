import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tooltipW = 256; // w-64 = 16rem = 256px
    let left = rect.left + rect.width / 2 - tooltipW / 2;
    // Clamp so tooltip doesn't overflow viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));
    setPos({ top: rect.top - 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleClick = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (tooltipRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 flex items-center justify-center text-[11px] font-bold transition-colors shrink-0"
        aria-label="Información"
      >
        ?
      </button>
      {open && pos && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[100] w-64 bg-gray-900 text-white text-xs leading-relaxed rounded-xl px-4 py-3 shadow-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ top: pos.top, left: pos.left, transform: 'translateY(-100%)' }}
        >
          {text}
          <div
            className="absolute top-full -mt-px w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"
            style={{ left: btnRef.current ? btnRef.current.getBoundingClientRect().left - pos.left + btnRef.current.offsetWidth / 2 - 6 : '50%' }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default InfoTooltip;
