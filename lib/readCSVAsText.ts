/**
 * Lit un File CSV en texte avec auto-détection UTF-8 / ISO-8859-1.
 *
 * Les exports Doctolib/Julie/Logos sur Windows sont encore souvent en latin1
 * par défaut. On essaie UTF-8 strict d'abord, et si ça throw, on retombe sur
 * latin1 — l'utilisateur n'a pas à se soucier de l'encodage de son logiciel.
 *
 * Pure-fn (hors I/O File). Consommé par `hooks/useCSVPreview.ts` (preview)
 * et `app/audit/page.tsx` (submission).
 */
export async function readCSVAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("iso-8859-1").decode(buffer);
  }
}
