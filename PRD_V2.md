PRD — Audit de Performance du Cabinet
PerfIAmatic — Version 2.0
Auteur : Mansour Ndiaye
Date : Avril 2026
Statut : Prêt pour développement
Stack actuelle : Next.js / Tailwind CSS / n8n / Claude API

1. Contexte et objectif
L'audit gratuit est le point d'entrée du funnel PerfIAmatic. Le praticien uploade son export CSV Doctolib et reçoit un rapport personnalisé en moins de 60 secondes.
La version actuelle (v1) traite uniquement l'analyse des no-shows. Elle affiche un score de satisfaction de 9,7/10 sur 7 fichiers testés.
Objectif de la v2 : Upgrader l'audit en un rapport multi-blocs qui adresse deux douleurs simultanément — les revenus perdus (no-shows) et les revenus non captés (avis Google) — sans casser la promesse "60 secondes, juste votre CSV".
Principe directeur du rapport : Chaque page doit créer plus d'inconfort que la précédente. Le praticien doit finir le rapport avec une seule pensée : "je ne peux pas ne rien faire." Le rapport ne donne jamais la solution. Il montre uniquement l'ampleur du problème.

2. Périmètre v2
Ce qui est dans le scope

Upgrade de la page de résultats existante (5 pages/sections)
Ajout d'un bloc Google conditionnel (déclenchement optionnel post-rapport)
Intégration Google Places API pour le bloc avis
Score global de performance du cabinet
CTA unique Calendly en sortie de rapport

Ce qui est hors scope

Modification du workflow n8n WF12 existant (parsing CSV)
Modification de la page d'upload (formulaire CSV)
Système de rappels SMS ou liste d'attente (Niveau 2 de l'offre)


3. Flux utilisateur complet
[Page upload CSV]
        ↓
Upload CSV Doctolib + email praticien
        ↓
Traitement n8n WF12 (~60 secondes)
        ↓
[Page de résultats — 5 sections]
  Section 1 — Le chiffre qui fait mal
  Section 2 — Détail no-shows
  Section 3 — (optionnelle) Diagnostic Google
  Section 4 — Score global
  Section 5 — CTA Calendly
        ↓
Bouton "Analyser aussi mes avis Google"
(déclenche Section 3 si non encore affichée)
        ↓
Praticien entre nom du cabinet → Google Places API
        ↓
Section 3 s'affiche + Section 4 se met à jour
        ↓
Section 5 — CTA unique

4. Spécifications des 5 sections

Section 1 — Le chiffre qui fait mal
Objectif : Impact immédiat. Le praticien comprend en 3 secondes l'ampleur de sa perte.
Contenu :

Chiffre principal en très grand, couleur rouge : "Votre cabinet perd estimativement X € par an"
Calcul : no-shows × CA moyen par créneau × 52 semaines
CA moyen par créneau : valeur par défaut = 150€ (configurable)

3 indicateurs sous le chiffre principal :
IndicateurValeurSourceTaux de no-showsX%Calculé depuis CSVCréneaux perdus / semaineXCalculé depuis CSVCA perdu / moisX€Calculé depuis CSV
Règle d'affichage couleur du taux :

< 4% → 🟢 vert — "Vous êtes en dessous de la moyenne nationale"
4% à 7% → 🟠 orange — "Vous êtes dans la moyenne nationale"
> 7% → 🔴 rouge — "Vous dépassez la moyenne nationale"

Note benchmark : Moyenne nationale affichée = 3-4% (source : données sectorielles France)

Section 2 — Le détail des no-shows
Objectif : Rendre le problème visuel, granulaire et non contestable. Les données viennent de son propre CSV.
Contenu :
Graphique en barres horizontal :

Répartition des no-shows par jour de la semaine (Lundi → Vendredi + Samedi si applicable)
Barres colorées selon seuil : rouge si > moyenne du cabinet, vert sinon
Libellé : nombre de no-shows + pourcentage par jour

Jauge de benchmark circulaire :

