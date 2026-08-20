#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Nouveau composant DownloadContent avec design glassmorphism
const downloadContent = `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Download, Smartphone, Globe, ShieldCheck, Star, Zap } from 'lucide-react';

export default function DownloadContent({
  title,
  subtitle,
  step1_title,
  step1_desc,
  step2_title,
  step2_desc,
  step3_title,
  step3_desc,
  cta_title,
  cta_desc,
  download_now,
}: {
  title: string;
  subtitle: string;
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  cta_title: string;
  cta_desc: string;
  download_now: string;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✨ Fond animé avec effets de particules */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: \`\${Math.random() * 100}%\`,
                top: \`\${Math.random() * 100}%\`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Lueurs de fond */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
        
        {/* ✨ En-tête principal */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="glass-border rounded-3xl p-8 md:p-12 mb-8 backdrop-blur-xl border border-white/20"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4">
            {title}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* 📱 Section téléchargement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20 mb-12"
        >
          {/* 🎨 Mockup téléphone stylisé */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, rotateY: -15 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
              className="relative"
            >
              {/* Cadre téléphone */}
              <div className="w-64 h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[28px] border-4 border-gray-700 relative overflow-hidden shadow-2xl">
                {/* Écran */}
                <div className="absolute inset-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[20px] p-4">
                  {/* Interface stylisée */}
                  <div className="flex flex-col h-full">
                    {/* Barre de statut */}
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Contenu écran */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-semibold mb-1">Luvika</h3>
                        <p className="text-gray-300 text-sm">Téléchargement en cours</p>
                      </div>
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          animate={{ width: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflets */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-[24px]"></div>
              </div>
            </motion.div>
          </div>

          {/* 🎯 Call-to-action principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {cta_title}
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              {cta_desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    {download_now}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                </motion.button>
              </Link>

              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-gray-200 font-semibold rounded-xl transition-all duration-300 hover:bg-white/20 hover:border-cyan-400/30"
                >
                  Voir les offres
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* 📋 Étapes du processus */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Comment ça marche ?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: step1_title,
                desc: step1_desc,
                icon: <Smartphone className="w-8 h-8" />,
                color: "from-cyan-500 to-blue-500",
              },
              {
                step: "2",
                title: step2_title,
                desc: step2_desc,
                icon: <Globe className="w-8 h-8" />,
                color: "from-blue-500 to-indigo-500",
              },
              {
                step: "3",
                title: step3_title,
                desc: step3_desc,
                icon: <ShieldCheck className="w-8 h-8" />,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.2, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur rounded-xl transition-all duration-300"
                  style={{ background: \`linear-gradient(135deg, \${item.color})\` }}
                ></div>
                
                <div className="relative glass-border rounded-xl p-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r shadow-lg flex items-center justify-center"
                      style={{ background: \`linear-gradient(135deg, \${item.color})\` }}
                    >
                      {item.icon}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: \`linear-gradient(135deg, \${item.color})\` }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🌟 Section avantages premium */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="mt-12 glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl mb-6"
            >
              <Star className="w-8 h-8" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.8 }}
              className="text-2xl md:text-3xl font-bold text-white mb-4"
            >
              Pourquoi choisir Luvika ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="text-gray-200 text-lg leading-relaxed mb-8"
            >
              Une expérience utilisateur fluide, sécurisée et innovante pour votre identité numérique.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Sécurité renforcée",
                  desc: "Vos données sont protégées avec les derniers standards de cryptographie.",
                  icon: <ShieldCheck className="w-6 h-6" />,
                  color: "text-cyan-400",
                },
                {
                  title: "Technologie NFC",
                  desc: "Échangez vos coordonnées en un simple tap avec la technologie NFC.",
                  icon: <Zap className="w-6 h-6" />,
                  color: "text-blue-400",
                },
                {
                  title: "Interface intuitive",
                  desc: "Une expérience utilisateur fluide et accessible à tous.",
                  icon: <Smartphone className="w-6 h-6" />,
                  color: "text-emerald-400",
                },
                {
                  title: "Multilingue",
                  desc: "Disponible dans plusieurs langues pour une accessibilité mondiale.",
                  icon: <Globe className="w-6 h-6" />,
                  color: "text-purple-400",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.8 + i * 0.1, duration: 0.6 }}
                  className="group"
                >
                  <div className="glass-border rounded-xl p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20 hover:border-cyan-400/40 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={\`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center \${item.color}\`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}`;

