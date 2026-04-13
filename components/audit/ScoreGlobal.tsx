"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { AuditStats, GoogleData } from "@/types/audit";

const BENCHMARK_AVIS = 87;
const CA_MOYEN_PATIENT = 150;

function calcScoreNoShows(taux: number): number {
  if (taux < 4) return 50;
  if (taux < 7) return 30;
  if (taux < 10) return 15;
  return 5;
}

function calcScoreGoogle(rating: number, avis: number): number {
  if (rating >= 4.5 && avis > BENCHMARK_AVIS) return 50;
  if (rating >= 4.0 && avis > BENCHMARK_AVIS * 0.8) return 35;
  if (rating >= 4.0 && avis <= BENCHMARK_AVIS * 0.8) return 20;
  return 10;
}

export function calcRevenusNonCaptesGoogle(avis: number): number {
  if (avis >= BENCHMARK_AVIS) return 0;
  return (BENCHMARK_AVIS - avis) * 4 * CA_MOYEN_PATIENT * 12;
}

interface Props {
  stats: AuditStats;
  googleData: GoogleData | null;
}

export default function ScoreGlobal({ stats, googleData }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const scoreNS = calcScoreNoShows(stats.global.taux);
  const scoreGoogle = googleData ? calcScoreGoogle(googleData.rating, googleData.user_ratings_total) : null;
  const scoreTotal = scoreNS + (scoreGoogle ?? 0);
  const scoreMax = googleData ? 100 : 50;

  const getConfig = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return { label: "Cabinet optimisé",                   color: "#10B981", tw: "text-success",  bgTw: "bg-green-50",  borderTw: "border-success/20"  };
    if (pct >= 50) return { label: "Améliorations possibles",             color: "#F59E0B", tw: "text-warning",  bgTw: "bg-orange-50", borderTw: "border-warning/20"  };
    return              { label: "Risque élevé — action recommandée",   color: "#EF4444", tw: "text-danger",   bgTw: "bg-red-50",    borderTw: "border-danger/20"   };
  };

  const config = getConfig(scoreTotal, scoreMax);

  // SVG arc (270°) — same pattern as existing ScoreCard
  const R = 72, CX = 96, CY = 96;
  const CIRC = 2 * Math.PI * R;
  const ARC = CIRC * 0.75;
  const GAP = CIRC - ARC;
  const progressArc = ARC * (displayed / scoreMax);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Intersection observer — trigger once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Counter animation 0 → scoreTotal
  useEffect(() => {
    if (!visible) return;
    if (reducedMotion) {
      setDisplayed(scoreTotal);
      return;
    }
    let raf: number;
    const start = performance.now();
    const duration = 1400;
    const run = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * scoreTotal));
      if (t < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [visible, scoreTotal, reducedMotion]);

  const caPerduNoShows = stats.global.ca_perdu_an;
  const caPerduGoogle = googleData ? calcRevenusNonCaptesGoogle(googleData.user_ratings_total) : null;
  const impactTotal = caPerduNoShows + (caPerduGoogle ?? 0);

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Header — same style as existing ScoreCard */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Performance globale du cabinet</p>
        <p className="text-xs text-slate-400 hidden sm:block">SCORE COMPLET v2</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        {/* Jauge SVG — même pattern que ScoreCard existant */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <svg width="192" height="192" viewBox="0 0 192 192" aria-label={`Score ${scoreTotal} sur ${scoreMax}`}>
            {/* Track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="14"
              strokeDasharray={`${ARC} ${GAP}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
            {/* Active arc */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={config.color}
              strokeWidth="14"
              strokeDasharray={`${progressArc} ${CIRC - progressArc}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
            {/* Score number */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#0F172A" fontSize="38" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              {displayed}
            </text>
            <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748B" fontSize="15" fontFamily="Plus Jakarta Sans, sans-serif">
              /{scoreMax}
            </text>
          </svg>

          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${config.bgTw} ${config.tw} ${config.borderTw}`}>
            {config.label}
          </span>

          {/* Légende */}
          <div className="flex gap-3 text-xs text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger inline-block" aria-hidden="true" />Risque élevé</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" aria-hidden="true" />Moyen</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" aria-hidden="true" />Optimisé</span>
          </div>
        </div>

        {/* Séparateur vertical */}
        <div className="hidden md:block self-stretch w-px bg-slate-200 mx-2" aria-hidden="true" />

        {/* Détail impact financier */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-danger/10">
            <span className="text-slate-600 font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger inline-block shrink-0" aria-hidden="true" />
              Revenus perdus (no-shows)
            </span>
            <span className="text-danger font-bold text-sm shrink-0 tabular-nums">
              -{caPerduNoShows.toLocaleString("fr-FR")} €/an
            </span>
          </div>

          {caPerduGoogle !== null && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-warning/10">
              <span className="text-slate-600 font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning inline-block shrink-0" aria-hidden="true" />
                Revenus non captés (Google)
              </span>
              <span className="text-warning font-bold text-sm shrink-0 tabular-nums">
                -{caPerduGoogle.toLocaleString("fr-FR")} €/an
              </span>
            </div>
          )}

          {/* Total — même style que le "Potentiel récupérable" du ScoreCard V1 */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-navy text-white">
            <span className="font-semibold text-sm">Impact total estimé</span>
            <span className="font-extrabold text-base tabular-nums">
              -{impactTotal.toLocaleString("fr-FR")} €/an
            </span>
          </div>

          {!googleData && (
            <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary text-sm font-medium">
              Score calculé sur {scoreMax} pts — Complétez l&apos;analyse Google pour voir votre score complet sur 100.
            </div>
          )}
        </div>
      </div>

      {/* Bottom strip — même pattern que V1 "Potentiel récupérable" */}
      <div className="bg-yellow-50 border-t border-yellow-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-yellow-800 text-sm font-semibold">Référence sectorielle</span>
        <span className="text-yellow-700 font-medium text-sm text-center sm:text-right">
          Les cabinets qui ont corrigé ces deux points ont récupéré en moyenne{" "}
          <strong className="text-yellow-900">3 200 € dans les 90 premiers jours.</strong>
        </span>
      </div>
    </motion.div>
  );
}
