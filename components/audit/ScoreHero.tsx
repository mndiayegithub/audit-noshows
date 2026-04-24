import type { AuditStats } from "@/types/audit";
import { computeScore, scoreBadge } from "@/lib/score";

/**
 * Section 4 — Score cabinet (sketch 009 variante A).
 *
 * White card (bg-white + border-gray-200 + rounded-3xl), 2 cols desktop :
 * ring 220px à gauche + badge/titre/narratif à droite. Ring émeraude
 * (#059669) sur track #e5e7eb — la card N'EST PAS primary-dark.
 *
 * Le score numérique et le label proviennent de `lib/score.ts` — aucune
 * formule dupliquée ici.
 */
export default function ScoreHero({ stats }: { stats: AuditStats }) {
  const tauxNoshow = stats.global.taux;
  const score = computeScore(tauxNoshow);
  const badge = scoreBadge(score);
  const CIRC = 540.4; // 2π × 86
  const dashOffset = CIRC * (1 - score / 100);

  const tonePill =
    badge.tone === "good"
      ? "bg-kpiSignal text-kpiSignal-fg"
      : badge.tone === "warn"
      ? "bg-kpiTaux text-kpiTaux-fg"
      : "bg-rose-100 text-rose-700";

  const title =
    badge.tone === "good"
      ? `Il reste ${100 - score} points à aller chercher.`
      : badge.tone === "warn"
      ? `Score correct, ${100 - score} points à aller chercher.`
      : `Score critique — priorité absolue sur le plan d'action.`;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-7 items-center">
        <div className="relative mx-auto h-[220px] w-[220px]">
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label={`Score ${score} sur 100`}
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="14"
            />
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="#059669"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="font-serif text-[56px] font-medium leading-none text-slate-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              {score}
            </div>
            <div className="mt-1 text-sm text-gray-500">sur 100</div>
          </div>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider ${tonePill}`}
            data-score-tone={badge.tone}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-current"
            />
            {badge.label}
          </span>
          <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-gray-600">
            Votre score (taux de no-show{" "}
            <span className="font-medium text-slate-900">
              {tauxNoshow.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              &nbsp;%
            </span>
            ) est au-dessus de la moyenne du secteur mais en dessous des
            cabinets les mieux gérés (85+). Les 3 leviers ci-dessous peuvent
            faire basculer votre score en zone « excellente » sous 60&nbsp;jours.
          </p>
        </div>
      </div>
    </div>
  );
}
