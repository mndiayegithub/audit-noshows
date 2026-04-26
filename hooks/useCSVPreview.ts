"use client";
/**
 * Hook React qui encapsule l'I/O fichier (FileReader) + le parsing pur
 * `parseCSVForPreview()`. Phase 7 Plan 07-03.
 *
 * Le composant `<CSVPreview>` consomme ce hook : lui passe le `File`,
 * obtient { status, result }. Erreurs FileReader → ENCODING_ERROR
 * (cf. D-05 mapping code → titre/hint).
 */
import { useEffect, useState } from "react";
import {
  parseCSVForPreview,
  type CSVPreviewResult,
} from "@/lib/parseCSVForPreview";
import { readCSVAsText } from "@/lib/readCSVAsText";
import { trackCsvPreviewLoaded } from "@/lib/analytics";

export type CSVPreviewStatus = "idle" | "loading" | "ready" | "error";

export function useCSVPreview(file: File | null): {
  status: CSVPreviewStatus;
  result: CSVPreviewResult | null;
} {
  const [status, setStatus] = useState<CSVPreviewStatus>("idle");
  const [result, setResult] = useState<CSVPreviewResult | null>(null);

  useEffect(() => {
    if (!file) {
      setStatus("idle");
      setResult(null);
      return;
    }
    setStatus("loading");
    readCSVAsText(file)
      .then((text) => {
        const r = parseCSVForPreview(text);
        setResult(r);
        setStatus(r.ok ? "ready" : "error");
        // Phase 9 — csv_preview_loaded (R2 event 4). Fail-soft : skip si NaN.
        if (r.ok) {
          const nbRdv = r.preview.nbRdvValides;
          const recoRate = r.preview.recoRate;
          if (
            typeof nbRdv === "number" &&
            Number.isFinite(nbRdv) &&
            typeof recoRate === "number" &&
            Number.isFinite(recoRate)
          ) {
            trackCsvPreviewLoaded(nbRdv, recoRate);
          }
        }
      })
      .catch(() => {
        setResult({
          ok: false,
          error: {
            error_code: "ENCODING_ERROR",
            error:
              "Impossible de lire le fichier. Vérifiez qu'il s'agit bien d'un CSV valide.",
          },
        });
        setStatus("error");
      });
  }, [file]);

  return { status, result };
}
