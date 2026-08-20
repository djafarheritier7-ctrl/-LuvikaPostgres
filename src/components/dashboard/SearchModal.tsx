// src/components/dashboard/SearchModal.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, UserPlus, UserCheck, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  username: string;
  full_name: string;
  plan: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
};

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const debouncedSearch = useMemo(
    () => debounce(async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.users || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const toggleFollow = async (userId: string, isFollowing: boolean) => {
  try {
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: isFollowing ? 'unfollow' : 'follow',
        targetId: userId, // ✅ string UUID, pas objet
      }),
    });
      if (res.ok) {
        setResults(prev => 
          prev.map(u => u.id === userId ? { ...u, isFollowing: !isFollowing } : u)
        );
      }
     } catch (err) {
    console.error('❌ Toggle follow error:', err);
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 🔹 Barre de recherche */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Chercher un profil (nom ou @username)..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 🔹 Résultats */}
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : query.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Tapez 2+ caractères pour chercher</div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2 text-yellow-400" />
                Aucun profil trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {results.map(user => (
                  <motion.div
                    key={user.id}
                    whileHover={{ x: 4 }}
                    className="glass-border bg-white/5 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : user.full_name ? (
                          user.full_name.charAt(0)
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.full_name}</p>
                        <p className="text-sm text-cyan-300">@{user.username}</p>
                      </div>
                      {user.plan && user.plan !== 'basic' && (
                        <Badge className={`px-2 py-0.5 text-xs ${
                          user.plan === 'premium' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {user.plan === 'premium' ? '⭐' : '🏢'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={user.isFollowing 
                        ? () => toggleFollow(user.id, true)
                        : () => toggleFollow(user.id, false)
                      }
                      className={`px-3 py-1 ${
                        user.isFollowing
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {user.isFollowing ? (
                        <><UserCheck className="w-3.5 h-3.5 mr-1" /> Se désabonner</>
                      ) : (
                        <><UserPlus className="w-3.5 h-3.5 mr-1" /> S’abonner</>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 🔹 Footer */}
          <div className="p-3 border-t border-white/10 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🔹 Utilitaire debounce
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T;
}