"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculateCartTotal, buildOrderMessage, openWhatsApp } from "@/lib/whatsapp";
import { MessageCircle, CheckCircle } from "lucide-react";

export default function CartSummary() {
  const { items } = useCart();
  const [sent, setSent] = useState(false);

  const total = calculateCartTotal(items);
  const allHavePrices = items.every((i) => i.product.price !== null);

  function handleOrder() {
    const message = buildOrderMessage(items);
    openWhatsApp(message);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <div className="border-t border-lavender-light pt-4 mt-2">
      {/* Subtotal or price note */}
      {allHavePrices && total !== null ? (
        <div className="flex justify-between items-center mb-4">
          <span className="font-body text-sm text-ink font-medium">Subtotal</span>
          <span className="font-heading text-purple text-lg font-semibold">
            GH₵{total.toFixed(2)}
          </span>
        </div>
      ) : (
        <div className="bg-lavender-light rounded-xl p-3 mb-4">
          <p className="font-body text-xs text-muted text-center leading-relaxed">
            Prices will be confirmed on WhatsApp.
            <br />
            You can still place your order.
          </p>
        </div>
      )}

      {/* WhatsApp order button */}
      <button
        onClick={handleOrder}
        className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-body font-semibold py-3.5 rounded-full hover:bg-[#1fbc5a] active:scale-[0.98] transition-all duration-200"
      >
        <MessageCircle size={18} />
        Order via WhatsApp
      </button>

      {/* Confirmation state */}
      {sent && (
        <div className="flex items-center justify-center gap-2 mt-3 text-[#1fbc5a]">
          <CheckCircle size={14} />
          <p className="font-body text-xs">
            Your order summary is ready in WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
