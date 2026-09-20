"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import Link from "next/link";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items } = useCart();

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-soft-lg flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-lavender-light">
              <div className="flex items-center gap-2 text-purple">
                <ShoppingBag size={18} strokeWidth={1.5} />
                <h2 className="font-heading text-lg font-semibold">
                  Your Cart
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-ink rounded-md transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                  <ShoppingBag size={40} className="text-lavender" strokeWidth={1} />
                  <div>
                    <p className="font-heading text-ink text-xl font-medium">
                      Your cart is empty
                    </p>
                    <p className="font-body text-muted text-sm mt-1">
                      Add some products to get started.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-2 inline-flex items-center bg-purple text-white font-body text-sm font-medium px-6 py-2.5 rounded-full hover:bg-purple-light transition-colors"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 pb-6 pt-2">
                <CartSummary />
                <button
                  onClick={onClose}
                  className="w-full text-center font-body text-sm text-muted hover:text-ink transition-colors mt-3 py-2"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
