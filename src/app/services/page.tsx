import type { Metadata } from "next";
import { services } from "@/data/services";
import ServiceCard from "@/components/services/ServiceCard";

export const metadata: Metadata = {
  title: "Our Services | Kiki's Touch Beauty Salon",
  description:
    "Explore our professional beauty services including knotless braids, cornrows, braided styles, wig installation, hair treatments and locs styling.",
};

export default function ServicesPage() {
  return (
    <div className="pt-24 lg:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
            What We Offer
          </p>
          <h1 className="font-heading text-purple text-5xl sm:text-6xl font-light leading-tight">
            Our Services
          </h1>
          <p className="font-body text-muted text-base sm:text-lg mt-4 max-w-md mx-auto">
            Beautiful styles and professional beauty care, crafted just for
            you.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} priority={i < 3} />
          ))}
        </div>
      </div>
    </div>
  );
}
