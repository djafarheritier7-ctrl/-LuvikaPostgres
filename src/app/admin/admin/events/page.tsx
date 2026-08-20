// src/app/admin/admin/events/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Calendar, Search, Globe, Lock, QrCode,
  MapPin, User, Eye, RefreshCw, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_public: boolean;
  max_participants: number | null;
  qr_code_url: string | null;
  created_at: string;
  profiles: { full_name: string; username: string } | null;
};

const ITEMS_PER_PAGE = 8;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('events')
        .select('*, profiles!inner(id, full_name, username)')
        .order('starts_at', { ascending: false });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    let result = events.filter(event => {
      if (filter === 'public' && !event.is_public) return false;
      if (filter === 'private' && event.is_public) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          event.title.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term) ||
          event.profiles?.full_name?.toLowerCase().includes(term)
        );
      }
      return true;
    });
    return result;
  }, [events, filter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => setCurrentPage(1), [filter, search]);

  const getStatusBadge = (startsAt: string | null, endsAt: string | null) => {
    const now = new Date();
    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;
    if (!start) return null;
    if (now < start) {
      return { icon: <Clock className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-300/60 border-blue-500/20', label: 'À venir' };
    }
    if (!end || now < end) {
      return { icon: <CheckCircle className="w-3 h-3" />, className: 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20', label: 'En cours' };
    }
    return { icon: <XCircle className="w-3 h-3" />, className: 'bg-gray-500/10 text-gray-300/60 border-gray-500/20', label: 'Terminé' };
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-gray-400/60 hover:text-white/70 transition-colors text-xs font-light w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white/80">Événements</h1>
            <p className="text-xs text-gray-400/60 font-light mt-1">{filtered.length} événement{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
              {['all', 'public', 'private'].map((v) => (
                <button key={v} onClick={() => setFilter(v as any)}
                  className={`px-2.5 py-1 text-[11px] font-light rounded-md transition-colors ${
                    filter === v ? 'bg-white/[0.08] text-white/70' : 'text-gray-400/50 hover:text-white/60'
                  }`}>{v === 'all' ? 'Tous' : v === 'public' ? 'Publics' : 'Privés'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
        <Input placeholder="Rechercher un événement..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl w-full" />
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
          <Calendar className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
          <p className="text-gray-400/60 text-sm font-light">Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {paginated.map((event) => {
            const status = getStatusBadge(event.starts_at, event.ends_at);
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all w-full">
                <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-cyan-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-white/70 font-medium">{event.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${
                          event.is_public ? 'bg-emerald-500/10 text-emerald-300/60 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300/60 border-amber-500/20'
                        }`}>
                          {event.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {event.is_public ? 'Public' : 'Privé'}
                        </span>
                        {status && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-light ${status.className}`}>
                            {status.icon}{status.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400/50 font-light mt-0.5">
                        par {event.profiles?.full_name} • @{event.profiles?.username}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500/50 font-light">
                        {event.starts_at && <span>{new Date(event.starts_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                        {event.max_participants && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{event.max_participants}</span>}
                      </div>
                      {event.description && <p className="text-[11px] text-gray-500/40 font-light mt-1 line-clamp-1">{event.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 lg:ml-4">
                    {event.qr_code_url ? (
                      <a href={event.qr_code_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-cyan-500/10 text-cyan-300/60 border border-cyan-500/20 hover:bg-cyan-500/20 font-light rounded-lg transition-all">
                        <QrCode className="w-3 h-3" />QR
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] bg-gray-500/10 text-gray-400/50 border border-gray-500/20 font-light rounded-lg">
                        <QrCode className="w-3 h-3" />--
                      </span>
                    )}
                    <Button variant="ghost" size="sm"
                      className="h-7 text-[11px] text-gray-400/60 hover:text-white/70 font-light rounded-lg">
                      <Eye className="w-3 h-3 mr-1" />Détails
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <p className="text-[11px] text-gray-500/50 font-light">Page {currentPage} sur {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
              <Button key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 p-0 text-xs font-light rounded-lg ${page === currentPage ? 'bg-white/[0.06] text-white/80' : 'text-gray-400/60 hover:text-white/70'}`}>
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-gray-400/60 hover:text-white/70 rounded-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}