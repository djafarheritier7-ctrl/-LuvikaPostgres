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

import PublicProfileClientWrapper from '../../../components/profile/PublicProfileClientWrapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  // --- 1️⃣ Vérification des locales ---
  const supported = ['ar', 'en', 'es', 'fr', 'kg', 'ln', 'nl', 'pt', 'sw'] as const;
  if (!supported.includes(locale as any)) redirect('/fr');

  const decodedInput = decodeURIComponent(username).toLowerCase().trim();

  // --- 2️⃣ Vérification des routes réservées ---
  const RESERVED_ROUTES = [
    'pricing', 'about', 'contact', 'download', 'dashboard',
    'auth', 'complete-profile', 'api', 'private',
    'admin', 'rewards',
  ];
  if (RESERVED_ROUTES.includes(decodedInput)) notFound();

  // --- 3️⃣ Supabase Server Client (ANON) ---
  const supabase = createServerClient();

  // 🔑 CRÉATION DU CLIENT ADMIN (Service Role) POUR card_configs SEULEMENT
  let supabaseAdmin;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createServerClient();
  }

  // --- 🔹 4️⃣ DÉTECTION : username vs public_id ---
  let profileData = null;
  let profileError = null;
  let searchBy: 'username' | 'public_id' = 'username';

  if (decodedInput.startsWith('lkv_')) {
    searchBy = 'public_id';
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, plan, accepts_contact_requests, cover_url, theme, nfc_cards(*)`)
      .eq('public_id', decodedInput)
      .maybeSingle();
    profileData = data;
    profileError = error;
  } else {
    searchBy = 'username';
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, plan, accepts_contact_requests, cover_url, theme, nfc_cards(*)`)
      .ilike('username', decodedInput)
      .maybeSingle();

    if (error || !data) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select(`*, plan, accepts_contact_requests, cover_url, theme, nfc_cards(*)`)
        .ilike('username', `%${decodedInput}%`)
        .limit(1)
        .maybeSingle();
      profileData = fallbackData;
      profileError = fallbackError;
    } else {
      profileData = data;
    }
  }

  if (profileError || !profileData || Object.keys(profileData).length === 0) {
    console.error('❌ ERREUR FATALE: Profil introuvable', { input: decodedInput, searchBy, profileError });
    notFound();
  }

  // 🔑 CORRECTION ULTIME - PRIORITÉ SERVICE ROLE KEY
  let cardConfigsData: any[] = [];

  try {
    // ✅ STRATÉGIE HYBRIDE : Service Role en priorité ABSOLUE
    if (supabaseAdmin) {
      console.log('🔑 Utilisation SERVICE_ROLE_KEY pour card_configs');
      const { data, error } = await supabaseAdmin
        .from('card_configs')
        .select('*')
        .eq('profile_id', profileData.id);
      
      if (error) {
        console.error('❌ Erreur SERVICE_ROLE_KEY:', error);
        throw error;
      }
      cardConfigsData = data || [];
      console.log(`✅ Card configs chargées via SERVICE_ROLE_KEY (${cardConfigsData.length} configs)`);
    } 
    // ✅ Fallback SÉCURISÉ : Uniquement si service role indisponible
    else {
      console.log('🔑 Fallback sur ANON_KEY pour card_configs');
      const { data, error } = await supabase
        .from('card_configs')
        .select('*')
        .eq('profile_id', profileData.id);
      
      if (error) {
        console.error('❌ Erreur ANON_KEY (RLS):', error);
        cardConfigsData = [];
      } else {
        cardConfigsData = data || [];
        console.log(`✅ Card configs chargées via ANON_KEY (${cardConfigsData.length} configs)`);
      }
    }
  } catch (err) {
    console.error('💥 Erreur critique chargement card_configs:', err);
    cardConfigsData = [];
  }

  // --- 🔹 6️⃣ Récupération des statistiques de scans ---
  let scansCount = 0;
  try {
    const { data: scansData } = await supabase
      .from('scans')
      .select('*')
      .eq('profile_id', profileData.id);
    scansCount = scansData?.length || 0;
  } catch (err) {
    console.warn('⚠️ Erreur chargement scans:', err);
  }

  // --- 🔹 7️⃣ Authentification ---
  const { data: { user } } = await supabase.auth.getUser();
  const currentUser = user as User | null;
  const isOwner = currentUser?.id === profileData.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  // --- 🔹 8️⃣ Gestion des profils privés ---
  if (!profileData.is_public && !isOwner && !isAdmin) {
    return redirect(`/${locale}/${decodedInput}/private`);
  }

  // --- 🔹 9️⃣ Followers ---
  const { data: followersData } = await supabase
    .from('follows')
    .select('*')
    .eq('followed_id', profileData.id);
  const initialFollowers = followersData?.length || 0;

  // --- 🔹 🔟 Following ---
  let initialFollowing = 0;
  let isInitiallyFollowing = false;
  if (currentUser) {
    const { data: followingData } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id);
    initialFollowing = followingData?.length || 0;

    const { data: followingThisUserData } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('followed_id', profileData.id);
    isInitiallyFollowing = (followingThisUserData?.length || 0) > 0;
  }

  // --- 🔹 1️⃣2️⃣ Analytics : Enregistrer le scan NFC ---
  if (searchBy === 'public_id') {
    try {
      await supabase
        .from('scans')
        .insert({
          profile_id: profileData.id,
          scan_type: 'nfc',
          created_at: new Date().toISOString(),
        });
      
      await supabase
        .from('profiles')
        .update({ scans_count: (profileData.scans_count || 0) + 1 })
        .eq('id', profileData.id);
        
      console.log('✅ Scan NFC enregistré pour:', profileData.username || profileData.public_id);
    } catch (err) {
      console.warn('⚠️ Erreur enregistrement scan NFC:', err);
    }
  }

  // ✅ RENDU AVEC DONNÉES CARD_CONFIGS CORRECTEMENT ATTACHÉES
  return (
    <PublicProfileClientWrapper
      profile={{
        ...profileData,
        _cardConfigs: cardConfigsData,
      }}
      currentUser={currentUser}
      initialFollowers={initialFollowers}
      initialFollowing={initialFollowing}
      isInitiallyFollowing={isInitiallyFollowing}
      searchBy={searchBy}
      locale={locale}
      input={decodedInput}
    />
  );
}