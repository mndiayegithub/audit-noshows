"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { mapErrorToCard } from "@/lib/mapErrorToCard";
import type { AuditErrorCode } from "@/types/audit-errors";
import { trackCsvRejected } from "@/lib/analytics";

const KNOWN_ERROR_CODES = new Set<AuditErrorCode>([
  "MISSING_COLUMNS",
  "INVALID_DATE_FORMAT",
  "EMPTY_AFTER_PARSING",
  "ENCODING_ERROR",
  "INSUFFICIENT_DATA",
]);

export interface CSVErrorCardProps {
  error: {
    error_code: AuditErrorCode | string;
    error?: string;
    details?: Record<string, unknown>;
  };
  onRetry: () => void;
}

/**
 * Carte d&apos;erreur inline (D-05) — REQ #2 frontend (Plan 07-06).
 * Affiche titre + hint mappés depuis AuditErrorCode + bouton ghost de retry.
 * Style verrouillé : palette amber/slate, pas de modal, bouton ghost (pas primary).
 */
export default function CSVErrorCard({ error, onRetry }: CSVErrorCardProps) {
  const { title, hint } = mapErrorToCard(error.error_code, error.details);

  // Phase 9 — csv_rejected (R2 event 5). Émis au mount ; ne fire qu'une seule
  // fois par error_code distinct (deps `error.error_code`). Si le code n'est
  // pas dans l'union AuditErrorCode (cas serveur ajoute un nouveau code), on
  // skip pour respecter la signature stricte du helper.
  useEffect(() => {
    const code = error.error_code;
    if (typeof code === "string" && KNOWN_ERROR_CODES.has(code as AuditErrorCode)) {
      trackCsvRejected(code as AuditErrorCode);
    }
  }, [error.error_code]);
  return (
    <section
      role="alert"
      aria-live="polite"
      className="rounded-xl border border-amber-200 bg-amber-50/60 p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
          <AlertTriangle
            className="h-5 w-5 text-amber-700"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            {title}
          </h3>
          {error.error && (
            <p className="mt-1 text-sm text-slate-700">{error.error}</p>
          )}
          <p className="mt-2 text-sm text-slate-600">{hint}</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Choisir un autre fichier
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
