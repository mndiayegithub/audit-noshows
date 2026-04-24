/**
 * Section 5 — Calendly embed (bottom of plan-et-cta).
 *
 * Lit `process.env.NEXT_PUBLIC_CALENDLY_URL` :
 *   - Si défini → iframe (360px, loading="lazy") + bouton "Voir plus de créneaux"
 *   - Sinon     → placeholder vert-sapin (bg-[#064E3B]) "Configuration Calendly
 *                 en cours" — jamais d'écran vide.
 */
export default function CalendlyEmbed() {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL;

  return (
    <div className="rounded-3xl border border-[#064E3B]/30 bg-white p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#064E3B]">
            Prendre rendez-vous
          </div>
          <h3 className="mt-1 font-serif text-2xl text-ink">
            30 minutes pour activer votre plan.
          </h3>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#064E3B]"
          >
            Voir plus de créneaux
          </a>
        )}
      </div>

      {url ? (
        <iframe
          src={url}
          width="100%"
          height={360}
          frameBorder={0}
          loading="lazy"
          title="Calendly — prise de rendez-vous"
          className="rounded-xl"
        />
      ) : (
        <div className="flex h-[360px] flex-col items-center justify-center rounded-xl bg-[#064E3B] text-white">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <p className="mt-3 font-serif text-lg">
            Configuration Calendly en cours
          </p>
          <p className="mt-1 text-[13px] text-white/80">
            Contactez-nous directement pour planifier votre session.
          </p>
        </div>
      )}

      <p className="mt-4 text-[12px] text-gray-500">
        Durée 30&nbsp;min · visio Google Meet · sans engagement
      </p>
    </div>
  );
}
