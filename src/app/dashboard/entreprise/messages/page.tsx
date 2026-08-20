// src/app/dashboard/entreprise/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import { ArrowLeft, MessageSquare, Send, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import Loading from '@/src/components/system/Loading';

type Message = {
  id: string;
  org_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  replied: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
      if (!company) return;
      setCompanyId(company.id);

      const { data } = await supabase
        .from('org_messages')
        .select('*')
        .eq('org_id', company.id)
        .order('created_at', { ascending: false });

      setMessages(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const sendReply = async () => {
    if (!reply.trim() || !selectedMsg) return;
    setSending(true);
    // Logique d'envoi de réponse (email ou notification)
    await supabase.from('org_messages').update({ replied: true, updated_at: new Date().toISOString() }).eq('id', selectedMsg.id);
    setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, replied: true } : m));
    toast.success('Réponse envoyée');
    setReply('');
    setSending(false);
  };

  if (loading) return <Loading />;

  const unreadCount = messages.filter(m => !m.replied).length;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Liste des messages */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] overflow-hidden">
          <div className="p-3 border-b border-white/[0.04]">
            <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages ({unreadCount} non lus)
            </h2>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => setSelectedMsg(msg)}
                className={`w-full text-left p-3 hover:bg-white/[0.04] transition-colors ${selectedMsg?.id === msg.id ? 'bg-white/[0.06]' : ''} ${!msg.replied ? 'border-l-2 border-l-cyan-400/60' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/70 font-medium">{msg.sender_name}</span>
                  <span className="text-[10px] text-gray-500/50">{format(new Date(msg.created_at), 'dd/MM HH:mm')}</span>
                </div>
                <p className="text-[11px] text-gray-400/60 font-light line-clamp-1">{msg.message}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Détail message */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] p-5">
          {selectedMsg ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400/60" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">{selectedMsg.sender_name}</p>
                    <p className="text-[10px] text-gray-500/50">{selectedMsg.sender_email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400/70 font-light whitespace-pre-wrap">{selectedMsg.message}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/[0.04]">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Votre réponse..."
                  rows={3}
                  className="w-full text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl p-3 resize-none font-light placeholder:text-gray-500/40"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={sendReply} disabled={sending || !reply.trim()} className="h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
              <p className="text-gray-400/60 text-sm font-light">Sélectionnez un message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}