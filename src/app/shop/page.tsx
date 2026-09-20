import type { Metadata } from "next";
import { products } from "@/data/products";
import ProductGrid from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Shop Hair & Beauty Products | Kiki's Touch Beauty Salon",
  description:
    "Shop quality hair and beauty products at Kiki's Touch Beauty Salon. Edge control, shampoo & conditioner, hair growth oil, accessories and more.",
};

export default function ShopPage() {
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

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
