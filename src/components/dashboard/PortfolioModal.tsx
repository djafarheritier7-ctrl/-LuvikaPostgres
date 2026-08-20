// src/components/dashboard/PortfolioModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, Save, Folder } from 'lucide-react';

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
};

export default function PortfolioModal({
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
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/portfolio?profile_id=${profileId}`)
        .then(r => r.json())
        .then(({ portfolios }) => {
          setItems(portfolios || []);
          setLoading(false);
        });
    }
  }, [isOpen, profileId]);

  const add = () => setItems([...items, { id: `new-${Date.now()}`, title: '', tags: [] }]);
  const update = (id: string, field: keyof PortfolioItem, value: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const save = async () => {
    setSaving(true);
    for (const item of items) {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'portfolio', data: { title: item.title, description: item.description, image_url: item.image_url, demo_url: item.demo_url, repo_url: item.repo_url, tags: item.tags, position: items.indexOf(item) } }),
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

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Folder className="text-cyan-400 w-5 h-5" />Portfolio</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X size={16} /></Button>
          </div>

          {/* Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-8">Chargement...</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <Input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} placeholder="Titre *" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                  <Input value={item.demo_url || ''} onChange={e => update(item.id, 'demo_url', e.target.value)} placeholder="URL démo" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                  <Textarea value={item.description || ''} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Description" className="text-xs bg-white/5 border-white/10 text-white" rows={2} />
                  <Input value={item.tags.join(', ')} onChange={e => update(item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Tags (React, Design...)" className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"><Trash2 size={12} />Supprimer</button>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" onClick={add} className="w-full text-xs border-white/20 text-gray-300"><Plus size={14} className="mr-1" />Ajouter un projet</Button>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 border-t border-white/10 shrink-0">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs border-white/20 text-gray-300">Annuler</Button>
            <Button onClick={save} disabled={saving || items.some(i => !i.title.trim())} className="flex-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
              <Save className="w-3 h-3 mr-1" />{saving ? '...' : 'Sauvegarder'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}