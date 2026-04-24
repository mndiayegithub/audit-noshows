// =============================================================================
// n8n Code node — "Aggregate Par Mois"
// Phase 3 / Plan 03-01 — WF12 audit-flash
// =============================================================================
// Placement recommandé : entre "Calculer Statistiques" et "AI Agent".
// Lit les RDV depuis "Parse & Validate CSV" et les stats depuis le nœud amont,
// puis renvoie le même payload en ajoutant `stats.stats_par_mois`.
//
// Forme des items RDV (sortie de "Parse & Validate CSV") :
//   { Date: "YYYY-MM-DD..." | "DD/MM/YYYY", Heure, Jour, Statut: "Honoré"|"No-show", Praticien }
//
// Garanties :
//   • O(n) single-pass sur les RDV valides
//   • Aucune conversion timezone (slice lexicographique après normalisation en YYYY-MM)
//   • Gaps entre min(mois) et max(mois) zero-filled (total_rdv: 0, no_shows: 0, taux: 0)
//   • Tri ascendant lexicographique = chronologique (YYYY-MM)
//   • Aucun champ monétaire ajouté — invariant ca_perdu_an strictement préservé
// =============================================================================

const upstream = $input.item.json;
const stats    = upstream.stats || {};
const email    = upstream.email;
const nomCabinet = upstream.nom_cabinet;

// Les RDV bruts (avec leur Statut déjà normalisé) viennent du nœud parser.
const rdvs = ($('Parse & Validate CSV').item.json.rdvs) || [];

// --- Helpers ----------------------------------------------------------------

function toYearMonth(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  // Cas 1 : ISO "YYYY-MM-DD" (ou avec heure) → slice direct
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 7);
  }
  // Cas 2 : "DD/MM/YYYY" ou "DD-MM-YYYY" (format FR Doctolib)
  const m = dateStr.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
  if (m) return `${m[3]}-${m[2]}`;
  return null;
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${next[0]}-${String(next[1]).padStart(2, '0')}`;
}

// --- Agrégation -------------------------------------------------------------

const bucketsMap = new Map(); // "YYYY-MM" → { total_rdv, no_shows }

for (const rdv of rdvs) {
  if (rdv.Statut !== 'Honoré' && rdv.Statut !== 'No-show') continue;
  const ym = toYearMonth(rdv.Date);
  if (!ym) continue;
  let b = bucketsMap.get(ym);
  if (!b) { b = { total_rdv: 0, no_shows: 0 }; bucketsMap.set(ym, b); }
  b.total_rdv++;
  if (rdv.Statut === 'No-show') b.no_shows++;
}

let statsParMois = [];

if (bucketsMap.size > 0) {
  const sortedKeys = [...bucketsMap.keys()].sort();
  const minYm = sortedKeys[0];
  const maxYm = sortedKeys[sortedKeys.length - 1];

  // Zero-fill des gaps internes
  for (let ym = minYm; ym <= maxYm; ym = nextMonth(ym)) {
    const b = bucketsMap.get(ym) || { total_rdv: 0, no_shows: 0 };
    const taux = b.total_rdv > 0
      ? Math.round((b.no_shows / b.total_rdv) * 1000) / 10
      : 0;
    statsParMois.push({
      mois: ym,
      total_rdv: b.total_rdv,
      no_shows: b.no_shows,
      taux
    });
  }
}

// --- Output : on ré-émet le payload upstream enrichi ------------------------

return {
  json: {
    stats: { ...stats, stats_par_mois: statsParMois },
    email,
    nom_cabinet: nomCabinet
  }
};
