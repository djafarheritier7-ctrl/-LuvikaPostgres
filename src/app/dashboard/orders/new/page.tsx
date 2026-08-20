// src/app/dashboard/orders/new/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Save, Package as PackageIcon, QrCode, MapPin, Sparkle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { Badge } from '../../../../../components/ui/badge';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewOrderPage() {
  const t = useTranslations('dashboard.orders');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    product_type: 'nfc_premium',
    shipping_address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        router.push('/dashboard/orders?success=1');
      } else {
        alert(`❌ ${result.error || 'Échec'}`);
      }
    } catch (err) {
      alert('❌ Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Prix par produit
  const productPrices = {
    nfc_premium: 15000,
    nfc_enterprise: 50000,
  };

  // 🔹 Calcul du total
  const totalPrice = formData.quantity * productPrices[formData.product_type as keyof typeof productPrices];

  return (
    <div className="min-h-screen bg-gradient-to-br  to-indigo-900/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 🔹 Header avec retour */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-cyan-300/80">
            <Sparkle className="w-3 h-3 animate-pulse" />
            <span>Commande sécurisée • Paiement à la livraison</span>
          </div>
        </div>

        {/* 🔹 Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 mb-3">
            Nouvelle commande NFC
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Sélectionnez votre produit, indiquez la quantité et votre adresse de livraison. 
            Votre commande sera traitée sous 24h.
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/25">
              <PackageIcon className="w-3 h-3 mr-1" />
              Livraison express
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
              <MapPin className="w-3 h-3 mr-1" />
              Kinshasa uniquement
            </Badge>
            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25">
              <QrCode className="w-3 h-3 mr-1" />
              QR personnalisé inclus
            </Badge>
          </div>
        </motion.div>

        {/* 🔹 Formulaire transparent glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-border bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* 🔹 Bandeau supérieur décoratif */}
            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
            
            <CardHeader className="border-b border-white/10 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-white" />
                </div>
                Détails de la commande
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* 🔹 Section Produit - Transparent */}
                <div className="space-y-3">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-violet-400" />
                    Sélectionnez votre produit
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        id: 'nfc_premium', 
                        title: 'Carte NFC Premium', 
                        desc: '1 carte avec QR personnalisé', 
                        price: '15 000 FC', 
                        icon: QrCode,
                        color: 'from-violet-500 to-fuchsia-500'
                      },
                      { 
                        id: 'nfc_enterprise', 
                        title: 'Pack NFC Entreprise', 
                        desc: '5 cartes + gestion centralisée', 
                        price: '50 000 FC', 
                        icon: PackageIcon,
                        color: 'from-emerald-500 to-teal-500'
                      }
                    ].map((product) => {
                      const Icon = product.icon;
                      const isSelected = formData.product_type === product.id;
                      
                      return (
                        <motion.button
                          key={product.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, product_type: product.id })}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? `border-${product.color.split(' ')[1].replace('/', '')}/40 bg-${product.color.split(' ')[0]}/10`
                              : 'border-white/10 bg-white/3 hover:bg-white/5'
                          }`}
                        >
                          {/* Décoration intérieure */}
                          <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${product.color} opacity-0 ${isSelected ? 'opacity-20' : 'group-hover:opacity-10'} blur transition-opacity`}></div>
                          
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${product.color} flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-white">{product.title}</h3>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300">{product.desc}</p>
                              </div>
                            </div>
                            
                            <Badge className={`px-3 py-1 text-sm font-bold ${
                              product.id === 'nfc_premium' 
                                ? 'bg-violet-500/20 text-violet-200 border-violet-500/30' 
                                : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                            }`}>
                              {product.price}
                            </Badge>
                          </div>
                          
                          {/* Checkmark overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 🔹 Section Quantité - Transparent */}
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Quantité
                  </Label>
                  
                  <div className="flex items-center gap-4 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-colors"
                    >
                      -
                    </button>
                    
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-20 text-center bg-white/5 border-white/15 text-white font-bold py-2"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quantity: Math.min(10, prev.quantity + 1) }))}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-sm text-cyan-300/80 flex items-center gap-1.5">
                    <Sparkle className="w-3 h-3" />
                    <span>Maximum 10 cartes par commande</span>
                  </div>
                </div>

                {/* 🔹 Section Adresse - Transparent */}
                <div className="space-y-3">
                  <Label htmlFor="shipping_address" className="text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Adresse de livraison
                  </Label>
                  
                  <Textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="ex: 123 Avenue Lumumba, Gombe, Kinshasa"
                    className="min-h-[120px] bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 rounded-xl"
                    required
                  />
                  
                  <div className="text-sm text-amber-300/80 bg-amber-900/20 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">Important :</span> Nous livrons uniquement à Kinshasa. 
                        Veuillez indiquer une adresse précise avec quartier et référence.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🔹 Résumé commande - Transparent */}
                <div className="glass-border bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-purple-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300">Produit sélectionné :</span>
                    <span className="font-bold text-white">
                      {formData.product_type === 'nfc_premium' ? 'Carte NFC Premium' : 'Pack NFC Entreprise'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300">Quantité :</span>
                    <span className="font-bold text-white">{formData.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">
                      Total à payer :
                    </span>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-300">
                      {totalPrice.toLocaleString('fr-FR')} FC
                    </span>
                  </div>
                </div>

                {/* 🔹 Bouton submit - Premium */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement de votre commande...
                    </>
                  ) : (
                    <>
                      <PackageIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Commander maintenant • {totalPrice.toLocaleString('fr-FR')} FC
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* 🔹 Signature */}
        <div className="mt-8 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkle className="w-3 h-3 text-violet-400 animate-pulse" />
          <span>Commande sécurisée • Données chiffrées • Livraison sous 24h</span>
        </div>
      </div>
      
      {/* 🔹 Styles globaux */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 200% 100%;
        }
      `}</style>
    </div>
  );
}

// 🔹 Icônes manquantes
import { ArrowRight, AlertTriangle } from 'lucide-react';