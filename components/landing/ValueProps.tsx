// components/landing/ValueProps.tsx
// RSC — pure DOM.

import { Check } from "lucide-react";
import ScorePill from "./ScorePill";

const REVELATIONS: string[] = [
  "Votre taux de no-shows vs. la moyenne du secteur dentaire",
  "Le CA perdu annualisé (déjà calculé, pas de re-multiplier)",
  "Les créneaux horaires et jours les plus à risque",
  "Un plan d'action priorisé en 3 leviers concrets",
];

export default function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-medium text-accentGreen">Ce que révèle votre audit</p>
          <h2 className="mt-2 font-serif text-3xl text-slate-900 md:text-4xl">
            Un diagnostic chiffré, pas un tableau de bord générique.
          </h2>
          <ul className="mt-8 space-y-3">
            {REVELATIONS.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Check aria-hidden className="mt-0.5 h-5 w-5 flex-none text-accentGreen" />
                <span className="text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center md:justify-end">
          <ScorePill />
        </div>
      </div>
    </section>
  );
}
