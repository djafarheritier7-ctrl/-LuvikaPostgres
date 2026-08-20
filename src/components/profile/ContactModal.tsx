// src/components/profile/ContactModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone, Send } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import ContactForm from './ContactForm';
export default function ContactModal({
  isOpen,
  onClose,
  profileId,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 🔹 Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="text-cyan-400" size={20} />
              Laissez-moi vos contacts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>

          {/* 🔹 Body */}
          <div className="p-5">
            <ContactForm profileId={profileId} />
          </div>

          {/* 🔹 Footer */}
          <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
                 
  ✅ Vos données sont stockées **temporairement** dans le profil du destinataire.<br />
  🔒 Conformément au RGPD, elles ne sont ni vendues ni partagées.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}