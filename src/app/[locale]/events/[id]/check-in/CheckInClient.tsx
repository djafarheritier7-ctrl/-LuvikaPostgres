// src/app/[locale]/events/[id]/check-in/CheckInClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { 
  Users, RefreshCw, CheckCircle, XCircle, Wifi, WifiOff, 
  UserPlus, QrCode, ArrowRight, Lock, Clock 
} from 'lucide-react';

type CheckInClientProps = {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  endsAt: string;
  isPublic: boolean;
  token: string | null;
  isOrganizer: boolean;
  requiresName: boolean;
};

export default function CheckInClient({ 
  eventId, eventTitle, startsAt, endsAt, isPublic, token, requiresName 
}: CheckInClientProps) {
  const [participantName, setParticipantName] = useState('');
  const [email, setEmail] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

  const supabase = useCallback(() => createClient(), []);

  // Gestion du statut de l'événement (upcoming / live / ended)
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const start = new Date(startsAt);
      const end = new Date(endsAt);

      if (now < start) {
        const diffMs = start.getTime() - now.getTime();
        const totalSeconds = Math.floor(diffMs / 1000);
        setTimeRemaining({ minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 });
        setEventStatus('upcoming');
      } else if (now >= start && now <= end) {
        setTimeRemaining(null);
        setEventStatus('live');
      } else {
        setTimeRemaining(null);
        setEventStatus('ended');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [startsAt, endsAt]);

  // Chargement initial du nombre de participants (compatible shim)
  useEffect(() => {
    const client = supabase();
    
    const fetchInitialCount = async () => {
      try {
        const { data, error } = await client
          .from('event_participants')
          .select('id')
          .eq('event_id', eventId);

        if (!error) {
          setParticipantsCount(data?.length || 0);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.warn('Erreur chargement compteur:', err);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchInitialCount();
  }, [eventId, supabase]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim() && requiresName) {
      setError('Le nom est requis.');
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const client = supabase();
      
      const payload = {
        event_id: eventId,
        name: participantName.trim() || 'Invité',
        email: email.trim() || null,
        qr_token: token || uuidv4(),
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
      };

      const { error } = await client.from('event_participants').insert(payload);
      if (error) throw error;

      setCheckedIn(true);
      setParticipantsCount(prev => prev !== null ? prev + 1 : 1);
      setLastUpdate(new Date());
      toast.success('Check-in réussi !');
    } catch (err: any) {
      console.error('Erreur check-in:', err);
      setError(err.message || 'Erreur lors du check-in');
      toast.error('Échec du check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // ========================
  // RENDU CONDITIONNEL
  // ========================

  // 1. Privé
  if (!isPublic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center max-w-sm w-full">
          <Lock className="w-10 h-10 mx-auto text-amber-400/60 mb-3" />
          <h2 className="text-lg font-semibold text-white/80 mb-1">Accès privé</h2>
          <p className="text-sm text-gray-400/60 font-light">Cet événement est réservé aux invités.</p>
        </div>
      </div>
    );
  }

  // 2. À venir
  if (eventStatus === 'upcoming' && timeRemaining) {
    const startDate = new Date(startsAt);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center max-w-sm w-full">
          <Clock className="w-10 h-10 mx-auto text-cyan-400/60 mb-3" />
          <h2 className="text-lg font-semibold text-white/80 mb-1">Bientôt !</h2>
          <p className="text-sm text-gray-400/60 font-light mb-4">
            L'événement « {eventTitle} » est prévu le{' '}
            {startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })} à{' '}
            {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
          </p>
          <div className="text-3xl font-mono font-bold text-cyan-300/80">
            {timeRemaining.minutes.toString().padStart(2, '0')}:{timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500/50 font-light mt-1">minutes : secondes</p>
        </div>
      </div>
    );
  }

  // 3. Terminé
  if (eventStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center max-w-sm w-full">
          <XCircle className="w-10 h-10 mx-auto text-red-400/60 mb-3" />
          <h2 className="text-lg font-semibold text-white/80 mb-1">Événement terminé</h2>
          <p className="text-sm text-gray-400/60 font-light">Merci d'être venu(e) !</p>
          {!loadingCount && participantsCount !== null && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Users className="w-4 h-4 text-cyan-400/60" />
              <span className="text-lg font-semibold text-white/80">{participantsCount}</span>
              <span className="text-xs text-gray-400/60 font-light">participant{participantsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Chargement
  if (loadingCount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // 5. Check-in normal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/80 text-xs font-light mb-3">
            <QrCode className="w-3.5 h-3.5" />
            Check-in
          </div>
          <h1 className="text-xl font-semibold text-white/80 mb-3">{eventTitle}</h1>

          {participantsCount !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Users className="w-4 h-4 text-cyan-400/60" />
              <span className="text-lg font-semibold text-white/80">{participantsCount}</span>
              <span className="text-xs text-gray-400/60 font-light">participant{participantsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </motion.div>

        {!checkedIn ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3">
                    <UserPlus className="w-5 h-5 text-cyan-400/60" />
                  </div>
                  <h2 className="text-base font-semibold text-white/80">Confirmez votre présence</h2>
                </div>

                <div>
                  <Label className="text-xs text-gray-400/70 font-light mb-1">
                    Votre nom {requiresName && <span className="text-red-400/60">*</span>}
                  </Label>
                  <Input
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder={requiresName ? 'John Doe' : 'Invité (optionnel)'}
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl"
                    required={requiresName}
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-400/70 font-light mb-1">Email (optionnel)</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@example.com"
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl"
                  />
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] text-xs text-red-300/60 font-light flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isCheckingIn}
                  className="w-full h-10 text-sm bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all"
                >
                  {isCheckingIn ? (
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                  )}
                  {isCheckingIn ? 'Enregistrement...' : 'Confirmer mon check-in'}
                </Button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="rounded-2xl p-6 bg-emerald-500/[0.03] backdrop-blur-sm border border-emerald-500/[0.08] text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-400/60" />
              </div>
              <h2 className="text-base font-semibold text-white/80 mb-1">Check-in confirmé !</h2>
              <p className="text-sm text-gray-400/60 font-light">
                Merci {participantName || 'd\'être venu(e)'} ! Votre présence a bien été enregistrée.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}