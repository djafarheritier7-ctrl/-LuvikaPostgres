// src/components/profile/GlacialLikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface GlacialLikeButtonProps {
  profileId: string;
  initialLikes: number;
  hideCount?: boolean;
}

export default function GlacialLikeButton({
  profileId,
  initialLikes,
  hideCount = false,
}: GlacialLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ Correction : tableau de dépendances constant
  useEffect(() => {
    const liked = localStorage.getItem(`luvika_liked_${profileId}`) === 'true';
    setHasLiked(liked);
  }, [profileId]); // ✅ OK - ne change pas

  // ✅ Correction : utiliser un ref ou vérifier le changement
  useEffect(() => {
    if (initialLikes !== undefined && initialLikes !== null) {
      setLikes(initialLikes);
    }
  }, [initialLikes]); // ✅ initialLikes est un nombre, pas undefined

  const handleLike = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Optimistic update
    const newHasLiked = !hasLiked;
    const newLikes = hasLiked ? likes - 1 : likes + 1;
    setHasLiked(newHasLiked);
    setLikes(newLikes);

    try {
      const res = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes_count ?? newLikes);
        setHasLiked(data.liked);
        localStorage.setItem(`luvika_liked_${profileId}`, String(data.liked));
      } else {
        // Rollback
        setHasLiked(hasLiked);
        setLikes(likes);
      }
    } catch (err) {
      console.error('❌ Like error:', err);
      // Rollback
      setHasLiked(hasLiked);
      setLikes(likes);
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={isAnimating}
      className="flex items-center justify-center rounded-full transition-all group"
      aria-label={hasLiked ? "Retirer un like" : "Ajouter un like"}
    >
      <motion.div
        animate={{ 
          scale: hasLiked ? [1, 1.4, 1] : 1,
          rotate: hasLiked ? [0, -15, 15, 0] : 0,
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut"
        }}
      >
        <Heart 
          size={22} 
          fill={hasLiked ? "#ec4899" : "none"} 
          className={`${hasLiked ? "text-pink-400" : "text-gray-400 group-hover:text-pink-300"} transition-colors`}
        />
      </motion.div>

      {!hideCount && (
        <span className="text-white font-medium text-lg ml-2">{likes}</span>
      )}
    </motion.button>
  );
}