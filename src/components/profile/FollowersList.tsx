'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { User, Users } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

type Following = {
  followed_id: string;
  followed: {
    full_name: string | null;
    username: string | null;
  };
};

export default function FollowingList({
  profileId,
  plan,
}: {
  profileId: string;
  plan: string;
}) {
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // ✅ Déclaré en premier
  const FOLLOWING_PER_PAGE = 10;

  // 🔒 Masquer si Basic
  if (plan === 'basic') return null;

  // ✅ Calculs après la déclaration
  const totalPages = Math.ceil(following.length / FOLLOWING_PER_PAGE);
  const paginatedFollowing = following.slice(
    (currentPage - 1) * FOLLOWING_PER_PAGE,
    currentPage * FOLLOWING_PER_PAGE
  );

  const resetPagination = () => setCurrentPage(1);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFollowing = async () => {
      try {
        const res = await fetch(`/api/following?profileId=${profileId}`);
        const data = await res.json();
        setFollowing(data.following || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur fetch following:', err);
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [isOpen, profileId]);

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          resetPagination();
        }}
        className="text-gray-400 hover:text-cyan-300 flex items-center gap-1"
      >
        <Users className="w-4 h-4" />
        Suivi(e)s ({following.length})
      </Button>

      {isOpen && (
        <Card className="mt-2 border border-white/10 bg-white/5">
          <CardContent className="p-3 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-gray-400 text-sm py-2">Chargement...</div>
            ) : paginatedFollowing.length === 0 ? (
              <div className="text-gray-400 text-sm py-2">Ne suit personne</div>
            ) : (
              <>
                <ul className="space-y-2">
                  {paginatedFollowing.map((f) => (
                    <li key={f.followed_id} className="flex items-center justify-between">
                      <Link
                        href={`/${f.followed.username}`}
                        className="flex items-center gap-2 text-sm text-cyan-300 hover:underline"
                      >
                        <User className="w-3 h-3" />
                        {f.followed.full_name || f.followed.username}
                      </Link>
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5">
                        Suit
                      </Badge>
                    </li>
                  ))}
                </ul>

                {/* ✅ Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-3 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-6 w-6 p-0 text-gray-400 hover:bg-white/10"
                    >
                      ‹
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        size="sm"
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`h-6 w-6 p-0 text-xs ${
                          currentPage === i + 1
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-6 w-6 p-0 text-gray-400 hover:bg-white/10"
                    >
                      ›
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}