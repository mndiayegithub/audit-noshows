"use client";

/**
 * Section 5 — CTA band (sketch 009 variante A).
 *
 * Variante A n'a PAS d'iframe Calendly — elle a un bandeau dark
 * (`bg-[#064E3B]`) placé après les 3 cards de plan d'action, avec 2 boutons :
 *   - Primaire blanc « Prendre rendez-vous » (ouvre Calendly si
 *     `NEXT_PUBLIC_CALENDLY_URL` défini, sinon aucun href)
 *   - Ghost `border-white/30` « Ou m'envoyer le PDF » (délègue à la prop
 *     `onDownloadPDF` si fournie par le parent `AuditDashboard`)
 *
 * Le nom du composant reste `CalendlyEmbed` pour éviter un rename qui
 * casserait l'import côté `AuditDashboard`.
 */
interface CalendlyEmbedProps {
  onDownloadPDF?: () => void;
}

export default function CalendlyEmbed({ onDownloadPDF }: CalendlyEmbedProps) {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL;

  return (
    <div className="rounded-[24px] bg-[#064E3B] p-10 text-white md:p-12">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-white/70">
        Prochaine étape
      </div>
      <h3 className="mt-2 font-serif text-[26px] font-medium leading-tight tracking-tight text-white md:text-[32px]">
        Passons en revue votre plan ensemble — 30&nbsp;minutes.
      </h3>
      <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-white/80">
        Un diagnostic personnalisé et la feuille de route sur-mesure pour
        activer ces 3 leviers dans votre cabinet. Sans engagement.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-[#064E3B] transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Prendre rendez-vous
          </a>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-[#064E3B] transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Prendre rendez-vous
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadPDF}
          className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          Ou m&apos;envoyer le PDF
        </button>
      </div>
    </div>
  );
}
