import { notFound } from 'next/navigation';
import { createServerClient } from '@/src/lib/supabase-shim';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Heart, ShoppingCart, MapPin, Store } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import Link from 'next/link';
import ProductActions from '../../../../components/product/ProductActions';

export default async function ProductPublicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) {
    return notFound();
  }

  const supabase = createServerClient();

  // 🔑 Récupère le produit + entreprise (sans username)
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      companies!inner(name, address, owner_id)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    console.error('❌ Produit introuvable:', slug);
    return notFound();
  }

  // 🔑 Récupère le username du propriétaire depuis profiles
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', product.companies.owner_id)
    .single();

  const companyUsername = ownerProfile?.username || 'entreprise';
  const company = product.companies; // ⚠️ Pas un tableau !

  // 🔹 Traductions
  const t = (key: string) => {
    const translations: Record<string, any> = {
      fr: {
        price: 'Prix',
        stock: 'En stock',
        out_of_stock: 'Rupture de stock',
        description: 'Description',
        seller: 'Vendu par',
        location: 'Localisation',
        add_to_cart: 'Ajouter au panier',
        like: 'Aimer',
      },
      en: {
        price: 'Price',
        stock: 'In stock',
        out_of_stock: 'Out of stock',
        description: 'Description',
        seller: 'Sold by',
        location: 'Location',
        add_to_cart: 'Add to cart',
        like: 'Like',
      },
      ln: {
        price: 'Prix',
        stock: 'Na stock',
        out_of_stock: 'Eza na ntina',
        description: 'Description',
        seller: 'Bataki na',
        location: 'Localisation',
        add_to_cart: 'Kosalela na chariot',
        like: 'Kondima',
      },
    };
    return translations[locale]?.[key] || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 🔙 Retour */}
        <Button variant="ghost" asChild className="mb-6 text-cyan-300 hover:text-cyan-200">
          <Link href={`/${locale}/${companyUsername}`}>
            ← {t('seller')} {company.name}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 🖼️ Galerie d'images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-2xl border border-white/10"
              />
            ) : (
              <div className="w-full h-96 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500">
                Pas d'image
              </div>
            )}
          </div>

          {/* 📄 Infos produit */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-emerald-500/20 text-emerald-300">
                {product.category?.name || 'Produit'}
              </Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-400 mt-2">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-emerald-400">
                ${product.promo_price ? product.promo_price : product.price}
              </span>
              {product.promo_price && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {product.stock_quantity > 0 ? (
                <span className="flex items-center gap-1 text-green-400">
                  <MapPin className="w-4 h-4" />
                  {t('stock')}: {product.stock_quantity}
                </span>
              ) : (
                <span className="text-red-400">{t('out_of_stock')}</span>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Store className="w-5 h-5" />
                {t('seller')}
              </h2>
              <p className="text-cyan-300">{company.name}</p>
              {company.address && (
                <p className="text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {company.address}
                </p>
              )}
            </div>
            <ProductActions productId={product.id} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}