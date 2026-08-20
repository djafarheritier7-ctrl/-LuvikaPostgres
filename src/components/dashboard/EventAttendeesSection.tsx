// src/components/dashboard/EventAttendeesSection.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, MapPin, QrCode, Download, Plus, Edit3, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRModal from '@/src/components/profile/QRModal';
import { toast } from 'sonner';

type Event = {
  id: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  attendee_count: number;
  qr_code_url: string | null;
  is_public: boolean;
};

type Participant = {
  id: string;
  name: string;
  email: string | null;
  checked_in_at: string | null;
  is_checked_in: boolean;
  qr_token: string;
  created_at: string;
};

export default function EventAttendeesSection({
  plan,
  onSelectEvent,
}: {
  plan: string | null;
  onSelectEvent?: (eventId: string | null) => void;
}) {
  const isFreePlan = !plan || plan === 'freemium' || plan === 'basic';
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [selectedParticipantQr, setSelectedParticipantQr] = useState<{ url: string; name: string } | null>(null);

  const locale = useLocale();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        if (res.status === 401) {
          toast.error('Vous devez vous connecter pour gérer vos événements.');
          return;
        }
        if (res.status === 403) {
          toast.error('Accès refusé : vous n’êtes pas l’organisateur de ces événements.');
          return;
        }
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const { events } = await res.json();
      setEvents(events.map((e: Event) => ({ ...e, qr_code_url: `/${locale}/events/${e.id}/check-in` })));
    } catch (err) {
      console.error('❌ Failed to load events', err);
      toast.error(err instanceof Error ? err.message : 'Erreur de chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any)._luvika_disable_analytics) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!isFreePlan) {
      fetchEvents();
    }
  }, [isFreePlan, locale]);

  const loadParticipants = async (event: Event) => {
    setSelectedEvent(event);
    onSelectEvent?.(event.id);
    setParticipants([]);
    setNewParticipant({ name: '', email: '' });
    setEditingParticipant(null);

    try {
      const participantsRes = await fetch(`/api/events/${event.id}/participants`, {
        credentials: 'include',
      });

      if (!participantsRes.ok) {
        const ct = participantsRes.headers.get('content-type') || '';
        let body: any;
        try {
          body = ct.includes('application/json') ? await participantsRes.json() : await participantsRes.text();
        } catch (parseErr) {
          body = `Unable to parse error body (${parseErr})`;
        }

        if (participantsRes.status === 401) {
          toast.error('Non authentifié — reconnectez-vous pour voir les participants.');
          console.error('Participants fetch 401:', body);
          return;
        }
        if (participantsRes.status === 403) {
          toast.error("Accès refusé — vous devez être l'organisateur de cet événement pour voir les participants.");
          console.error('Participants fetch 403:', body);
          return;
        }

        console.error('Participants fetch failed', participantsRes.status, body);
        toast.error('Erreur lors du chargement des participants.');
        return;
      }

      const loadedParticipants: Participant[] = await participantsRes.json();
      setParticipants(loadedParticipants);
    } catch (err) {
      console.error('❌ Failed to load participants (unexpected):', err);
      toast.error('Erreur lors du chargement des participants (réseau ou serveur).');
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedEvent) return;
    window.open(`/api/events/${selectedEvent.id}/participants.csv`, '_blank');
  };

  const handleAddParticipant = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newParticipant.name.trim()) return;

    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newParticipant.name.trim(), email: newParticipant.email.trim() || null }),
      });

      if (res.ok) {
        const addedParticipant: Participant = await res.json();
        setParticipants((prev) => [addedParticipant, ...prev]);
        setNewParticipant({ name: '', email: '' });
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error || "Impossible d'ajouter le participant"}`);
      }
    } catch (err) {
      console.error('Erreur ajout participant:', err);
      alert("Erreur réseau lors de l'ajout du participant.");
    }
  };

  const handleUpdateParticipant = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingParticipant || !editingParticipant.name.trim()) return;

    try {
      const res = await fetch(`/api/events/${selectedEvent?.id}/participants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          participantId: editingParticipant.id,
          name: editingParticipant.name.trim(),
          email: editingParticipant.email?.trim() || null,
        }),
      });

      if (res.ok) {
        setParticipants((prev) =>
          prev.map((p) => (p.id === editingParticipant.id ? editingParticipant : p))
        );
        setEditingParticipant(null);
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error || 'Impossible de modifier le participant'}`);
      }
    } catch (err) {
      console.error('Erreur modification participant:', err);
      alert('Erreur réseau lors de la modification du participant.');
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;

    try {
      const res = await fetch(`/api/events/${selectedEvent?.id}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId }),
      });

      if (res.ok) {
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
        if (selectedEvent) {
          const wasCheckedIn = participants.find((p) => p.id === participantId)?.is_checked_in;
          if (wasCheckedIn) {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === selectedEvent.id
                  ? { ...e, attendee_count: Math.max(0, (e.attendee_count || 0) - 1) }
                  : e
              )
            );
          }
        }
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error || 'Impossible de supprimer le participant'}`);
      }
    } catch (err) {
      console.error('Erreur suppression participant:', err);
      alert('Erreur réseau lors de la suppression du participant.');
    }
  };

  const now = new Date();

  if (isFreePlan) {
    return (
      <Card className="glass-border bg-gradient-to-br from-gray-900/50 to-amber-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            🗓️ Événements (Pro)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Gérez vos événements</h3>
            <p className="text-gray-300 text-sm mb-4">
              Créez des événements, gérez les invités, générez des QR, suivez les présents.
            </p>
            <ul className="text-left text-gray-400 text-xs space-y-1 mb-6 max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Liste d'invités personnalisée
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                QR unique par invité
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Suivi des présences temps réel
              </li>
            </ul>
            <Button
              variant="default"
              className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white"
              onClick={() => {
                window.location.href = '/dashboard?open=upgrade';
              }}
            >
              🚀 Débloquer les événements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-border bg-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" />
            🗓️ Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-border bg-transparent border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-amber-400" />
          🗓️ Événements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Aucun événement pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((event) => {
                const starts = new Date(event.starts_at);
                const ends = new Date(event.ends_at);
                const isOngoing = now >= starts && now <= ends;
                const isUpcoming = now < starts;

                return (
                  <motion.div
                    key={event.id}
                    whileHover={{ y: -2 }}
                    className={`glass-border p-4 rounded-xl cursor-pointer ${
                      selectedEvent?.id === event.id
                        ? 'border-amber-400/50 bg-amber-400/5'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => loadParticipants(event)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white">{event.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`px-2 py-0.5 text-xs ${
                          isOngoing
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isUpcoming
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {isOngoing ? 'En cours' : isUpcoming ? 'À venir' : 'Terminé'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {starts.toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        timeZone: 'UTC'
                      })} ·{' '}
                      {starts.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'UTC'
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-sm text-cyan-300">
                        {event.attendee_count} présents
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto text-cyan-400 hover:bg-cyan-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowQRModal(true);
                        }}
                        title="Voir QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedEvent && (
              <>
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <User className="text-cyan-400" />
                    Participants à « {selectedEvent.name} »
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={handleExportCSV}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exporter CSV
                    </Button>
                    {!selectedEvent.is_public && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewParticipant({ name: '', email: '' });
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter
                      </Button>
                    )}
                  </div>
                </div>

                {!selectedEvent.is_public && (
                  <form onSubmit={handleAddParticipant} className="mb-4 p-3 glass-border rounded-lg flex gap-2">
                    <Input
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                      placeholder="Nom complet"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-grow"
                      required
                    />
                    <Input
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                      placeholder="Email (optionnel)"
                      type="email"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-40"
                    />
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                  </form>
                )}

                {loadingParticipants ? (
                  <p className="text-gray-400 text-sm text-center py-2">Chargement des participants...</p>
                ) : participants.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun participant inscrit</p>
                ) : (
                  <ul className="space-y-2">
                    {participants.map((p) => (
                      <li key={p.id} className="flex items-center justify-between p-3 glass-border rounded-lg">
                        {editingParticipant?.id !== p.id ? (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{p.name}</p>
                              {p.email && <p className="text-sm text-gray-400 truncate">{p.email}</p>}
                              <p className="text-xs text-gray-500">
                                Créé le: {new Date(p.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {p.is_checked_in ? (
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                  <User className="w-3 h-3" /> Présent
                                </span>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-auto text-cyan-400 hover:bg-cyan-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const url = `${window.location.origin}/${locale}/events/${selectedEvent.id}/check-in?token=${p.qr_token}`;
                                      navigator.clipboard.writeText(url);
                                      alert('Lien QR copié ! Partagez-le.');
                                    }}
                                    title="Copier lien QR"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-auto text-purple-400 hover:bg-purple-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const participantSpecificUrl = `${window.location.origin}/${locale}/events/${selectedEvent.id}/check-in?token=${p.qr_token}`;
                                      setSelectedParticipantQr({ url: participantSpecificUrl, name: p.name });
                                      setShowQRModal(true);
                                    }}
                                    title="Voir QR Code"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {!selectedEvent.is_public && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-auto text-amber-400 hover:bg-amber-400/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingParticipant(p);
                                    }}
                                    title="Modifier"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-auto text-red-400 hover:bg-red-400/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteParticipant(p.id);
                                    }}
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <form
                            onSubmit={handleUpdateParticipant}
                            className="flex-1 flex items-center gap-2 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              value={editingParticipant.name}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-grow"
                              required
                            />
                            <Input
                              value={editingParticipant.email || ''}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value || null })}
                              placeholder="Email"
                              type="email"
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-32"
                            />
                            <div className="flex gap-1">
                              <Button type="submit" size="sm" variant="outline" className="text-xs">
                                Sauver
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => setEditingParticipant(null)}
                              >
                                Annuler
                              </Button>
                            </div>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>

      {selectedEvent && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedParticipantQr(null);
          }}
          profileUrl={selectedEvent?.qr_code_url || ''}
          qrCodeUrl={`${process.env.NEXT_PUBLIC_SITE_URL}${selectedEvent.qr_code_url}`}
          username={selectedEvent?.name || 'Événement'}
          participantQrUrl={selectedParticipantQr?.url}
          participantName={selectedParticipantQr?.name}
        />
      )}
    </Card>
  );
}