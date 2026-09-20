import type { Metadata } from "next";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us | Kiki's Touch Beauty Salon",
  description:
    "Get in touch with Kiki's Touch Beauty Salon. Call, WhatsApp or email us. Located in Sowutoum, Ghana. Open Monday to Saturday, 9AM to 8PM.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
          We&apos;re Here
        </p>
        <h1 className="font-heading text-purple text-5xl sm:text-6xl font-light leading-tight">
          Contact Us
        </h1>
      </div>
      <ContactSection />
    </div>
  );
}
