// src/components/profile/LikeButton.tsx (version corrigée)
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function LikeButton({
  profileId,
  initialLikes,
  isOwner = false, // ✅ optionnel
}: {
  profileId: string;
  initialLikes: number;
  isOwner?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOwner) {
      // Le propriétaire ne peut pas liker son propre profil
      setHasLiked(false);
      setLoading(false);
      return;
    }

    // ✅ Vérifie si l'utilisateur a déjà liké
    const checkLike = async () => {
      try {
        const res = await fetch('/api/interactions/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId }),
        });
        const data = await res.json();
        setHasLiked(data.hasLiked || false);
      } catch (err) {
        console.warn('CallCheck failed, defaulting to false');
      } finally {
        setLoading(false);
      }
    };

    checkLike();
  }, [profileId, isOwner]);

  const handleLike = async () => {
    if (loading || isOwner) return;
    setLoading(true);

    try {
      const res = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(prev => data.liked ? prev + 1 : prev - 1);
        setHasLiked(data.liked);
      }
    } catch (err) {
      console.error('Erreur like:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading || isOwner}
      className="flex items-center gap-1 text-gray-300 hover:text-red-400 hover:bg-red-500/10"
    >
      <Heart
        size={16}
        fill={hasLiked ? "red" : "none"}
        className="transition-colors"
      />
      <span>{likes}</span>
    </Button>
  );
}