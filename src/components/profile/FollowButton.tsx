'use client';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { UserCheck, UserX, Loader2 } from 'lucide-react';

export default function FollowButton({
  targetId,
  isInitiallyFollowing,
  onFollowChange,
}: {
  targetId: string;
  isInitiallyFollowing: boolean;
  onFollowChange: (isNowFollowing: boolean, newFollowers: number) => void;
}) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  if (typeof window !== 'undefined' && (window as any)._luvika_disable_analytics) {
    return;
  }
  // Charger ou enregistrer les présences
}, []);

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const toggleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow',
          targetId,
        }),
      });

      if (res.ok) {
        const { followers } = await res.json();
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        onFollowChange(newIsFollowing, followers);
      } else {
        const { error } = await res.json();
        alert(error || 'Action échouée');
      }
    } catch (err) {
      alert('❌ Réseau indisponible');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isFollowing ? "secondary" : "default"}
      className={`flex items-center gap-2 ${
        isFollowing
          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30'
          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
      }`}
      onClick={toggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserX className="w-4 h-4" />
          Ne plus suivre
        </>
      ) : (
        <>
          <UserCheck className="w-4 h-4" />
          Suivre
        </>
      )}
    </Button>
  );
}