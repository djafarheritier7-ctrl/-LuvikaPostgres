// src/components/profile/ContactForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Mail, Phone, User } from 'lucide-react';

export default function ContactForm({ profileId }: { profileId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, name, email, phone, message }),
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Échec');
      }
    } catch (err: any) {
      setError(err.message || 'Impossible d’envoyer. Réessayez plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm"
        >
          ✅ Message envoyé ! Le propriétaire vous contactera sous 48h.
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-200 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-gray-300 text-sm flex items-center gap-2">
            <User className="w-4 h-4" /> Nom *
          </label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            placeholder="Votre nom"
          />
        </div>

        <div className="space-y-2">
          <label className="text-gray-300 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email *
          </label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            placeholder="votre@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm flex items-center gap-2">
          <Phone className="w-4 h-4" /> Téléphone (optionnel)
        </label>
        <Input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          placeholder="+243 ..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-gray-300 text-sm">Message *</label>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={4}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
          placeholder="Bonjour, je vous contacte car..."
        />
      </div>

 

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3"
      >
        {isSubmitting ? 'Envoi...' : '📤 Envoyer mon contact'}
      </Button>
    </form>
  );
}