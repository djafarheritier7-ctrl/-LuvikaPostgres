// src/app/dashboard/entreprise/menu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { 
  Plus, Search, Edit, Trash2, ArrowLeft, Upload, 
  DollarSign, Star, Package, ImageIcon, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type MenuItem = {
  id: string;
  org_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
};

export default function MenuPage() {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');
  
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    available: true, featured: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return;
    setCompanyId(company.id);

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('org_id', company.id)
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.warning('Champs requis', { description: 'Nom et prix sont obligatoires.' });
      return;
    }
    setSaving(true);

    // ✅ Correction : le shim local ne fournit pas `supabase.storage`.
    // L'upload de photo est donc temporairement désactivé.
    let imageUrl = editingItem?.image_url || null;
    if (photoFile) {
      console.warn('📷 Upload photo désactivé : `supabase.storage` non implémenté dans le shim.');
      // imageUrl reste null ou inchangé
    }

    const payload = {
      org_id: companyId,
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category || 'Général',
      image_url: imageUrl,
      available: form.available,
      featured: form.featured,
      updated_at: new Date().toISOString(),
    };

    if (editingItem) {
      await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
      toast.success('Article mis à jour');
    } else {
      await supabase.from('menu_items').insert({ ...payload, created_at: new Date().toISOString() });
      toast.success('Article ajouté');
    }

    setShowModal(false);
    resetForm();
    fetchItems();
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    toast.success('Article supprimé');
    fetchItems();
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', available: true, featured: false });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingItem(null);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name, description: item.description || '', price: String(item.price),
      category: item.category, available: item.available, featured: item.featured,
    });
    setPhotoPreview(item.image_url);
    setShowModal(true);
  };

  const categories = [...new Set(items.map(i => i.category))];
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || i.category === categoryFilter)
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
          </Button>
          <h1 className="text-xl font-semibold text-white/80">Menu & Produits</h1>
          <p className="text-xs text-gray-400/60 font-light mt-1">Gérez vos articles, plats et produits</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter un article
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
          <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 text-xs bg-white/[0.03] border border-white/[0.08] text-white/70 rounded-lg px-3 font-light">
          <option value="all">Toutes catégories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.map(item => (
          <motion.div key={item.id} whileHover={{ y: -2 }} className="rounded-2xl p-3 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <div className="w-full h-32 rounded-xl bg-white/[0.03] mb-3 overflow-hidden relative group">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30"><Edit className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30"><Trash2 className="w-3.5 h-3.5 text-red-300" /></button>
              </div>
            </div>
            <h3 className="text-sm text-white/70 font-medium truncate">{item.name}</h3>
            <p className="text-xs text-gray-400/60 font-light truncate">{item.description || '—'}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-emerald-400/80">{item.price.toLocaleString()} $</span>
              <div className="flex gap-1">
                {item.featured && <Badge className="bg-amber-500/10 text-amber-300/70 border-amber-500/20 text-[9px] font-light">★</Badge>}
                {!item.available && <Badge className="bg-red-500/10 text-red-300/70 border-red-500/20 text-[9px] font-light">Indispo.</Badge>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Package className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun article trouvé</p>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="mt-3 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
            Ajouter un premier article
          </Button>
        </div>
      )}

      {/* Modal Ajout/Édition */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white/80">{editingItem ? 'Modifier' : 'Ajouter un article'}</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400/60 hover:text-white/70"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-3">
                {/* Photo */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden cursor-pointer" onClick={() => document.getElementById('menu-photo')?.click()}>
                    {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Upload className="w-5 h-5" /></div>}
                  </div>
                  <input id="menu-photo" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                  <p className="text-[11px] text-gray-400/60 font-light">Photo de l'article</p>
                </div>

                <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Nom *</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Description</label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Prix ($) *</label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                  <div><label className="text-xs text-gray-400/60 font-light mb-1 block">Catégorie</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Général" className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" /></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-gray-400/60 font-light"><input type="checkbox" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="rounded" /> Disponible</label>
                  <label className="flex items-center gap-2 text-xs text-gray-400/60 font-light"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" /> En vedette</label>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="ghost" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">Annuler</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}