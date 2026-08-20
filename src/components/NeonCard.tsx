'use client';

import { motion } from 'framer-motion';

interface NeonCardProps {
  children: React.ReactNode;
  title?: string;
  gradient?: 'cyan' | 'purple' | 'blue' | 'green';
  className?: string;
}

export default function NeonCard({ 
  children, 
  title, 
  gradient = 'cyan',
  className = '' 
}: NeonCardProps) {
  const gradients = {
    cyan: 'from-cyan-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative ${className}`}
    >
      {/* 🔳 Bordure néon animée */}
      <div className="absolute -inset-1 bg-gradient-to-r rounded-2xl opacity-20 blur animate-pulse-slow" />
      
      <div className={`relative glass-border rounded-2xl p-6 backdrop-blur-xl border-white/10`}>
        {title && (
          <div className="mb-4 pb-3 border-b border-white/10">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r animate-gradient">
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>

      {/* ✨ Lueur au hover */}
      <div className="absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 hover:opacity-5 transition-opacity duration-300" />
    </motion.div>
  );
}