import type { AuditStats } from "@/types/audit";

const SLOTS = ["8–10h", "10–12h", "14–16h", "16–18h", "18–20h"] as const;

function matchSlot(raw: string): string | null {
  const s = raw.replace(/\s/g, "").toLowerCase();
  for (const slot of SLOTS) {
    const key = slot.replace(/\s/g, "").toLowerCase();
    if (
      s.includes(key.replace("–", "-")) ||
      s.includes(key.replace("–", "")) ||
      s === key
    ) {
      return slot;
    }
  }
  // loose match by first number
  const m = s.match(/(\d{1,2})/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 8 && n < 10) return "8–10h";
    if (n >= 10 && n < 12) return "10–12h";
    if (n >= 14 && n < 16) return "14–16h";
    if (n >= 16 && n < 18) return "16–18h";
    if (n >= 18 && n < 20) return "18–20h";
  }
  return null;
}

export default function ChartParHeure({ stats }: { stats: AuditStats }) {
  const raw = (
    stats as {
      par_heure?: Array<{
        tranche?: string;
        slot?: string;
        heure?: string;
        count?: number;
        no_shows?: number;
        noShows?: number;
        value?: number;
      }>;
    }
  ).par_heure;

  if (!raw || raw.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-center">
        <h3 className="font-serif text-lg text-ink">Par tranche horaire</h3>
        <p className="mt-6 text-[13px] text-gray-500">Données horaires non disponibles</p>
        <p className="mt-1 text-[12px] text-gray-400">
          Nécessite l&apos;extension n8n Phase 3
        </p>
      </div>
    );
  }

  const bySlot = new Map<string, number>(SLOTS.map((s) => [s, 0]));
  for (const item of raw) {
    const key = matchSlot(item.tranche ?? item.slot ?? item.heure ?? "");
    const value = Number(
      item.count ?? item.no_shows ?? item.noShows ?? item.value ?? 0
    );
    if (key && Number.isFinite(value)) bySlot.set(key, (bySlot.get(key) ?? 0) + value);
  }
  const values = SLOTS.map((s) => bySlot.get(s) ?? 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const picIdx = values.indexOf(Math.max(...values));
  const picSlot = SLOTS[picIdx];
  const picPct = total > 0 ? Math.round((values[picIdx] / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="font-serif text-lg text-ink">Par tranche horaire</h3>
      <p className="mt-1 text-[13px] text-gray-500">Répartition horaire des no-shows</p>
      <div
        className="mt-6 flex gap-3"
        role="img"
        aria-label="Histogramme des no-shows par tranche horaire"
      >
        {SLOTS.map((s, i) => {
          const v = values[i];
          const h = Math.round((v / max) * 100);
          const isPic = i === picIdx && v > 0;
          return (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className="font-serif text-[14px] text-ink">{v}</div>
              <div className="flex h-40 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${isPic ? "bg-[#EA580C]" : "bg-[#FCEACC]"}`}
                  style={{ height: `${h}%` }}
                  aria-label={`${s} : ${v} no-shows`}
                />
              </div>
              <div className="text-[12px] text-gray-600">{s}</div>
            </div>
          );
        })}
      </div>
      {values[picIdx] > 0 && (
        <p className="mt-4 text-[13px] text-gray-700">
          Créneau critique{" "}
          <span className="font-medium text-[#EA580C]">{picSlot}</span> — {picPct}&nbsp;% des
          no-shows.
        </p>
      )}
    </div>
  );
}