Position du cabinet vs moyenne sectorielle (3-4%)
Affichage : Votre taux : X% | Moyenne nationale : 3-4%
Couleur de la jauge : reprend le code couleur de la Section 1

Tableau des créneaux à risque :

3 créneaux les plus à risque → fond rouge clair, badge 🔴
3 créneaux les plus performants → fond vert clair, badge 🟢
Format créneau : Lundi 14h00 avec taux associé


Section 3 — Diagnostic Google (conditionnel)
Objectif : Révéler la deuxième douleur — les nouveaux patients que le cabinet ne capte pas faute de visibilité Google.
Déclenchement :
Cette section est masquée par défaut. Elle s'affiche de deux façons :

Le praticien clique sur le bouton "Analyser aussi mes avis Google →" visible après la Section 2
La Section 4 affiche un score partiel avec une incitation à compléter l'analyse

Interaction :

Champ texte : "Entrez le nom de votre cabinet"
Bouton : "Lancer l'analyse"
Appel Google Places API → résultats en < 5 secondes
En cas d'échec API ou cabinet non trouvé : message "Cabinet non trouvé — vérifiez le nom ou passez cette étape"

Contenu affiché après appel API :
4 éléments uniquement, pas plus :
ÉlémentValeurAffichageNote Google actuelleX / 5 ⭐Grande, centréNombre d'avis actuelsX avisAvec tendance si disponibleBenchmark zoneMoyenne cabinets similaires dans votre ville : X avisComparatif visuelImpact estimé"Un cabinet avec 50 avis de plus convertit en moyenne 3-5 nouveaux patients/mois supplémentaires"Texte statique
Règle d'affichage couleur du nombre d'avis :

> benchmark zone → 🟢 "Vous êtes bien positionné"
= benchmark ± 20% → 🟠 "Vous êtes dans la moyenne"
< benchmark zone → 🔴 "Vous avez un déficit de visibilité"

Benchmark par défaut (si géolocalisation non disponible) : 87 avis (moyenne nationale cabinets dentaires France — source : données MerciDocteur / DoctiZen)

Section 4 — Score global de performance
Objectif : Synthétiser les deux douleurs en un seul chiffre. Créer l'envie d'agir.
Calcul du score (sur 100) :
Score No-Shows (50 points max) :
  taux < 4%    → 50 pts
  taux 4-7%    → 30 pts
  taux 7-10%   → 15 pts
  taux > 10%   → 5 pts

Score Google (50 points max) — si Section 3 complétée :
  note ≥ 4.5 ET avis > benchmark      → 50 pts
  note ≥ 4.0 ET avis > benchmark×0.8  → 35 pts
  note ≥ 4.0 ET avis ≤ benchmark×0.8  → 20 pts
  note < 4.0                           → 10 pts

Score Google — si Section 3 non complétée :
  Score affiché sur 50 uniquement + mention "Complétez l'analyse Google pour voir votre score complet"
Affichage :
┌─────────────────────────────────────────────┐
│   Performance globale du cabinet            │
│                                             │
│            58 / 100                         │
│         [jauge visuelle]                    │
│   🔴 Risque élevé                           │
│                                             │
│  🔴 Revenus perdus (no-shows)  : - X€/an   │
│  🟠 Revenus non captés (Google): - Y€/an   │
│  ─────────────────────────────────────────  │
│  💥 Impact total estimé        : - Z€/an   │
└─────────────────────────────────────────────┘
Niveaux du score :

80-100 → 🟢 "Cabinet optimisé"
50-79 → 🟠 "Améliorations possibles"
0-49 → 🔴 "Risque élevé — action recommandée"

Phrase de benchmark (statique) :

"Les cabinets qui ont corrigé ces deux points ont récupéré en moyenne 3 200€ dans les 90 premiers jours."


