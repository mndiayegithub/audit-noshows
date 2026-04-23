// components/landing/TargetGrid.tsx
// RSC — pure DOM.

import { Stethoscope, Smile, Sparkles, Building2 } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Target = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  sub: string;
  pastilleBg: string;
  pastilleFg: string;
};

const TARGETS: Target[] = [
  { Icon: Stethoscope, label: "Omnipratique", sub: "Cabinets généralistes", pastilleBg: "bg-kpiVolume", pastilleFg: "text-kpiVolume-fg" },
  { Icon: Smile, label: "Orthodontie", sub: "Cabinets spécialisés", pastilleBg: "bg-kpiSignal", pastilleFg: "text-kpiSignal-fg" },
  { Icon: Sparkles, label: "Implantologie", sub: "Cabinets chirurgicaux", pastilleBg: "bg-kpiTaux", pastilleFg: "text-kpiTaux-fg" },
  { Icon: Building2, label: "Groupes & réseaux", sub: "Structures multi-sites", pastilleBg: "bg-kpiArgent", pastilleFg: "text-kpiArgent-fg" },
];

export default function TargetGrid() {
  return (
    <section id="pour-qui" className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-sm font-medium text-accentGreen">Pour qui ?</p>
      <h2 className="mt-2 font-serif text-3xl text-slate-900 md:text-4xl">
        Pensé pour les cabinets qui veulent chiffrer leurs no-shows.
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TARGETS.map(({ Icon, label, sub, pastilleBg, pastilleFg }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${pastilleBg} ${pastilleFg}`}>
              <Icon aria-hidden className="h-5 w-5" />
            </div>
            <div className="mt-4 font-medium text-slate-900">{label}</div>
            <div className="mt-1 text-sm text-slate-600">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
