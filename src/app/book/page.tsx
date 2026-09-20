import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Book an Appointment | Kiki's Touch Beauty Salon",
  description:
    "Request an appointment at Kiki's Touch Beauty Salon via WhatsApp. Fill in your details and we'll confirm your slot. GH₵50 deposit required.",
};

export default function BookPage() {
  return (
    <div className="pt-24 lg:pt-32 pb-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold mb-3">
            Reserve Your Slot
          </p>
          <h1 className="font-heading text-purple text-5xl sm:text-6xl font-light leading-tight">
            Book Appointment
          </h1>
          <p className="font-body text-muted text-base mt-4 max-w-sm mx-auto">
            Fill in your details to request an appointment.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-8">
          <Suspense fallback={<div className="h-96 animate-pulse bg-lavender-light rounded-xl" />}>
            <BookingForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
