// src/app/auth/sign-up/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowLeft, ArrowRight, 
  Eye, EyeOff, Check, X, AlertCircle, 
  ShieldCheck, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/src/lib/supabase/client';

type Step = 'email' | 'security';

export default function SignUpPage() {
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const isValidEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email);
  const isPasswordLengthValid = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.passwordConfirm;
  const allPasswordRulesMet = isPasswordLengthValid && doPasswordsMatch;

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
        return;
      }
      setPageLoading(false);
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 'security' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!formData.email || !isValidEmail) {
      setEmailExists(false);
      return;
    }

    const checkEmail = async () => {
      setCheckingEmail(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email.trim().toLowerCase())
        .maybeSingle();

      setEmailExists(!!data);
      setCheckingEmail(false);
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email, isValidEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleNextEmail = () => {
    if (!isValidEmail) {
      setError(t('error_email_format'));
      return;
    }
    if (emailExists) {
      setError(t('email_exists'));
      return;
    }
    setStep('security');
  };

  const handleBack = () => {
    setStep('email');
  };

  const handleSignUp = async () => {
  if (!isValidEmail || !allPasswordRulesMet || emailExists) return;

  setLoading(true);
  setError(null);

  try {
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        // Pas d'emailRedirectTo nécessaire pour notre système local
      },
    });

    if (signUpError) throw signUpError;

    // Redirection immédiate vers le dashboard
    router.push('/dashboard');
    router.refresh();
  } catch (err: any) {
    if (err.message?.includes('User already registered')) {
      setError(t('email_exists'));
    } else {
      setError(err.message || t('error_generic'));
    }
  } finally {
    setLoading(false);
  }
};

  const isNextDisabled = () => {
    if (step === 'email') return !isValidEmail || emailExists || checkingEmail;
    if (step === 'security') return !allPasswordRulesMet;
    return false;
  };

  const steps: Step[] = ['email', 'security'];
  const currentStepIndex = steps.indexOf(step);
  const stepIcons = { email: Mail, security: Lock };
  const stepTitles = { email: t('email_title'), security: t('security_title') };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">{tCommon('loading')}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(6,182,212,0.03),transparent_50%)]" />
      </div>

      {/* Retour accueil */}
      <Link href="/" className="absolute top-6 left-6 z-10 text-gray-400/60 hover:text-cyan-300/70 transition-colors text-xs flex items-center gap-1.5 group font-light">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        {tCommon('back_to_home')}
      </Link>

      <div className="w-full max-w-md">
        {/* Étapes */}
        <div className="mb-6">
          <div className="flex justify-center gap-4 mb-4">
            {steps.map((s, i) => {
              const Icon = stepIcons[s];
              const isActive = step === s;
              const isCompleted = i < currentStepIndex;

              return (
                <motion.div key={s} className="flex flex-col items-center" animate={{ scale: isActive ? 1.05 : 1 }}>
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-gradient-to-br from-emerald-500/60 to-cyan-500/60 text-white/80' :
                    isActive ? 'bg-cyan-500/60 text-white/80' :
                    'bg-white/[0.04] text-gray-400/50'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {isCompleted && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-emerald-400/60">
                        <Check className="w-2.5 h-2.5 text-emerald-400/70" />
                      </div>
                    )}
                  </div>
                  <span className={`mt-2 text-[11px] font-light transition-colors ${
                    isActive ? 'text-white/70' : isCompleted ? 'text-emerald-300/60' : 'text-gray-500/50'
                  }`}>
                    {stepTitles[s]}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Barre de progression */}
          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500/60 to-cyan-500/60 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStepIndex) / 1) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Carte formulaire */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-2xl p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]"
        >
          {/* Icône */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.08] flex items-center justify-center border border-white/[0.06]">
              {step === 'email' && <Mail className="w-5 h-5 text-cyan-300/60" />}
              {step === 'security' && <Lock className="w-5 h-5 text-cyan-300/60" />}
            </div>
          </div>

          <h1 className="text-lg font-semibold text-center text-white/80 mb-1">{stepTitles[step]}</h1>
          <p className="text-gray-400/60 text-center text-xs font-light mb-5">
            {step === 'email' ? t('email_desc') : t('security_desc')}
          </p>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] flex items-start gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0 mt-0.5" />
                <p className="text-red-300/60 text-xs font-light">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08] flex items-start gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
                <p className="text-emerald-300/60 text-xs font-light">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Étape Email */}
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs text-gray-400/70 font-light mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400/60" />
                  {t('email')}
                </Label>
                <div className="relative">
                  <Input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="votre@gmail.com"
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingEmail && <Loader2 className="w-4 h-4 text-cyan-400/60 animate-spin" />}
                    {!checkingEmail && emailExists && <X className="w-4 h-4 text-red-400/60" />}
                    {!checkingEmail && !emailExists && formData.email && isValidEmail && <Check className="w-4 h-4 text-emerald-400/60" />}
                  </div>
                </div>
                {emailExists && (
                  <p className="text-[11px] text-red-400/60 mt-1.5 flex items-center gap-1 font-light">
                    <AlertCircle className="w-3 h-3" />{t('email_exists')}
                  </p>
                )}
                {emailTouched && !isValidEmail && formData.email && !emailExists && (
                  <p className="text-[11px] text-amber-400/60 mt-1.5 flex items-center gap-1 font-light">
                    <AlertCircle className="w-3 h-3" />{t('error_email_format')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Étape Sécurité */}
          {step === 'security' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-xs text-gray-400/70 font-light mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400/60" />
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-cyan-400/60 transition-colors">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {formData.password && !isPasswordLengthValid && (
                  <p className="text-[11px] text-amber-400/60 mt-1.5 flex items-center gap-1 font-light">
                    <AlertCircle className="w-3 h-3" />{t('password_min_length')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="passwordConfirm" className="text-xs text-gray-400/70 font-light mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400/60" />
                  {t('password_confirm')}
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-xl focus:border-cyan-400/30 font-light pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-cyan-400/60 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {formData.passwordConfirm && !doPasswordsMatch && (
                  <p className="text-[11px] text-amber-400/60 mt-1.5 flex items-center gap-1 font-light">
                    <AlertCircle className="w-3 h-3" />{t('password_mismatch')}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/[0.06] text-xs text-blue-300/60 font-light flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{t('two_factor_info')}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <div className="flex gap-2">
              {step === 'security' && (
                <Button type="button" onClick={handleBack} variant="ghost"
                  className="h-9 text-xs text-gray-400/60 hover:text-white/70 hover:bg-white/[0.04] font-light rounded-xl px-4">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />{t('back_button')}
                </Button>
              )}
              <Button type="button"
                onClick={step === 'email' ? handleNextEmail : handleSignUp}
                disabled={isNextDisabled() || loading}
                className="flex-1 h-9 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-xl transition-all">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('creating')}
                  </span>
                ) : step === 'email' ? (
                  <span className="flex items-center gap-1.5">{t('next')}<ArrowRight className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t('create_account')}</span>
                )}
              </Button>
            </div>

            <div className="mt-4 text-center pt-3 border-t border-white/[0.04]">
              <p className="text-xs text-gray-400/60 font-light">
                {t('already_have_account')}{' '}
                <Link href="/auth/sign-in" className="text-cyan-400/60 hover:text-cyan-300/70 font-medium">
                  {t('sign_in')}
                </Link>
              </p>
              <div className="mt-3 flex justify-center gap-3 text-[11px] text-gray-500/50 font-light">
                <Link href="/privacy" className="hover:text-cyan-400/60 transition-colors">{tCommon('privacy_link')}</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-cyan-400/60 transition-colors">{tCommon('terms_link')}</Link>
                <span>•</span>
                <Link href="/contact" className="hover:text-cyan-400/60 transition-colors">{tCommon('contact_link')}</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Bienvenue */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowWelcomeModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] text-center"
              onClick={e => e.stopPropagation()}>
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-white/80 mb-2">{t('welcome_title')}</h3>
              <p className="text-gray-400/60 text-xs font-light mb-5">
                {t('welcome_description')}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setShowWelcomeModal(false)}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white font-light rounded-lg">
                  {t('welcome_start_button')}
                </Button>
                <Button variant="ghost" onClick={() => { setShowWelcomeModal(false); router.push('/auth/sign-in'); }}
                  className="flex-1 h-8 text-xs text-gray-400/60 hover:text-white/70 font-light rounded-lg">
                  {t('welcome_login_button')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}