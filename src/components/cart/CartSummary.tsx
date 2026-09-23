"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { calculateCartTotal, buildOrderMessage, openWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/lib/supabase";
import { MessageCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function CartSummary() {
  const { items } = useCart();
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = calculateCartTotal(items);
  const allHavePrices = items.every((i) => i.product.price !== null && i.product.price !== undefined);

  async function handleOrder() {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      // Create order record in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: "Customer (WhatsApp)",
          customer_phone: "WhatsApp Contact",
          total_amount: total || 0,
          status: "pending",
        })
        .select("id")
        .single();

      if (!orderError && orderData?.id) {
        // Insert order items preserving historic product name and unit price
        const orderItemsPayload = items.map((item) => ({
          order_id: orderData.id,
          product_id: typeof item.product.id === "string" && item.product.id.includes("-") ? item.product.id : null,
          product_name: item.product.name,
          unit_price: item.product.price || 0,
          quantity: item.quantity,
        }));

        await supabase.from("order_items").insert(orderItemsPayload);
      }
    } catch (err) {
      console.error("Order database insert error:", err);
    } finally {
      setIsSubmitting(false);
    }

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
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-body font-semibold py-3.5 rounded-full hover:bg-[#1fbc5a] active:scale-[0.98] transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <MessageCircle size={18} />
            <span>Order via WhatsApp</span>
          </>
        )}
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
