"use client";
// components/landing/CTABand.tsx
// Client — single conversion anchor, no form. Phase 9: tracks landing CTA click.

import Link from "next/link";
import { trackLandingCtaAuditClick } from "@/lib/analytics";

export default function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="rounded-3xl bg-primaryDark px-8 py-12 md:px-14 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div>
            <h2 className="font-serif text-3xl text-white md:text-4xl">
              Chiffrez ce que vos no-shows coûtent à votre cabinet.
            </h2>
            <p className="mt-3 max-w-xl text-emerald-100">
              Audit gratuit, 60 secondes, aucune inscription. Export CSV Doctolib suffisant.
            </p>
          </div>
          <Link
            href="/audit"
            onClick={() => trackLandingCtaAuditClick()}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-medium text-primaryDark transition-shadow hover:shadow-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primaryDark"
          >
            Lancer mon audit
          </Link>
        </div>
      </div>
    </section>
  );
}
