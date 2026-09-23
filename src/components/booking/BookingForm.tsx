"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getServicesFromSupabase } from "@/lib/supabase-data";
import { services as staticServices } from "@/data/services";
import { Service, BookingFormData } from "@/types";
import { supabase } from "@/lib/supabase";
import { buildBookingMessage, openWhatsApp } from "@/lib/whatsapp";
import { Send, RefreshCw } from "lucide-react";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM",
];

const initialForm: BookingFormData = {
  fullName: "",
  phone: "",
  service: "",
  date: "",
  time: "",
  note: "",
};

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BookingFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [servicesList, setServicesList] = useState<Service[]>(staticServices);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      const data = await getServicesFromSupabase();
      setServicesList(data);
    }
    fetchServices();
  }, []);

  // Pre-select service from URL query param
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      setForm((prev) => ({ ...prev, service: serviceParam }));
    }
  }, [searchParams]);

  function validate(): boolean {
    const newErrors: Partial<BookingFormData> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Please enter your full name.";
    if (!form.phone.trim()) newErrors.phone = "Please enter your phone number.";
    if (!form.service) newErrors.service = "Please select a service.";
    if (!form.date) newErrors.date = "Please select a date.";
    if (!form.time) newErrors.time = "Please select a time.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Save booking to Supabase database so admin receives it in dashboard
      await supabase.from("bookings").insert({
        customer_name: form.fullName.trim(),
        customer_phone: form.phone.trim(),
        service_name: form.service,
        booking_date: form.date,
        booking_time: form.time,
        notes: form.note.trim() || null,
        deposit_status: "pending",
        status: "pending",
      });
    } catch (err) {
      console.error("Booking database insert error:", err);
    } finally {
      setIsSubmitting(false);
    }

    const message = buildBookingMessage(form);
    openWhatsApp(message);
  }

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  const fieldClass = (error?: string) =>
    `w-full font-body text-sm text-ink bg-white border rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-purple focus:ring-2 focus:ring-purple/10 placeholder:text-muted/50 ${
      error ? "border-red-400" : "border-lavender"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          className={fieldClass(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p id="fullName-error" className="mt-1 font-body text-xs text-red-500">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
          WhatsApp / Phone Number <span className="text-red-400">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="054 360 0000"
          autoComplete="tel"
          className={fieldClass(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 font-body text-xs text-red-500">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Service */}
      <div>
        <label htmlFor="service" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
          Service <span className="text-red-400">*</span>
        </label>
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className={fieldClass(errors.service)}
          aria-describedby={errors.service ? "service-error" : undefined}
          aria-invalid={!!errors.service}
        >
          <option value="">Select a service</option>
          {servicesList.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.service && (
          <p id="service-error" className="mt-1 font-body text-xs text-red-500">
            {errors.service}
          </p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
            Preferred Date <span className="text-red-400">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            min={today}
            className={fieldClass(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p id="date-error" className="mt-1 font-body text-xs text-red-500">
              {errors.date}
            </p>
          )}
        </div>

        {/* Time */}
        <div>
          <label htmlFor="time" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
            Preferred Time <span className="text-red-400">*</span>
          </label>
          <select
            id="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className={fieldClass(errors.time)}
            aria-describedby={errors.time ? "time-error" : undefined}
            aria-invalid={!!errors.time}
          >
            <option value="">Select time</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.time && (
            <p id="time-error" className="mt-1 font-body text-xs text-red-500">
              {errors.time}
            </p>
          )}
        </div>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block font-body text-xs font-medium text-ink mb-1.5 tracking-wide">
          Additional Note{" "}
          <span className="text-muted font-normal">(Optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
          placeholder="Any details you'd like us to know…"
          className={`${fieldClass()} resize-none`}
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 bg-purple text-white font-body font-semibold py-4 rounded-full hover:bg-purple-light active:scale-[0.98] transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send size={17} />
              Send via WhatsApp
            </>
          )}
        </button>
        <p className="font-body text-xs text-muted text-center mt-3">
          A GH₵50 deposit is required to secure your appointment.
        </p>
      </div>
    </form>
  );
}
