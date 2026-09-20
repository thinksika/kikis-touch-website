import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo/kikis-touch-logo.png"
                  alt="Kiki's Touch Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="block font-heading text-cream font-semibold text-xl leading-none">
                  Kiki&apos;s Touch
                </span>
                <span className="block font-body text-lavender text-xs tracking-[0.15em] uppercase mt-0.5">
                  Beauty Salon
                </span>
              </div>
            </div>
            <p className="font-body text-lavender text-sm leading-relaxed max-w-xs">
              Beautiful braids, professional beauty services and quality hair
              products. Serving Sowutoum, Ghana.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-gold text-lg font-medium mb-5 tracking-wide">
              Contact
            </h3>
            <address className="not-italic space-y-2.5 font-body text-sm text-lavender">
              <p>
                <a
                  href="tel:+233543603627"
                  className="hover:text-gold transition-colors"
                >
                  054 360 3627
                </a>
              </p>
              <p>
                <a
                  href="mailto:Sarpongkesh@gmail.com"
                  className="hover:text-gold transition-colors"
                >
                  Sarpongkesh@gmail.com
                </a>
              </p>
              <p>Sowutoum, Ghana</p>
              <div className="pt-1">
                <p>Mon – Sat: 9:00 AM – 8:00 PM</p>
                <p>Sunday: Closed</p>
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
            © {year} Kiki&apos;s Touch Beauty Salon. All rights reserved.
          </p>
          <p className="font-heading text-gold/40 text-xs italic">
            Beauty Beyond Limits ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