Section 5 — CTA unique
Objectif : Une seule action possible. Pas deux. Pas trois.
Contenu :
┌─────────────────────────────────────────────┐
│                                             │
│  Découvrez comment récupérer ces X€         │
│  en 90 jours.                               │
│                                             │
│  [→ Réserver mon appel de 20 minutes]       │
│         (bouton Calendly)                   │
│                                             │
│  ✓ Sans engagement                          │
│  ✓ 20 minutes chrono                        │
│  ✓ Je vous montre ce que votre cabinet      │
│    peut récupérer concrètement              │
│                                             │
└─────────────────────────────────────────────┘
Logique du lien Calendly :

URL Calendly passée en variable d'environnement : NEXT_PUBLIC_CALENDLY_URL
Pré-remplissage du nom + email du praticien si disponible depuis le formulaire d'upload


5. Spécifications techniques
Stack

Frontend : Next.js / Tailwind CSS (existant)
Parsing CSV + calculs : n8n WF12 (existant — ne pas modifier)
Google Places API : appel côté serveur (Next.js API route) pour ne pas exposer la clé API
Rapport : page de résultats dynamique (pas de génération PDF dans la v2)

API Google Places
Endpoint utilisé : Text Search ou Find Place
GET https://maps.googleapis.com/maps/api/place/findplacefromtext/json
  ?input={nom_cabinet}
  &inputtype=textquery
  &fields=name,rating,user_ratings_total,formatted_address
  &key={GOOGLE_PLACES_API_KEY}

Voici un exemple de l'endpoint pour que la requête passe : 
"GET https://maps.googleapis.com/maps/api/place/findplacefromtext/json
  ?input=Cabinet+dentaire+de+lAvenue
  &inputtype=textquery
  &fields=name,rating,user_ratings_total,formatted_address
    &key=AIzaSyDXHOsqjeNHJOOjIF6qwOI9RdgeC43Libw
"

Données extraites :

rating → note Google (X/5)
user_ratings_total → nombre d'avis

Gestion d'erreurs :

Aucun résultat → afficher message "Cabinet non trouvé" + lien pour passer
Erreur API → afficher message "Analyse temporairement indisponible" + permettre de continuer sans ce bloc
Ne jamais bloquer l'accès au CTA en cas d'erreur Google

