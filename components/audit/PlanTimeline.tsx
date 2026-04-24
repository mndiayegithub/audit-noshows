/**
 * Section 5 — Plan d'action (sketch 009 variante A — grille 3 cards).
 *
 * 3 cards blanches `rounded-[20px]` avec pastille carrée 36×36 rounded-lg
 * colorée selon la sémantique KPI :
 *   - Card 1 (Volume) → bg #DFF3FF / fg #2563EB
 *   - Card 2 (Signal) → bg #DCF4E6 / fg #059669
 *   - Card 3 (Taux)   → bg #FCEACC / fg #EA580C
 *
 * Chaque card se termine par un tag "Gain estimé · X k€ / an" en uppercase
 * muted (pas de couleur sémantique sur le tag, conformément au sketch).
 */
interface PlanItem {
  num: 1 | 2 | 3;
  numBg: string;
  numFg: string;
  title: string;
  description: string;
  gain: string;
}

const ITEMS: PlanItem[] = [
  {
    num: 1,
    numBg: "#DFF3FF",
    numFg: "#2563EB",
    title: "Rappels SMS automatiques J-2",
    description:
      "Réduit les no-shows de 35 % en moyenne sur les créneaux du matin. Paramétrable depuis votre logiciel de prise de RDV.",
    gain: "Gain estimé · 18 k€ / an",
  },
  {
    num: 2,
    numBg: "#DCF4E6",
    numFg: "#059669",
    title: "Caution symbolique sur créneaux sensibles",
    description:
      "10 € de caution remboursable pour les RDV du jeudi 16h–18h et du samedi. Dissuade les no-shows opportunistes.",
    gain: "Gain estimé · 12 k€ / an",
  },
  {
    num: 3,
    numBg: "#FCEACC",
    numFg: "#EA580C",
    title: "Liste d'attente en temps réel",
    description:
      "Un créneau se libère → SMS groupé aux patients en attente. Remplissage en moyenne 6 min après l'annulation.",
    gain: "Gain estimé · 9 k€ / an",
  },
];

export default function PlanTimeline() {
  return (
    <ol
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Plan d'action en 3 étapes"
    >
      {ITEMS.map((item) => (
        <li
          key={item.num}
          className="relative overflow-hidden rounded-[20px] border border-gray-200 bg-white p-[22px]"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-serif text-[18px] font-medium"
            style={{ backgroundColor: item.numBg, color: item.numFg }}
          >
            {item.num}
          </span>
          <h4 className="mt-[14px] font-serif text-[17px] font-medium leading-snug tracking-tight text-slate-900">
            {item.title}
          </h4>
          <p
            className="mt-2 text-[13px] text-gray-600"
            style={{ lineHeight: 1.55 }}
          >
            {item.description}
          </p>
          <p
            className="mt-[14px] text-[11px] font-semibold uppercase text-gray-500"
            style={{ letterSpacing: "0.06em" }}
          >
            {item.gain}
          </p>
        </li>
      ))}
    </ol>
  );
}
