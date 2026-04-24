/**
 * Section 5 — Plan d'action (timeline verticale tricolore + narratif).
 *
 * Exactement 3 items dont les puces reprennent les couleurs sémantiques
 * des KPI foreground :
 *   - Volume  → #2563EB (bleu)
 *   - Signal  → #059669 (émeraude)
 *   - Taux    → #EA580C (orange)
 */
interface TimelineItem {
  dotColor: string; // hex — ring/number color
  dotBg: string; // hex — pill background
  title: string;
  meta: string;
  description: string;
  gain: string;
}

const ITEMS: TimelineItem[] = [
  {
    dotColor: "#2563EB",
    dotBg: "#DFF3FF",
    title: "Rappels SMS automatiques J-2",
    meta: "Mois 1 · Volume",
    description:
      "Réduit les no-shows de 35 % en moyenne sur les créneaux du matin. Paramétrable depuis votre logiciel de prise de RDV.",
    gain: "Gain estimé · +18 k€/an",
  },
  {
    dotColor: "#059669",
    dotBg: "#DCF4E6",
    title: "Caution symbolique sur créneaux sensibles",
    meta: "Mois 1–2 · Signal",
    description:
      "10 € de caution remboursable pour les RDV du jeudi 16h–18h et du samedi. Dissuade les no-shows opportunistes.",
    gain: "Gain estimé · +12 k€/an",
  },
  {
    dotColor: "#EA580C",
    dotBg: "#FCEACC",
    title: "Liste d'attente en temps réel",
    meta: "Mois 2 · Taux",
    description:
      "Un créneau se libère → SMS groupé aux patients en attente. Remplissage en moyenne 6 min après l'annulation.",
    gain: "Gain estimé · +9 k€/an",
  },
];

export default function PlanTimeline() {
  return (
    <ol
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Plan d'action en 3 étapes"
    >
      {ITEMS.map((item, i) => (
        <li
          key={i}
          className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6"
        >
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl font-serif text-[18px] font-semibold"
            style={{ backgroundColor: item.dotBg, color: item.dotColor }}
          >
            {i + 1}
          </span>
          <h4 className="mt-4 font-serif text-[17px] leading-snug text-ink">
            {item.title}
          </h4>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
            {item.description}
          </p>
          <p
            className="mt-4 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: item.dotColor }}
          >
            {item.gain}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {item.meta}
          </p>
        </li>
      ))}
    </ol>
  );
}
