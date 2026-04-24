"use client";
import { useScrollSpy } from "./useScrollSpy";
import type { AuditStats } from "@/types/audit";

const LINKS = [
  { id: "synthese", label: "Synthèse" },
  { id: "manque-a-gagner", label: "Manque à gagner" },
  { id: "ou-et-quand", label: "Où & Quand" },
  { id: "score", label: "Score cabinet" },
  { id: "plan-et-cta", label: "Plan d'action" },
] as const;

export default function AuditSidebar({ stats }: { stats: AuditStats }) {
  const active = useScrollSpy(LINKS.map((l) => l.id));

  const periodeLabel = stats.periode
    ? `${stats.periode.nb_mois} mois`
    : null;

  return (
    <>
      {/* Desktop sidebar >= md */}
      <aside
        data-audit-sidebar
        className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] flex-col border-r border-gray-200 bg-white px-5 py-6 z-20"
      >
        <div className="mb-6">
          <span className="font-serif text-lg font-semibold text-[#064E3B]">
            GetLostRevenue
          </span>
        </div>
        {/* Cabinet info — sketch 005 variant C :
             - nom en Fraunces semi-bold
             - lignes méta : libellé (k) regular gris / valeur (v) bold slate-900 */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="font-serif text-base font-semibold text-slate-900">
            {stats.nom_cabinet ?? "Cabinet"}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">Généré le</span>
            <span className="font-semibold text-slate-900">
              {new Date().toLocaleDateString("fr-FR")}
            </span>
          </div>
          {periodeLabel && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-500">Période</span>
              <span className="font-semibold text-slate-900">
                {periodeLabel}
              </span>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">RDV analysés</span>
            <span className="font-semibold text-slate-900">
              {stats.global.total_rdv.toLocaleString("fr-FR")}
            </span>
          </div>
        </div>
        <nav aria-label="Sections du rapport" className="flex-1">
          <ul className="space-y-1">
            {LINKS.map((l, i) => {
              const isActive = active === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#064E3B] ${
                      isActive
                        ? "bg-emerald-50 text-[#064E3B] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[#064E3B]"
                      />
                    )}
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold tabular-nums text-slate-900"
                    >
                      {i + 1}.
                    </span>
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* CTA block — matches sketch 005 variant C (headline + sub + white button on primary-dark) */}
        <div className="mt-4 rounded-xl bg-[#064E3B] p-4 text-white shadow-cta">
          <p className="font-serif text-sm font-semibold leading-tight">
            Réservez 30 min
          </p>
          <p className="mt-1 text-[11px] leading-snug text-emerald-100">
            Un expert vous aide à mettre en place le plan.
          </p>
          <a
            href="#plan-et-cta"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[#064E3B] transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Prendre RDV
          </a>
        </div>
      </aside>

      {/* Mobile sticky top bar < md */}
      <div className="md:hidden sticky top-0 z-20 flex items-center gap-2 border-b border-gray-200 bg-white/95 backdrop-blur px-3 py-2">
        <nav
          aria-label="Sections du rapport"
          className="flex-1 overflow-x-auto"
        >
          <ul className="flex gap-2 min-w-max">
            {LINKS.map((l, i) => {
              const isActive = active === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#064E3B] ${
                      isActive
                        ? "border-[#064E3B] bg-emerald-50 text-[#064E3B] font-medium"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="font-semibold tabular-nums text-slate-900"
                    >
                      {i + 1}.
                    </span>
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <a
          href="#plan-et-cta"
          aria-label="Prendre RDV"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064E3B] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </a>
      </div>
    </>
  );
}
