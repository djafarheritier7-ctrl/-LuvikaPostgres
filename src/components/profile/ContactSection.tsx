// src/components/profile/ContactSection.tsx
'use client';

import { motion } from 'framer-motion';
import { PhoneCall, Mail, Phone, MessageCircle, MapPin, Globe } from 'lucide-react';
import ActionItem from './ActionItem';
import { isSectionEnabled } from '../../lib/utils/profileHelpers'; // ✅ Helper partagé

type Profile = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  website?: string | null;
};

type CardConfig = {
  scan_type: string;
  enabled: boolean;
};

export default function ContactSection({ 
  profile, 
  cardConfigs 
}: { 
  profile: Profile; 
  cardConfigs: CardConfig[]; 
}) {
  // ✅ Calcul local - pas de dépendance au parent
  const showContactSection = isSectionEnabled('contact', cardConfigs) && (
    profile.email?.trim() ||
    profile.phone?.trim() ||
    profile.whatsapp?.trim() ||
    profile.address?.trim() ||
    profile.website?.trim()
  );

  if (!showContactSection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="w-full px-4 mt-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Titre section */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PhoneCall className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Contact</h2>
          </div>
          <p className="text-sm text-gray-400">
            Connectez-vous avec {profile.full_name} via vos canaux préférés
          </p>
        </div>

        {/* 🔹 Grid moderne avec cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 📧 Email */}
          {profile.email && (
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
              <ActionItem
                icon={
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                }
                label="Email"
                value={profile.email}
                href={`mailto:${profile.email}`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                gradient="from-cyan-500 to-blue-500"
              />
            </motion.div>
          )}
          
          {/* 📞 Téléphone */}
          {profile.phone && (
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
              <ActionItem
                icon={
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                }
                label="Appeler"
                value={profile.phone}
                href={`tel:${profile.phone}`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                gradient="from-green-500 to-emerald-500"
              />
            </motion.div>
          )}
          
          {/* 💬 WhatsApp */}
          {profile.whatsapp && (
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
              <ActionItem
                icon={
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                }
                label="WhatsApp"
                value={profile.whatsapp}
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                gradient="from-emerald-500 to-lime-500"
              />
            </motion.div>
          )}
          
          {/* 📍 Adresse */}
          {profile.address && (
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
              <ActionItem
                icon={
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                }
                label="Carte"
                value={profile.address}
                href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                gradient="from-amber-500 to-orange-500"
              />
            </motion.div>
          )}
          
          {/* 🌐 Site web */}
          {profile.website && (
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group">
              <ActionItem
                icon={
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                }
                label="Site"
                value={profile.website.replace(/^https?:\/\//, '')}
                href={profile.website}
                className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                gradient="from-blue-500 to-indigo-500"
              />
            </motion.div>
          )}
        </div>

        {/* Divider décoratif */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span>Informations de contact sécurisées</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}