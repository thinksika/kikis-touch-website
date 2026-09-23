"use client";

import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink, Navigation } from "lucide-react";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import { formatWhatsAppLink } from "@/lib/whatsapp";

export default function ContactSection() {
  const { settings, hours } = useBusinessSettings();
  const whatsappUrl = formatWhatsAppLink(settings.whatsapp_number);

  const openDays = hours.filter((h) => h.is_open);
  const sunday = hours.find((h) => h.id === 0 || h.day_name === "Sunday");

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
            Reach out anytime or visit us at our salon in {settings.location_address}.
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
                href={`tel:${settings.phone_number.replace(/\s+/g, "")}`}
                className="font-heading text-purple text-xl font-semibold hover:text-plum transition-colors"
              >
                {settings.phone_number}
              </a>
            </div>
            <a
              href={`tel:${settings.phone_number.replace(/\s+/g, "")}`}
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
                {settings.phone_number}
              </p>
            </div>
            <a
              href={`${whatsappUrl}?text=${encodeURIComponent(`Hello ${settings.business_name}!`)}`}
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
                href={`mailto:${settings.email_address}`}
                className="font-heading text-purple text-lg font-semibold hover:text-plum transition-colors break-all"
              >
                {settings.email_address}
              </a>
            </div>
            <a
              href={`mailto:${settings.email_address}`}
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
                  {settings.location_address}
                </p>
                <p className="font-body text-xs text-muted mt-1">
                  Official Salon Location
                </p>
              </div>
            </div>

            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-purple text-white font-body text-sm font-medium py-3 px-6 rounded-full hover:bg-purple-light transition-all shadow-sm"
              aria-label={`Get Directions to ${settings.business_name} on Google Maps`}
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
                {openDays.length > 0 ? `${openDays[0]?.open_time?.slice(0, 5)} – ${openDays[0]?.close_time?.slice(0, 5)}` : "9:00 AM – 8:00 PM"}
              </p>
              <p className="font-body text-sm text-muted mt-1">
                Sunday — {sunday?.is_open ? `${sunday.open_time?.slice(0, 5)} – ${sunday.close_time?.slice(0, 5)}` : "Closed"}
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
                Find {settings.business_name}
              </h3>
              <p className="font-body text-muted text-sm max-w-md">
                Located in {settings.location_address}. Open Google Maps to get turn-by-turn navigation directly to our salon doors.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a
                href={settings.google_maps_url}
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
