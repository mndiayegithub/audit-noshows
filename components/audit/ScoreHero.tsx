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
      <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-8 items-center">
        <div className="flex items-center justify-center">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            role="img"
            aria-label={`Score ${score} sur 100`}
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
            <text
              x="110"
              y="108"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
              fontSize="64"
              fill="#ffffff"
            >
              {score}
            </text>
            <text
              x="110"
              y="142"
              textAnchor="middle"
              fontSize="13"
              fill="#a7f3d0"
            >
              sur 100
            </text>
          </svg>
        </div>
        <div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${tonePill}`}
            data-score-tone={badge.tone}
          >
            {badge.label}
          </span>
          <h3 className="mt-3 font-serif text-2xl md:text-[26px] text-white">
            Score cabinet
          </h3>
          <p className="mt-2 max-w-lg text-[15px] text-[#d1fae5]">
            Score calculé à partir de votre taux de no-show (
            <span className="font-medium text-white">
              {tauxNoshow.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              &nbsp;%
            </span>
            ). Plus le score est haut, plus votre cabinet est résilient aux
            no-shows.
          </p>
        </div>
      </div>
    </div>
  );
}
