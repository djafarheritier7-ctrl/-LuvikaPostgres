// src/app/dashboard/entreprise/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Settings, MapPin, Globe, LinkIcon, Building2, Mail, Phone, FileText, 
  ArrowLeft, Clock, Save, Upload, ImageIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loading from '@/src/components/system/Loading';

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', shop: 'Boutique', delivery: 'Livraison',
  hotel: 'Hôtel', pharmacy: 'Pharmacie', beauty: 'Salon de beauté',
  agency: 'Agence', supermarket: 'Supermarché', tech: 'Tech',
  school: 'École', medical: 'Cabinet médical', clinic: 'Clinique',
  realestate: 'Immobilier', gym: 'Salle de sport', bar: 'Bar / Lounge',
  bakery: 'Boulangerie', library: 'Librairie', gasstation: 'Station-service',
  repair: 'Réparation', transport: 'Transport', travel: 'Voyage',
  cybercafe: 'Cybercafé', photography: 'Photo', construction: 'Construction',
  farm: 'Ferme', ngo: 'ONG', bank: 'Banque',
  other: 'Autre',
};

export default function SettingsPage() {
  const t = useTranslations('enterprise.modules.settings');
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '',
    website: '', description: '', logo_url: '', opening_hours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).single();
      if (data) {
        setCompany(data);
        setFormData({
          name: data.name || '', email: data.email || '', phone: data.phone || '',
          address: data.address || '', city: data.city || '', country: data.country || '',
          website: data.website || '', description: data.description || '',
          logo_url: data.logo_url || '', opening_hours: data.opening_hours || '',
        });
        setPhotoPreview(data.logo_url || null);
      }
      setLoading(false);
    };
    fetchCompany();
  }, []);

  // ✅ Correction : le shim local ne fournit pas `supabase.storage`.
  // L'upload de logo est temporairement désactivé.
  const uploadLogo = async (file: File): Promise<string | null> => {
    console.warn('📷 Upload logo désactivé : `supabase.storage` non implémenté dans le shim.');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoUrl = formData.logo_url;
      if (photoFile) {
        const uploaded = await uploadLogo(photoFile);
        if (uploaded) logoUrl = uploaded;
      }

      const { error } = await supabase.from('companies').update({
        name: formData.name.trim(), email: formData.email.trim(),
        phone: formData.phone.trim(), address: formData.address.trim(),
        city: formData.city.trim(), country: formData.country.trim(),
        website: formData.website.trim(), description: formData.description.trim(),
        logo_url: logoUrl, opening_hours: formData.opening_hours.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', company.id);

      if (error) throw error;
      toast.success('Paramètres enregistrés', {
        description: 'Vos informations ont été mises à jour.',
        icon: <Save className="w-4 h-4 text-emerald-400/70" />,
      });
      setPhotoFile(null);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      toast.error('Erreur', {
        description: 'Impossible d\'enregistrer les modifications.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/entreprise')} 
          className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> 
          Retour
        </Button>
        <h1 className="text-lg font-semibold text-white/80">{t('title')}</h1>
      </div>

      {/* Type d'entreprise */}
      {company?.company_type && (
        <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400/60 font-light">Catégorie</p>
            <p className="text-sm text-white/70 font-medium">{TYPE_LABELS[company.company_type] || company.company_type}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/dashboard/entreprise/setup/${company.company_type}`)} 
            className="h-7 text-xs text-cyan-400/60 hover:text-cyan-300/70 hover:bg-cyan-500/[0.04] font-light rounded-lg"
          >
            Configurer
          </Button>
        </div>
      )}

      {/* Formulaire */}
      <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400/60" />
          Informations de l'entreprise
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div 
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/[0.08] hover:border-cyan-400/30 cursor-pointer group bg-white/[0.03]" 
              onClick={() => document.getElementById('logo-input')?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500/50 group-hover:text-cyan-400/60">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-4 h-4 text-white/80" />
              </div>
            </div>
            <input 
              id="logo-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={e => { 
                const f = e.target.files?.[0]; 
                if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } 
              }} 
            />
            <div>
              <Label className="text-xs text-gray-400/70 font-light">Logo</Label>
              <p className="text-[11px] text-gray-500/50 font-light">JPEG ou PNG, max 2 Mo</p>
            </div>
          </div>

          {/* Champs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5" />Nom
              </Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5" />Email
              </Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5" />Téléphone
              </Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />Horaires
              </Label>
              <Input 
                value={formData.opening_hours} 
                onChange={e => setFormData({...formData, opening_hours: e.target.value})} 
                placeholder="Lun-Ven 8h-18h" 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" />Adresse
              </Label>
              <Input 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" />Ville
              </Label>
              <Input 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5" />Pays
              </Label>
              <Input 
                value={formData.country} 
                onChange={e => setFormData({...formData, country: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <LinkIcon className="w-3.5 h-3.5" />Site web
              </Label>
              <Input 
                type="url" 
                placeholder="https://exemple.com" 
                value={formData.website} 
                onChange={e => setFormData({...formData, website: e.target.value})} 
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg" 
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-400/70 font-light flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5" />Description
              </Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                rows={3} 
                className="text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg resize-none" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={saving} 
            className="w-full h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                Enregistrer
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}