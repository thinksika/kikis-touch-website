import Link from "next/link";
import { services } from "@/data/services";
import ServiceCard from "@/components/services/ServiceCard";
import { ArrowRight } from "lucide-react";

// Show only 4 featured services on the home page
const featuredServices = services.slice(0, 4);

export default function ServicesSection() {
  return (
    <section className="section-padding bg-cream" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-14">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
              What We Offer
            </p>
            <h2 className="font-heading text-purple text-4xl sm:text-5xl font-light leading-tight">
              Our Services
            </h2>
            <p className="font-body text-muted text-base mt-3 max-w-sm">
              Beautiful styles and professional beauty care.
            </p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 font-body text-sm text-purple hover:text-plum transition-colors shrink-0 group"
            aria-label="See all services"
          >
            See All
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {featuredServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} priority={i < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
