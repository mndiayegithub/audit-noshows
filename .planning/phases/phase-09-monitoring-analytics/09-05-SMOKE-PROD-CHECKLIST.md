# Phase 9 — Smoke Prod Checklist (D-08, AC-1, AC-2, AC-6)

**Cible :** `https://audit.perfiamatic.fr` (prod uniquement — Vercel Analytics ne tracke PAS en dev/preview, cf RESEARCH §Q4)
**Effectué par :** user (mndiayepro97@gmail.com)
**Quand :** après merge des plans 09-01 → 09-04 sur `main` + redéploiement Vercel auto vert
**Durée estimée :** ~10 min

---

## Pré-requis

- [ ] Plans 09-01, 09-02, 09-03, 09-04 mergés sur `main`
- [ ] Déploiement Vercel auto-déclenché et **vert** (vérifier `https://vercel.com/mndiayepro97-3818s-projects/audit-no-shows`)
- [ ] Onglet Vercel Analytics → projet `audit-no-shows` → **Custom Events** ouvert dans un onglet à part : `https://vercel.com/mndiayepro97-3818s-projects/audit-no-shows/analytics`
- [ ] Navigation privée (Chrome incognito ou Firefox private) pour éviter le bruit cookies / sessions précédentes
- [ ] DevTools ouvert sur l'onglet Network filtré sur `_vercel/insights/event` (utile en cas de gap)
- [ ] Un CSV valide local : `01_Leads_CSV/test_01_doctolib_6mois_clean.csv` (golden path Phase 7, validé 100% reco)
- [ ] Un CSV invalide local : n'importe quel CSV avec colonnes manquantes (ex : un fichier `.csv` à 1 colonne, ou créer un CSV vide avec juste `nom,prenom\n`)

---

## Parcours 1 — Golden path (8 events)

Cible events : `landing_view`, `landing_cta_audit_click`, `audit_view`, `csv_preview_loaded`, `audit_submitted`, `audit_success`, `cta_calendly_click`, `pdf_downloaded`.

