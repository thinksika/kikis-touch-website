import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink, Navigation } from "lucide-react";
import { WHATSAPP_BASE } from "@/lib/whatsapp";

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/cYdLK7PJLBu15iGF7";

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
            Reach out anytime or visit us at our salon in Sowutoum, Ghana.
          </p>
        </div>

        {/* Primary Contact Cards */}
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

        {/* Location + Opening Hours Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow-soft flex flex-col justify-between">
            <div className="flex gap-4 items-start">
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
                  Official Salon Location
                </p>
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-purple text-white font-body text-sm font-medium py-3 px-6 rounded-full hover:bg-purple-light transition-all shadow-sm"
              aria-label="Get Directions to Kiki's Touch Beauty Salon on Google Maps"
            >
              <Navigation size={15} />
              Get Directions
              <ExternalLink size={14} className="opacity-70" />
            </a>
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

        {/* Dedicated Google Maps Location Section */}
        <div className="mt-12 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-lavender-light">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-lavender-light px-3 py-1 rounded-full text-xs text-purple font-semibold">
                <MapPin size={14} />
                <span>Google Maps Location</span>
              </div>
              <h3 className="font-heading text-purple text-2xl sm:text-3xl font-semibold">
                Find Kiki&apos;s Touch Beauty Salon
              </h3>
              <p className="font-body text-muted text-sm max-w-md">
                Located in Sowutoum, Ghana. Open Google Maps to get turn-by-turn navigation directly to our salon doors.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-[#C5A059] hover:bg-[#b08c46] text-black font-body text-sm font-semibold py-3.5 px-8 rounded-full transition-all shadow-md active:scale-[0.98]"
              >
                <Navigation size={17} />
                <span>Open in Google Maps</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