Variable d'environnement à créer :
GOOGLE_PLACES_API_KEY=xxx
Données transmises par WF12 vers la page de résultats
Le workflow n8n existant doit transmettre à minima :
json{
    "output": {
      "success": true,
      "stats": {
        "nom_cabinet": "Cabinet Fontaine",
        "periode": {
          "debut": "01/10/2024",
          "fin": "28/02/2025",
          "nb_mois": 5
        },
        "global": {
          "total_rdv": 1917,
          "no_shows": 226,
          "honores": 1691,
          "taux": 11.79,
          "ca_moyen": 150,
          "ca_perdu_mois": 6780,
          "ca_perdu_an": 81360
        },
        "benchmark": {
          "votre_taux": 11.79,
          "optimal": "4.0-5.0%",
          "ecart": 7.29
        },
        "top_3_pires": [
          {
            "jour": "Vendredi",
            "heure": "18:30",
            "total": 21,
            "noShows": 10,
            "taux": 47.62,
            "ca_perdu": 3600
          },
          {
            "jour": "Mercredi",
            "heure": "18:30",
            "total": 21,
            "noShows": 8,
            "taux": 38.1,
            "ca_perdu": 2880
          },
          {
            "jour": "Vendredi",
            "heure": "15:00",
            "total": 18,
            "noShows": 6,
            "taux": 33.33,
            "ca_perdu": 2160
          }
        ],
        "top_3_meilleurs": [
          {
            "jour": "Mardi",
            "heure": "09:00",
            "total": 17,
            "noShows": 0,
            "taux": 0,
            "ca_perdu": 0
          },
          {
            "jour": "Mardi",
            "heure": "09:30",
            "total": 19,
            "noShows": 0,
            "taux": 0,
            "ca_perdu": 0
          },
          {
            "jour": "Mardi",
            "heure": "10:00",
            "total": 21,
            "noShows": 0,
            "taux": 0,
            "ca_perdu": 0
          }
        ],
        "par_jour": [
          {
            "jour": "Lundi",
            "total_rdv": 335,
            "no_shows": 40,
            "taux": 11.94
          },
          {
            "jour": "Mardi",
            "total_rdv": 360,
            "no_shows": 21,
            "taux": 5.83
          },
          {
            "jour": "Mercredi",
            "total_rdv": 350,
            "no_shows": 49,
            "taux": 14
          },
          {
            "jour": "Jeudi",
            "total_rdv": 343,
            "no_shows": 41,
            "taux": 11.95
          },
          {
            "jour": "Vendredi",
            "total_rdv": 361,
            "no_shows": 58,
            "taux": 16.07
          },
          {
            "jour": "Samedi",
            "total_rdv": 168,
            "no_shows": 17,
            "taux": 10.12
          }
        ],
        "stats_par_praticien": [
          {
            "praticien": "Dr. Fontaine",
            "total": 1917,
            "noShows": 226,
            "taux": 11.79,
            "ca_perdu": 81360
          }
        ],
        "potentiel": {
          "passage_5": 46800,
          "passage_45": 50400
        },
        "qualite_donnees": {
          "nb_total_lignes": 1917,
          "nb_analyses": 1917,
          "nb_ignores": 0,
          "taux_couverture": 100,
          "statuts_inconnus": [],
          "colonnes_detectees": {
            "date": "Date",
            "heure": "Heure",
            "statut": "Statut",
            "jour": "Jour",
            "praticien": "Praticien"
          }
        }
      },
      "rapport_texte": "## Rapport d'audit no-shows — Cabinet Fontaine\n\n**Période analysée :** 01/10/2024 au 28/02/2025 (5 mois)\n\n---\n\n## 1. Résumé exécutif\n\n- **Total rendez-vous :** 1917\n- **No-shows :** 226 (11.79%)\n- **Benchmark sectoriel :** 4.0-5.0% (vous êtes à 11.79%, écart de 7.29 points)\n- **CA moyen par rendez-vous :** 150 €\n- **Perte mensuelle estimée :** 6 780 €\n- **Perte annuelle estimée :** 81 360 €\n\n> ⚠️ Jours au-dessus de votre moyenne : **Lundi** (11.94%), **Mercredi** (14%), **Jeudi** (11.95%), **Vendredi** (16.07%)\n\n---\n\n## 2. Analyse des créneaux à risque\n\nLes créneaux suivants concentrent le plus de no-shows :\n\n1. **Vendredi à 18:30** — 47.62% de no-shows (10 sur 21) — perte estimée : **3 600 €/an**\n2. **Mercredi à 18:30** — 38.1% de no-shows (8 sur 21) — perte estimée : **2 880 €/an**\n3. **Vendredi à 15:00** — 33.33% de no-shows (6 sur 18) — perte estimée : **2 160 €/an**\n\n**Créneaux performants (à dupliquer) :**\n\n1. **Mardi à 09:00** — 0% no-shows (0 sur 17)\n2. **Mardi à 09:30** — 0% no-shows (0 sur 19)\n3. **Mardi à 10:00** — 0% no-shows (0 sur 21)\n\n---\n\n## 3. Impact financier\n\nSur la période analysée (5 mois), votre cabinet a enregistré **226 no-shows** pour un total de **1917 rendez-vous**.\n\nCela représente une perte sèche de **6 780 €/mois**, soit **81 360 €/an**.\n\nEn ramenant votre taux au niveau optimal du secteur (4.0-5.0%), le potentiel récupérable est estimé entre **46 800 €** et **50 400 €/an**.\n\n---\n\n## 4. Actions immédiates (7 premiers jours)\n\n1. **Activer les rappels automatiques** : SMS + email 48h et 2h avant chaque rendez-vous\n2. **Cibler les créneaux à risque** : Vendredi 18:30, Mercredi 18:30, Vendredi 15:00 — rappels renforcés pour ces horaires\n3. **Mettre en place une liste d'attente** : pour remplir immédiatement les créneaux libérés en dernière minute\n4. **Instaurer une politique de confirmation obligatoire** : demander une confirmation active 24h avant pour les créneaux à forte sinistralité\n5. **Analyser les meilleurs créneaux** : Mardi 09:00, Mardi 09:30, Mardi 10:00 — identifier pourquoi ces créneaux performent et répliquer les conditions\n",
      "pdf_url": null,
      "email_sent": false
    },
    "email": null
  }
