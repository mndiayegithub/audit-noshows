// components/landing/FAQCards.tsx
// FAQ avec image + accordéon contrôlé. DA clinique-claire (primaryDark, Fraunces).
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-center gap-10 md:gap-12 px-6">
        <div className="relative w-full max-w-sm aspect-square shrink-0 rounded-3xl overflow-hidden border border-gray-200">
          <Image
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop"
            alt="Praticien dentaire en consultation"
            fill
            sizes="(min-width: 768px) 24rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primaryDark">
            Questions Fréquentes
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium text-slate-900 lg:text-4xl">
            Les questions qu&apos;on nous pose le plus souvent.
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Diagnostic gratuit en 60 secondes — vos données patient ne sortent
            jamais de l&apos;analyse.
          </p>

          <div className="mt-6">
            {FAQ.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <button
                  key={faq.q}
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left border-b border-slate-200 py-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark/30 rounded-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-medium text-slate-900">
                      {faq.q}
                    </h3>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "h-5 w-5 flex-none text-slate-500 transition-transform duration-500 ease-in-out",
                        isOpen && "rotate-180 text-primaryDark",
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md overflow-hidden",
                      isOpen
                        ? "opacity-100 max-h-[300px] translate-y-0 pt-3"
                        : "opacity-0 max-h-0 -translate-y-2",
                    )}
                  >
                    {faq.a}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
