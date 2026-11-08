import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo — the ElyBeauty bicolor wordmark ("Ely" in gold, "Beauty" in rose),
 * matching the reference's serif logo treatment (Cormorant Garamond).
 */
export function Logo({ className, brandName = "ElyBeauty" }: { className?: string; brandName?: string }) {
  return (
    <Link
      href="/"
      className={cn("font-display text-2xl font-medium leading-none tracking-tight", className)}
      aria-label={`${brandName} home`}
    >
      <span className="text-[#b08d57]">Ely</span>
      <span className="text-[#c4717d]">Beauty</span>
    </Link>
  );
}
