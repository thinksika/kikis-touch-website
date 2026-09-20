"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-purple hover:text-plum transition-colors duration-200 rounded-md"
      aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
    >
      <ShoppingBag size={22} strokeWidth={1.5} />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gold text-white text-[10px] font-bold font-body rounded-full flex items-center justify-center px-1"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
