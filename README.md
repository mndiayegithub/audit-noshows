<<<<<<< HEAD
# audit-noshows
=======
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

## Déploiement (Vercel)

Le projet est prêt pour un déploiement sur Vercel. Aucune configuration spéciale n'est requise.

**Variable d'environnement optionnelle :**

- `N8N_WEBHOOK_URL` ou `NEXT_PUBLIC_N8N_WEBHOOK_URL` : URL du webhook n8n (par défaut : `https://n8n.srv939707.hstgr.cloud/webhook/audit-flash`)

## Pages

- **/** - Landing page
- **/audit** - Formulaire d'audit et affichage des résultats

## Format CSV attendu

Le fichier CSV doit contenir les données d'export des rendez-vous. Le format exact dépend de votre logiciel de gestion de cabinet.
>>>>>>> bb5e574 (Projet audit no-shows cabinet dentaire)
