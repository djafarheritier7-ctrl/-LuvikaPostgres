// src/app/complete-profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  User, Phone, Briefcase, Mail, 
  Check, AlertCircle, X,
  Sparkle, ArrowLeft, ArrowRight, Loader2,
  ShieldCheck, Globe, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

type Step = 'identity' | 'contact' | 'bio';
type FormData = {
  full_name: string;
  username: string;
  phone: string;
  whatsapp: string;
  job_title: string;
  company: string;
  bio_short: string;
  address: string;
};

// 🔹 Server-side translations fallback
const t = (key: string) => {
  const translations = {
    'auth.complete.error_full_name_required': 'Veuillez saisir votre nom complet',
    'auth.complete.error_username_too_short': 'Le nom d\'utilisateur doit contenir au moins 3 caractères et tout doit être en minuscule',
    'auth.complete.username_taken': 'Ce nom d\'utilisateur est déjà pris',
    'auth.complete.error_generic': 'Erreur lors de la mise à jour du profil',
    'auth.complete.success': 'Profil mis à jour avec succès !',
    'auth.complete.step_identity': 'Identité',
    'auth.complete.step_contact': 'Contact',
    'auth.complete.step_bio': 'Bio',
    'auth.complete.title_identity': 'Complétez votre identité',
    'auth.complete.title_contact': 'Informations de contact',
    'auth.complete.title_bio': 'Bio professionnelle',
    'auth.complete.desc_identity': 'Vos informations personnelles',
    'auth.complete.desc_contact': 'Comment les gens peuvent vous contacter',
    'auth.complete.desc_bio': 'Votre expertise et votre parcours',
    'auth.complete.full_name': 'Nom complet',
    'auth.complete.full_name_placeholder': 'Entrez votre nom complet',
    'auth.complete.username': 'Nom d\'utilisateur',
    'auth.complete.username_placeholder': 'Choisissez un nom d\'utilisateur',
    'auth.complete.phone': 'Téléphone',
    'auth.complete.whatsapp': 'WhatsApp',
    'auth.complete.job_title': 'Poste',
    'auth.complete.company': 'Entreprise',
    'auth.complete.bio_short': 'Bio courte',
    'auth.complete.back': 'Retour',
    'auth.complete.next': 'Suivant',
    'auth.complete.finish': 'Terminer le profil',
    'auth.complete.saving': 'Enregistrement...',
    'auth.complete.skip': 'Passer pour plus tard',
    'auth.complete.welcome': 'Bienvenue sur LUVIKA !',
    'auth.complete.subtitle': 'Complétez votre profil pour débloquer toutes les fonctionnalités',
    'auth.complete.secure': 'Vos données sont sécurisées • Chiffrement AES-256'
  };
  return translations[key as keyof typeof translations] || key;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('identity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    username: '',
    phone: '',
    whatsapp: '',
    job_title: '',
    company: '',
    bio_short: '',
    address: '',
  });

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // 🔹 ✅ Correction CRITIQUE : Suppression de la duplication d'appel API
  useEffect(() => {
    if (hasCheckedProfile) return;
    setHasCheckedProfile(true);

    const checkProfile = async () => {
      try {
        // 🔹 ✅ UN SEUL appel à getUser() - suppression de la duplication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.warn('🚨 Pas d\'utilisateur — redirection vers /auth/sign-in');
          return router.push('/auth/sign-in');
        }

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('onboarding_done, username, full_name')
  .eq('id', user.id)
  .maybeSingle();

if (profileError && profileError.code !== 'PGRST116') {
  console.error('❌ Erreur chargement profil:', profileError);
  return;
}

// profile peut être null si aucune ligne n'existe encore
const isComplete = profile?.onboarding_done === true;
        console.log('🔍 CompleteProfile check:', { user_id: user.id, isComplete });

        if (isComplete) {
          localStorage.setItem('luvika_skip_onboarding', 'true');
          setTimeout(() => {
            localStorage.removeItem('luvika_skip_onboarding');
            router.push('/dashboard');
          }, 300);
        } else {
          // Pré-remplir avec les données du signup si disponibles
          const urlParams = new URLSearchParams(window.location.search);
          setFormData(prev => ({
  ...prev,
  full_name: urlParams.get('full_name') || profile?.full_name || '',
  username: urlParams.get('username') || profile?.username || '',
}));
          // Focus sur le champ username si vide
          if (!profile?.username && usernameInputRef.current) {
            setTimeout(() => usernameInputRef.current?.focus(), 100);
          }
        }
      } catch (err) {
        console.error('❌ Erreur checkProfile:', err);
        // Ne pas rediriger ici - laisser l'utilisateur compléter le profil
      }
    };

    checkProfile();
  }, [router, supabase, hasCheckedProfile]);

  // 🔹 Vérification username optimisée avec debounce
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username.toLowerCase().trim())
          .maybeSingle();

        setUsernameAvailable(!existing);
      } catch (err) {
        console.error('Erreur vérification username:', err);
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    
    // Reset username availability check when typing
    if (name === 'username') {
      setUsernameAvailable(null);
    }
  };

  const handleNext = () => {
    if (step === 'identity') {
      if (!formData.full_name.trim()) {
        setError(t('auth.complete.error_full_name_required'));
        return;
      }
      if (formData.username.trim().length < 3) {
        setError(t('auth.complete.error_username_too_short'));
        return;
      }
      if (usernameAvailable === false) {
        setError(t('auth.complete.username_taken'));
        return;
      }
      if (usernameAvailable === null && formData.username.trim().length >= 3) {
        setError('Veuillez attendre la vérification du nom d\'utilisateur');
        return;
      }
    }

    setStep(prev => 
      prev === 'identity' ? 'contact' :
      prev === 'contact' ? 'bio' : 'bio'
    );
    
    setError(null);
  };

  const handleSkip = () => {
    if (step === 'identity') return;
    
    if (step === 'contact') {
      setStep('bio');
    } else if (step === 'bio') {
      handleSubmit();
    }
    setError(null);
  };

  const handleSubmit = async () => {
    if (step !== 'bio') return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return router.push('/auth/sign-in');

      // 🔹 ✅ Récupération du plan depuis les cookies
      const getPlan = () => {
        const match = document.cookie.match(/signup_plan=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : 'basic';
      };

      // 🔹 ✅ Nettoyage des données avant envoi
      const cleanedData = {
        id: user.id,
        full_name: formData.full_name.trim(),
        username: formData.username.trim().toLowerCase(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        job_title: formData.job_title.trim(),
        company: formData.company.trim(),
        bio_short: formData.bio_short.trim(),
        address: formData.address.trim(),
        plan: getPlan(),
        onboarding_done: true,
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(cleanedData, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // 🔹 ✅ Nettoyage des cookies après utilisation
      document.cookie = "signup_plan=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      setSuccess(true);
      
      // 🔹 ✅ Redirection après succès avec délai
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError(err.message || t('auth.complete.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const steps: Step[] = ['identity', 'contact', 'bio'];
  const currentStepIndex = steps.indexOf(step);

  // 🔹 Icônes et couleurs par étape
  const stepConfig = {
    identity: { icon: User, color: 'from-cyan-500 to-blue-500', gradient: 'bg-gradient-to-r from-cyan-400 to-blue-400' },
    contact: { icon: Phone, color: 'from-emerald-500 to-teal-500', gradient: 'bg-gradient-to-r from-emerald-400 to-teal-400' },
    bio: { icon: Briefcase, color: 'from-purple-500 to-indigo-500', gradient: 'bg-gradient-to-r from-purple-400 to-indigo-400' },
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-2xl opacity-20"></div>
            <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Check className="w-12 h-12 text-white drop-shadow-md" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-300 mb-4">
            {t('auth.complete.success')}
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 max-w-sm mx-auto">
            Votre profil est prêt ! Redirection vers votre tableau de bord...
          </p>
          
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-[13px] text-emerald-300/90">
              <ShieldCheck className="w-4 h-4" />
              <span>Profil sécurisé • Données chiffrées</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-900/10 to-indigo-900/10 relative overflow-hidden">
      {/* 🔹 Fond décoratif */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(79,70,229,0.05),transparent_70%)]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
<Card className="bg-black/60 rounded-3xl border border-white/20 overflow-hidden">
          {/* 🔹 Bandeau supérieur décoratif */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          
          {/* 🔹 Header avec logo */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center justify-center gap-3 mb-4">
             
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                  {t('auth.complete.welcome')}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {t('auth.complete.subtitle')}
                </p>
              </div>
            </div>
            
            {/* 🔹 Indicateur de progression premium */}
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                {steps.map((s, i) => {
                  const isActive = step === s;
                  const isCompleted = i < currentStepIndex;
                  const Icon = stepConfig[s].icon;
                  const gradient = stepConfig[s].gradient;
                  
                  return (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${
                        isCompleted 
                          ? 'bg-emerald-500/20 border border-emerald-500/30' 
                          : isActive 
                          ? `${gradient} shadow-lg shadow-cyan-500/20` 
                          : 'bg-white/5 border border-white/10'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                        )}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-2xl bg-emerald-500 opacity-20"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isActive ? 'text-cyan-300' : 'text-gray-400'
                      }`}>
                        {t(`auth.complete.step_${s}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* 🔹 Barre de progression fluide */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStepIndex) / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 🔹 Contenu principal */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-900/30 border border-amber-500/30 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-200 font-medium mb-0.5">Erreur de validation</p>
                      <p className="text-amber-100/90 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 text-center mb-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                    {step === 'identity' && t('auth.complete.title_identity')}
                    {step === 'contact' && t('auth.complete.title_contact')}
                    {step === 'bio' && t('auth.complete.title_bio')}
                  </h2>
                  <p className="text-gray-400">
                    {step === 'identity' && t('auth.complete.desc_identity')}
                    {step === 'contact' && t('auth.complete.desc_contact')}
                    {step === 'bio' && t('auth.complete.desc_bio')}
                  </p>
                </div>

                {/* 🔹 Étape Identité */}
                {step === 'identity' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2 text-gray-300">
                        <User className="w-4 h-4 text-cyan-400" />
                        {t('auth.complete.full_name')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder={t('auth.complete.full_name_placeholder')}
                          className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                          required
                          autoFocus
                        />
                        {formData.full_name && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {t('auth.complete.username')}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          luvika.me/
                        </div>
                        <Input
                          ref={usernameInputRef}
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="votre_nom"
                          className="pl-24 pr-12 py-3.5 bg-white/5 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                          required
                          pattern="^[a-z0-9_-]{3,20}$"
                        />
                        {checkingUsername ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">···</div>
                        ) : usernameAvailable === true ? (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        ) : usernameAvailable === false ? (
                          <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                        ) : null}
                      </div>
                      
                      {usernameAvailable === false && (
                        <p className="text-[13px] text-amber-400 mt-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t('auth.complete.username_taken')}
                        </p>
                      )}
                      
                      <p className="text-[13px] text-gray-500 mt-1">
                        ⚡ Seulement lettres minuscules, chiffres, tirets et underscores • 3-20 caractères
                      </p>
                    </div>
                  </div>
                )}

                {/* 🔹 Étape Contact */}
                {step === 'contact' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        {t('auth.complete.phone')}
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+242 04 000 00 00"
                        className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="flex items-center gap-2 text-gray-300">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        WhatsApp (optionnel)
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          wa.me/
                        </div>
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="2420400000000"
                          className="pl-20 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                        />
                      </div>
                      <p className="text-[13px] text-gray-500">
                        🔒 Votre numéro ne sera visible que par vos contacts autorisés
                      </p>
                    </div>
                  </div>
                )}

                {/* 🔹 Étape Bio */}
                {step === 'bio' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="job_title" className="flex items-center gap-2 text-gray-300">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        {t('auth.complete.job_title')}
                      </Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        placeholder="Développeur Full Stack"
                        className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        {t('auth.complete.company')}
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Elikya Fondation"
                        className="pl-4 pr-4 py-3.5 bg-white/5 border border-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio_short" className="flex items-center gap-2 text-gray-300">
                        <Sparkle className="w-4 h-4 text-purple-400" />
                        {t('auth.complete.bio_short')}
                      </Label>
                      <Textarea
                        id="bio_short"
                        name="bio_short"
                        value={formData.bio_short}
                        onChange={handleChange}
                        placeholder="Passionné de tech et de fierté africaine 🌍 | Créateur de solutions numériques innovantes"
                        className="min-h-[100px] bg-white/5 border border-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
                        maxLength={160}
                      />
                      <div className="flex justify-end text-[13px] text-gray-500">
                        {formData.bio_short.length}/160
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 🔹 Navigation */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-3">
                  {step !== 'identity' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(prev => prev === 'contact' ? 'identity' : 'contact')}
                      className="border-white/20 text-gray-300 hover:bg-white/10 px-5 py-3 rounded-xl font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      {t('auth.complete.back')}
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {step !== 'bio' ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        (step === 'identity' && (
                          !formData.full_name.trim() || 
                          formData.username.length < 3 || 
                          usernameAvailable === false ||
                          (usernameAvailable === null && formData.username.trim().length >= 3)
                        ))
                      }
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"></span>
                      <span className="flex items-center justify-center gap-2">
                        {t('auth.complete.next')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 group relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"></span>
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('auth.complete.saving')}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {t('auth.complete.finish')}
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                  
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[13px] text-cyan-300/90">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('auth.complete.secure')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* 🔹 Signature */}
        <div className="mt-6 text-center text-[13px] text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkle className="w-3 h-3 text-cyan-400" />
          <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
        </div>
      </motion.div>
    </div>
  );
}
