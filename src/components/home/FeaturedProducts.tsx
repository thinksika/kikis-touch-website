import Link from "next/link";
import { products } from "@/data/products";
import ProductGrid from "@/components/shop/ProductGrid";
import { ArrowRight } from "lucide-react";

const featuredProducts = products.filter((p) => p.featured);

export default function FeaturedProducts() {
  return (
    <section className="section-padding bg-lavender-light/40" id="featured-products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-14">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
              Shop
            </p>
            <h2 className="font-heading text-purple text-4xl sm:text-5xl font-light leading-tight">
              Hair &amp; Beauty Products
            </h2>
            <p className="font-body text-muted text-base mt-3 max-w-sm">
              Quality products for beautiful hair.
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 font-body text-sm text-purple hover:text-plum transition-colors shrink-0 group"
            aria-label="View all products in the shop"
          >
            View Shop
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </div>
    </section>
  );
}
