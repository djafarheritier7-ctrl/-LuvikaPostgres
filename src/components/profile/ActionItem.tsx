// src/components/profile/ActionItem.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  gradient?: string;
  className?: string;
}

export default function ActionItem({
  icon,
  label,
  value,
  href,
  gradient,
  className = '',
}: ActionItemProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <a
        href={href}
        className={`block rounded-xl p-4 transition-all duration-300 ${className}`}
        target={href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') ? '_blank' : '_self'}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        aria-label={`${label}: ${value}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              {/* 🔑 CORRECTION CRITIQUE : Labels cachés sur mobile */}
              <span className="font-medium text-white text-sm hidden sm:block">
                {label}
              </span>
              <ArrowUpRight 
                className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate">{value}</p>
          </div>
        </div>
      </a>
    </motion.div>
  );
}