'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function GlassModal({
  open,
  onOpenChange,
  title,
  children
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-slate-900/60 border border-white/10
          backdrop-blur-xl rounded-xl
          p-6 w-full max-w-md
          shadow-xl shadow-black/50
        ">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close>
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
