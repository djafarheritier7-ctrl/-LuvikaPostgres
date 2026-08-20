// src/components/org/OrgCardPublicClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Building, User, Mail, Phone, Globe,
  Calendar, Clock, XCircle, CheckCircle,
  Briefcase, BadgeCheck, ChevronDown, ChevronUp,
  ExternalLink, Fingerprint, Hash,
  UserCircle, PhoneCall, Award, MapPin,
  Layers, Droplet, Flag, Clock3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type OrgCard = {
  id: string;
  card_number: string;
  status: string;
  role_in_org: string | null;
  member_name?: string | null;
  member_email?: string | null;
  member_surname?: string | null;
  member_given_name?: string | null;
  member_phone?: string | null;
  member_position?: string | null;
  member_department?: string | null;
  member_blood_group?: string | null;
  member_nationality?: string | null;
  member_access_level?: string | null;
  member_work_hours?: string | null;
  member_photo_url?: string | null;
  valid_from: string;
  valid_until: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    email: string | null;
    phone: string | null;
    username: string | null;
  } | null;
  companies?: {
    name: string | null;
    logo_url: string | null;
    description: string | null;
    website: string | null;
    address?: string | null;
  } | null;
};

type Props = {
  card: OrgCard;
  isValid: boolean;
  isExpired: boolean;
  locale: string;
};

const parseFullName = (fullName: string): { surname: string; givenName: string } => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3) return { surname: parts.slice(0, 2).join(' '), givenName: parts.slice(2).join(' ') };
  if (parts.length === 2) return { surname: parts[0], givenName: parts[1] };
  return { surname: parts[0] || '', givenName: '' };
};

