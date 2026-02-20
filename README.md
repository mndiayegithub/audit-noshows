# PerfIAmatic - Audit No-Shows pour Cabinets Dentaires

Outil d'audit des rendez-vous manqués (no-shows) pour cabinets dentaires. Analysez vos données en 30 secondes grâce à l'IA.

## Stack technique

- **Next.js 14** (App Router)
- **TypeScript** (mode strict)
- **Tailwind CSS**
- **react-dropzone** - Upload CSV
- **react-markdown** + **remark-gfm** - Affichage du rapport
- **react-hot-toast** - Notifications

## Installation

```bash
npm install
```

## Démarrage en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Build production

```bash
npm run build
npm run start
```

## Déploiement (Vercel)

Le projet est prêt pour un déploiement sur Vercel (framework détecté automatiquement : Next.js).

1. Importer le dépôt dans Vercel (`Add New` -> `Project`)
2. Vérifier les paramètres de build (par défaut) :
   - Build Command : `npm run build`
   - Output Directory : `.next` (géré automatiquement)
3. Configurer les variables d'environnement
4. Lancer le déploiement

**Variable d'environnement :**

- `N8N_WEBHOOK_URL` : URL du webhook n8n (exemple : `https://n8n.srv939707.hstgr.cloud/webhook/audit-flash`)
- Optionnel selon votre implémentation : `NEXT_PUBLIC_N8N_WEBHOOK_URL`

## Notes métier importantes

- `ca_perdu` est déjà annualisé côté backend n8n.
- Le frontend ne doit pas réappliquer de calcul d'annualisation (`* 12` ou `* (12 / nb_mois)`) dans les sections Top 3 créneaux (UI et PDF).
- Les montants affichés dans les cards et dans le PDF doivent rester alignés avec les valeurs backend.

## Pages

- **/** - Landing page
- **/audit** - Formulaire d'audit et affichage des résultats

## Format CSV attendu

Le fichier CSV doit contenir les données d'export des rendez-vous. Le format exact dépend de votre logiciel de gestion de cabinet.
