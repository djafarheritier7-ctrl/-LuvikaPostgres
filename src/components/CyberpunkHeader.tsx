'use client';

import { motion } from 'framer-motion';

interface CyberpunkHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: 'cyan' | 'purple' | 'blue' | 'green';
}

export default function CyberpunkHeader({ 
  title, 
  subtitle, 
  icon, 
  gradient = 'cyan' 
}: CyberpunkHeaderProps) {
  const gradients = {
    cyan: 'from-cyan-400 via-blue-500 to-cyan-400',
    purple: 'from-purple-400 via-pink-500 to-purple-400',
    blue: 'from-blue-400 via-cyan-500 to-blue-400',
    green: 'from-green-400 via-emerald-500 to-green-400',
  };

  return (
    <div className="relative">
      {/* 🔷 Bordure lumineuse animée */}
      <div className="absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-30 blur animate-pulse-slow" />
      
      {/* 📦 Conteneur principal */}
      <div className="relative glass-border rounded-2xl p-6 backdrop-blur-xl border-white/10">
        {/* 🎯 Ligne de scan sur le header */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{ 
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear",
            delay: 1
          }}
        />

        <div className="flex items-center gap-4">
          {icon && (
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradients[gradient]} bg-clip-text text-transparent`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
            </motion.div>
          )}
          
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r animate-gradient">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 💫 Particules dans le header */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: ['#6366f1', '#8b5cf6', '#22d3ee'][i % 3],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}