// src/components/profile/ProfileModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  gradient?: string;
  children: React.ReactNode;
  skills?: string[];
  profileId?: string;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  title, 
  icon,
  gradient,
  children,
  skills 
}: ProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="fixed inset-4 sm:inset-6 md:inset-10 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                <div className="flex items-center gap-2">
                  {icon && (
                    <div className="w-6 h-6 text-cyan-400">
                      {icon}
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10 w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">
                {children}

                {skills && skills.length > 0 && title === "Compétences" && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Tag className="text-white w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-base font-semibold text-white">Compétences</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <Badge
                          key={i}
                          className="bg-purple-500/20 text-purple-200 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}