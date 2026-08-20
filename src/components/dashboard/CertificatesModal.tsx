// src/components/dashboard/CertificatesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, X, Award } from 'lucide-react';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date_issued: string;
  credential_id?: string;
  credential_url?: string;
};

export default function CertificatesModal({
  isOpen,
  onClose,
  profileId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onSuccess?: () => void;
}) {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/portfolio?profile_id=${profileId}`)
        .then(r => r.json())
        .then(({ certificates }) => {
          setItems(certificates || []);
          setLoading(false);
        });
    }
  }, [isOpen, profileId]);

  const add = () => setItems([...items, { id: `new-${Date.now()}`, title: '', issuer: '', date_issued: new Date().toISOString().slice(0, 10) }]);
  const update = (id: string, field: keyof Certificate, value: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const save = async () => {
    setSaving(true);
    for (const item of items) {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'certificate', data: { title: item.title, issuer: item.issuer, date_issued: item.date_issued, credential_id: item.credential_id, credential_url: item.credential_url } }),
      });
    }
    onSuccess?.();
    onClose();
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
          className="glass-border bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>

          {/* Header fixe */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Award className="text-yellow-400 w-5 h-5" />Certifications</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X size={16} /></Button>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">Chargement...</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} placeholder="Titre *" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                    <Input value={item.issuer} onChange={e => update(item.id, 'issuer', e.target.value)} placeholder="Délivré par *" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                    <Input type="date" value={item.date_issued} onChange={e => update(item.id, 'date_issued', e.target.value)} className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                    <Input value={item.credential_id || ''} onChange={e => update(item.id, 'credential_id', e.target.value)} placeholder="ID (optionnel)" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                    <Input value={item.credential_url || ''} onChange={e => update(item.id, 'credential_url', e.target.value)} placeholder="URL vérification" className="h-8 text-xs bg-white/5 border-white/10 text-white sm:col-span-2" />
                  </div>
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"><Trash2 size={12} />Supprimer</button>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" onClick={add} className="w-full text-xs border-white/20 text-gray-300"><Plus size={14} className="mr-1" />Ajouter</Button>
          </div>

          {/* Footer fixe */}
          <div className="flex gap-2 p-4 border-t border-white/10 shrink-0">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs border-white/20 text-gray-300">Annuler</Button>
            <Button onClick={save} disabled={saving || items.some(i => !i.title.trim() || !i.issuer.trim())} className="flex-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white">
              <Save className="w-3 h-3 mr-1" />{saving ? '...' : 'Sauvegarder'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}