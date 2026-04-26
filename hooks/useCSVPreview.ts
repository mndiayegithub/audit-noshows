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
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      const r = parseCSVForPreview(text);
      setResult(r);
      setStatus(r.ok ? "ready" : "error");
    };
    reader.onerror = () => {
      setResult({
        ok: false,
        error: {
          error_code: "ENCODING_ERROR",
          error:
            "Impossible de lire le fichier (encodage non supporté). Réenregistrez en UTF-8.",
        },
      });
      setStatus("error");
    };
    reader.readAsText(file, "utf-8");
  }, [file]);

  return { status, result };
}
