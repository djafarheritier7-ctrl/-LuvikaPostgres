// src/components/dashboard/ContactRequestsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Clock, CheckCircle, User } from 'lucide-react';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

// Dans ContactRequestsModal
export default function ContactRequestsModal({
  isOpen,
  onClose,
  onMarkAsRead,
}: {
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (unreadCount: number) => void;
}) {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/contact-requests');
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        setRequests(data.requests || []);
      } catch (err) {
        console.error('Erreur chargement messages:', err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isOpen]);

const markAsRead = async (id: string) => {
  try {
    const res = await fetch(`/api/contact-requests/${id}/read`, { method: 'PATCH' });
    if (res.ok) {
      setRequests(prev => {
        const updated = prev.map(req => 
          req.id === id ? { ...req, is_read: true } : req
        );
        
        // ✅ Calculer et notifier dans requestAnimationFrame
        requestAnimationFrame(() => {
          const unreadCount = updated.filter(r => !r.is_read).length;
          onMarkAsRead?.(unreadCount);
        });
        
        return updated;
      });
    }
  } catch (err) {
    console.error('Erreur marquage lu:', err);
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-full sm:max-w-lg max-h-[85vh] flex flex-col bg-slate-900/90 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl border border-white/[0.08] shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <h2 className="text-base font-semibold text-white/80 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400/60" />
              Messages
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400/60 hover:text-white/70 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-10 h-10 text-gray-500/30 mx-auto mb-3" />
                <p className="text-sm text-gray-400/60 font-light">Aucun message</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`rounded-xl p-4 transition-all ${
                      req.is_read
                        ? 'bg-white/[0.02] border border-white/[0.04]'
                        : 'bg-cyan-500/[0.04] border border-cyan-500/[0.1]'
                    }`}
                  >
                    {/* Infos + badge */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-cyan-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-white/70 font-medium truncate">{req.name}</p>
                          {!req.is_read && (
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-300/60 px-1.5 py-0.5 rounded-full font-light flex-shrink-0">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400/50 font-light mt-0.5 truncate">{req.email}</p>
                        {req.phone && (
                          <p className="text-[11px] text-gray-500/40 font-light mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {req.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-[10px] text-gray-500/40 font-light">
                          {new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </p>
                        {!req.is_read && (
                          <button
                            onClick={() => markAsRead(req.id)}
                            className="mt-1 text-[10px] text-cyan-400/60 hover:text-cyan-300/70 font-light transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-0.5" />
                            Lu
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-gray-300/60 font-light mt-2.5 leading-relaxed">
                      {req.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.06] text-center text-[10px] text-gray-500/40 font-light flex-shrink-0">
            Messages stockés dans votre compte
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}