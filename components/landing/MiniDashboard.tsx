// components/landing/MiniDashboard.tsx
// Pure DOM mockup — no charts, no data fetching.
// Render preview of the audit dashboard KPI signature inside the hero.

export default function MiniDashboard() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Fake browser bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 text-xs text-slate-500">Tableau de bord</span>
      </div>

      {/* 4 KPI pastels — grille 2x2, sémantique figée */}
      <div className="grid grid-cols-2 gap-3 pt-5">
        <KpiMini bg="bg-kpiVolume" fg="text-kpiVolume-fg" label="RDV analysés" value="2 148" />
        <KpiMini bg="bg-kpiSignal" fg="text-kpiSignal-fg" label="No-shows" value="164" />
        <KpiMini bg="bg-kpiTaux" fg="text-kpiTaux-fg" label="Taux" value="7,6 %" />
        <KpiMini bg="bg-kpiArgent" fg="text-kpiArgent-deep" label="CA perdu / an" value="27 k€" />
      </div>

      {/* Mini bar row émeraude — placeholder graphique, pas de lib */}
      <div className="mt-5 flex items-end gap-1.5 h-16">
        {[40, 65, 48, 78, 55, 70, 42].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-sm bg-accentGreen/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">No-shows par jour — aperçu</p>
    </div>
  );
}

function KpiMini({
  bg, fg, label, value,
}: { bg: string; fg: string; label: string; value: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3`}>
      <div className={`font-serif text-xl ${fg}`}>{value}</div>
      <div className="text-[11px] text-slate-600 mt-0.5">{label}</div>
    </div>
  );
}