1. [ ] Ouvrir `https://audit.perfiamatic.fr` (incognito) → vérifier que le dashboard Vercel "Custom Events" voit **`landing_view`** apparaître < 30s
2. [ ] Cliquer le bouton "Démarrer l'audit" depuis **n'importe lequel** des 4 emplacements (hero, nav, CTA band, ou footer) → vérifier **`landing_cta_audit_click`**
3. [ ] Sur `/audit`, le mount déclenche → vérifier **`audit_view`**
4. [ ] Drag-drop le CSV `test_01_doctolib_6mois_clean.csv` → vérifier **`csv_preview_loaded`** (avec `nb_rdv > 0` et `reco_rate ≈ 1`)
5. [ ] Remplir nom_cabinet (n'importe quoi, ex: "Cabinet Test"), email (un email à toi), cliquer "Lancer l'audit" → vérifier **`audit_submitted`** (avec `degraded: false`)
6. [ ] Attendre la réponse n8n (~30-50s) → vérifier **`audit_success`** (avec `score` et `taux_noshow` numériques)
7. [ ] Sur les résultats, cliquer "Télécharger PDF" → vérifier **`pdf_downloaded`**
8. [ ] Cliquer un CTA Calendly (sticky bottom OU embed dans la section Plan d'Action) → vérifier **`cta_calendly_click`** (avec `location: "audit-results"`)

**Attendu :** 8 events visibles dans Custom Events dashboard < 30s après l'action correspondante.

---

## Parcours 2 — Rejet CSV (1-2 events)

Cible events : `csv_rejected` (gardé), éventuellement `audit_failed` (si on force la soumission en mode dégradé).

1. [ ] Recharger `/audit` (ou nouvel onglet incognito)
2. [ ] Drag-drop un CSV **invalide** (colonnes manquantes — ex: fichier vide ou avec juste `nom,prenom\n`) → l'UI doit afficher `CSVErrorCard` → vérifier **`csv_rejected`** (avec `error_code` correspondant à la cause, ex: `MISSING_COLUMNS` ou `EMPTY_CSV`)
3. [ ] **Optionnel — pour déclencher `audit_failed`** : utiliser un CSV avec ≥80% statuts non reconnus pour voir le `DegradedConfirmDialog`, confirmer la soumission dégradée, puis si le serveur répond en erreur (ex: timeout, 500) → vérifier **`audit_failed`** (avec `error_code` = code serveur OU status HTTP OU `UNKNOWN_FAILURE` OU `CLIENT_EXCEPTION`)

**Attendu :** au minimum `csv_rejected` visible. `audit_failed` est nice-to-have (5 branches client → ≥1 doit fire en cas d'échec serveur observé en prod).

---

## Parcours 3 — Diagnostic Google (1 event)

Cible event : `google_diagnostic_triggered`.

1. [ ] Sur la page de résultats audit (ou autre emplacement où vit `DiagnosticGoogle.tsx`), saisir un nom de cabinet **non vide** (ex: "Cabinet Dentaire Paris 11")
2. [ ] Cliquer le bouton de recherche Google → vérifier **`google_diagnostic_triggered`** (no properties)

**Attendu :** event visible < 30s. Note : le guard empty-input doit empêcher le tracking si le champ est vide (à vérifier en bonus : saisir vide + cliquer → AUCUN event ne doit fire).

---

## Vérification finale dashboard Vercel (AC-1, AC-2, AC-6)

Ouvrir `https://vercel.com/mndiayepro97-3818s-projects/audit-no-shows/analytics` → onglet **Custom Events**.

- [ ] **AC-1 :** Les **11 events** apparaissent dans la liste Custom Events après les 3 parcours (au moins 1 occurrence chacun) :
      `landing_view`, `landing_cta_audit_click`, `audit_view`, `csv_preview_loaded`, `csv_rejected`, `audit_submitted`, `audit_success`, `audit_failed` (si parcours 2 step 3 fait), `cta_calendly_click`, `google_diagnostic_triggered`, `pdf_downloaded`
- [ ] **AC-2 :** Le funnel `landing_view → landing_cta_audit_click → audit_view → audit_submitted → audit_success → cta_calendly_click` est **filtrable** via les filtres natifs Vercel Analytics (sélectionner les events un par un et vérifier le drop-off)
- [ ] **AC-6 :** Tous les events apparaissent **< 30s** après l'action correspondante (latence dashboard ≤ 30s)
- [ ] **AC-3 confirm visuel :** Cliquer chaque event dans le dashboard pour voir le détail des properties et confirmer **aucune PII** :
      - Pas d'email
      - Pas de nom_cabinet
      - Pas de contenu CSV (lignes brutes)
      - Uniquement : `referrer` (URL string), `nb_rdv` (number), `reco_rate` (number ∈ [0,1]), `error_code` (enum string court), `degraded` (bool), `score` / `taux_noshow` (numbers), `location` (enum string court)

---

## Critères pass / fail

### ✅ PASS si :
- 11 events visibles (10 si parcours 2 step 3 non exécuté + parcours 3 fait → AC-1 partiel acceptable, à clarifier avec user)
- Funnel filtrable (AC-2 ✅)
- Latence ≤ 30s (AC-6 ✅)
- Aucune PII détectée (AC-3 confirm ✅)

→ **Action :** taper "approved" en réponse au checkpoint. STATE.md basculera à "Phase 9 ✅ close".

### ❌ FAIL si :
- Un ou plusieurs events manquants après 30s
- Un event contient un email / nom_cabinet / contenu CSV
- Latence > 30s sur ≥3 events

→ **Action :** documenter le gap (event manquant ? property suspecte ? latence anormale ?) → ouvrir un fix-plan ad hoc (probablement Plan 09-06 ou hotfix sur 09-03).

---

## Si un event manque — Debug

1. **DevTools Console** : recharger la page concernée et chercher `[Vercel Web Analytics] Track "..."` (Vercel Analytics log les events en debug en local — peut-être pas en prod par défaut, vérifier).
2. **DevTools Network** : filtrer sur `_vercel/insights/event` → POST doit retourner **200** ou **204**. Si 404 → `<Analytics />` n'est pas mounted (régression `app/layout.tsx`). Si 4xx/5xx → endpoint Vercel down (vérifier `vercel-status.com`).
3. **Latence dashboard** : Vercel Analytics a une propagation ~1-2 min en pratique malgré le SLA "real-time". Si l'event est en console + Network 200 mais absent du dashboard → attendre 2 min puis refresh.
4. **Call-site introuvable** : grep le helper côté repo (`grep -rn "trackXxx" app/ components/ hooks/`) pour vérifier qu'il est bien dans un composant **`"use client"`** (Server Components ne peuvent pas appeler `track()`).
5. **Adblock / brave shields** : désactiver tout adblock dans la fenêtre incognito — Vercel Analytics utilise un endpoint qui peut être listé par certains filtres (uBlock Origin notamment). Re-tester en navigation totalement nue.

---

## Notes

- **Vercel Analytics ne tracke PAS en dev/preview deploy** (RESEARCH §Q4). Ne pas perdre de temps à tester en local — seul le domaine prod `audit.perfiamatic.fr` génère des events visibles.
- **Fail-soft `safeTrack` (D-04) :** si Vercel Analytics est down ou bloqué par adblock, les `track()` sont silencieusement avalés (try/catch dans `lib/analytics.ts`) — c'est voulu (R4) pour ne jamais casser le funnel commercial. Conséquence : un event manquant peut signifier "Vercel down" OU "adblock côté user" OU "vraie régression code". Le fallback debug ci-dessus permet de discriminer.
- **`audit_failed` est conditionnel :** ses 5 branches ne fire qu'en cas d'erreur serveur. Si les n8n tournent normalement pendant le smoke, l'event ne sortira pas — c'est attendu. Pour le forcer : couper le webhook n8n côté Vercel env temporairement (`N8N_WEBHOOK_URL=https://invalid.example.com`) puis lancer un audit → `CLIENT_EXCEPTION` ou code 4xx fire. **Ne pas oublier de remettre la bonne valeur après !**
