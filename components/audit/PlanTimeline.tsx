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
  dotColor: string; // hex
  title: string;
  meta: string;
}

const ITEMS: TimelineItem[] = [
  { dotColor: "#2563EB", title: "Rappels SMS J-2", meta: "Mois 1 · Volume" },
  {
    dotColor: "#059669",
    title: "Caution créneaux sensibles",
    meta: "Mois 1–2 · Signal",
  },
  {
    dotColor: "#EA580C",
    title: "Liste d'attente temps réel",
    meta: "Mois 2 · Taux",
  },
];

export default function PlanTimeline() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7">
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-8">
        <ol
          className="relative space-y-6 pl-6"
          aria-label="Plan d'action en 3 étapes"
        >
          <div
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"
          />
          {ITEMS.map((item, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className="absolute -left-6 top-1 inline-block h-3 w-3 rounded-full ring-4 ring-white"
                style={{ backgroundColor: item.dotColor }}
              />
              <p className="font-fraunces text-[16px] text-ink">{item.title}</p>
              <p className="mt-0.5 text-[12px] uppercase tracking-wide text-gray-500">
                {item.meta}
              </p>
            </li>
          ))}
        </ol>
        <div className="text-[15px] text-gray-700 space-y-3">
          <h4 className="font-fraunces text-xl text-ink">
            Un plan en 3 étapes, pensé pour l&apos;exécution.
          </h4>
          <p>
            En{" "}
            <span className="font-semibold text-[#2563EB]">
              4 à 6 semaines
            </span>
            , on active les 3 leviers qui couvrent 80&nbsp;% des no-shows
            identifiés : rappels, cautions, et liste d&apos;attente automatisée.
          </p>
          <p>
            Chaque levier est mesurable. L&apos;objectif : réduire le taux de
            no-show de{" "}
            <span className="font-semibold text-[#059669]">30 à 50&nbsp;%</span>{" "}
            en 3 mois, avec un ROI visible dès le premier mois.
          </p>
        </div>
      </div>
    </div>
  );
}
