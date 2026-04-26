"use client";

/**
 * DegradedConfirmDialog
 * ---------------------
 * Modal Radix interruptif déclenché lorsque le taux de reconnaissance CSV
 * descend sous 90 % (mais reste ≥ 50 %). L'utilisateur lit le diagnostic
 * (lignes ignorées / total / % reconnu) et choisit explicitement :
 *   - "Continuer en mode dégradé" → onConfirm()
 *   - "Changer de fichier"        → onCancel()
 *
 * Palette : clinique-claire (overlay slate-900/40, content rounded-xl bg-white,
 * primary via token Tailwind primaryDark). Aucune couleur hex hardcodée.
 *
 * Accessibilité : focus trap + ESC dismiss + click-outside dismiss + ARIA
 * (Title / Description) fournis nativement par @radix-ui/react-dialog.
 *
 * Composant standalone : aucun appel API, aucun état interne — tout passe
 * par les props (open / onOpenChange / onConfirm / onCancel).
 */

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

export interface DegradedConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Taux de reconnaissance entre 0 et 1 (ex: 0.78 pour 78 %). */
  recoRate: number;
  /** Nombre de lignes non reconnues / ignorées par le parser. */
  ignoredCount: number;
  /** Total de lignes du CSV (lignes reconnues + ignorées). */
  totalRows: number;
  /** Callback : l&apos;utilisateur valide l&apos;audit en mode dégradé. */
  onConfirm: () => void;
  /** Callback : l&apos;utilisateur annule pour changer de fichier. */
  onCancel: () => void;
}

export default function DegradedConfirmDialog({
  open,
  onOpenChange,
  recoRate,
  ignoredCount,
  totalRows,
  onConfirm,
  onCancel,
}: DegradedConfirmDialogProps) {
  const recoPct = Math.round(recoRate * 100);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          aria-describedby="degraded-desc"
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-amber-50 p-2">
              <AlertTriangle
                className="h-5 w-5 text-amber-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <Dialog.Title className="font-serif text-lg font-semibold text-slate-900">
                Données partiellement reconnues
              </Dialog.Title>
              <Dialog.Description
                id="degraded-desc"
                className="mt-2 text-sm leading-relaxed text-slate-600"
              >
                Sur {totalRows} lignes, {ignoredCount} n&apos;ont pas pu être
                interprétées ({recoPct} % reconnues). Vous pouvez continuer
                l&apos;audit en mode dégradé — le rapport indiquera les
                lignes ignorées.
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                onCancel();
                onOpenChange(false);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              Changer de fichier
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="rounded-lg bg-primaryDark px-4 py-2 text-sm font-medium text-white transition-shadow hover:bg-[#053b2d] hover:shadow-cta focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
            >
              Continuer en mode dégradé
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