// Nouveau composant ContactContent avec design glassmorphism
const contactContent = `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Star } from 'lucide-react';

export default function ContactContent({
  title,
  subtitle,
  address,
  email,
  phone,
  form_title,
  name,
  name_placeholder,
  message,
  message_placeholder,
  send,
}: {
  title: string;
  subtitle: string;
  address: string;
  email: string;
  phone: string;
  form_title: string;
  name: string;
  name_placeholder: string;
  message: string;
  message_placeholder: string;
  send: string;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✨ Fond animé avec effets de particules */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: \`\${Math.random() * 100}%\`,
                top: \`\${Math.random() * 100}%\`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Lueurs de fond */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
        
        {/* ✨ En-tête principal */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="glass-border rounded-3xl p-8 md:p-12 mb-8 backdrop-blur-xl border border-white/20"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4">
            {title}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* 📞 Informations de contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Adresse",
                content: address,
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: <Mail className="w-8 h-8" />,
                title: "Email",
                content: email,
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: <Phone className="w-8 h-8" />,
                title: "Téléphone",
                content: phone,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.2, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur rounded-xl transition-all duration-300"
                  style={{ background: \`linear-gradient(135deg, \${item.color})\` }}
                ></div>
                
                <div className="relative glass-border rounded-xl p-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r shadow-lg flex items-center justify-center"
                      style={{ background: \`linear-gradient(135deg, \${item.color})\` }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 📝 Formulaire de contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20 w-full max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl mb-6"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            {form_title}
          </h3>

          <form className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="glass-border rounded-xl p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {name}
              </label>
              <input
                type="text"
                placeholder={name_placeholder}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="glass-border rounded-xl p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {message}
              </label>
              <textarea
                placeholder={message_placeholder}
                rows={5}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none"
              ></textarea>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  {send}
                  <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* 🌟 Section avantages du contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-12 glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl mb-6"
            >
              <Star className="w-8 h-8" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.8 }}
              className="text-2xl md:text-3xl font-bold text-white mb-4"
            >
              Pourquoi nous contacter ?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.0, duration: 0.8 }}
              className="text-gray-200 text-lg leading-relaxed mb-8"
            >
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Réponse rapide",
                  desc: "Nous répondons à vos messages en moins de 24h.",
                  icon: <Globe className="w-6 h-6" />,
                  color: "text-cyan-400",
                },
                {
                  title: "Support technique",
                  desc: "Une assistance technique experte à votre service.",
                  icon: <MessageSquare className="w-6 h-6" />,
                  color: "text-blue-400",
                },
                {
                  title: "Conseils personnalisés",
                  desc: "Des conseils adaptés à vos besoins spécifiques.",
                  icon: <Star className="w-6 h-6" />,
                  color: "text-emerald-400",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2 + i * 0.1, duration: 0.6 }}
                  className="group"
                >
                  <div className="glass-border rounded-xl p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/20 hover:border-cyan-400/40 transition-all duration-300">
                    <div className="flex flex-col items-center text-center space-y-4">
<div class="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center ${color}">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}`;

