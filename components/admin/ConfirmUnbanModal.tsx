'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { ShieldCheck } from 'lucide-react';

export function ConfirmUnbanModal({
  isOpen,
  onOpenChange,
  onConfirm,
  username,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  username: string;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-border bg-black/50 backdrop-blur-xl border-white/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-green-400">
            <ShieldCheck className="h-6 w-6" />
            <AlertDialogTitle className="text-xl text-white">
              Débannir {username} ?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-300">
            L’utilisateur pourra à nouveau se connecter à LUVIKA.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-gray-200 border-white/20">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white"
          >
            Débannir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}