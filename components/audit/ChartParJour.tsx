import type { AuditStats } from "@/types/audit";

const DAY_ORDER = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
const DAY_FULL: Record<string, string> = {
  Lun: "lundi",
  Mar: "mardi",
  Mer: "mercredi",
  Jeu: "jeudi",
  Ven: "vendredi",
  Sam: "samedi",
  Dim: "dimanche",
};

function normalizeDayKey(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (s.startsWith("lun")) return "Lun";
  if (s.startsWith("mar")) return "Mar";
  if (s.startsWith("mer")) return "Mer";
  if (s.startsWith("jeu")) return "Jeu";
  if (s.startsWith("ven")) return "Ven";
  if (s.startsWith("sam")) return "Sam";
  if (s.startsWith("dim")) return "Dim";
  return null;
}

export default function ChartParJour({ stats }: { stats: AuditStats }) {
  const raw = stats.par_jour ?? stats.stats_par_jour ?? [];
  const byDay = new Map<string, number>(DAY_ORDER.map((d) => [d, 0]));
  for (const item of raw as Array<{
    jour?: string;
    day?: string;
    count?: number;
    no_shows?: number;
    noShows?: number;
    value?: number;
  }>) {
    const key = normalizeDayKey(item.jour ?? item.day ?? "");
    const value = Number(item.count ?? item.no_shows ?? item.noShows ?? item.value ?? 0);
    if (key && Number.isFinite(value)) byDay.set(key, (byDay.get(key) ?? 0) + value);
  }
  const values = DAY_ORDER.map((d) => byDay.get(d) ?? 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const picIdx = values.indexOf(Math.max(...values));
  const picCount = values[picIdx];
  const picPct = total > 0 ? Math.round((picCount / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="font-fraunces text-lg text-ink">No-shows par jour</h3>
      <p className="mt-1 text-[13px] text-gray-500">Répartition sur la période analysée</p>
      <div
        className="mt-6 flex h-48 items-end gap-3"
        role="img"
        aria-label="Histogramme des no-shows par jour de la semaine"
      >
        {DAY_ORDER.map((d, i) => {
          const v = values[i];
          const h = Math.round((v / max) * 100);
          const isPic = i === picIdx && v > 0;
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <div className="font-fraunces text-[14px] text-ink">{v}</div>
              <div
                className={`w-full rounded-t-md ${isPic ? "bg-[#059669]" : "bg-[#DCF4E6]"}`}
                style={{ height: `${h}%` }}
                aria-label={`${DAY_FULL[d]} : ${v} no-shows`}
              />
              <div className="text-[12px] text-gray-600">{d}</div>
            </div>
          );
        })}
      </div>
      {picCount > 0 && (
        <p className="mt-4 text-[13px] text-gray-700">
          Pic le{" "}
          <span className="font-medium text-[#059669]">{DAY_FULL[DAY_ORDER[picIdx]]}</span> —{" "}
          {picCount} no-shows, soit {picPct}&nbsp;% du total.
        </p>
      )}
    </div>
  );
}
