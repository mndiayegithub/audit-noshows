"use client";
import type { AuditStats } from "@/types/audit";
import AuditSidebar from "./AuditSidebar";
import AuditSection from "./AuditSection";
import SyntheseKPIs from "./SyntheseKPIs";
import MoneyBuildCard from "./MoneyBuildCard";
import ChartParJour from "./ChartParJour";
import ChartParHeure from "./ChartParHeure";
import ScoreHero from "./ScoreHero";
import PlanTimeline from "./PlanTimeline";
import CalendlyEmbed from "./CalendlyEmbed";

interface AuditDashboardProps {
  stats: AuditStats;
  rapport: string;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
}

/**
 * Dashboard shell orchestrator: sidebar + 5 scroll-anchored section slots.
 * Section bodies are placeholders — Wave 3 (plans 02-03/04/05) replaces them.
 */
export default function AuditDashboard({
  stats,
  rapport,
  onDownloadPDF,
  isGeneratingPDF,
}: AuditDashboardProps) {
  return (
    <div className="min-h-screen">
      <AuditSidebar stats={stats} />
      <main className="md:ml-[240px] w-full max-w-none px-6 lg:px-10 pb-20">
        <AuditSection
          id="synthese"
          title="Synthèse"
          index={1}
        >
          <SyntheseKPIs stats={stats} />
        </AuditSection>
        <AuditSection
          id="manque-a-gagner"
          title="Manque à gagner annuel"
          index={2}
          lede="CA perdu sur la période analysée, extrapolé sur 12 mois — valeur annualisée renvoyée par l'analyse."
        >
          <MoneyBuildCard stats={stats} />
        </AuditSection>
        <AuditSection
          id="ou-et-quand"
          title="Où & quand vos no-shows apparaissent"
          index={3}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartParJour stats={stats} />
            <ChartParHeure stats={stats} />
          </div>
        </AuditSection>
        <AuditSection
          id="score"
          title="Score cabinet"
          index={4}
        >
          <ScoreHero stats={stats} />
        </AuditSection>
        <AuditSection
          id="plan-et-cta"
          title="Plan d'action"
          index={5}
        >
          <div className="space-y-6">
            <PlanTimeline />
            <CalendlyEmbed onDownloadPDF={onDownloadPDF} />
            {onDownloadPDF && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center gap-2 rounded-full bg-[#064E3B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#053f31] disabled:opacity-60 disabled:cursor-wait"
                >
                  {isGeneratingPDF ? "Génération du PDF…" : "Télécharger le rapport PDF"}
                </button>
              </div>
            )}
            {rapport && (
              <details className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                <summary className="cursor-pointer font-medium">
                  Rapport détaillé
                </summary>
                <div className="mt-3 whitespace-pre-wrap">{rapport}</div>
              </details>
            )}
          </div>
        </AuditSection>
      </main>
    </div>
  );
}
