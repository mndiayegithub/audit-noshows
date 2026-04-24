import type { AuditStats } from "@/types/audit";
import { computeScore, scoreBadge } from "@/lib/score";

/**
 * Section 4 — Score cabinet.
 *
 * Primary-dark hero (bg-[#064E3B]) with a 220px SVG ring (white progress
 * on rgba(255,255,255,0.14) track) + conditional badge.
 *
 * The numeric score and badge label both come from `lib/score.ts` — no
 * formula is duplicated here.
 */
export default function ScoreHero({ stats }: { stats: AuditStats }) {
  const tauxNoshow = stats.global.taux;
  const score = computeScore(tauxNoshow);
  const badge = scoreBadge(score);
  const CIRC = 540.4; // 2π × 86
  const dash = (score / 100) * CIRC;

  const tonePill =
    badge.tone === "good"
      ? "bg-emerald-500/20 text-[#a7f3d0]"
      : badge.tone === "warn"
      ? "bg-amber-500/20 text-[#fde68a]"
      : "bg-rose-500/20 text-[#fecaca]";

  return (
    <div
      className="relative overflow-hidden rounded-[28px] bg-[#064E3B] p-8 md:p-10 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 100% 100%, rgba(16,185,129,0.18), transparent 60%)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8 items-center">
        <div className="relative mx-auto h-[220px] w-[220px]">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            role="img"
            aria-label={`Score ${score} sur 100`}
            className="h-full w-full"
          >
            <circle
              cx="110"
              cy="110"
              r="86"
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="14"
            />
            <circle
              cx="110"
              cy="110"
              r="86"
              fill="none"
              stroke="#ffffff"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              transform="rotate(-90 110 110)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-serif text-[64px] font-medium leading-none tracking-tight text-white">
              {score}
              <span className="font-sans text-base font-normal text-[#a7f3d0]">
                /100
              </span>
            </div>
            <div className="mt-1 text-[13px] text-[#a7f3d0]">sur 100</div>
          </div>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tonePill}`}
            data-score-tone={badge.tone}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-current"
            />
            {badge.label}
          </span>
          <h3 className="mt-3 font-serif text-[28px] md:text-[32px] leading-tight tracking-tight text-white">
            {badge.tone === "good"
              ? `Il reste ${100 - score} points à aller chercher.`
              : badge.tone === "warn"
              ? `Score correct, ${100 - score} points à aller chercher.`
              : `Score critique — priorité absolue sur le plan d'action.`}
          </h3>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#d1fae5]">
            Votre score (taux de no-show{" "}
            <span className="font-medium text-white">
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
