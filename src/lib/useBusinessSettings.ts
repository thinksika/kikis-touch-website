import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface BusinessSettings {
  business_name: string;
  phone_number: string;
  whatsapp_number: string;
  email_address: string;
  location_address: string;
  google_maps_url: string;
  logo_url: string;
  booking_deposit_amount: number;
  currency: string;
  hero_title: string;
  hero_subtitle: string;
  booking_cta_text: string;
  shop_cta_text: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
}

export interface BusinessHour {
  id: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface AvailabilityOverride {
  id: string;
  override_date: string;
  is_closed: boolean;
  open_time?: string;
  close_time?: string;
  reason?: string;
}

export const defaultSettings: BusinessSettings = {
  business_name: "Kiki's Touch Beauty Salon",
  phone_number: "054 360 3627",
  whatsapp_number: "233543603627",
  email_address: "Sarpongkesh@gmail.com",
  location_address: "Sowutoum, Ghana",
  google_maps_url: "https://maps.app.goo.gl/cYdLK7PJLBu15iGF7",
  logo_url: "/images/logo/kikis-touch-logo.png",
  booking_deposit_amount: 50,
  currency: "GH₵",
  hero_title: "Kiki's Touch Beauty Salon",
  hero_subtitle: "Beautiful braids, professional beauty services and quality hair products.",
  booking_cta_text: "Book via WhatsApp",
  shop_cta_text: "Shop Products",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
};

export const defaultHours: BusinessHour[] = [
  { id: 1, day_name: "Monday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 2, day_name: "Tuesday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 3, day_name: "Wednesday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 4, day_name: "Thursday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 5, day_name: "Friday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 6, day_name: "Saturday", is_open: true, open_time: "09:00", close_time: "20:00" },
  { id: 0, day_name: "Sunday", is_open: false, open_time: "09:00", close_time: "20:00" },
];

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [hours, setHours] = useState<BusinessHour[]>(defaultHours);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const [settingsRes, hoursRes, overridesRes] = await Promise.all([
          supabase.from('business_settings').select('*').eq('id', 1).single(),
          supabase.from('business_hours').select('*').order('id', { ascending: true }),
          supabase.from('availability_overrides').select('*').order('override_date', { ascending: true }),
        ]);

        if (settingsRes.data) {
          setSettings(settingsRes.data);
        }
        if (hoursRes.data && hoursRes.data.length > 0) {
          setHours(hoursRes.data);
        }
        if (overridesRes.data) {
          setOverrides(overridesRes.data);
        }
      } catch (err) {
        console.error('Error loading business configuration from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return { settings, hours, overrides, loading };
}
