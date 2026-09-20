"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { WHATSAPP_BASE } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 lg:pt-20 overflow-hidden bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 lg:py-0 min-h-[calc(100svh-5rem)]">

          {/* Text side */}
          <motion.div
            className="order-2 lg:order-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Eyebrow */}
            <motion.p
              className="font-body text-xs sm:text-sm tracking-[0.2em] uppercase text-gold mb-4 lg:mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Sowutoum, Ghana
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="font-heading text-purple text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              Kiki&apos;s Touch
              <br />
              <span className="text-plum italic">Beauty Salon</span>
            </motion.h1>

            {/* Body text */}
            <motion.p
              className="font-body text-muted text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Beautiful braids, professional beauty services and quality hair
              products.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Hello Kiki's Touch Beauty Salon, I'd like to book an appointment.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-purple text-white font-body font-medium px-7 py-4 rounded-full hover:bg-purple-light active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
              >
                <MessageCircle size={18} />
                Book via WhatsApp
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-purple text-purple font-body font-medium px-7 py-4 rounded-full hover:bg-lavender-light active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
              >
                Shop Products
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Deposit note */}
            <motion.p
              className="font-body text-xs text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              GH₵50 deposit required to secure your appointment.
            </motion.p>
          </motion.div>

          {/* Image side */}
          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="relative w-full aspect-[4/5] max-h-[85vh] rounded-3xl overflow-hidden shadow-soft-lg">
              <Image
                src="/images/hero/hero-main.jpg"
                alt="Beautiful woman with knotless braids at Kiki's Touch Beauty Salon"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle gold overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-4 -left-4 lg:left-auto lg:-right-4 bg-white rounded-2xl shadow-soft px-5 py-3.5 border border-lavender-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="font-heading text-purple font-semibold text-lg leading-none">
                Mon – Sat
              </p>
              <p className="font-body text-muted text-xs mt-0.5">
                9:00 AM – 8:00 PM
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
