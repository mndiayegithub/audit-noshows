import type { AuditStats } from "@/types/audit";

// NBSP ( ) — French typographic spacing before € and numbers
const NBSP = " ";

const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("fr-FR")}${NBSP}€`;

export default function MoneyBuildCard({ stats }: { stats: AuditStats }) {
  // DO NOT re-multiply stats.global.ca_perdu_an — it is ALREADY ANNUALIZED by n8n
  const noShows = stats.global.no_shows;
  const caMoyen = stats.global.ca_moyen ?? 0;
  const nbMois = stats.periode?.nb_mois ?? 3;
  const pertePeriode = Math.round(noShows * caMoyen);
  const facteur =
    nbMois > 0 ? (12 / nbMois).toFixed(1).replace(".", ",") : "—";

  return (
    <div
      className="relative overflow-hidden rounded-[28px] bg-[#6B21A8] p-10 md:p-12 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(236,205,248,0.28), transparent 55%)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-10 md:gap-12 items-center">
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#e9d5ff]">
            CA perdu / an — extrapolé
          </div>
          {/* font-weight 500 matches sketch 007A Fraunces styling */}
          <div className="font-serif font-medium text-[64px] md:text-[96px] leading-[0.95] tracking-tight">
            {fmtEur(stats.global.ca_perdu_an)}
          </div>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#f3e8ff]">
            Soit l&apos;équivalent de plusieurs semaines de CA qui
            s&apos;évaporent chaque année, faute de process anti no-show.
          </p>
        </div>

        <div className="rounded-[20px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
          <ul className="space-y-5 text-[14px]">
            <li className="flex items-center justify-between">
              <span className="text-white/80">
                No-shows détectés ({nbMois}
                {NBSP}mois)
              </span>
              <span className="font-serif">
                {noShows.toLocaleString("fr-FR")}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-white/80">CA moyen par RDV</span>
              <span className="font-serif">{fmtEur(caMoyen)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-white/80">Perte sur la période</span>
              <span className="font-serif">{fmtEur(pertePeriode)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-white/80">
                Extrapolation 12{NBSP}mois
              </span>
              <span className="font-serif">
                ×{NBSP}
                {facteur}
              </span>
            </li>
            <li className="mt-3 flex items-center justify-between rounded-xl bg-white/15 px-3 py-2.5 border-t border-white/25">
              <span className="font-medium text-white">
                Total CA perdu annualisé
              </span>
              {/* stats.global.ca_perdu_an VERBATIM — no * 12, no * (12/nb_mois) */}
              <span className="font-serif text-lg">
                {fmtEur(stats.global.ca_perdu_an)}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
