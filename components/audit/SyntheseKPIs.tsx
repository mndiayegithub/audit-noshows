"use client";

import type { AuditStats } from "@/types/audit";
import { CountUpNumber } from "@/components/ui/CountUpNumber";

// NBSP ( ) — French typographic spacing before € and %
const NBSP = " ";

interface KPI {
  chip: string;
  target: number;
  decimals: number;
  suffix: string;
  sublabel: string;
  bg: string;
  fg: string;
}

export default function SyntheseKPIs({ stats }: { stats: AuditStats }) {
  // Rule 1 fix vs. plan snippet: real AuditStats keys live under stats.global
  // stats.global.ca_perdu_an is ALREADY ANNUALIZED by n8n — DO NOT multiply
  const kpis: KPI[] = [
    {
      chip: "Volume",
      target: stats.global.total_rdv,
      decimals: 0,
      suffix: "",
      sublabel: "RDV analysés",
      bg: "bg-kpiVolume",
      fg: "text-kpiVolume-fg",
    },
    {
      chip: "Signal",
      target: stats.global.no_shows,
      decimals: 0,
      suffix: "",
      sublabel: "No-shows",
      bg: "bg-kpiSignal",
      fg: "text-kpiSignal-fg",
    },
    {
      chip: "Taux",
      target: stats.global.taux,
      decimals: 1,
      suffix: `${NBSP}%`,
      sublabel: "Taux de no-show",
      bg: "bg-kpiTaux",
      fg: "text-kpiTaux-fg",
    },
    // NOTE: stats.global.ca_perdu_an is ALREADY ANNUALIZED by n8n — DO NOT multiply
    {
      chip: "Argent",
      target: stats.global.ca_perdu_an,
      decimals: 0,
      suffix: `${NBSP}€`,
      sublabel: "CA perdu estimé",
      bg: "bg-kpiArgent",
      fg: "text-kpiArgent-fg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((k) => (
        <div key={k.chip} className={`rounded-2xl p-5 ${k.bg}`}>
          <div
            className={`mb-3 inline-block rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${k.fg}`}
          >
            {k.chip}
          </div>
          {/* Valeur centrale en slate-900 (demande user) — la couleur sémantique fg reste portée par le chip */}
          <div className="font-serif text-[32px] md:text-[36px] leading-none text-slate-900 break-words">
            <CountUpNumber
              target={k.target}
              decimals={k.decimals}
              suffix={k.suffix}
            />
          </div>
          <div className="mt-2 text-[13px] text-gray-700">{k.sublabel}</div>
        </div>
      ))}
    </div>
  );
}
