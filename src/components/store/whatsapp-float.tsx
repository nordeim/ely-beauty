/**
 * WhatsAppFloat — the reference's floating "Chat on WhatsApp" button
 * (green circular, bottom-right, on every storefront page). The number is
 * settings-driven (whatsappNumber, seeded from the reference: 8801787385459).
 *
 * S75-8 (D-8, measured): the reference renders the REAL WhatsApp logo
 * glyph (a 32×32 viewBox path, fill-white, w-7 h-7) — not a generic chat
 * bubble. The path below is the standard WhatsApp brand mark.
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
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden>
        <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.72.71 5.27 1.96 7.48L.5 31.5l8.22-2.1A15.46 15.46 0 0 0 16 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5Zm0 28.06c-2.34 0-4.52-.66-6.38-1.8l-.46-.27-4.83 1.24 1.25-4.7-.3-.48A12.99 12.99 0 0 1 3.4 16C3.4 8.99 8.99 3.4 16 3.4S28.6 8.99 28.6 16 23.01 28.56 16 28.56Zm7.27-10.32c-.4-.2-2.36-1.16-2.72-1.3-.37-.13-.63-.2-.9.2-.26.4-1.02 1.3-1.25 1.57-.23.26-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.06-1.98-2.36-2.21-2.76-.23-.4-.03-.62.17-.82.18-.18.4-.46.6-.7.2-.23.26-.4.4-.66.13-.27.06-.5-.04-.7-.1-.2-.9-2.16-1.23-2.96-.32-.77-.65-.67-.9-.68h-.76c-.27 0-.7.1-1.06.5-.37.4-1.4 1.36-1.4 3.32s1.43 3.85 1.63 4.12c.2.26 2.8 4.27 6.78 5.99.95.41 1.69.65 2.26.83.95.3 1.82.26 2.5.16.77-.11 2.36-.96 2.7-1.9.33-.93.33-1.72.23-1.89-.1-.16-.36-.26-.76-.46Z" />
      </svg>
    </a>
  );
}
