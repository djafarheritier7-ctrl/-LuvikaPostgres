// src/app/dashboard/entreprise/setup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { COMPANY_TYPES_DATA } from '@/src/config/company-modules.config';
import { getIcon } from '@/src/config/company-icons';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ArrowLeft, Building } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

export default function SetupChoicePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [existingType, setExistingType] = useState<string | null>(null);
  const [existingCompanyName, setExistingCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/sign-in'); return; }

      const { data: company } = await supabase
        .from('companies')
        .select('company_type, name')
        .eq('owner_id', user.id)
        .single();

      if (company) {
        setExistingType(company.company_type || null);
        setExistingCompanyName(company.name || null);
      }
      setLoading(false);
    };
    checkExisting();
  }, []);

  const handleSelectType = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (existing) {
        // Mettre à jour le type
        const { error } = await supabase
          .from('companies')
          .update({ 
            company_type: type, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing.id);

        if (error) throw error;
        
        toast.success('Type mis à jour', {
          description: `Votre entreprise est maintenant configurée comme "${COMPANY_TYPES_DATA[type]?.label || type}"`,
        });
      } else {
        // Créer une nouvelle entreprise
        const { error } = await supabase
          .from('companies')
          .insert({
            owner_id: user.id,
            company_type: type,
            name: 'Mon entreprise',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        toast.success('Entreprise créée', {
          description: 'Vous pouvez maintenant la configurer',
        });
      }

      router.push(`/dashboard/entreprise/setup/${type}`);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la sélection', {
        description: 'Veuillez réessayer',
      });
    }
  };

  if (loading) return <Loading />;

  const types = Object.entries(COMPANY_TYPES_DATA);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bouton retour */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard/entreprise')} 
        className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> 
        Retour au dashboard
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Building className="w-7 h-7 text-gray-400/60" />
        </div>
        <h1 className="text-3xl font-bold text-white/90 mb-3">
          {existingType ? 'Changer le type d\'entreprise' : 'Choisissez votre type d\'entreprise'}
        </h1>
        {existingCompanyName && (
          <p className="text-sm text-gray-400/50 font-light mb-2">
            Entreprise actuelle : <span className="text-white/60">{existingCompanyName}</span>
          </p>
        )}
        <p className="text-gray-400/60 font-light max-w-lg mx-auto">
          Cette configuration permet d'adapter Luvika à vos besoins spécifiques. 
          Vous pourrez personnaliser davantage après la sélection.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {types.map(([key, config], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleSelectType(key)}
            className={`relative rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border transition-all text-left group ${
              existingType === key
                ? 'border-cyan-400/30 ring-1 ring-cyan-400/20 bg-cyan-500/[0.02]'
                : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
            }`}
          >
            {existingType === key && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400/70" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
              {getIcon(config.iconName)}
            </div>
            <h3 className="text-sm text-white/70 font-medium mb-1">{config.label}</h3>
            <p className="text-[11px] text-gray-400/50 font-light line-clamp-2">
              {config.modules.length} modules disponibles
            </p>
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] text-gray-500/40 font-light">
                {config.modules.filter(m => m.required).length} requis
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500/50 group-hover:text-cyan-400/70 group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Aide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-gray-500/40 font-light">
          Vous pourrez modifier ce choix plus tard dans les paramètres
        </p>
      </motion.div>
    </div>
  );
}