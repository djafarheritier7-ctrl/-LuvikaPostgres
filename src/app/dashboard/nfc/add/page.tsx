import { redirect } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';
import { Button } from '../../../../../components/ui/button';
import Link from 'next/link';

export default async function AddNFCPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, id, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) redirect('/dashboard');

  const currentPlan = profile.plan || 'basic';

  // 🔢 Compte les cartes actives/non bloquées (simplifié car le shim ne supporte pas .not)
  const { data: cards } = await supabase
    .from('nfc_cards')
    .select('id, status')
    .eq('user_id', user.id);

  const actualCardCount = (cards || []).filter((card: { status: string; }) => card.status !== 'blocked').length;

  let maxCards = 1;
  if (currentPlan === 'premium') maxCards = 5;
  if (currentPlan === 'entreprise') maxCards = Infinity;

  const canCreate = actualCardCount < maxCards;

  if (!canCreate && currentPlan !== 'entreprise') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br text-white px-4">
        {/* ... message d'upgrade ... */}
        <Link href="/pricing" className="block">
          <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 py-3 text-base">
            💰 Voir les plans & tarifs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-6 group">
          <span className="text-lg">←</span>
          <span className="group-hover:underline"></span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Ajouter une carte NFC</h1>
          <p className="text-gray-400">
            Chaque carte aura un matricule unique de 9 caractères (ex: NFC123456).
          </p>
        </div>

        <div className="glass-border rounded-2xl p-6 text-center border border-white/10">
          <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👆</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Prêt à scanner ?</h2>
          <p className="text-gray-300 mb-6">
            1. Activez le NFC sur votre téléphone<br />
            2. Approchez la carte vierge<br />
            3. Confirmez l’écriture
          </p>
          {/* CardManager component not yet implemented */}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>❓ Besoin d’aide ? <Link href="/contact" className="text-cyan-400 hover:underline">Contactez-nous</Link></p>
        </div>
      </div>
    </div>
  );
}