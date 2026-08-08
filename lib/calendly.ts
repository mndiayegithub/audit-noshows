/**
 * Construction des liens Calendly sortants, avec paramètres UTM.
 *
 * Pourquoi : `cta_calendly_click` compte les clics, mais un clic n'est pas un
 * rendez-vous. Les `utm_*` posés ici sont restitués par Calendly avec chaque
 * réservation — c'est le seul moyen de passer de « 40 clics » à « 40 clics,
 * 3 RDV, dont 2 venus du bandeau de résultats ».
 *
 * À savoir : ces paramètres partent sur des liens SORTANTS. Vercel Analytics
 * ne les verra jamais (il ne mesure que l'entrant) — ils se lisent côté
 * Calendly uniquement.
 *
 * Convention alignée sur le site vitrine (perfiamatic-website), pour que les
 * deux sites s'agrègent dans Calendly :
 *   - `utm_campaign` IDENTIQUE des deux côtés → filtrer dessus donne le total ;
 *   - `utm_source` = le domaine → c'est lui qui ventile par site ;
 *   - `utm_medium` = le canal, pour distinguer plus tard d'un `email` ou d'un
 *     `linkedin` ;
 *   - `utm_content` = l'emplacement du bouton, propre à chaque site.
 *
 * ⚠️ Ne JAMAIS renommer une valeur déjà en circulation : l'historique Calendly
 * porterait deux noms pour le même bouton et les totaux deviendraient faux
 * sans prévenir.
 */

/** Emplacement d'où part le lien Calendly. Devient `utm_content`. */
export type CalendlyOrigin =
  /** Bandeau CTA en bas du tableau de bord d'audit. */
  | "audit-results"
  /** Lien inséré dans le rapport PDF téléchargé. */
  | "pdf";

/** Notre domaine — distingue ce site de `perfiamatic.fr` (site vitrine). */
const UTM_SOURCE = "audit.perfiamatic.fr";
const UTM_MEDIUM = "site";
/** Commun aux deux sites : c'est la clé d'agrégation. Ne pas modifier. */
const UTM_CAMPAIGN = "audit";

/**
 * Renvoie l'URL Calendly enrichie des UTM, ou `undefined` si
 * `NEXT_PUBLIC_CALENDLY_URL` n'est pas défini (les appelants doivent gérer
 * l'absence de lien — c'est ce qui avait cassé silencieusement en Phase 8).
 */
export function lienCalendly(
  origine: CalendlyOrigin,
  options?: { email?: string },
): string | undefined {
  const base = process.env.NEXT_PUBLIC_CALENDLY_URL;
  if (!base) return undefined;

  const params = new URLSearchParams({
    utm_source: UTM_SOURCE,
    utm_medium: UTM_MEDIUM,
    utm_campaign: UTM_CAMPAIGN,
    utm_content: origine,
  });
  // Préremplissage Calendly (champ natif `email`), si on l'a déjà.
  if (options?.email) params.set("email", options.email);

  return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
}
