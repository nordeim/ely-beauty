import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FlaskConical, Leaf, Sparkles } from "lucide-react";

import { siteBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind ElyBeauty — clean, effective, luxurious skincare and beauty rituals, curated with clinical precision.",
  alternates: { canonical: `${siteBaseUrl()}/about` },
};

const VALUES: { icon: typeof FlaskConical; id?: string; title: string; text: string }[] = [
  {
    icon: FlaskConical,
    id: "ingredients",
    title: "Clean Formulas",
    text: "Every formula is screened for safety and efficacy — botanical actives at concentrations that actually deliver, with nothing your skin doesn't need.",
  },
  {
    icon: Leaf,
    id: "sustainability",
    title: "Sustainable",
    text: "Responsibly sourced ingredients, mindful packaging, and refill-friendly formats. Luxury that treads lightly.",
  },
  {
    icon: Sparkles,
    title: "Results-Driven",
    text: "Clinically-inspired actives, tested in real rituals. If it doesn't earn its place in your routine, it doesn't earn a place in our collection.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero statement (the reference's centered editorial opening). */}
      <section className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <h1 className="font-display text-5xl font-light tracking-tight sm:text-6xl">Beauty, Redefined</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          ElyBeauty was born from a simple belief: that true beauty comes from nature&rsquo;s finest
          ingredients, formulated with clinical precision. Every product in our collection is a
          testament to this philosophy — clean, effective, and luxurious.
        </p>
      </section>

      {/* Collection image */}
      <section className="container-page">
        <Image
          src="/images/about-collection.png"
          alt="The ElyBeauty collection — beauty tools and skincare essentials arranged on ivory linen"
          width={1344}
          height={768}
          priority
          className="h-auto w-full object-cover"
        />
      </section>

      {/* Value props */}
      <section aria-labelledby="about-values-heading" className="container-page py-16 sm:py-20">
        <h2 id="about-values-heading" className="sr-only">
          What we stand for
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} id={value.id} className="flex flex-col gap-3 text-center scroll-mt-28">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground">
                <value.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-2xl font-medium">{value.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20 text-center">
        <Link href="/shop" className="link-cta border-foreground/40 text-foreground hover:border-foreground">
          Explore Our Products
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
