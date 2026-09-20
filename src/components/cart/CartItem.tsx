"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const lineTotal =
    product.price !== null ? product.price * quantity : null;

  return (
    <div className="flex gap-3 py-4 border-b border-lavender-light last:border-0">
      {/* Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-lavender-light">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-body text-sm font-medium text-ink leading-snug">
            {product.name}
          </p>
          <button
            onClick={() => removeFromCart(product.id)}
            className="shrink-0 text-muted hover:text-red-500 transition-colors p-0.5"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Price / total */}
        {lineTotal !== null ? (
          <p className="font-body text-xs text-muted mt-0.5">
            GH₵{product.price!.toFixed(2)} × {quantity} ={" "}
            <span className="text-purple font-medium">
              GH₵{lineTotal.toFixed(2)}
            </span>
          </p>
        ) : (
          <p className="font-body text-xs text-muted mt-0.5">
            Price confirmed on WhatsApp
          </p>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            disabled={quantity <= 1}
            className="w-7 h-7 rounded-full border border-lavender flex items-center justify-center text-purple hover:bg-lavender-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span className="font-body text-sm font-medium text-ink min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-7 h-7 rounded-full border border-lavender flex items-center justify-center text-purple hover:bg-lavender-light transition-all duration-150"
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
