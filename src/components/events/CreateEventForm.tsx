'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Calendar, MapPin, Users, Hash, Link as LinkIcon, QrCode, Send, RotateCcw,
  Locate, Clock, Tag, AlertCircle, Loader2, ChevronRight, ChevronLeft, Globe, Shield, CheckCircle, ScanLine
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';

const formatDateForInput = (dateStr: string): string => {
  const date = new Date(dateStr);
  // Convertit en représentation locale pour datetime-local
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};
type EventData = {
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  is_public: boolean;
  max_participants?: number;
};

type Props = {
  onSubmit: (data: EventData) => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
};

export default function CreateEventForm({ onSubmit, onCancel, onClose, isLoading = false }: Props) {
  const t = useTranslations('CreateEventForm');
  const now = new Date();
  
  // États du formulaire (1 à 5)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
const [startsAt, setStartsAt] = useState(
  formatDateForInput(new Date(now.getTime() + 15 * 60000).toISOString())
);
const [endsAt, setEndsAt] = useState(
  formatDateForInput(new Date(now.getTime() + 2 * 3600000).toISOString())
);
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  
  // États utilitaires
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('fr');

  // Initialisation Locale
  useEffect(() => {
    const stored = localStorage.getItem('NEXT_LOCALE');
    if (stored) setCurrentLocale(stored);
    else {
      const browser = navigator.language.split('-')[0];
      if (['fr', 'en', 'sw', 'ln', 'pt', 'ar', 'es', 'ko', 'nl'].includes(browser)) setCurrentLocale(browser);
    }
  }, []);

  // --- VALIDATIONS PAR ÉTAPE ---

  const isStep1Valid = useMemo(() => {
    if (!title.trim() || title.length < 3) return false;
    if (!startsAt) return false;
    if (new Date(startsAt) <= new Date(Date.now() - 120000)) return false;
    return true;
  }, [title, startsAt]);

  const isStep2Valid = useMemo(() => {
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) return false;
    return true;
  }, [maxParticipants]);

  const isStep3Valid = true;
  const isStep4Valid = !isGeneratingQR && !!qrDataUrl;

  const isFormValid = useMemo(() => {
    return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
  }, [isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid]);

  const previewUrl = useMemo(() => {
    if (!title) return '';
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/${currentLocale}/events/${slug}-${Date.now().toString(36)}`;
  }, [title, currentLocale]);

  // Génération QR Code
  useEffect(() => {
    if (!title || !startsAt) return;
    setIsGeneratingQR(true);
    const timer = setTimeout(() => {
      try {
        const payload = encodeURIComponent(JSON.stringify({ title, starts_at: startsAt, location, is_public: isPublic }).replace(/\s+/g, ''));
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${payload}`);
      } catch (e) { console.warn(e); }
      finally { setIsGeneratingQR(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, startsAt, location, isPublic]);

  // Géolocalisation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return setErrors(p => ({ ...p, location: t('error_location_not_supported') }));
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=${currentLocale}`);
          const data = await res.json();
          setLocation(data.display_name || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } catch { setLocation(t('error_location_unknown')); }
        finally { setIsLocating(false); }
      },
      (err) => {
        setErrors(p => ({ ...p, location: err.code === 1 ? t('error_location_denied') : t('error_location_generic') }));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = t('error_title_required');
    else if (title.length < 3) e.title = t('error_title_min_length');
    if (!startsAt) e.startsAt = t('error_date_required');
    else if (new Date(startsAt) <= new Date()) e.startsAt = t('error_date_future');
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) e.endsAt = t('error_date_order');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (maxParticipants && (Number(maxParticipants) < 1 || Number(maxParticipants) > 10000)) e.maxParticipants = t('error_max_participants_range');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


const handleSubmit = async (ev: React.FormEvent) => {
  ev.preventDefault();
  if (!validateStep1() || !validateStep2()) return;

  // L'input datetime-local (startsAt) est déjà local; new Date(startsAt) l'interprète en local.
  const utcStart = new Date(startsAt).toISOString();
  const utcEnd = endsAt ? new Date(endsAt).toISOString() : undefined;

  console.log('Input:', startsAt, ' -> UTC:', utcStart);

  await onSubmit({
    title,
    description: description.trim() || undefined,
    location: location.trim() || undefined,
    starts_at: utcStart,
    ends_at: utcEnd,
    is_public: isPublic,
    max_participants: maxParticipants ? Number(maxParticipants) : undefined,
  });
};

  const getStepTitle = () => {
    switch(step) {
      case 1: return t('step1_title');
      case 2: return t('step2_title');
      case 3: return t('step3_title');
      case 4: return t('step4_title');
      case 5: return t('step5_title');
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch(step) {
      case 1: return t('step1_subtitle');
      case 2: return t('step2_subtitle');
      case 3: return t('step3_subtitle');
      case 4: return t('step4_subtitle');
      case 5: return t('step5_subtitle');
      default: return '';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="glass-border bg-black/40 backdrop-blur-xl border-white/10 w-full shadow-2xl overflow-hidden">
        
        {/* Header avec Indicateur d'Étapes (5 steps) */}
        <div className="p-5 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{getStepTitle()}</h2>
                <p className="text-xs text-gray-400">{getStepSubtitle()}</p>
              </div>
            </div>
            
            {/* Badges d'étapes */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  step === i 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 scale-105' 
                    : step > i 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/5 text-gray-500'
                }`}>
                  {step > i ? <CheckCircle className="w-3 h-3" /> : <span>{i}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Barre de progression dynamique */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: step === 1 ? "20%" : step === 2 ? "40%" : step === 3 ? "60%" : step === 4 ? "80%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            
            {/* ================= ÉTAPE 1 : BASES ================= */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {t('title_label')}</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('title_placeholder')} className="bg-white/5 border-white/10 text-sm h-10" autoFocus />
                  {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('start_label')}</label>
                    <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-10" />
                    {errors.startsAt && <p className="text-red-400 text-[10px] mt-1">{errors.startsAt}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('end_label')}</label>
                    <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-10" min={startsAt} />
                    {errors.endsAt && <p className="text-red-400 text-[10px] mt-1">{errors.endsAt}</p>}
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={handleNext} disabled={!isStep1Valid} className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    {t('next_button')} <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 2 : DÉTAILS ================= */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t('location_label')}</label>
                  <div className="flex gap-2">
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder={t('location_placeholder')} className="bg-white/5 border-white/10 text-sm h-10" />
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-cyan-400 hover:bg-cyan-500/10 shrink-0" onClick={getCurrentLocation} disabled={isLocating}>
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {t('max_participants_label')}</label>
                    <Input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value ? Number(e.target.value) : '')} placeholder={t('max_participants_placeholder')} className="bg-white/5 border-white/10 text-sm h-10" />
                    {errors.maxParticipants && <p className="text-red-400 text-[10px] mt-1">{errors.maxParticipants}</p>}
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                     <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <label className="text-xs font-medium text-gray-300 block mb-1">{t('description_label')}</label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="bg-black/20 border-white/5 text-sm resize-none h-20" placeholder={t('description_placeholder')} />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> {t('back_button')}
                  </Button>
                  <Button type="button" onClick={handleNext} disabled={!isStep2Valid} className="flex-[2] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    {t('next_button')} <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 3 : OPTIONS ================= */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> {t('visibility_title')}</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {isPublic ? <Globe className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </div>
                      <div>
                        <label className="text-sm font-bold text-white block">{t('public_event_label')}</label>
                        <p className="text-xs text-gray-400 mt-0.5">{isPublic ? t('public_event_description') : t('private_event_description')}</p>
                      </div>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> {t('back_button')}
                  </Button>
                  <Button type="button" onClick={handleNext} className="flex-[2] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    {t('view_qr_button')} <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 4 : QR CODE ================= */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">{t('qr_title')}</h3>
                  <p className="text-xs text-gray-400">{t('qr_subtitle')}</p>
                </div>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-3 rounded-2xl shadow-2xl border-2 border-white/10">
                      {isGeneratingQR ? (
                        <div className="w-40 h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
                      ) : qrDataUrl ? (
                        <div className="relative">
                          <img src={qrDataUrl} alt="QR" className="w-40 h-40 object-contain mix-blend-multiply" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm rounded-xl">
                            <ScanLine className="w-8 h-8 text-white mb-1 animate-pulse" />
                            <span className="text-white font-bold text-xs">{t('scan_me')}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>luvika.me
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> {t('edit_button')}
                  </Button>
                  <Button type="button" onClick={handleNext} disabled={!isStep4Valid} className="flex-[2] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-11">
                    {t('validate_button')} <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= ÉTAPE 5 : RÉCAPITULATIF FINAL ================= */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-white mb-1">{t('review_title')}</h3>
                  <p className="text-xs text-gray-400">{t('review_subtitle')}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/10 shadow-lg">
                  <div className="flex-1 w-full space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-gray-400 block mb-1 text-[10px] uppercase tracking-wider">{t('review_title_label')}</span> 
                        <span className="text-white font-medium truncate block text-sm">{title}</span>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-gray-400 block mb-1 text-[10px] uppercase tracking-wider">{t('review_date_label')}</span> 
                        <span className="text-white font-medium block text-sm">{startsAt ? new Date(startsAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}) : '...'}</span>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-gray-400 block mb-1 text-[10px] uppercase tracking-wider">{t('review_location_label')}</span> 
                        <span className="text-white font-medium truncate block text-sm">{location || t('review_not_defined')}</span>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                        <span className="text-gray-400 block mb-1 text-[10px] uppercase tracking-wider">{t('review_visibility_label')}</span> 
                        <Badge variant={isPublic ? "default" : "secondary"} className="text-[9px] h-5 mt-0.5">
                          {isPublic ? t('public_badge') : t('private_badge')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5">
                       <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 break-all flex items-center gap-2">
                        <LinkIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300 font-mono text-[10px]">luvika.me{previewUrl}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 h-11">
                    <ChevronLeft className="w-4 h-4 mr-2" /> {t('edit_button')}
                  </Button>
                                   <Button 
  type="submit" 
  disabled={isLoading} 
  className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white h-11 shadow-lg shadow-green-900/20"
>
  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
  {t('create_button')}
</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </Card>

      {/* Toast Erreur Global */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && step < 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 max-w-xs z-[200]">
            <div className="bg-red-950/90 backdrop-blur border border-red-500/50 text-red-100 px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">{t('errors_detected_title')}</p>
                <ul className="text-xs space-y-1 mt-1 list-disc list-inside opacity-90">
                  {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}