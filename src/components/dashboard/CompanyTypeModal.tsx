// src/components/dashboard/CompanyTypeModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Building, Store, Truck, Hotel, Pill, Scissors,
  Briefcase, ShoppingCart, Cpu, GraduationCap,
  Stethoscope, HeartPulse, Home, Dumbbell,
  Wine, Croissant, Book, Fuel, Wrench,
  Bus, Plane, Monitor, Camera, HardHat,
  Wheat, HandHeart, Landmark, MoreHorizontal,
  X, ArrowRight, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

const COMPANY_TYPES = [
  { id: 'restaurant', label: 'Restaurant', icon: Building, color: 'from-orange-500 to-red-500' },
  { id: 'shop', label: 'Boutique / Magasin', icon: Store, color: 'from-blue-500 to-cyan-500' },
  { id: 'delivery', label: 'Livraison', icon: Truck, color: 'from-green-500 to-emerald-500' },
  { id: 'hotel', label: 'Hôtel', icon: Hotel, color: 'from-purple-500 to-indigo-500' },
  { id: 'pharmacy', label: 'Pharmacie', icon: Pill, color: 'from-red-500 to-rose-500' },
  { id: 'beauty', label: 'Salon de beauté', icon: Scissors, color: 'from-pink-500 to-rose-500' },
  { id: 'agency', label: 'Agence de services', icon: Briefcase, color: 'from-amber-500 to-orange-500' },
  { id: 'supermarket', label: 'Supermarché', icon: ShoppingCart, color: 'from-emerald-500 to-teal-500' },
  { id: 'tech', label: 'Entreprise tech', icon: Cpu, color: 'from-cyan-500 to-blue-500' },
  { id: 'school', label: 'Établissement scolaire', icon: GraduationCap, color: 'from-yellow-500 to-amber-500' },
  { id: 'medical', label: 'Cabinet médical', icon: Stethoscope, color: 'from-sky-500 to-blue-500' },
  { id: 'clinic', label: 'Clinique / Hôpital', icon: HeartPulse, color: 'from-red-600 to-rose-600' },
  { id: 'realestate', label: 'Agence immobilière', icon: Home, color: 'from-violet-500 to-purple-500' },
  { id: 'gym', label: 'Salle de sport', icon: Dumbbell, color: 'from-lime-500 to-green-500' },
  { id: 'bar', label: 'Bar / Lounge', icon: Wine, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'bakery', label: 'Boulangerie', icon: Croissant, color: 'from-amber-400 to-yellow-500' },
  { id: 'library', label: 'Librairie', icon: Book, color: 'from-stone-500 to-neutral-500' },
  { id: 'gasstation', label: 'Station-service', icon: Fuel, color: 'from-slate-500 to-gray-500' },
  { id: 'repair', label: 'Atelier de réparation', icon: Wrench, color: 'from-zinc-500 to-gray-600' },
  { id: 'transport', label: 'Transport', icon: Bus, color: 'from-teal-500 to-cyan-500' },
  { id: 'travel', label: 'Agence de voyage', icon: Plane, color: 'from-sky-400 to-blue-400' },
  { id: 'cybercafe', label: 'Cybercafé', icon: Monitor, color: 'from-indigo-500 to-blue-500' },
  { id: 'photography', label: 'Studio photo', icon: Camera, color: 'from-gray-500 to-slate-500' },
  { id: 'construction', label: 'Construction', icon: HardHat, color: 'from-amber-600 to-orange-600' },
  { id: 'farm', label: 'Ferme / Agricole', icon: Wheat, color: 'from-green-600 to-emerald-600' },
  { id: 'ngo', label: 'ONG / Organisation', icon: HandHeart, color: 'from-rose-500 to-pink-500' },
  { id: 'bank', label: 'Banque / Microfinance', icon: Landmark, color: 'from-blue-700 to-indigo-700' },
  { id: 'other', label: 'Autre', icon: MoreHorizontal, color: 'from-gray-400 to-gray-500' },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
};

export default function CompanyTypeModal({ isOpen, onClose, companyId }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const selectedCompany = COMPANY_TYPES.find(t => t.id === selectedType);

  const handleSave = async () => {
    if (!selectedType) return;
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('companies')
      .update({ company_type: selectedType, updated_at: new Date().toISOString() })
      .eq('id', companyId);

    if (error) {
      toast.error('Erreur lors de l\'enregistrement');
      setSaving(false);
      return;
    }

    toast.success('Type d\'entreprise enregistré !');
    setSaving(false);
    onClose();

    // Rediriger vers la page de configuration spécifique
    if (selectedType === 'other') {
      router.push('/dashboard/entreprise/settings');
    } else {
      router.push(`/dashboard/entreprise/setup/${selectedType}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-3xl bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 'select' ? 'Choisissez votre secteur d\'activité' : 'Confirmer votre choix'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {step === 'select'
                  ? 'Sélectionnez le type qui correspond le mieux à votre entreprise'
                  : 'Vous allez être redirigé vers un formulaire adapté à votre activité'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'select' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {COMPANY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <motion.div key={type.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Card
                        className={`cursor-pointer transition-all duration-300 p-4 text-center border ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-medium text-white leading-tight">{type.label}</p>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 w-5 h-5 mx-auto rounded-full bg-cyan-400 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-black" />
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${selectedCompany?.color} flex items-center justify-center shadow-lg`}>
                  {selectedCompany && <selectedCompany.icon className="w-10 h-10 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedCompany?.label}</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Vous allez pouvoir configurer les informations spécifiques à votre {selectedCompany?.label?.toLowerCase()}.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            {step === 'select' ? (
              <>
                <Button variant="outline" onClick={onClose} className="border-white/20 text-gray-300">
                  Plus tard
                </Button>
                <Button onClick={() => setStep('confirm')} disabled={!selectedType} className="bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-50">
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep('select')} className="border-white/20 text-gray-300">
                  ← Retour
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  {saving ? 'Enregistrement...' : 'Confirmer et continuer'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}