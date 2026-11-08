import { MessageCircle } from "lucide-react";

/**
 * WhatsAppFloat — the reference's floating "Chat on WhatsApp" button
 * (green circular, bottom-right, on every storefront page). The number is
 * settings-driven (whatsappNumber, seeded from the reference: 8801787385459).
 */
export function WhatsAppFloat({ whatsappNumber }: { whatsappNumber?: string }) {
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/[^\d]/g, "");
  if (!digits) return null;
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-float"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </a>
  );
}
