import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
};

import { motion } from 'framer-motion';
import { Lock, User as UserIcon, EyeOff, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function PrivateProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  const supported = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
  if (!supported.includes(locale as any)) {
    redirect('/fr');
  }

  const decodedUsername = decodeURIComponent(username).toLowerCase().trim();

  const supabase = createServerClient();

  /**
   * 🔹 Étape 1 — Lecture minimale (autorisée par RLS)
   */
  const { data: visibility } = await supabase
    .from('profiles')
    .select('id, is_public, full_name, username, plan')
    .ilike('username', decodedUsername)
    .maybeSingle();

  if (!visibility) {
    notFound();
  }

  /**
   * 🔹 Étape 2 — Authentification
   */
  const { data: { user } } = await supabase.auth.getUser();
  const currentUser = user as User | null;
  const isOwner = currentUser?.id === visibility.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  /**
   * 🔹 Étape 3 — Sécurité : si public ou autorisé, redirige vers le profil normal
   */
  if (visibility.is_public || isOwner || isAdmin) {
    return redirect(`/${locale}/${decodedUsername}`);
  }

  /**
   * 🔹 Étape 4 — Rendu de la page privée - DESIGN ULTIME
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/10 to-indigo-900/20 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fond animé subtil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.08),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-border bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/15 p-8 md:p-10 max-w-md w-full relative overflow-hidden shadow-2xl shadow-black/40"
      >
        {/* Décoration intérieure */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl opacity-30 blur-xl"></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30"></div>
        
        <div className="relative z-10 text-center">
          {/* Icône premium */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <Lock className="w-10 h-10 text-white relative z-10" />
          </div>

          {/* Titre et sous-titre */}
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 mb-2">
            {visibility.full_name || visibility.username}
          </h1>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Profil privé
            </Badge>
            {visibility.plan && visibility.plan !== 'basic' && (
              <Badge className={`${
                visibility.plan === 'premium' 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' 
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              }`}>
                {visibility.plan === 'premium' ? '⭐ Premium' : '🏢 Business'}
              </Badge>
            )}
          </div>

          {/* Message principal */}
          <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto leading-relaxed">
            Ce profil est actuellement <span className="font-medium text-purple-300">masqué au public</span>.
            <br />
            Son propriétaire a choisi de le garder privé.
          </p>

          {/* Caractéristiques */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: EyeOff, label: 'Visibilité limitée', desc: 'Contenu non accessible' },
              { icon: UserIcon, label: 'Accès restreint', desc: 'Réservé au propriétaire' },
              { icon: Lock, label: 'Sécurité renforcée', desc: 'Données protégées' },
              { icon: ShieldCheck, label: 'Confidentialité', desc: 'Paramètres stricts' }
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center mb-2">
                  <item.icon className="w-4 h-4 text-purple-300" />
                </div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Bouton d'action */}
          <Button 
            variant="outline"
            className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-gray-300 hover:text-white text-lg py-6 rounded-xl font-medium transition-all duration-300 group"
            onClick={() => window.history.back()}
          >
            <span className="flex items-center justify-center gap-2">
              ← Retour à l'accueil
              <span className="group-hover:translate-x-1 transition-transform">↩</span>
            </span>
          </Button>

          {/* Signature */}
          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-gray-500">
            <p className="flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-purple-400" />
              <span>Contenu volontairement limité • Respect des paramètres de confidentialité</span>
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Plateforme sécurisée • Chiffrement de bout en bout</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}