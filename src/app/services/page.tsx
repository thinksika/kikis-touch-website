'use client';

import { useEffect, useState } from 'react';
import { getServicesFromSupabase } from '@/lib/supabase-data';
import { services as staticServices } from '@/data/services';
import { Service } from '@/types';
import ServiceCard from '@/components/services/ServiceCard';
import { RefreshCw } from 'lucide-react';

export default function ServicesPage() {
  const [servicesList, setServicesList] = useState<Service[]>(staticServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getServicesFromSupabase();
      setServicesList(data);
      setLoading(false);
    }
    loadData();
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {servicesList.map((service, i) => (
              <ServiceCard key={service.id} service={service} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
