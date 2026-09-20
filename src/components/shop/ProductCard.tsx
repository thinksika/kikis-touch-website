"use client";

import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-lavender-light">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-heading text-purple text-lg sm:text-xl font-semibold leading-snug mb-1">
          {product.name}
        </h3>
        <p className="font-body text-muted text-xs sm:text-sm leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="mt-3 mb-4">
          {product.price !== null ? (
            <p className="font-heading text-purple text-xl font-semibold">
              GH₵{product.price.toFixed(2)}
            </p>
          ) : (
            <p className="font-body text-xs text-muted italic">
              Price available on WhatsApp
            </p>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-2 font-body text-sm font-medium py-2.5 px-4 rounded-full transition-all duration-200 active:scale-[0.98] ${
            added
              ? "bg-green-500 text-white"
              : "bg-purple text-white hover:bg-purple-light"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <>
              <Check size={16} />
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
