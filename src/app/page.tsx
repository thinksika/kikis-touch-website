import Hero from "@/components/home/Hero";
import ServicesSection from "@/components/home/ServicesSection";
import BookingCTA from "@/components/home/BookingCTA";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ContactSection from "@/components/contact/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <BookingCTA />
      <FeaturedProducts />
      <ContactSection />
    </>
  );
}
