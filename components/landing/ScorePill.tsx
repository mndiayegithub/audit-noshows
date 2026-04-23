// components/landing/ScorePill.tsx
// RSC — pure SVG, no Chart.js.

export default function ScorePill() {
  const score = 72;
  const max = 100;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / max) * circumference;

  return (
    <div className="inline-flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#064E3B"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 40 40)"
        />
        <text
          x="40"
          y="46"
          textAnchor="middle"
          fontFamily="var(--font-fraunces)"
          fontSize="20"
          fill="#064E3B"
          fontWeight="600"
        >
          {score}
        </text>
      </svg>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">Score cabinet</div>
        <div className="font-serif text-2xl text-slate-900">{score}/{max}</div>
      </div>
    </div>
  );
}
