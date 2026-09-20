import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kiki's Touch Beauty Salon | Sowutoum, Ghana",
  description:
    "Beautiful braids, professional beauty services and quality hair products at Kiki's Touch Beauty Salon, Sowutoum, Ghana. Book via WhatsApp.",
  keywords: [
    "beauty salon",
    "braids",
    "knotless braids",
    "cornrows",
    "wig installation",
    "hair products",
    "Ghana",
    "Sowutoum",
  ],
  openGraph: {
    title: "Kiki's Touch Beauty Salon",
    description:
      "Beautiful braids, professional beauty services and quality hair products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream antialiased">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
