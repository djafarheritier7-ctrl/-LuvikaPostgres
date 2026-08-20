'use client';

import { useToast } from './use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`
            backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-xl
            bg-slate-900/70 text-white min-w-[280px]
            ${variant === 'destructive' ? 'border-red-500/40' : 'border-cyan-500/40'}
          `}
        >
          <div className="flex justify-between items-start gap-3">
            <div>
              {title && <p className="font-medium">{title}</p>}
              {description && <p className="text-sm text-gray-300">{description}</p>}
            </div>
            <button onClick={() => dismiss(id)} aria-label="Fermer la notification">
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
