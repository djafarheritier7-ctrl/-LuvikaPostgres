// src/components/system/ReviewPrompt.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';

export function ReviewPrompt() {
  const t = useTranslations('ReviewPrompt');
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const startTimeRef = useRef(Date.now());
  const pageViewsRef = useRef(1);
  const checkedRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  const MIN_TIME = 120000; // 2 minutes
  const MIN_VIEWS = 3;
  const PROMPT_DELAY = 5000;

  // Compter les pages vues
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      pageViewsRef.current++;
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Vérifier l'authentification
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  // Vérifier si déjà reviewé
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const res = await fetch(`/api/review/check?userId=${user.id}`);
        const data = await res.json();
        if (data.hasSubmitted) {
          setHasReviewed(true);
          localStorage.setItem('review_prompt_done', 'true');
        }
      } catch (err) {
        // Silencieux
      }
    };
    check();
  }, [user]);

  // Vérifier les conditions d'affichage
  useEffect(() => {
    if (loading || checkedRef.current) return;
    if (!user || hasReviewed) return;
    if (pathname?.startsWith('/auth')) return;

    const done = localStorage.getItem('review_prompt_done');
    const declined = localStorage.getItem('review_prompt_declined');
    if (done || declined) {
      checkedRef.current = true;
      return;
    }

    const interval = setInterval(() => {
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent >= MIN_TIME && pageViewsRef.current >= MIN_VIEWS) {
        clearInterval(interval);
        checkedRef.current = true;
        setTimeout(() => setShowPrompt(true), PROMPT_DELAY);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, user, pathname, hasReviewed]);

  const handleAccept = () => {
    setShowPrompt(false);
    setShowReviewModal(true);
  };

  const handleDecline = () => {
    localStorage.setItem('review_prompt_declined', 'true');
    setShowPrompt(false);
  };

  const handleLater = () => {
    setShowPrompt(false);
  };

  const submitReview = async () => {
    if (rating === 0) {
      toast.warning(t('rating_required'), {
        description: t('select_rating_description'),
        icon: <Star className="w-4 h-4 text-amber-400/70" />,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast(t('already_submitted_title'), {
            description: t('already_submitted_description'),
            icon: <Star className="w-4 h-4 text-amber-400/70" />,
          });
          setShowReviewModal(false);
          return;
        }
        throw new Error(data.error || t('error_unknown'));
      }

      toast.success(t('thank_you_title'), {
        description: t('thank_you_description'),
        icon: <Heart className="w-4 h-4 text-rose-400/70" />,
      });
      setShowReviewModal(false);
      setHasReviewed(true);
      localStorage.setItem('review_prompt_done', 'true');
    } catch (error: any) {
      toast.error(t('error_title'), {
        description: error.message || t('error_try_again'),
        icon: <X className="w-4 h-4 text-red-400/70" />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || hasReviewed) return null;

  return (
    <AnimatePresence>
      {/* Prompt */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleLater}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl p-5 bg-slate-900/90 backdrop-blur-xl border border-amber-500/[0.08] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/[0.04] rounded-full blur-2xl" />
              
              <button
                onClick={handleLater}
                className="absolute top-3 right-3 p-1 text-gray-400/60 hover:text-gray-300/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="relative z-10 text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400/60 text-amber-400/60" />
                  ))}
                </div>

                <h3 className="text-base font-semibold text-white/80 mb-1.5">
                  {t('prompt_title')}
                </h3>
                <p className="text-gray-400/60 text-xs font-light mb-4">
                  {t('prompt_description')}
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleAccept}
                    className="h-8 text-xs bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-500 hover:to-amber-400 text-white font-light rounded-lg"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    {t('leave_review_button')}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={handleLater}
                      className="flex-1 h-7 text-xs text-gray-400/60 hover:text-gray-300/80 hover:bg-white/[0.04] font-light rounded-lg"
                    >
                      {t('later_button')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleDecline}
                      className="flex-1 h-7 text-xs text-gray-500/50 hover:text-gray-400/70 hover:bg-white/[0.04] font-light rounded-lg"
                    >
                      {t('no_thanks_button')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal d'avis */}
      {showReviewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReviewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl p-5 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] relative">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-3 right-3 p-1 text-gray-400/60 hover:text-gray-300/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-base font-semibold text-white/80 mb-1">{t('modal_title')}</h3>
                <p className="text-gray-400/60 text-xs font-light">{t('modal_subtitle')}</p>
              </div>

              {/* Étoiles */}
              <div className="flex justify-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400/70 text-amber-400/70'
                          : 'text-gray-600/50'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Commentaire */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('comment_placeholder')}
                className="min-h-[80px] bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-gray-500/50 text-sm font-light resize-none rounded-xl mb-4"
                maxLength={500}
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 h-8 text-xs text-gray-400/60 hover:text-gray-300/80 hover:bg-white/[0.04] font-light rounded-lg"
                >
                  {t('cancel_button')}
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={submitting || rating === 0}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-500 hover:to-amber-400 text-white font-light rounded-lg"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('sending_button')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      {t('send_button')}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}