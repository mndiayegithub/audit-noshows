"use client";
// components/landing/LandingFooter.tsx
// Client — pure DOM + Phase 9 tracking on /audit link.

import Link from "next/link";
import { trackLandingCtaAuditClick } from "@/lib/analytics";

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primaryDark text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
                </svg>
              </span>
              <span className="font-semibold text-slate-900">GetLostRevenue</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              L&apos;audit analyse de performances des cabinets médicaux.
              Chiffré, rapide, gratuit.
            </p>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Produit</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><a href="#comment-ca-marche" className="hover:text-slate-900">Comment ça marche</a></li>
              <li><a href="#pour-qui" className="hover:text-slate-900">Pour qui ?</a></li>
              <li><a href="#faq" className="hover:text-slate-900">FAQ</a></li>
              <li><Link href="/audit" onClick={() => trackLandingCtaAuditClick()} className="hover:text-slate-900">Lancer un audit</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Légal</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><a href="#" className="hover:text-slate-900">Mentions légales</a></li>
              <li><a href="#" className="hover:text-slate-900">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-gray-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} GetLostRevenue — Tous droits réservés.</span>
          <span>
            Powered by{" "}
            <a
              href="https://perfiamatic.fr"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              PerfIAmatic
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
