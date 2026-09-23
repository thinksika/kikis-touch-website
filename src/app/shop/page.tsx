'use client';

import { useEffect, useState } from 'react';
import { getProductsFromSupabase } from '@/lib/supabase-data';
import { products as staticProducts } from '@/data/products';
import { Product } from '@/types';
import ProductGrid from '@/components/shop/ProductGrid';
import { RefreshCw } from 'lucide-react';

export default function ShopPage() {
  const [productsList, setProductsList] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getProductsFromSupabase();
      setProductsList(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="pt-24 lg:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
            Hair &amp; Beauty
          </p>
          <h1 className="font-heading text-purple text-5xl sm:text-6xl font-light leading-tight">
            Shop
          </h1>
          <p className="font-body text-muted text-base sm:text-lg mt-4 max-w-sm mx-auto">
            Quality products for beautiful hair.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : (
          <ProductGrid products={productsList} />
        )}
      </div>
    </div>
  );
}
