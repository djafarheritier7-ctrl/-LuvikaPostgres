// src/app/dashboard/entreprise/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/src/lib/supabase/client';
import { Star, ArrowLeft, MessageSquare, User, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Loading from '@/src/components/system/Loading';

type Review = {
  id: string;
  org_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ReviewsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
      if (!company) return;

      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('org_id', company.id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="h-8 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-lg">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Résumé */}
        <div className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] text-center">
          <p className="text-4xl font-bold text-white/90">{averageRating.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400/60 font-light">{reviews.length} avis</p>

          <div className="mt-4 space-y-2">
            {ratingDistribution.reverse().map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400/60 w-4">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400/60 rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-gray-500/50 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="md:col-span-2 space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
              <MessageSquare className="w-10 h-10 text-gray-500/40 mx-auto mb-3" />
              <p className="text-gray-400/60 text-sm font-light">Aucun avis pour le moment</p>
            </div>
          ) : reviews.map(review => (
            <div key={review.id} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400/60" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">{review.reviewer_name || 'Anonyme'}</p>
                    <p className="text-[10px] text-gray-500/50 font-light">{format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400/70 font-light">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}