Si WF12 ne transmet pas encore toutes ces données : les champs manquants sont calculés côté frontend depuis les données brutes disponibles.

6. Design et UX
Identité visuelle

Fond blanc dominant — style medical SaaS
Palette : blanc / vert teal (#0A2E2E pour accents) / rouge (#DC2626) / orange (#F59E0B) / vert (#16A34A)
Police : Inter ou Satoshi (existante dans le projet)
Pas d'animations complexes — performance > esthétique

Règles UX

Mobile-first — le praticien lira le rapport sur son téléphone
Chaque section est visible sans scroll horizontal
Le score global (Section 4) reste visible en sticky sur mobile si possible
Le bouton CTA (Section 5) est toujours accessible — pas enterré en bas de page
Temps de chargement Section 3 (Google Places) : afficher un spinner "Analyse en cours..." pendant l'appel API

États d'affichage à gérer

Rapport sans bloc Google (Section 3 non déclenchée) : score affiché sur 50, mention "Complétez pour voir votre score complet"
Rapport avec bloc Google complet : score sur 100
Cabinet non trouvé sur Google : Section 3 affiche message doux + bouton "Passer cette étape"
Erreur API Google : Section 3 masquée, rapport continue normalement


7. Envoi email post-rapport
Le système existant envoie déjà un email avec le rapport. En v2, l'email doit contenir :
Objet : [Résultats] Votre cabinet perd X€/an — voici ce que vos données révèlent
Corps :

Le score global si calculé
Les 3 indicateurs clés (taux no-shows, CA perdu, nombre d'avis si disponible)
Lien vers la page de résultats en ligne (pas de PDF en v2)
Bouton CTA Calendly

Condition d'envoi du lien booking call : si taux no-shows > 6% OU score global < 60/100

8. Critères d'acceptance

 Upload CSV → rapport affiché en moins de 60 secondes
 Section 1 affiche le bon CA perdu calculé depuis le CSV
 Section 2 affiche le graphique par jour avec les bons créneaux rouge/vert
 Bouton "Analyser mes avis Google" déclenche bien la Section 3
 Appel Google Places API fonctionne et retourne note + nombre d'avis
 En cas d'erreur API, le rapport s'affiche quand même sans Section 3
 Section 4 calcule le bon score selon les règles définies
 Score partiel (sans Google) affiché sur 50 avec mention
 Bouton Calendly fonctionne et pré-remplit email si disponible
 Email envoyé avec les bons indicateurs
 Responsive mobile sans scroll horizontal
 Clé Google Places API non exposée côté client


9. Ce qui ne change pas (ne pas toucher)

Page d'upload CSV (formulaire existant)
Workflow n8n WF12 dans sa logique de parsing (ajout de champs uniquement si nécessaire)
URL du site audit.perfiamatic.fr
Système d'envoi email existant (SMTP)


10. Questions ouvertes pour le développement

Format de transmission WF12 → frontend : webhook vers une route Next.js API ou stockage temporaire (Redis / fichier) ? À clarifier selon l'implémentation actuelle.
Benchmark Google par zone : dans la v2, le benchmark est une valeur statique nationale (87 avis). Une v3 pourrait utiliser les résultats Google Places pour calculer la moyenne des 5 cabinets les plus proches.
Persistance du rapport : le rapport est-il accessible via URL unique après génération ? Si oui, durée de vie souhaitée.


Version : 2.0
Dernière mise à jour : Avril 2026
Auteur : Mansour Ndiaye — PerfIAmatic
Contact : mndiaye@perfiamatic.fr