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
}

/**
 * Dashboard shell orchestrator: sidebar + 5 scroll-anchored section slots.
 * Section bodies are placeholders — Wave 3 (plans 02-03/04/05) replaces them.
 */
export default function AuditDashboard({
  stats,
  rapport,
}: AuditDashboardProps) {
  return (
    <div className="min-h-screen">
      <AuditSidebar stats={stats} />
      <main className="md:ml-[240px] px-4 md:px-10 pb-20">
        <AuditSection
          id="synthese"
          eyebrow="Synthèse"
          eyebrowColor="text-kpiVolume-fg"
          title="Synthèse"
        >
          <SyntheseKPIs stats={stats} />
        </AuditSection>
        <AuditSection
          id="manque-a-gagner"
          eyebrow="Manque à gagner"
          eyebrowColor="text-kpiArgent-fg"
          title="Manque à gagner"
          lede="CA perdu sur la période analysée, extrapolé sur 12 mois — valeur annualisée renvoyée par l'analyse."
        >
          <MoneyBuildCard stats={stats} />
        </AuditSection>
        <AuditSection
          id="ou-et-quand"
          eyebrow="Où & Quand"
          eyebrowColor="text-kpiSignal-fg"
          title="Où & Quand"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartParJour stats={stats} />
            <ChartParHeure stats={stats} />
          </div>
        </AuditSection>
        <AuditSection
          id="score"
          eyebrow="Score cabinet"
          eyebrowColor="text-[#064E3B]"
          title="Score cabinet"
        >
          <ScoreHero stats={stats} />
        </AuditSection>
        <AuditSection
          id="plan-et-cta"
          eyebrow="Plan d'action"
          eyebrowColor="text-kpiTaux-fg"
          title="Plan d'action"
        >
          <div className="space-y-6">
            <PlanTimeline />
            <CalendlyEmbed />
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
