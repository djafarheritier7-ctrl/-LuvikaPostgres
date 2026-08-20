'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Loader2, QrCode, User, AlertCircle, Users,
  CheckCircle, XCircle, Clock, Lock, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type CheckInClientProps = {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  endsAt: string;
  isPublic: boolean;
  token: string | null;
  isOrganizer: boolean;
  requiresName?: boolean;
};

export default function CheckInClient({
  eventId,
  eventTitle,
  startsAt,
  endsAt,
  isPublic,
  token,
  isOrganizer,
  requiresName = false,
}: CheckInClientProps) {
  const t = useTranslations('CheckInClient');
  
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [inputName, setInputName] = useState('');

  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number } | null>(null);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  const supabase = createClient();

  // 🔹 Compte à rebours dynamique
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const start = new Date(startsAt);
      const end = new Date(endsAt);

      if (now < start) {
        const diffMs = start.getTime() - now.getTime();
        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeRemaining({ minutes, seconds });
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

  // 🔹 Charger le nombre initial de participants
  useEffect(() => {
    if (!isPublic) {
      setLoadingCount(false);
      return;
    }

    const fetchInitialCount = async () => {
      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId);

      if (!error) {
        setParticipantsCount(data?.length || 0);
      }
      setLoadingCount(false);
    };
    fetchInitialCount();
  }, [eventId, isPublic]);

  // 🔹 Gestion du check-in
  const handleCheckIn = async () => {
    if (!token) {
      setMessage(t('invalid_qr_message'));
      setStatus('error');
      return;
    }

    if (requiresName && !inputName.trim()) {
      setMessage(t('name_required_message'));
      setStatus('error');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: requiresName ? inputName.trim() : undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(t('welcome_message', { name: data.name || 'participant' }));
        // Incrémenter le compteur localement
        setParticipantsCount(prev => (prev !== null ? prev + 1 : 1));
        toast.success(t('checkin_success_toast'));
      } else {
        setStatus('error');
        setMessage(data.error || t('checkin_error_generic'));
        toast.error(data.error || t('checkin_error_failed'));
      }
    } catch (err) {
      setStatus('error');
      setMessage(t('network_error_message'));
      toast.error(t('network_error_toast'));
    }
  };

  // ========================
  // 🔹 RENDU CONDITIONNEL
  // ========================

  // 1. Événement PRIVÉ → bloqué en premier
  if (!isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20 p-4">
        <Card className="glass-border p-8 text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('private_title')}</h2>
          <p className="text-gray-300">{t('private_description')}</p>
        </Card>
      </div>
    );
  }

  // 2. Événement À VENIR
  if (eventStatus === 'upcoming' && timeRemaining) {
    const startDate = new Date(startsAt);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20 p-4">
        <Card className="glass-border p-8 text-center max-w-md">
          <Clock className="w-16 h-16 mx-auto text-cyan-400 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('upcoming_title')}</h2>
          <p className="text-gray-300 text-lg">
            {t('upcoming_description', { title: eventTitle })}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Prévu le{' '}
            {startDate.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              timeZone: 'Africa/Kinshasa'
            })} à{' '}
            {startDate.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Africa/Kinshasa'
            })}
          </p>
          <div className="mt-4 text-4xl font-mono font-bold text-cyan-300">
            {timeRemaining.minutes.toString().padStart(2, '0')}:
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-400 mt-2">{t('minutes_seconds_label')}</p>
        </Card>
      </div>
    );
  }

  // 3. Événement TERMINÉ
  if (eventStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/20 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-4">
              <XCircle className="w-4 h-4" />
              {t('ended_title')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{eventTitle}</h1>
            <p className="text-gray-400">{t('ended_description')}</p>

            {!loadingCount && participantsCount !== null && (
              <Card className="glass-border bg-white/5 border-white/10 px-6 py-3 inline-flex items-center gap-3 mt-6">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{participantsCount}</span>
                <span className="text-gray-400 text-sm">
                  {participantsCount === 1 ? t('participant_singular') : t('participant_plural')}
                </span>
              </Card>
            )}
            {loadingCount && (
              <div className="mt-4">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // 4. Événement EN COURS et PUBLIC → check-in normal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-indigo-900/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm mb-4">
            <QrCode className="w-4 h-4" />
            {t('checkin_badge')}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {eventTitle}
          </h1>

          {!loadingCount && participantsCount !== null && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Card className="glass-border bg-white/5 border-white/10 px-6 py-3 inline-flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{participantsCount}</span>
                <span className="text-gray-400 text-sm">
                  {participantsCount === 1 ? t('participant_singular') : t('participant_plural')}
                </span>
              </Card>
            </div>
          )}
          {loadingCount && (
            <div className="mt-4">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
            </div>
          )}
        </motion.div>

        {status === 'success' ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <Card className="glass-border bg-emerald-900/20 border-emerald-500/30 p-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('success_title')}</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-400 mt-4">{t('success_footer')}</p>
            </Card>
          </motion.div>
        ) : (
          <Card className="glass-border w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
              <CardTitle className="text-white">{eventTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {requiresName && (
                <div className="mb-4">
                  <label htmlFor="check-in-name" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('full_name_label')}
                  </label>
                  <Input
                    id="check-in-name"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder={t('name_placeholder')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              )}
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                </div>
              )}
              <Button
                onClick={handleCheckIn}
                disabled={status === 'checking' || !token}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {status === 'checking' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('checking_button')}</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" />{t('checkin_button')}<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              {!token && (
                <p className="text-xs text-gray-400 mt-4 text-center">{t('invalid_qr_hint')}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}