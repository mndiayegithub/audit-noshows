// components/landing/StatsBar.tsx
// RSC — pure DOM, no client hooks.

const STATS: { value: string; label: string }[] = [
  { value: "8 %", label: "Taux de no-shows moyen secteur dentaire" },
  { value: "27 k€", label: "Manque à gagner annuel cabinet moyen" },
  { value: "3 min", label: "Temps pour recevoir votre audit" },
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
            <div className="font-serif text-4xl text-primaryDark md:text-5xl">{s.value}</div>
            <div className="mt-2 text-sm text-slate-600">{s.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
