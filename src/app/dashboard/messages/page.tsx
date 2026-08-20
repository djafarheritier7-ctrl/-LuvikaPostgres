// src/app/dashboard/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, User, Clock, Check, X, Eye, EyeOff,
  Search, Filter, RefreshCw, Download, Archive, ArchiveX, Star, StarOff,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Plus, Send, Trash2, ArrowLeft
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';

// Types
type ContactRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles?: { full_name?: string; username?: string; avatar_url?: string };
  read_at?: string | null;
  starred?: boolean;
};

export default function MessagesPage() {
  const t = useTranslations('dashboard.messages');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterRead, setFilterRead] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          profiles!contact_requests_sender_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .order(sortBy === 'date' ? 'created_at' : 'profiles.full_name', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('❌ Erreur chargement messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [sortBy, sortOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'read' | 'unread' | 'star' | 'unstar' | 'archive' | 'unarchive') => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let updates: any = {};
      switch (action) {
        case 'accept':
          updates = { status: 'accepted' };
          break;
        case 'reject':
          updates = { status: 'rejected' };
          break;
        case 'read':
          updates = { read_at: new Date().toISOString() };
          break;
        case 'unread':
          updates = { read_at: null };
          break;
        case 'star':
          updates = { starred: true };
          break;
        case 'unstar':
          updates = { starred: false };
          break;
        case 'archive':
          updates = { archived: true };
          break;
        case 'unarchive':
          updates = { archived: false };
          break;
      }

      const { error } = await supabase
        .from('contact_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('❌ Erreur action message:', err);
      alert('❌ Échec de l’action');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedRequest) return;
    setReplying(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('contact_replies')
        .insert({
          request_id: selectedRequest.id,
          sender_id: user.id,
          receiver_id: selectedRequest.sender_id,
          message: replyMessage,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setReplyMessage('');
      alert('✅ Réponse envoyée');
    } catch (err) {
      console.error('❌ Erreur envoi réponse:', err);
      alert('❌ Échec envoi');
    } finally {
      setReplying(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = !searchQuery ||
      (req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       req.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       req.message.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !filterStatus || req.status === filterStatus;
    const matchesRead = filterRead === null ? true : (filterRead === 'read' ? !!req.read_at : !req.read_at);
    return matchesSearch && matchesStatus && matchesRead;
  });

  const formatDistance = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays > 0) return `${diffDays} j`;
    if (diffHrs > 0) return `${diffHrs} h`;
    if (diffMin > 0) return `${diffMin} min`;
    return `${diffSec} s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  // 🔹 Définir les actions DU MENU RAPIDE (à l'intérieur du composant)
  const quickActions = [
    {
      id: 'refresh',
      label: '',
      icon: <RefreshCw className="w-4 h-4" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'back',
      label: '',
      icon: <ArrowLeft className="w-4 h-4" />,
      color: 'from-gray-500 to-gray-600',
    },
    {
      id: 'export',
      label: '',
      icon: <Download className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
    }
  ];

  // 🔹 Gestionnaire d'actions (à l'intérieur du composant)
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'refresh':
        handleRefresh();
        break;
      case 'back':
        router.push('/dashboard');
        break;
      case 'export':
        // Logique d'export
        break;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </motion.div>

      {/* Filtres */}
      <Card className="glass-border">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('search')}</Label>
            </div>
            <Input
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('filter_status')}</Label>
            </div>
            <Select value={filterStatus || ''} onValueChange={(v: string) => setFilterStatus(v || null)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('all_statuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="accepted">{t('status.accepted')}</SelectItem>
                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <Label className="text-gray-300">{t('filter_read')}</Label>
            </div>
            <Select value={filterRead || ''} onValueChange={(v: string) => setFilterRead(v === '' ? null : v as 'read' | 'unread')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('all_read')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('all_read')}</SelectItem>
                <SelectItem value="read">{t('read')}</SelectItem>
                <SelectItem value="unread">{t('unread')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tri */}
      <Card className="glass-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-gray-300">{t('sort_by')}</Label>
              <Select value={sortBy} onValueChange={(v: 'date' | 'name') => setSortBy(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t('sort.date')}</SelectItem>
                  <SelectItem value="name">{t('sort.name')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-gray-300">{t('order')}</Label>
              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {sortOrder === 'asc' ? t('asc') : t('desc')}
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {filteredRequests.length} {t('results')}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="text-cyan-400" />
                {t('requests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t('no_requests')}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map(req => (
                    <div
                      key={req.id}
                      className={`p-4 glass-border rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedRequest?.id === req.id ? 'ring-2 ring-cyan-500/50 bg-white/5' : ''
                      }`}
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                            {req.profiles?.avatar_url ? (
                              <img src={req.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{req.profiles?.full_name || t('anonymous')}</div>
                            <div className="text-sm text-gray-400">@{req.profiles?.username || 'inconnu'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(req.status)}>
                            {req.status === 'pending' ? t('status.pending') : req.status === 'accepted' ? t('status.accepted') : t('status.rejected')}
                          </Badge>
                          {!req.read_at && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                          {req.starred && <Star className="w-4 h-4 text-yellow-400" />}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 line-clamp-2 mb-2">{req.message}</div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDistance(req.created_at)}</span>
                        <div className="flex gap-1">
                          {req.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'accept'); }}>
                                <Check className="w-3 h-3 mr-1" />
                                {t('accept')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'reject'); }}>
                                <X className="w-3 h-3 mr-1" />
                                {t('reject')}
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction(req.id, req.read_at ? 'unread' : 'read'); }}>
                            {req.read_at ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                            {req.read_at ? t('mark_unread') : t('mark_read')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction(req.id, req.starred ? 'unstar' : 'star'); }}>
                            {req.starred ? <StarOff className="w-3 h-3 mr-1" /> : <Star className="w-3 h-3 mr-1" />}
                            {req.starred ? t('unstar') : t('star')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Détails */}
        <div>
          <Card className="glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-emerald-400" />
                {t('details')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                      {selectedRequest.profiles?.avatar_url ? (
                        <img src={selectedRequest.profiles.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{selectedRequest.profiles?.full_name}</div>
                      <div className="text-sm text-gray-400">@{selectedRequest.profiles?.username}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">{t('message')}:</div>
                    <p className="text-white">{selectedRequest.message}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {t('sent')} {formatDistance(selectedRequest.created_at)}
                    {selectedRequest.read_at && ` • ${t('read')} ${formatDistance(selectedRequest.read_at)}`}
                  </div>
                  <div className="flex gap-2">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(selectedRequest.id, 'accept')}>
                          <Check className="w-4 h-4 mr-2" />
                          {t('accept')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction(selectedRequest.id, 'reject')}>
                          <X className="w-4 h-4 mr-2" />
                          {t('reject')}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleAction(selectedRequest.id, selectedRequest.read_at ? 'unread' : 'read')}>
                      {selectedRequest.read_at ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {selectedRequest.read_at ? t('mark_unread') : t('mark_read')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction(selectedRequest.id, selectedRequest.starred ? 'unstar' : 'star')}>
                      {selectedRequest.starred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                      {selectedRequest.starred ? t('unstar') : t('star')}
                    </Button>
                  </div>
                  {/* Répondre */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="text-sm text-gray-300 mb-2">{t('reply')}</div>
                    <Textarea
                      value={replyMessage}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
                      placeholder={t('reply_placeholder')}
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={handleReply} disabled={!replyMessage.trim() || replying}>
                        <Send className="w-4 h-4 mr-2" />
                        {replying ? t('sending') : t('send')}
                      </Button>
                      <Button variant="outline" onClick={() => setReplyMessage('')}>
                        <X className="w-4 h-4 mr-2" />
                        {t('clear')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {t('select_request')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🔹 MENU FLOTTANT - PLACÉ À L'INTÉRIEUR DU CONTENEUR PRINCIPAL */}
      <DashboardQuickMenu 
        onAction={handleQuickAction} 
        actions={quickActions} 
      />
    </div>
  );
};
