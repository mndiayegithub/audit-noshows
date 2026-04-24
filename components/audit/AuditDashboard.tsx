"use client";
import type { AuditStats } from "@/types/audit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
      <main className="md:ml-[240px] w-full max-w-none px-4 md:px-5 lg:px-6 pb-20">
        <div className="flex items-center justify-between gap-4 py-6 mb-2 border-b border-gray-200">
          <div className="text-sm text-slate-500">
            Rapport <span className="mx-1 text-slate-300">·</span>
            <span className="font-semibold text-slate-900">Synthèse</span>
          </div>
          {onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-wait"
            >
              {isGeneratingPDF ? "Génération…" : "Télécharger PDF"}
            </button>
          )}
        </div>
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
            {rapport && (
              <details className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-slate-700">
                <summary className="cursor-pointer font-semibold text-slate-900">
                  Rapport détaillé
                </summary>
                <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h3 className="font-serif text-lg font-semibold text-slate-900 mt-5 mb-2">{children}</h3>
                      ),
                      h2: ({ children }) => (
                        <h4 className="font-serif text-base font-semibold text-slate-900 mt-4 mb-1.5">{children}</h4>
                      ),
                      h3: ({ children }) => (
                        <h5 className="text-sm font-semibold text-slate-900 mt-3 mb-1">{children}</h5>
                      ),
                      p: ({ children }) => <p className="text-slate-700">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-700 marker:text-slate-400">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {rapport}
                  </ReactMarkdown>
                </div>
              </details>
            )}
          </div>
        </AuditSection>
      </main>
    </div>
  );
}
