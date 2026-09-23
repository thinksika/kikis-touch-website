"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import MobileMenu from "./MobileMenu";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { settings } = useBusinessSettings();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-soft"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${settings.business_name} — Home`}>
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <Image
                  src={settings.logo_url || "/images/logo/kikis-touch-logo.png"}
                  alt={settings.business_name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="block font-heading text-purple font-semibold text-lg lg:text-xl leading-none">
                  {settings.business_name.split(" Beauty")[0] || "Kiki's Touch"}
                </span>
                <span className="block font-body text-muted text-[10px] lg:text-xs tracking-[0.15em] uppercase">
                  Beauty Salon
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-body text-sm tracking-wide transition-colors duration-200 ${
                    pathname === href
                      ? "text-purple font-medium"
                      : "text-muted hover:text-purple"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <CartButton onClick={() => setCartOpen(true)} />

              <Link
                href="/book"
                className="hidden lg:inline-flex items-center gap-2 bg-purple text-white text-sm font-body font-medium px-5 py-2.5 rounded-full hover:bg-purple-light transition-colors duration-200"
                aria-label="Book an appointment"
              >
                Book Now
              </Link>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-purple rounded-md hover:bg-lavender-light transition-colors"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} pathname={pathname} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
