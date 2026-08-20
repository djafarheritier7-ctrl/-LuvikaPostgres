// src/components/profile/EventsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/src/lib/supabase/client';

type PublicEvent = {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
  is_public: boolean;
  max_participants?: number;
  participants_count?: number;
};

export default function EventsSection({ profileId }: { profileId: string }) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [profileId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_public', true)
        .eq('status', 'active')
        .gte('ends_at', now)
        .order('starts_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startsAt: string, endsAt?: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = endsAt ? new Date(endsAt) : new Date(start.getTime() + 3600000);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
      className="w-full px-4 mt-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Événements</h2>
          </div>
          <p className="text-sm text-gray-400">Découvrez les événements à venir</p>
        </div>

        <div className="grid gap-4">
          {events.map((event, index) => {
            const status = getEventStatus(event.starts_at, event.ends_at);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all"
              >
                <div
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  className="w-full p-4 flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{event.title}</h3>
                      {status === 'live' && (
                        <Badge className="bg-red-500/20 text-red-300 text-[10px] animate-pulse">EN COURS</Badge>
                      )}
                      {status === 'upcoming' && (
                        <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">À venir</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(event.starts_at)} à {formatTime(event.starts_at)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedEvent === event.id ? 'rotate-90' : ''
                  }`} />
                </div>

                {expandedEvent === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 border-t border-white/10"
                  >
                    {event.description && (
                      <p className="text-sm text-gray-400 mt-3">{event.description}</p>
                    )}

                    <div className="mt-4 flex flex-col items-center">
                      <div className="bg-white p-2 rounded-lg">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.me'}/events/${event.id}`)}`}
                          alt={`QR Code - ${event.title}`}
                          className="w-32 h-32"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Scannez pour rejoindre l'événement</p>
                    </div>

                    {event.max_participants && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{event.participants_count || 0} / {event.max_participants} participants</span>
                      </div>
                    )}

                    <Button
                      onClick={() => window.open(`/events/${event.id}`, '_blank')}
                      className="mt-3 w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir l'événement
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}