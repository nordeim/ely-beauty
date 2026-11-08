import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo — the ElyBeauty bicolor wordmark ("Ely" in gold, "Beauty" in rose),
 * matching the reference's serif logo treatment (Cormorant Garamond).
 * S74-10: the hex anchors are the reference logo image's measured gradient
 * endpoints (gold #C99A3A→#E0B14E, pink #E8899A→#D95577 — sampled live
 * 2026-11-08); the flat pair sits on those anchors.
 */
export function Logo({ className, brandName = "ElyBeauty" }: { className?: string; brandName?: string }) {
  return (
    <Link
      href="/"
      className={cn("font-display text-2xl font-medium leading-none tracking-tight", className)}
      aria-label={`${brandName} home`}
    >
      <span className="text-[#c99a3a]">Ely</span>
      <span className="text-[#d95577]">Beauty</span>
    </Link>
  );
}
