// src/components/product/ProductActions.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../src/lib/supabase/client';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Heart, ShoppingCart, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ProductActions({
  productId,
  locale,
}: {
  productId: string;
  locale: string;
}) {
  const t = useTranslations();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState<number | null>(null);
  const [company, setCompany] = useState<{ name: string; phone: string | null } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          name,
          price,
          promo_price,
          stock_quantity,
          companies!inner(name, phone)
        `)
        .eq('id', productId)
        .single();

      if (error || !product) {
        setLoading(false);
        return;
      }

      setProductName(product.name);
      setPrice(product.price);
      setPromoPrice(product.promo_price);
      setStock(product.stock_quantity);

      const comp = Array.isArray(product.companies)
        ? product.companies[0]
        : product.companies;
      setCompany(comp || null);

      if (product.stock_quantity > 0) {
        setQuantity(1);
      }
      setLoading(false);
    };
    init();
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();
      setIsFavorite(!!data);
    };
    checkFavorite();
  }, [user, productId]);

  const addToCart = async () => {
    if (stock !== null && quantity > stock) {
      toast.warning(t('ProductActions.out_of_stock_warning'), {
        description: t('ProductActions.insufficient_stock_description'),
        icon: <AlertCircle className="w-4 h-4 text-yellow-400/70" />,
      });
      return;
    }

    if (!user) {
      toast.warning(t('ProductActions.login_required'), {
        description: t('ProductActions.login_to_add_to_cart'),
      });
      return;
    }

    setLoadingCart(true);
    try {
      const { data: existing } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabase
          .from('carts')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
      }

      toast.success(t('ProductActions.added_to_cart'), {
        description: t('ProductActions.added_to_cart_description', { productName }),
        icon: <ShoppingCart className="w-4 h-4 text-emerald-400/70" />,
      });
    } catch (err) {
      console.error('Erreur panier:', err);
      toast.error(t('ProductActions.error'), {
        description: t('ProductActions.cart_error_description'),
      });
    } finally {
      setLoadingCart(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.warning(t('ProductActions.login_required'), {
        description: t('ProductActions.login_to_manage_favorites'),
      });
      return;
    }

    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Erreur favori:', err);
      toast.error(t('ProductActions.error'), {
        description: t('ProductActions.favorite_error_description'),
      });
    } finally {
      setLoadingFavorite(false);
    }
  };

  const orderViaWhatsApp = async () => {
    if (!company || !company.phone) {
      toast.warning(t('ProductActions.unavailable'), {
        description: t('ProductActions.no_whatsapp_configured'),
      });
      return;
    }

    if (stock !== null && quantity > stock) {
      toast.warning(t('ProductActions.out_of_stock_warning'), {
        description: t('ProductActions.insufficient_stock_description'),
        icon: <AlertCircle className="w-4 h-4 text-yellow-400/70" />,
      });
      return;
    }

    const cleanPhone = company.phone.replace(/\D/g, '');
    const finalPrice = promoPrice || price;
    const total = (finalPrice * quantity).toFixed(2);

    const message = encodeURIComponent(
      t('ProductActions.whatsapp_message_template', {
        companyName: company.name,
        productName,
        quantity,
        unitPrice: finalPrice,
        total,
      })
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-white/[0.03] rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-white/[0.03] rounded-xl animate-pulse" />
        </div>
        <div className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
      </div>
    );
  }

  const disabled = stock === null || company === null;
  const isVisitor = !user;
  const outOfStock = stock === 0;
  const lowStock = stock !== null && stock <= 5 && stock > 0;

  return (
    <div className="space-y-4 pt-4">
      {/* Quantité */}
      <div className="flex items-center gap-3">
        <Label htmlFor="quantity" className="text-xs text-gray-400/70 font-light whitespace-nowrap">
          {t('ProductActions.quantity_label')}
        </Label>
        <div className="relative">
          <Input
            id="quantity"
            type="number"
            min="1"
            max={stock || 99}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.max(1, Math.min(val, stock || 99)));
            }}
            className="w-16 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg px-2.5 transition-all focus:ring-1 focus:ring-cyan-500/30"
            disabled={disabled || outOfStock}
          />
          {lowStock && (
            <AlertCircle className="absolute -right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-400/60" />
          )}
        </div>
        {stock !== null && (
          <span className={`text-[11px] font-light ${
            outOfStock ? 'text-red-400/60' : lowStock ? 'text-yellow-400/60' : 'text-gray-500/60'
          }`}>
            {outOfStock 
              ? t('ProductActions.out_of_stock_status')
              : t('ProductActions.in_stock_status', { count: stock })
            }
          </span>
        )}
      </div>

      {/* Boutons principaux */}
      <div className="flex gap-2">
        <Button
          onClick={addToCart}
          disabled={isVisitor || loadingCart || disabled || outOfStock}
          className={`
            flex-1 h-9 text-xs font-light rounded-xl
            bg-gradient-to-r from-emerald-600/80 to-cyan-600/80
            hover:from-emerald-500 hover:to-cyan-500
            border border-white/[0.08]
            text-white transition-all duration-300
            ${isVisitor || outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-emerald-500/10'}
          `}
        >
          {loadingCart ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              {t('ProductActions.cart_button')}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFavorite}
          disabled={isVisitor || loadingFavorite}
          className={`
            w-9 h-9 rounded-xl border transition-all duration-200
            ${isFavorite 
              ? 'bg-red-500/[0.08] border-red-500/[0.15] text-red-400/70 hover:bg-red-500/[0.12]' 
              : 'border-white/[0.08] text-gray-400/50 hover:border-cyan-400/30 hover:text-cyan-400/70'
            }
          `}
        >
          {loadingFavorite ? (
            <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 transition-transform duration-200 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </Button>
      </div>

      {/* Bouton WhatsApp */}
      <Button
        onClick={orderViaWhatsApp}
        disabled={disabled || outOfStock}
        className={`
          w-full h-9 text-xs font-light rounded-xl
          bg-gradient-to-r from-green-600/80 to-emerald-600/80
          hover:from-green-500 hover:to-emerald-500
          border border-white/[0.08] text-white
          transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10
          ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="flex items-center justify-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          {t('ProductActions.whatsapp_button')}
        </span>
      </Button>
    </div>
  );
}