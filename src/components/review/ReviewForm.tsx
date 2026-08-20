// src/components/forms/ReviewForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Gift, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function ReviewForm() {
  const t = useTranslations('ReviewForm');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [eligibleForBadge, setEligibleForBadge] = useState(false);
  const [reviewsThisWeek, setReviewsThisWeek] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
          
          const reviewRes = await fetch(`/api/review/check?userId=${data.user.id}`);
          const reviewData = await reviewRes.json();
          
          if (reviewData.hasSubmitted) {
            setHasSubmitted(true);
            setLoading(false);
            return;
          }
          
          const countRes = await fetch('/api/review/count');
          const countData = await countRes.json();
          setReviewsThisWeek(countData.count || 0);
          setEligibleForBadge((countData.count || 0) < 100);
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getRatingMessage = () => {
    if (rating === 0) return t('rating_select_prompt');
    if (rating < 3) return t('rating_low_message');
    if (rating < 5) return t('rating_medium_message');
    return t('rating_high_message');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning(t('login_required'), {
        description: t('login_to_review'),
        icon: <XCircle className="w-4 h-4 text-amber-400/70" />,
      });
      return;
    }
    
    if (rating === 0) {
      toast.warning(t('rating_required'), {
        description: t('select_rating_before_submit'),
        icon: <Star className="w-4 h-4 text-amber-400/70" />,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || t('unknown_error'));
      
      setHasSubmitted(true);
      toast.success(t('thank_you_title'), {
        description: result.receivedBadge ? t('badge_received') : t('review_helps'),
        icon: <CheckCircle className="w-4 h-4 text-emerald-400/70" />,
        duration: 6000,
      });
      
      if (window.gtag) {
        window.gtag('event', 'review_submitted', {
          event_category: 'engagement',
          event_label: 'review_form',
          value: rating
        });
      }
      
    } catch (error: any) {
      toast.error(t('error_title'), {
        description: error.message || t('error_try_again'),
        icon: <XCircle className="w-4 h-4 text-red-400/70" />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="rounded-2xl p-6 bg-emerald-500/[0.03] backdrop-blur-sm border border-emerald-500/[0.08] text-center">
        <div className="flex justify-center mb-3">
          <CheckCircle className="w-10 h-10 text-emerald-400/60" />
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-1.5">{t('thank_you_title')}</h2>
        <p className="text-gray-400/60 text-sm font-light leading-relaxed">
          {t('thank_you_description')}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl p-6 bg-amber-500/[0.03] backdrop-blur-sm border border-amber-500/[0.08] text-center">
        <div className="flex justify-center mb-3">
          <XCircle className="w-10 h-10 text-amber-400/60" />
        </div>
        <h2 className="text-lg font-semibold text-white/80 mb-1.5">{t('login_required')}</h2>
        <p className="text-gray-400/60 text-sm font-light mb-4">
          {t('login_to_share_experience')}
        </p>
        <Button 
          onClick={() => window.location.href = '/auth/sign-in'} 
          className="h-8 text-xs bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white font-light px-4 rounded-lg"
        >
          {t('sign_in_button')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-semibold text-white/80 mb-1">
          {t('form_title')}
        </h2>
        <p className="text-gray-400/60 text-xs font-light">
          {t('form_subtitle')}
        </p>
      </div>

      {/* Étoiles */}
      <div className="mb-5">
        <label className="block text-gray-400/70 text-sm font-light mb-2 text-center">
          {t('your_rating_label')}
        </label>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
              aria-label={t('rating_star_aria', { stars: star })}
            >
              <Star
                className={`w-8 h-8 transition-all duration-200 ${
                  star <= (hoverRating || rating) 
                    ? 'text-amber-400/80 fill-amber-400/80' 
                    : 'text-gray-600/50'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center mt-1.5 text-xs text-gray-400/60 font-light">
          {getRatingMessage()}
        </p>
      </div>

      {/* Commentaire */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-gray-400/70 text-sm font-light mb-1.5">
          {t('comment_label')}
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('comment_placeholder')}
          className="min-h-[80px] bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-gray-500/50 text-sm font-light resize-none rounded-xl"
          maxLength={500}
        />
        <p className="text-right text-[11px] text-gray-500/60 mt-1 font-light">
          {comment.length}/500
        </p>
      </div>

      {/* Badge incitation + Compteur */}
      <div className="space-y-3 mb-4">
        <div className="p-3 bg-amber-500/[0.04] border border-amber-500/[0.08] rounded-xl">
          <p className="text-xs text-amber-300/60 font-light flex items-start gap-2">
            <Gift className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400/50" />
            <span>
              <span className="text-amber-300/70">{t('gift_prefix')}</span> {t('badge_offer_text', { eligible: eligibleForBadge ? t('next') : t('first') })}
            </span>
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-amber-400/60 font-light bg-amber-500/[0.04] py-0.5 px-2 rounded-full">
              {reviewsThisWeek}/100
            </span>
            <span className={`text-[11px] font-light ${eligibleForBadge ? 'text-amber-400/60' : 'text-gray-500/60'}`}>
              {eligibleForBadge ? t('spots_remaining') : t('full')}
            </span>
          </div>
          <div className="overflow-hidden h-1.5 rounded-full bg-white/[0.04]">
            <div 
              style={{ width: `${Math.min(reviewsThisWeek, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                eligibleForBadge 
                  ? 'bg-gradient-to-r from-amber-500/60 to-orange-500/60' 
                  : 'bg-gray-500/40'
              }`}
            ></div>
          </div>
          <p className="text-[11px] text-gray-500/60 mt-1.5 font-light">
            {eligibleForBadge ? t('be_among_pioneers') : t('thanks_to_contributors')}
          </p>
        </div>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        disabled={submitting || rating === 0}
        className={`w-full h-9 text-sm font-light transition-all duration-300 rounded-xl ${
          submitting
            ? 'bg-gray-500/50 cursor-wait'
            : rating >= 4
            ? 'bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white'
            : rating >= 3
            ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white'
            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 hover:from-gray-500 hover:to-gray-600 text-white/80'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('sending')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            {rating === 0 ? t('select_rating_button') : t('submit_review_button')}
          </span>
        )}
      </Button>

      {/* Footer */}
      <p className="mt-3 text-[11px] text-gray-500/50 text-center font-light">
        {t('footer_anonymous_note')}
      </p>
    </form>
  );
}