export default function OrgCardPublicClient({ card, isValid, isExpired }: Props) {
  const t = useTranslations('org_card');
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => { setAnimatedIn(true); }, []);

  const rawFullName = card.profiles?.full_name || card.member_name || t('default_member');
  const parsed = parseFullName(rawFullName);
  const memberSurname = card.member_surname || parsed.surname;
  const memberGivenName = card.member_given_name || parsed.givenName;
  const memberFullName = `${memberSurname} ${memberGivenName}`.trim();
  const memberEmail = card.profiles?.email || card.member_email || null;
  const memberPhone = card.member_phone || card.profiles?.phone || null;
  const memberPosition = card.member_position || card.profiles?.job_title || null;
  const memberPhoto = card.member_photo_url || card.profiles?.avatar_url || null;
  const orgName = card.companies?.name || t('default_org');
  const orgLogo = card.companies?.logo_url || null;
  const orgWebsite = card.companies?.website || null;
  const orgDescription = card.companies?.description || null;
  const orgAddress = card.companies?.address || null;

  const memberInitials = memberFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getStatusConfig = () => {
    if (isExpired) return { icon: Clock, label: t('status.expired'), bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', bandeau: 'from-amber-400 to-orange-400' };
    if (card.status === 'suspended') return { icon: Clock, label: t('status.suspended'), bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', bandeau: 'from-amber-400 to-orange-400' };
    if (card.status === 'revoked') return { icon: XCircle, label: t('status.revoked'), bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400', bandeau: 'from-red-400 to-rose-400' };
    if (!isValid) return { icon: XCircle, label: t('status.invalid'), bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400', bandeau: 'from-red-400 to-rose-400' };
    return { icon: CheckCircle, label: t('status.valid'), bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', bandeau: 'from-emerald-400 to-teal-400' };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const identityFields = [
    { label: t('fields.surname'), value: memberSurname?.split(' ')[0] || null, icon: UserCircle },
    { label: t('fields.middle_name'), value: memberSurname?.split(' ').slice(1).join(' ') || null, icon: UserCircle },
    { label: t('fields.given_name'), value: memberGivenName, icon: User },
    { label: t('fields.phone'), value: memberPhone, icon: PhoneCall, href: memberPhone ? `tel:${memberPhone}` : undefined },
    { label: t('fields.email'), value: memberEmail, icon: Mail, href: memberEmail ? `mailto:${memberEmail}` : undefined },
    { label: t('fields.position'), value: memberPosition, icon: Briefcase },
    { label: t('fields.department'), value: card.member_department, icon: Layers },
    { label: t('fields.role_in_org'), value: card.role_in_org, icon: Award },
    { label: t('fields.access_level'), value: card.member_access_level, icon: ShieldCheck },
    { label: t('fields.blood_group'), value: card.member_blood_group, icon: Droplet },
    { label: t('fields.nationality'), value: card.member_nationality, icon: Flag },
    { label: t('fields.work_hours'), value: card.member_work_hours, icon: Clock3 },
  ].filter(f => !!f.value);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={animatedIn ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* En-tête Organisation */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={animatedIn ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-center mb-5">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-white shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-2 shadow-md"><Building className="w-8 h-8 text-white" /></div>
          )}
          <h2 className="text-lg font-bold text-gray-900">{orgName}</h2>
          {orgDescription && <p className="text-xs text-gray-500 mt-0.5 max-w-xs mx-auto line-clamp-2">{orgDescription}</p>}
          {orgAddress && (
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{orgAddress}</p>
          )}
        </motion.div>

        {/* Carte principale */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={animatedIn ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="relative bg-white rounded-[28px] shadow-2xl shadow-black/10 overflow-hidden border border-gray-100">
          <div className={`h-1.5 bg-gradient-to-r ${status.bandeau}`} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[40px] border-gray-900" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border-[30px] border-gray-900" />
          </div>

          <div className="relative p-6">
            {/* Statut + N° carte */}
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} border ${status.border}`}>
                <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                <StatusIcon className={`w-4 h-4 ${status.text}`} />
                <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Hash className="w-3 h-3" />
                <span className="text-[11px] font-mono font-medium">{card.card_number.slice(-8)}</span>
              </div>
            </div>

            {/* Profil du membre */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                {memberPhoto ? (
                  <img src={memberPhoto} alt={memberFullName} className="w-20 h-20 rounded-full object-cover border-[3px] border-violet-100 shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border-[3px] border-violet-100 shadow-md">
                    <span className="text-2xl font-bold text-white">{memberInitials}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{memberFullName}</h1>
                {card.role_in_org && <Badge className="mt-1 bg-violet-100 text-violet-700 border-violet-200 font-medium">{card.role_in_org}</Badge>}
                {memberPosition && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{memberPosition}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-300" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-5 h-5 text-violet-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-violet-800">{t('verified_by', { orgName })}</p>
                <p className="text-xs text-violet-500">{t('member_since', { date: formatDate(card.valid_from) })}</p>
              </div>
            </div>

            {/* IDENTITÉ COMPLÈTE */}
            <AnimatePresence>
              {showFullInfo && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                  <div className="space-y-2.5 mb-5 pt-1">
                    {identityFields.map((field, i) => {
                      const content = (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><field.icon className="w-4 h-4 text-violet-600" /></div>
                          <div className="flex-1 min-w-0"><p className="text-[11px] text-gray-400 uppercase">{field.label}</p><p className="text-sm text-gray-900 font-medium">{field.value}</p></div>
                        </div>
                      );
                      return field.href ? <a key={i} href={field.href} className="block hover:bg-violet-50 rounded-xl transition-all">{content}</a> : <div key={i}>{content}</div>;
                    })}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><Fingerprint className="w-4 h-4 text-violet-600" /></div>
                      <div className="flex-1"><p className="text-[11px] text-gray-400 uppercase">{t('fields.matricule')}</p><p className="text-sm text-gray-900 font-mono font-medium">{card.card_number}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><Calendar className="w-4 h-4 text-violet-600" /></div>
                      <div className="flex-1">
                        <p className="text-[11px] text-gray-400 uppercase">{t('fields.validity')}</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {t('validity_range', {
                            from: formatShortDate(card.valid_from),
                            to: card.valid_until ? formatShortDate(card.valid_until) : t('no_limit')
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => setShowFullInfo(!showFullInfo)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 text-violet-700 font-medium text-sm transition-all border border-violet-100">
              {showFullInfo ? <><ChevronUp className="w-4 h-4" /> {t('hide_details')}</> : <><ChevronDown className="w-4 h-4" /> {t('show_details')}</>}
            </button>

            {orgWebsite && (
              <a href={orgWebsite} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all text-sm">
                <Globe className="w-4 h-4" />{orgName}<ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-gray-400" /><span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{t('org_badge')}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] text-gray-400 font-medium">{t('secure_card')}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={animatedIn ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">{t('footer_authenticated', { orgName })}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}