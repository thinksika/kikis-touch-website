import { CartItem, BookingFormData } from "@/types";

export const WHATSAPP_NUMBER = "233543603627";
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`${WHATSAPP_BASE}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

export function buildBookingMessage(data: BookingFormData): string {
  const lines = [
    "Hello Kiki's Touch Beauty Salon,",
    "",
    "I would like to request an appointment.",
    "",
    `Name: ${data.fullName}`,
    `Phone: ${data.phone}`,
    `Service: ${data.service}`,
    `Preferred Date: ${data.date}`,
    `Preferred Time: ${data.time}`,
  ];

  if (data.note.trim()) {
    lines.push(`Note: ${data.note.trim()}`);
  }

  lines.push(
    "",
    "I understand that a GH₵50 deposit is required to secure my appointment.",
    "",
    "Please confirm availability."
  );

  return lines.join("\n");
}

export function buildOrderMessage(items: CartItem[]): string {
  const allHavePrices = items.every((item) => item.product.price !== null);

  const itemLines = items.map((item, index) => {
    const line = `${index + 1}. ${item.product.name} × ${item.quantity}`;
    return line;
  });

  let total = "";
  if (allHavePrices) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product.price as number) * item.quantity;
    }, 0);
    total = `GH₵${subtotal.toFixed(2)}`;
  } else {
    total = "To be confirmed.";
  }

  const lines = [
    "Hello Kiki's Touch Beauty Salon,",
    "",
    "I would like to order:",
    "",
    ...itemLines,
    "",
    `Total: ${total}`,
    "",
    "Please confirm availability and payment details.",
  ];

  return lines.join("\n");
}

export function calculateCartTotal(items: CartItem[]): number | null {
  if (items.some((item) => item.product.price === null)) return null;
  return items.reduce(
    (sum, item) => sum + (item.product.price as number) * item.quantity,
    0
  );
}
