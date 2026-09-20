import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { WHATSAPP_BASE } from "@/lib/whatsapp";

export default function ContactSection() {
  const whatsappUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(
    "Hello Kiki's Touch Beauty Salon!"
  )}`;

  return (
    <section className="section-padding bg-cream" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
            We&apos;re Here for You
          </p>
          <h2 className="font-heading text-purple text-4xl sm:text-5xl font-light leading-tight">
            Contact Us
          </h2>
          <p className="font-body text-muted text-base mt-3">
            Reach out anytime. We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Phone */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center">
              <Phone size={18} className="text-purple" />
            </div>
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1">
                Phone
              </p>
              <a
                href="tel:+233543603627"
                className="font-heading text-purple text-xl font-semibold hover:text-plum transition-colors"
              >
                054 360 3627
              </a>
            </div>
            <a
              href="tel:+233543603627"
              className="mt-auto inline-flex items-center justify-center gap-2 border border-purple text-purple font-body text-sm font-medium py-2.5 px-5 rounded-full hover:bg-lavender-light transition-colors"
            >
              <Phone size={14} />
              Call
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8F8EE] flex items-center justify-center">
              <MessageCircle size={18} className="text-[#25D366]" />
            </div>
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1">
                WhatsApp
              </p>
              <p className="font-heading text-purple text-xl font-semibold">
                054 360 3627
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-body text-sm font-medium py-2.5 px-5 rounded-full hover:bg-[#1fbc5a] transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center">
              <Mail size={18} className="text-purple" />
            </div>
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1">
                Email
              </p>
              <a
                href="mailto:Sarpongkesh@gmail.com"
                className="font-heading text-purple text-lg font-semibold hover:text-plum transition-colors break-all"
              >
                Sarpongkesh@gmail.com
              </a>
            </div>
            <a
              href="mailto:Sarpongkesh@gmail.com"
              className="mt-auto inline-flex items-center justify-center gap-2 border border-purple text-purple font-body text-sm font-medium py-2.5 px-5 rounded-full hover:bg-lavender-light transition-colors"
            >
              <Mail size={14} />
              Email
            </a>
          </div>
        </div>

        {/* Location + Hours */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-purple" />
            </div>
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1">
                Location
              </p>
              <p className="font-heading text-purple text-xl font-semibold">
                Sowutoum, Ghana
              </p>
              <p className="font-body text-xs text-muted mt-1">
                {/* Replace with Google Maps URL when available */}
                Our location
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-lavender-light flex items-center justify-center shrink-0">
              <Clock size={18} className="text-purple" />
            </div>
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-wider mb-1">
                Opening Hours
              </p>
              <p className="font-body text-sm text-ink font-medium">
                Monday – Saturday
              </p>
              <p className="font-body text-sm text-purple font-semibold">
                9:00 AM – 8:00 PM
              </p>
              <p className="font-body text-sm text-muted mt-1">
                Sunday — Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
