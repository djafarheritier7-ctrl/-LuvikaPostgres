// src/components/profile/SocialCard.tsx
import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

type Platform = 'instagram' | 'linkedin' | 'github' | 'pinterest' | 'tiktok' | 'snapchat' | 'telegram' | 'discord' | 'reddit' | 'threads' | 'youtube';

interface SocialCardProps {
  platform: Platform;
  label: string;
  handle: string;
  href: string;
  icon: React.ReactNode;
}

const platformStyles: Record<Platform, { bg: string; border: string; hover: string; text: string }> = {
  instagram: {
    bg: 'from-pink-500 to-rose-500',
    border: 'border-pink-500/20',
    hover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
    text: 'text-pink-400'
  },
  linkedin: {
    bg: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/20',
    hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
    text: 'text-blue-400'
  },
  github: {
    bg: 'from-gray-700 to-gray-500',
    border: 'border-gray-500/20',
    hover: 'hover:border-gray-500/40 hover:shadow-gray-500/10',
    text: 'text-gray-400'
  },
  tiktok: {
    bg: 'from-black to-gray-800',
    border: 'border-gray-700/20',
    hover: 'hover:border-gray-700/40 hover:shadow-gray-700/10',
    text: 'text-white'
  },
  snapchat: {
    bg: 'from-yellow-400 to-amber-400',
    border: 'border-yellow-400/20',
    hover: 'hover:border-yellow-400/40 hover:shadow-yellow-400/10',
    text: 'text-yellow-400'
  },
  telegram: {
    bg: 'from-blue-400 to-cyan-400',
    border: 'border-blue-400/20',
    hover: 'hover:border-blue-400/40 hover:shadow-blue-400/10',
    text: 'text-blue-400'
  },
  pinterest: {
    bg: 'from-red-600 to-rose-600',
    border: 'border-red-500/20',
    hover: 'hover:border-red-500/40 hover:shadow-red-500/10',
    text: 'text-red-400'
  },
  discord: {
    bg: 'from-indigo-500 to-blue-600',
    border: 'border-indigo-500/20',
    hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
    text: 'text-indigo-400'
  },
  reddit: {
    bg: 'from-orange-500 to-red-500',
    border: 'border-orange-500/20',
    hover: 'hover:border-orange-500/40 hover:shadow-orange-500/10',
    text: 'text-orange-400'
  },
  threads: {
    bg: 'from-neutral-800 to-neutral-700',
    border: 'border-neutral-600/20',
    hover: 'hover:border-neutral-600/40 hover:shadow-neutral-600/10',
    text: 'text-neutral-400'
  },
  youtube: {
    bg: 'from-red-600 to-rose-600',
    border: 'border-red-500/20',
    hover: 'hover:border-red-500/40 hover:shadow-red-500/10',
    text: 'text-red-400'
  }
};

export default function SocialCard({ platform, label, handle, href, icon }: SocialCardProps) {
  // ✅ Ajout d'un fallback de sécurité
  const styles = platformStyles[platform];

  // 🔒 Si la plateforme n'est pas trouvée, on log l'erreur et on utilise un fallback
  if (!styles) {
    console.error(`❌ Platform "${platform}" not found in platformStyles`);
    return null; // ou un fallback visuel
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block bg-gradient-to-br from-${styles.bg.split(' ')[0].replace('from-', '')}/30 to-${styles.bg.split(' ')[1].replace('to-', '')}/20 ${styles.border} rounded-2xl p-5 cursor-pointer transition-all duration-300 ${styles.hover}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <ExternalLink className={`w-4 h-4 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <h3 className="font-bold text-white mb-1 flex items-center gap-1.5">
          {label}
          <ArrowUpRight className={`w-3 h-3 ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </h3>
        <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-1">
          {handle}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/70`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text', 'bg')}/50`}></div>
        </div>
      </a>
    </motion.div>
  );
}