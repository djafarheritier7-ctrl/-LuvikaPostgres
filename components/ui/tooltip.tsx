// src/components/ui/tooltip.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';

export interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
  children: ReactNode;
}

const Tooltip = ({
  content,
  side = 'top',
  delayDuration = 0,
  children,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setIsOpen(true), delayDuration);
    setTimer(t);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setIsOpen(false);
  };

  // Nettoyage
  useEffect(() => () => { if (timer) clearTimeout(timer); }, [timer]);

  // Position calculée
  const getStyles = () => {
const base = 'absolute z-[1000] px-2.5 py-1.5 text-xs text-cyan-300 bg-black/80 backdrop-blur border border-white/10 rounded-md shadow-lg animate-in fade-in-0 zoom-in-95';

    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-1 data-[state=closed]:zoom-out-95',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-1 data-[state=closed]:zoom-out-95',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-1 data-[state=closed]:zoom-out-95',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-1 data-[state=closed]:zoom-out-95',
    };
    return `${base} ${positions[side]}`;
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="outline-none"
        tabIndex={0}
      >
        {children}
      </div>
      {isOpen && (
        <div
          role="tooltip"
          className={getStyles()}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Compatibilité avec ton import existant
export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
export const TooltipTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;
export const TooltipContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

export { Tooltip };