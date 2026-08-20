// src/components/ui/BadgeLevel.tsx
'use client';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal } from 'lucide-react';

const LevelIcon = ({ level }: { level: 'bronze' | 'silver' | 'gold' }) => {
  const icons = {
    bronze: <Trophy className="w-4 h-4 text-amber-500" />,
    silver: <Award className="w-4 h-4 text-gray-400" />,
    gold: <Medal className="w-4 h-4 text-yellow-400" />,
  };
  return icons[level];
};

// ✅ Seulement le composant exporté
export default function BadgeLevel({ info }: { info: any }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="group relative"
    >
      <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${info.color} flex items-center gap-1.5 text-white text-xs font-medium border border-white/20`}>
        <LevelIcon level={info.level} />
        <span>{info.label}</span>
        <motion.span
          animate={{ rotate: 15 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
          className="ml-0.5"
        >
          🏆
        </motion.span>
      </div>

      {info.scansNeeded > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block"
        >
          <div className="bg-black/80 backdrop-blur border border-white/10 text-gray-200 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
            {info.scansNeeded} scan{info.scansNeeded > 1 ? 's' : ''} pour {info.level === 'bronze' ? 'Argent' : 'Or'}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
        </motion.div>
      )}
    </motion.div>
  );
}