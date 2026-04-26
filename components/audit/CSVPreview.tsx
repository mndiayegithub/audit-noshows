"use client";
/**
 * <CSVPreview> — Phase 7 Plan 07-03 / D-02 (preview inline qui remplace la dropzone).
 *
 * États rendus :
 *  - loading : skeleton 3 lignes + texte "Lecture du fichier..."
 *  - ready   : eyebrow + titre Fraunces + bandeau métriques (totalRows /
 *              nbRdvValides / recoRate %), badges colonnes (vert pour
 *              `date`/`statut` reconnues), mini table 3 lignes,
 *              boutons "Continuer" (primaryDark) / "Changer de fichier".
 *  - error   : `null` — c'est <CSVErrorCard> (Plan 07-06) qui prend la main.
 *              Le composant invoque `onError(err)` une fois pour signaler.
 *
 * Palette : clinique-claire (primary #064E3B = `bg-primaryDark`,
 * KPI tokens kpiTaux/kpiSignal). Typo : Fraunces (font-serif) titres,
 * Inter (font-sans default) corps.
 */
import { useEffect, useRef } from "react";
import { useCSVPreview } from "@/hooks/useCSVPreview";

export interface CSVPreviewSnapshot {
  recoRate: number;
  ignoredCount: number;
  totalRows: number;
  degraded: boolean;
  willReject: boolean;
}

export interface CSVPreviewProps {
  file: File;
  /** Parent décide de POST direct OU d&apos;ouvrir le DegradedConfirmDialog. */
  onContinue: (degraded: boolean) => void;
  /** Réinitialise la sélection (retour à la dropzone). */
  onCancel: () => void;
  /** Remontée de l&apos;erreur structurée vers le parent (qui affiche <CSVErrorCard>). */
  onError: (err: {
    error_code: string;
    error: string;
    details?: Record<string, unknown>;
  }) => void;
  /** Plan 07-05 — remonte les métriques calculées dès que le preview est prêt. */
  onReady?: (snapshot: CSVPreviewSnapshot) => void;
}

const RECOGNIZED_HEADERS = /^(date|jour|date_rdv|date du rendez-vous|statut|status|état|etat)$/i;

export function CSVPreview({
  file,
  onContinue,
  onCancel,
  onError,
  onReady,
}: CSVPreviewProps) {
  const { status, result } = useCSVPreview(file);

  // Remonter l'erreur au parent une seule fois (pas à chaque render).
  const errorReported = useRef(false);
  useEffect(() => {
    if (status === "error" && result && !result.ok && !errorReported.current) {
      errorReported.current = true;
      onError(result.error);
    }
    if (status !== "error") {
      errorReported.current = false;
    }
  }, [status, result, onError]);

  // Plan 07-05 — remonter le snapshot une seule fois lorsqu'il devient ready.
  const readyReported = useRef(false);
  useEffect(() => {
    if (status === "ready" && result && result.ok && !readyReported.current) {
      readyReported.current = true;
      const { recoRate, totalRows, nbRdvValides, degraded, willReject } = result.preview;
      onReady?.({
        recoRate,
        totalRows,
        ignoredCount: Math.max(0, totalRows - nbRdvValides),
        degraded,
        willReject,
      });
    }
    if (status !== "ready") {
      readyReported.current = false;
    }
  }, [status, result, onReady]);

  if (status === "idle" || status === "loading") {
    return (
      <section
        aria-busy="true"
        aria-label="Lecture du fichier en cours"
        className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">
          Aperçu
        </p>
        <p className="font-serif text-xl text-slate-900 mb-6">
          Lecture du fichier...
        </p>
        <div className="space-y-3">
          <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
        </div>
      </section>
    );
  }

  // status === "error" → null (parent affiche <CSVErrorCard>)
  if (status === "error" || !result || !result.ok) {
    return null;
  }

  const { columns, sampleRows, totalRows, nbRdvValides, recoRate, degraded, willReject } =
    result.preview;
  const recoPct = Math.round(recoRate * 100);

  return (
    <section
      aria-label="Aperçu du fichier CSV"
      className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
    >
      {/* Header */}
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">
          Aperçu
        </p>
        <h2 className="font-serif text-2xl md:text-3xl text-slate-900 tracking-tight">
          Vérifiez ce que nous avons compris
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Avant de lancer l&apos;audit, validez les colonnes détectées et l&apos;échantillon de lignes.
        </p>
      </header>

      {/* Bandeau métriques */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-2 rounded-lg bg-kpiVolume px-3 py-2 text-sm font-medium text-kpiVolume-fg">
          <span className="font-semibold">{totalRows}</span> RDV
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-kpiSignal px-3 py-2 text-sm font-medium text-kpiSignal-fg">
          <span className="font-semibold">{nbRdvValides}</span> reconnus
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-kpiTaux px-3 py-2 text-sm font-medium text-kpiTaux-fg">
          <span className="font-semibold">{recoPct} %</span> taux
        </span>
        {degraded ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-kpiTaux px-3 py-2 text-xs font-semibold uppercase tracking-wide text-kpiTaux-fg">
            Mode dégradé
          </span>
        ) : null}
        {willReject ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Sous le seuil minimum
          </span>
        ) : null}
      </div>

      {/* Badges colonnes */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Colonnes détectées
        </p>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => {
            const recognized = RECOGNIZED_HEADERS.test(col);
            return (
              <span
                key={col}
                className={
                  recognized
                    ? "bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium"
                    : "bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-xs"
                }
              >
                {col}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mini table 3 lignes */}
      <div className="mb-8 overflow-x-auto">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Aperçu (3 premières lignes)
        </p>
        <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-semibold border-b border-slate-200"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row, idx) => (
              <tr key={idx} className="text-sm text-slate-700">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 border-b border-slate-100 last:border-b-0"
                  >
                    {(row[col] ?? "").toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 px-4 py-3 text-sm font-medium transition-colors"
        >
          Changer de fichier
        </button>
        <button
          type="button"
          onClick={() => onContinue(degraded)}
          disabled={willReject}
          className="bg-primaryDark hover:bg-[#053b2d] text-white px-6 py-3 rounded-lg font-medium text-sm transition-shadow hover:shadow-cta disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
        >
          Continuer
        </button>
      </div>
    </section>
  );
}

export default CSVPreview;