// Nouveau composant PricingPlans avec design glassmorphism
const pricingPlans = `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Star, Zap, Crown, Users, ShieldCheck, BarChart3, Download, Globe } from 'lucide-react';

interface Plan {
  key: 'freemium' | 'premium' | 'entreprise';
  title: string;
  desc: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
  price: { mensuel: number; annuel: number };
}

interface PricingPlansProps {
  title: string;
  billingMonthly: string;
  billingYearly: string;
  perMonth: string;
  perYear: string;
  ctaChoose: {
    freemium: string;
    premium: string;
    entreprise: string;
  };
  customPlan: string;
  contactUs: string;
  plans: Plan[];
}

export default function PricingPlans({
  title,
  billingMonthly,
  billingYearly,
  perMonth,
  perYear,
  ctaChoose,
  customPlan,
  contactUs,
  plans,
}: PricingPlansProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✨ Fond animé avec effets de particules */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: \`\${Math.random() * 100}%\`,
                top: \`\${Math.random() * 100}%\`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Lueurs de fond */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
        
        {/* ✨ En-tête principal */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="glass-border rounded-3xl p-8 md:p-12 mb-8 backdrop-blur-xl border border-white/20"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4">
            {title}
          </h1>
        </motion.div>

        {/* 🎯 Options de facturation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="glass-border rounded-2xl p-6 backdrop-blur-xl border border-white/20 mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-gray-300 font-medium">{billingMonthly}</span>
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <button className="relative px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full shadow-lg">
                {billingYearly}
              </button>
            </div>
            <span className="text-gray-300 text-sm">-20% {perYear}</span>
          </div>
        </motion.div>

        {/* 📦 Plans */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.2, duration: 0.6 }}
              className={\`group relative \${plan.highlight ? 'md:-mt-6 md:mb-6' : ''}\`}
            >
              {/* Highlight border */}
              {plan.highlight && (
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-all duration-500"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <div className={\`relative glass-border rounded-2xl p-8 backdrop-blur-xl border border-white/20 \${plan.highlight ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-gradient-to-br from-white/5 to-white/10'} hover:border-cyan-400/40 transition-all duration-300\`}>
                
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.2, duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30 mb-4"
                  >
                    <Star className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-medium text-sm">{plan.badge}</span>
                  </motion.div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                    {plan.key === 'freemium' && <Users className="w-8 h-8 text-white" />}
                    {plan.key === 'premium' && <Zap className="w-8 h-8 text-white" />}
                    {plan.key === 'entreprise' && <Crown className="w-8 h-8 text-white" />}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-white mb-2 text-center">{plan.title}</h3>
                <p className="text-gray-300 text-center mb-8">{plan.desc}</p>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-white">
                    {plan.price.mensuel === 0 ? 'Gratuit' : \`€\${plan.price.mensuel}\`}
                    {plan.price.mensuel > 0 && <span className="text-gray-400 text-lg ml-2">/mois</span>}
                  </div>
                  {plan.price.annuel > 0 && (
                    <div className="text-gray-400 text-sm mt-2">
                      ou €{plan.price.annuel}/an (économie de 20%)
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + i * 0.2 + j * 0.1, duration: 0.4 }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={\`w-full py-3 px-6 font-semibold rounded-xl shadow-lg transition-all duration-300 \${plan.highlight 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20'
                  }\`}
                >
                  {ctaChoose[plan.key]}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 🌟 Section plan sur mesure */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="mt-12 glass-border rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl mb-6"
          >
            <Crown className="w-8 h-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.8 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            {customPlan}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8 }}
            className="text-gray-200 text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Besoin d'une solution sur mesure pour votre entreprise ? Contactez-nous pour discuter de vos besoins spécifiques.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.8 }}
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  {contactUs}
                  <Globe className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}`;

// Fonction pour écrire un fichier
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fichier ${filePath} créé avec succès`);
  } catch (error) {
    console.error(`✗ Erreur lors de la création de ${filePath}:`, error.message);
  }
}

// Créer les fichiers
console.log('Création des nouveaux composants avec design glassmorphism...\n');

writeFile(path.join(__dirname, '../src/components/download/DownloadContent.tsx'), downloadContent);
writeFile(path.join(__dirname, '../src/components/contact/ContactContent.tsx'), contactContent);
writeFile(path.join(__dirname, '../src/components/pricing/PricingPlans.tsx'), pricingPlans);

console.log('\nCréation terminée !');