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
import { Button } from '../../components/ui/button';
import { ShieldX } from 'lucide-react';

export function ConfirmBanModal({
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
          <div className="flex items-center gap-2 text-red-400">
            <ShieldX className="h-6 w-6" />
            <AlertDialogTitle className="text-xl text-white">
              Bannir {username} ?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-300">
            Cette action est irréversible. L’utilisateur ne pourra plus se connecter à LUVIKA.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-gray-200 border-white/20">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white"
          >
            Bannir définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}