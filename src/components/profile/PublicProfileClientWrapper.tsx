'use client';

import { useEffect, useState, useCallback, useRef, useOptimistic } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import PublicProfileClient from '../../components/profile/PublicProfileClient';
import { toast } from 'sonner';
import { QrCode } from 'lucide-react';

// Type local remplaçant @supabase/supabase-js
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
};

export default function PublicProfileClientWrapper({
  profile: initialProfile,
  currentUser,
  initialFollowers,
  initialFollowing,
  isInitiallyFollowing,
  searchBy,
  locale,
  input,
}: {
  profile: any;
  currentUser: User | null;
  initialFollowers: number;
  initialFollowing: number;
  isInitiallyFollowing: boolean;
  searchBy: 'username' | 'public_id';
  locale: string;
  input: string;
}) {
  const [optimisticFollowers, addOptimisticFollowers] = useOptimistic(
    initialFollowers,
    (state: number, action: { type: 'increment' | 'decrement' }) => {
      return action.type === 'increment' ? state + 1 : state - 1;
    }
  );

  const initialCardConfigs = initialProfile._cardConfigs || [];
  const initialScansCount = initialProfile._scansCount || 0;

  const [profileData, setProfileData] = useState<any>(initialProfile);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [cardConfigs, setCardConfigs] = useState(initialCardConfigs);
  const [scansCount, setScansCount] = useState(initialScansCount);

  const [isClient, setIsClient] = useState(false);
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    w: number;
    h: number;
    l: number;
    t: number;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = useRef<any>(null);

  useEffect(() => {
    supabase.current = createClient();
  }, []);

  useEffect(() => {
    setIsClient(true);
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      w: 8 + Math.random() * 25,
      h: 8 + Math.random() * 25,
      l: Math.random() * 100,
      t: Math.random() * 100,
      animationDelay: `${i * 0.15}s`,
      animationDuration: `${10 + i * 0.5}s`,
    }));
    setBubbles(generated);
  }, []);

  const fetchStats = useCallback(async (profileId: string, userId: string | null) => {
    if (!supabase.current) return;
    try {
      // Récupération des données et comptage manuel (le shim ne supporte pas count/head)
      const [followersData, followingData, isFollowingData] = await Promise.all([
        supabase.current.from('follows').select('id').eq('followed_id', profileId),
        userId ? supabase.current.from('follows').select('id').eq('follower_id', userId) : Promise.resolve({ data: [] }),
        userId ? supabase.current.from('follows').select('id').eq('follower_id', userId).eq('followed_id', profileId) : Promise.resolve({ data: [] }),
      ]);

      setFollowers(followersData.data?.length || 0);
      setFollowing(followingData.data?.length || 0);
      setIsFollowing((isFollowingData.data?.length || 0) > 0);
    } catch (err) {
      console.warn('Erreur chargement stats:', err);
    }
  }, []);

  const showFollowNotification = useCallback((follower: any) => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${follower.full_name || follower.username} vous suit !`, {
        body: 'Cliquez pour voir son profil',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      notification.onclick = () => {
        window.open(`/${locale}/${follower.username}`, '_blank');
        notification.close();
      };
      setTimeout(() => notification.close(), 5000);
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 🔹 Le realtime n'est pas supporté par le shim ; on le désactive pour l'instant
  // (les données initiales suffisent, et les mises à jour se feront via refresh)
  useEffect(() => {
    const userId = currentUser?.id || null;
    const isOwner = currentUser?.id === profileData.id;
    const isAdmin = currentUser?.user_metadata?.role === 'admin';

    if (!profileData.is_public && !isOwner && !isAdmin) {
      router.push(`/${locale}/${input}/private`);
      return;
    }

    // Chargement initial des stats (après création du client)
    fetchStats(profileData.id, userId);
  }, [profileData.id, currentUser, locale, input, router, fetchStats]);

  return (
    <div suppressHydrationWarning className="min-h-screen relative">
      <div className="fixed right-4 top-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          lastUpdate.getTime() > Date.now() - 60000
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            lastUpdate.getTime() > Date.now() - 60000 ? 'bg-green-400' : 'bg-yellow-400'
          } animate-pulse`}></div>
          <span>
            {lastUpdate.getTime() > Date.now() - 60000 ? 'Synchronisé' : 'Mise à jour...'}
          </span>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
        {isClient && (
          <div className="absolute inset-0 overflow-hidden">
            {bubbles.map(bubble => (
              <div
                key={`bg-bubble-${bubble.id}`}
                className="absolute rounded-full bg-white/5 animate-pulse"
                style={{
                  width: `${bubble.w}px`,
                  height: `${bubble.h}px`,
                  left: `${bubble.l}%`,
                  top: `${bubble.t}%`,
                  animationDelay: bubble.animationDelay,
                  animationDuration: bubble.animationDuration,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto pb-20 relative z-10">
        <PublicProfileClient
          profile={profileData}
          cardConfigs={cardConfigs}
          followers={optimisticFollowers}
          following={following}
          isOwner={currentUser?.id === profileData.id}
          isInitiallyFollowing={isFollowing}
          currentUserId={currentUser?.id || null}
          onFollowChange={(newCount: number, isNowFollowing: boolean) => {
            setFollowers(newCount);
            setIsFollowing(isNowFollowing);
          }}
          lastUpdate={lastUpdate}
        />
      </div>
    </div>
  );
}