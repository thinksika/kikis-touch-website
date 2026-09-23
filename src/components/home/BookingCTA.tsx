"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import { formatWhatsAppLink } from "@/lib/whatsapp";

export default function BookingCTA() {
  const { settings } = useBusinessSettings();
  const whatsappUrl = formatWhatsAppLink(settings.whatsapp_number);

  return (
    <section className="section-padding bg-purple" id="book-cta">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-gold/80 mb-4">
          Ready to Book?
        </p>
        <h2 className="font-heading text-cream text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-5">
          Book Your Appointment
        </h2>
        <p className="font-body text-lavender text-base sm:text-lg leading-relaxed mb-2">
          Fill in our simple booking form and we&apos;ll confirm via WhatsApp.
        </p>
        <p className="font-body text-lavender/70 text-sm mb-10">
          {settings.currency}{settings.booking_deposit_amount} deposit required to secure your slot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 bg-gold text-ink font-body font-semibold px-8 py-4 rounded-full hover:bg-gold-light active:scale-[0.98] transition-all duration-200"
          >
            Book Appointment
          </Link>
          <a
            href={`${whatsappUrl}?text=${encodeURIComponent(`Hello ${settings.business_name}, I'd like to book an appointment.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-cream/30 text-cream font-body font-medium px-8 py-4 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
          >
            <MessageCircle size={18} />
            Message Us
          </a>
        </div>
      </div>
    </section>
  );
}
