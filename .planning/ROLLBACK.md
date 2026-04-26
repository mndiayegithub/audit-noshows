# Rollback plan — v2 production (audit.perfiamatic.fr)

**Date** : 2026-04-26 (Phase 8 close)
**Cible** : Vercel project `audit-no-shows` (alias `audit.perfiamatic.fr`)

## Si problème détecté en prod

### Niveau 1 — Rollback instantané via Vercel UI (recommandé pour incident en cours)

1. Ouvrir https://vercel.com/mndiayepro97-3818s-projects/audit-no-shows/deployments
2. Identifier le dernier déploiement Production marqué `● Ready` antérieur au problème
3. Click `…` → `Promote to Production`
4. L'alias `audit.perfiamatic.fr` bascule en < 30 s

**Limite** : Vercel garde l'historique des deployments ~30 jours. Au-delà → niveau 2.

### Niveau 2 — Rollback via CLI Vercel

```bash
vercel ls          # lister les deployments récents
vercel promote <deployment-url>   # promouvoir un déploiement spécifique en prod
```

### Niveau 3 — Retour code v1 (catastrophe ou >30j post-deploy)

```bash
git checkout v1-backup    # branche pointant vers 91e66ad (snapshot pré-refonte v2)
# OU
git checkout v1.0.0       # tag immutable, même commit

vercel --prod --yes       # redéploie le code v1
```

## Variables d'environnement (Vercel)

3 vars critiques set en Production le 2026-04-26 :
- `N8N_WEBHOOK_URL` (server) — webhook n8n live
- `GOOGLE_PLACES_API_KEY` (server) — Phase 4 diagnostic
- `NEXT_PUBLIC_CALENDLY_URL` (client, baked au build) — CTA principal

**Vérification rapide** :
```bash
vercel env ls production
```

Si une var manque ou est wrong, `vercel env rm <NAME> production` puis `vercel env add <NAME> production` puis `vercel --prod --yes` pour rebuild.

## Workflow n8n (`Hc3aGjSuNjd4KVuu`)

Live en prod, refactoré 2026-04-26 (Phase 7-bis option propre). Snapshots préservés :
- Pre-refactor : `04_Scripts_Workflows/audit-flash-Hc3aGjSuNjd4KVuu-snapshot-2026-04-26.json`
- Post-refactor : `04_Scripts_Workflows/audit-flash-Hc3aGjSuNjd4KVuu-snapshot-2026-04-26-postrefactor.json`

Si le refactor option propre génère ≥ 3 incidents prod en 2 semaines → fallback option simple (cf. memory `feedback_n8n_workflow_error_strategy`).

Pour restaurer le workflow pre-refactor :
```bash
# Via MCP n8n (si Claude Code session)
# mcp__n8n-mcp__n8n_update_full_workflow avec le contenu du snapshot pre-refactor

# OU via UI n8n directement (cabinet duplicate qu'on garde de côté)
```

User a déjà dupliqué le workflow comme backup côté n8n avant le refactor — accessible dans l'UI n8n sous le nom dupliqué.

## Smoke test post-rollback

Toujours re-run après rollback :
```bash
curl -sS -X POST https://audit.perfiamatic.fr/api/audit \
  -H "Origin: https://audit.perfiamatic.fr" \
  -F "csv=<01_Leads_CSV/test_01_doctolib_6mois_clean.csv" \
  -F "nom_cabinet=PostRollback" -F "ca_moyen=200"
# Attendu : HTTP 200, success: true, total_rdv ≥ 400
```
