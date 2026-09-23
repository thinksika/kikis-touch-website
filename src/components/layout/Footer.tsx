"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import { MapPin, ExternalLink } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const { settings, hours } = useBusinessSettings();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Format hours summary string
  const openDays = hours.filter((h) => h.is_open);
  const sunday = hours.find((h) => h.id === 0 || h.day_name === "Sunday");

  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12">
                <Image
                  src={settings.logo_url || "/images/logo/kikis-touch-logo.png"}
                  alt={settings.business_name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="block font-heading text-cream font-semibold text-xl leading-none">
                  {settings.business_name.split(" Beauty")[0] || "Kiki's Touch"}
                </span>
                <span className="block font-body text-lavender text-xs tracking-[0.15em] uppercase mt-0.5">
                  Beauty Salon
                </span>
              </div>
            </div>
            <p className="font-body text-lavender text-sm leading-relaxed max-w-xs">
              {settings.hero_subtitle || "Beautiful braids, professional beauty services and quality hair products."} Serving {settings.location_address}.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-gold text-lg font-medium mb-5 tracking-wide">
              Contact &amp; Location
            </h3>
            <address className="not-italic space-y-2.5 font-body text-sm text-lavender">
              <p>
                <a
                  href={`tel:${settings.phone_number.replace(/\s+/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {settings.phone_number}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${settings.email_address}`}
                  className="hover:text-gold transition-colors"
                >
                  {settings.email_address}
                </a>
              </p>
              <p>
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <MapPin size={14} className="text-gold" />
                  <span>{settings.location_address}</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              </p>
              <div className="pt-2">
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline font-semibold"
                >
                  Get Directions on Google Maps ↗
                </a>
              </div>
              <div className="pt-2 text-xs text-lavender/80">
                {openDays.length > 0 ? (
                  <p>Mon – Sat: {openDays[0]?.open_time?.slice(0, 5)} – {openDays[0]?.close_time?.slice(0, 5)}</p>
                ) : (
                  <p>Mon – Sat: 9:00 AM – 8:00 PM</p>
                )}
                <p>Sunday: {sunday?.is_open ? `${sunday.open_time?.slice(0, 5)} – ${sunday.close_time?.slice(0, 5)}` : "Closed"}</p>
              </div>
            </address>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-gold text-lg font-medium mb-5 tracking-wide">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {footerLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-body text-sm text-lavender hover:text-gold transition-colors duration-200 w-fit"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-lavender/60 text-center sm:text-left">
            © {year} {settings.business_name}. All rights reserved.
          </p>
          <p className="font-heading text-gold/40 text-xs italic">
            Beauty Beyond Limits ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
