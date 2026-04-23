// components/landing/FAQCards.tsx
// RSC — native <details>, no React state, no JS, a11y built-in.

import { ChevronDown } from "lucide-react";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Mes données CSV sont-elles stockées quelque part ?",
    a: "Non. Le fichier est analysé à la volée et supprimé immédiatement après la génération du rapport. Aucune donnée patient n'est conservée.",
  },
  {
    q: "Quel format de CSV est accepté ?",
    a: "L'export standard Doctolib (rendez-vous avec statut). Les autres PMS sont supportés si les colonnes date / statut / praticien sont présentes.",
  },
  {
    q: "Combien de temps prend l'audit ?",
    a: "En moyenne 60 secondes. Le traitement IA du rapport texte peut prendre jusqu'à 90 secondes pour les gros fichiers.",
  },
  {
    q: "L'audit est-il vraiment gratuit ?",
    a: "Oui. Vous obtenez votre diagnostic complet sans inscription et sans carte bancaire.",
  },
];

export default function FAQCards() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-sm font-medium text-accentGreen">FAQ</p>
      <h2 className="mt-2 font-serif text-3xl text-slate-900 md:text-4xl">
        Les questions qu&apos;on nous pose le plus souvent.
      </h2>

      <div className="mt-10 space-y-3">
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-gray-200 bg-white transition-colors open:border-emerald-100 open:bg-emerald-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-slate-900 [&::-webkit-details-marker]:hidden">
              <span className="font-medium">{q}</span>
              <ChevronDown
                aria-hidden
                className="h-5 w-5 flex-none text-slate-500 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-5 pb-5 text-sm text-slate-700">{a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
