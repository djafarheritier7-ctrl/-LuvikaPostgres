// src/app/[locale]/[username]/layout.tsx
'use client';

import Link from "next/link";
import { Toaster } from "sonner";
import { NetworkWatcher } from "../../../components/system/NetworkWatcher";
import { 
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
//import Footer from '../../../components/layout/Footer'; // ✅ Footer fusionné SANS props
import { useState, useEffect } from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });


    return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/15 via-blue-900/10 to-indigo-900/5 animate-gradient-shift" />
        
        {/* ✅ Particules affichées uniquement côté client */}
        {isMounted && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() > 0.5 ? 30 : -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* 🔹 Scroll to top button (visible on scroll) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 border border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Retour en haut"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <main className="w-full flex-1 relative z-10">
        {children}
        <Toaster richColors position="top-right" />
        <NetworkWatcher />
      </main>

      {/* ✅ FOOTER APPELÉ SANS PROPS (utilise useTranslations en interne) */}
      {/* <Footer /> */}
      
      {/* 🔹 Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 30s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>
    </div>
  );
}