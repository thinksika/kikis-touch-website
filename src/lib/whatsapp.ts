import { CartItem, BookingFormData } from "@/types";

export const DEFAULT_WHATSAPP_NUMBER = "233543603627";
export const WHATSAPP_NUMBER = DEFAULT_WHATSAPP_NUMBER;
export const WHATSAPP_BASE = `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`;

export function formatWhatsAppLink(phone?: string): string {
  if (!phone) return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const fullPhone = cleanPhone.startsWith("233")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `233${cleanPhone.slice(1)}`
    : cleanPhone || DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${fullPhone}`;
}

export function openWhatsApp(message: string, targetPhone?: string) {
  const baseUrl = formatWhatsAppLink(targetPhone);
  const encoded = encodeURIComponent(message);
  window.open(`${baseUrl}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

export function buildBookingMessage(
  data: BookingFormData,
  businessName = "Kiki's Touch Beauty Salon",
  depositAmount = 50,
  currency = "GH₵"
): string {
  const lines = [
    `Hello ${businessName},`,
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
    `I understand that a ${currency}${depositAmount} deposit is required to secure my appointment.`,
    "",
    "Please confirm availability."
  );

  return lines.join("\n");
}

export function buildOrderMessage(
  items: CartItem[],
  businessName = "Kiki's Touch Beauty Salon",
  currency = "GH₵"
): string {
  const allHavePrices = items.every((item) => item.product.price !== null && item.product.price !== undefined);

  const itemLines = items.map((item, index) => {
    const line = `${index + 1}. ${item.product.name} × ${item.quantity}`;
    return line;
  });

  let total = "";
  if (allHavePrices) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product.price as number) * item.quantity;
    }, 0);
    total = `${currency}${subtotal.toFixed(2)}`;
  } else {
    total = "To be confirmed.";
  }

  const lines = [
    `Hello ${businessName},`,
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
  if (items.some((item) => item.product.price === null || item.product.price === undefined)) return null;
  return items.reduce(
    (sum, item) => sum + (item.product.price as number) * item.quantity,
    0
  );
}
