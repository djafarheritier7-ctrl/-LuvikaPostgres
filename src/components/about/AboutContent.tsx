// src/components/about/AboutContent.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  Book, Globe, Lightbulb, AlertTriangle, RefreshCw, Wifi, 
  Users, Target, Star, Rocket, ChevronRight, 
  CheckCircle, Zap, HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AboutContent({
  title,
  subtitle,
  origin_title,
  origin_content,
  context_title,
  context_content,
  problem_title,
  problem_content,
  transformation_title,
  transformation_content,
  solution_title,
  solution_content,
  offers_title,
  offers_content,
  vision_title,
  vision_content,
  value_title,
  value_content,
  perspective_title,
  perspective_content,
}: {
  title: string;
  subtitle: string;
  origin_title: string;
  origin_content: string;
  context_title: string;
  context_content: string;
  problem_title: string;
  problem_content: string;
  transformation_title: string;
  transformation_content: string;
  solution_title: string;
  solution_content: string;
  offers_title: string;
  offers_content: string;
  vision_title: string;
  vision_content: string;
  value_title: string;
  value_content: string;
  perspective_title: string;
  perspective_content: string;
}) {
  const t = useTranslations('about_page');
  const currentYear = new Date().getFullYear();

  const sections = [
    { 
      title: origin_title, 
      content: origin_content, 
      icon: Book, 
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1 
    },
    { 
      title: context_title, 
      content: context_content, 
      icon: Lightbulb, 
      color: 'from-green-500 to-emerald-500',
      delay: 0.15 
    },
    { 
      title: problem_title, 
      content: problem_content, 
      icon: AlertTriangle, 
      color: 'from-orange-500 to-red-500',
      delay: 0.2 
    },
    { 
      title: transformation_title, 
      content: transformation_content, 
      icon: RefreshCw, 
      color: 'from-purple-500 to-pink-500',
      delay: 0.25 
    },
    { 
      title: solution_title, 
      content: solution_content, 
      icon: Wifi, 
      color: 'from-teal-500 to-emerald-500',
      delay: 0.3 
    },
    { 
      title: offers_title, 
      content: offers_content, 
      icon: Users, 
      color: 'from-indigo-500 to-blue-500',
      delay: 0.35 
    },
    { 
      title: vision_title, 
      content: vision_content, 
      icon: Target, 
      color: 'from-cyan-500 to-blue-500',
      delay: 0.4 
    },
    { 
      title: value_title, 
      content: value_content, 
      icon: Star, 
      color: 'from-yellow-500 to-orange-500',
      delay: 0.45 
    },
    { 
      title: perspective_title, 
      content: perspective_content, 
      icon: Rocket, 
      color: 'from-red-500 to-purple-500',
      delay: 0.5 
    },
  ];

  return (
    <div className="min-h-screen py-10 bg-transparent">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent mb-3">
            {title}
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: section.delay, duration: 0.5 }}
              whileHover={{ y: -2 }}
              className="group relative"
            >
              {/* Effet de survol */}
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${section.color.split(' ')[1]}40, ${section.color.split(' ')[3]}20)` 
                }}
              ></div>
              
              <div className="glass-border rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 relative overflow-hidden transition-all duration-300 group-hover:border-cyan-400/30">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r ${section.color}`}>
                    <section.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white flex-1">
                    {section.title}
                  </h2>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
                
                <motion.div
                  className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: section.delay + 0.2, duration: 0.6 }}
                >
                  <div className={`h-full bg-gradient-to-r ${section.color}`}></div>
                </motion.div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8 pt-6 border-t border-white/10 text-[11px] text-gray-500"
        >
          <p>
            {t('footer_text', { year: currentYear })}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <span>{t('made_with')}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}