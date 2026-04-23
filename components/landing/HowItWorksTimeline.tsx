// components/landing/HowItWorksTimeline.tsx
// RSC — pure DOM. Tricolor sémantique fixe: Volume → Signal → Taux.

const STEPS: { n: string; title: string; body: string; bg: string; fg: string }[] = [
  {
    n: "1",
    title: "Chargez votre export Doctolib",
    body: "Glissez votre CSV — nous supportons tous les exports standard.",
    bg: "bg-kpiVolume",
    fg: "text-kpiVolume-fg",
  },
  {
    n: "2",
    title: "On analyse vos no-shows",
    body: "Détection des créneaux à risque, des jours critiques et des motifs récurrents.",
    bg: "bg-kpiSignal",
    fg: "text-kpiSignal-fg",
  },
  {
    n: "3",
    title: "Recevez votre rapport",
    body: "Taux, CA perdu annualisé, graphiques et plan d'action — prêt en 60 secondes.",
    bg: "bg-kpiTaux",
    fg: "text-kpiTaux-fg",
  },
];

export default function HowItWorksTimeline() {
  return (
    <section id="comment-ca-marche" className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-sm font-medium text-accentGreen">Comment ça marche</p>
      <h2 className="mt-2 font-serif text-3xl text-slate-900 md:text-4xl">
        Trois étapes, zéro inscription.
      </h2>

      <ol className="relative mt-12 space-y-10">
        {/* connector vertical — aligné sur le centre des pastilles (20px depuis la gauche) */}
        <span
          aria-hidden
          className="absolute left-5 top-5 bottom-5 w-px bg-gray-200"
        />

        {STEPS.map((s) => (
          <li key={s.n} className="relative flex gap-5">
            <span
              className={`relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full ${s.bg} ${s.fg} font-serif text-lg`}
            >
              {s.n}
            </span>
            <div>
              <div className="font-medium text-slate-900">{s.title}</div>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
