// src/components/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../src/lib/supabase/client';
import DashboardContent from '../../../src/components/dashboard/DashboardContent';
import { generateQRBase64 } from '../../../lib/qr';

type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profile_id: string;
  scanner_id?: string;
  profiles?: {
    username?: string;
    full_name?: string;
  };
};

const formatDistance = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffHrs > 0) return `${diffHrs} heure${diffHrs > 1 ? 's' : ''}`;
  if (diffMin > 0) return `${diffMin} min`;
  return `${diffSec} sec`;
};

const PLAN_COLORS = {
  freemium: 'bg-gray-500',
  basic: 'bg-gray-500',
  premium: 'bg-blue-500',
  entreprise: 'bg-purple-500',
};

export default function DashboardClient() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const hasRedirected = useRef(false);

  const refreshProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select(`*, nfc_cards(*), portfolios(*), certificates(*)`)
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/auth/sign-in');
          }
          return;
        }

        setUser(authUser);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            nfc_cards(*),
            portfolios(*),
            certificates(*)
          `)
          .eq('id', authUser.id)
          .single();

        if (profileError || !profileData) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/complete-profile');
          }
          return;
        }

        if (profileData.onboarding_done !== true) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/complete-profile');
          }
          return;
        }

        setProfile(profileData);

        // 🔹 Followers (comptage via length)
        const { data: followersData } = await supabase
          .from('follows')
          .select('id')
          .eq('followed_id', authUser.id);
        setFollowers(followersData?.length || 0);

        // 🔹 Scans (derniers)
        const { data: scansData } = await supabase
          .from('scans')
          .select('*, profiles!left(username, full_name)')
          .eq('profile_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setScans(scansData || []);
        setTotalScans(scansData?.length || 0);

        // 🔹 QR Code
        if (profileData.username) {
          const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app')
            .trim()
            .replace(/\/+$/, '');
          const profileUrl = `${baseUrl}/${profileData.username}`;
          try {
            const qr = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
            setQrBase64(qr);
          } catch (err) {
            console.warn('⚠️ QR generation failed');
          }
        }

        setLoading(false);
        // ✅ Realtime désactivé : le shim ne supporte pas `channel`.
      } catch (err) {
        console.error('❌ Erreur DashboardClient:', err);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/auth/sign-in');
        }
      }
    };

    init();
  }, [router]);

  if (loading) return null;
  if (!profile) return null;

  const isAdmin = profile.role === 'admin';
  const cards = profile.nfc_cards || [];

  return (
    <DashboardContent
      user={user}
      profile={profile}
      cards={cards}
      recentScans={scans.map(scan => ({
        ...scan,
        relativeTime: scan.created_at ? formatDistance(scan.created_at) : '—',
        profiles: scan.profiles || { username: 'inconnu', full_name: 'Utilisateur supprimé' },
      }))}
      totalScans={totalScans}
      totalFollowers={followers}
      qrBase64={qrBase64}
      profileUrl={`https://luvika.me/${profile.username}`}
      planColors={PLAN_COLORS}
      isAdmin={isAdmin}
      refreshProfile={refreshProfile}
    />
  );
}