"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getServicesFromSupabase } from "@/lib/supabase-data";
import { services as staticServices } from "@/data/services";
import { Service, BookingFormData } from "@/types";
import { supabase } from "@/lib/supabase";
import { useBusinessSettings } from "@/lib/useBusinessSettings";
import { buildBookingMessage, openWhatsApp } from "@/lib/whatsapp";
import { Send, RefreshCw, AlertCircle } from "lucide-react";

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
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const { settings, hours, overrides } = useBusinessSettings();

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

  // Check date against overrides & business hours when date changes
  useEffect(() => {
    if (!form.date) {
      setDateWarning(null);
      return;
    }

    // Check availability override
    const override = overrides.find((o) => o.override_date === form.date);
    if (override && override.is_closed) {
      setDateWarning(`Notice: We are closed on ${form.date} (${override.reason || "Scheduled closure"}). Please select another date.`);
      return;
    }

    // Check normal day of week hours
    const selectedDayObj = new Date(form.date);
    const dayOfWeek = selectedDayObj.getDay(); // 0 = Sunday, 1 = Monday...
    const daySchedule = hours.find((h) => h.id === dayOfWeek);

    if (daySchedule && !daySchedule.is_open) {
      setDateWarning(`Notice: We are normally closed on ${daySchedule.day_name}s. Please select an available working day.`);
      return;
    }

    setDateWarning(null);
  }, [form.date, overrides, hours]);

  function validate(): boolean {
    const newErrors: Partial<BookingFormData> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Please enter your full name.";
    if (!form.phone.trim()) newErrors.phone = "Please enter your phone number.";
    if (!form.service) newErrors.service = "Please select a service.";
    if (!form.date) newErrors.date = "Please select a date.";
    if (!form.time) newErrors.time = "Please select a time.";
    if (dateWarning) newErrors.date = "Selected date is unavailable.";

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
      // Save booking request to Supabase database for admin verification
      await supabase.from("bookings").insert({
        customer_name: form.fullName.trim(),
        customer_phone: form.phone.trim(),
        service_name: form.service,
        booking_date: form.date,
        booking_time: form.time,
        notes: form.note.trim() || null,
        deposit_amount: settings.booking_deposit_amount || 50,
        deposit_status: "pending",
        status: "pending",
      });
    } catch (err) {
      console.error("Booking database insert error:", err);
    } finally {
      setIsSubmitting(false);
    }

    const message = buildBookingMessage(
      form,
      settings.business_name,
      settings.booking_deposit_amount,
      settings.currency
    );
    openWhatsApp(message, settings.whatsapp_number);
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
              {s.name} {s.price ? `(${settings.currency}${s.price})` : ''}
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
            className={fieldClass(errors.date || (dateWarning ? 'border-red-400' : undefined))}
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

      {/* Date Availability Warning Banner */}
      {dateWarning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          <span>{dateWarning}</span>
        </div>
      )}

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
          disabled={isSubmitting || !!dateWarning}
          className="w-full flex items-center justify-center gap-2.5 bg-purple text-white font-body font-semibold py-4 rounded-full hover:bg-purple-light active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              Processing Request...
            </>
          ) : (
            <>
              <Send size={17} />
              {settings.booking_cta_text || "Send via WhatsApp"}
            </>
          )}
        </button>
        <p className="font-body text-xs text-muted text-center mt-3">
          A {settings.currency}{settings.booking_deposit_amount} deposit is required to secure your appointment.
        </p>
      </div>
    </form>
  );
}
