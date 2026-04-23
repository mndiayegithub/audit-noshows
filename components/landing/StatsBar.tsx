// components/landing/StatsBar.tsx
// RSC wrapper — number cells use the client CountUpNumber component.

import { CountUpNumber } from "@/components/ui/CountUpNumber";

type Stat = {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
};

const STATS: Stat[] = [
  { target: 8, suffix: " %", label: "Taux de no-shows moyen secteur dentaire" },
  { target: 27, suffix: " k€", label: "Manque à gagner annuel cabinet moyen" },
  { target: 3, suffix: " min", label: "Temps pour recevoir votre audit" },
];

export default function StatsBar() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <ul className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-3">
        {STATS.map((s, i) => (
          <li
            key={s.label}
            className={[
              "px-8 py-10 text-center",
              i < STATS.length - 1 ? "md:border-r md:border-gray-200" : "",
            ].join(" ")}
          >
            <div className="font-serif text-4xl text-primaryDark md:text-5xl tabular-nums">
              <CountUpNumber
                target={s.target}
                decimals={s.decimals ?? 0}
                prefix={s.prefix}
                suffix={s.suffix}
              />
            </div>
            <div className="mt-2 text-sm text-slate-600">{s.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
