// components/landing/LandingFooter.tsx
// RSC — pure DOM.

import Link from "next/link";

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-6 w-6 rounded-full bg-primaryDark" />
              <span className="font-semibold text-slate-900">GetLostRevenue</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              L&apos;audit no-shows des cabinets dentaires. Chiffré, rapide, gratuit.
            </p>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Produit</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li><a href="#comment-ca-marche" className="hover:text-slate-900">Comment ça marche</a></li>
              <li><a href="#pour-qui" className="hover:text-slate-900">Pour qui</a></li>
              <li><a href="#faq" className="hover:text-slate-900">FAQ</a></li>
              <li><Link href="/audit" className="hover:text-slate-900">Lancer un audit</Link></li>
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

        <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-slate-500">
          © {year} GetLostRevenue — Placeholder brand. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
