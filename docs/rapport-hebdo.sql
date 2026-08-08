-- ════════════════════════════════════════════════════════════════════════
-- Rapport hebdomadaire — audit.perfiamatic.fr
-- Table : audit_events (projet Supabase perfiamatic-prod, région Irlande)
--
-- À coller tel quel dans l'éditeur SQL de Supabase et à enregistrer comme
-- snippet. UNE seule requête, volontairement : l'éditeur n'affiche que le
-- résultat de la dernière instruction d'un script, donc tous les blocs sont
-- réunis en un seul tableau via UNION ALL.
--
-- Six blocs :
--   ① Entonnoir          — où les gens s'arrêtent, et l'évolution sur 7 jours
--   ② La plus grosse chute — l'étape à travailler en priorité
--   ③ Attente n8n        — durées réelles, et abandons pendant l'attente
--   ④ Pourquoi ça échoue — codes d'erreur CSV et d'audit
--   ⑤ Quel bouton travaille — clics par emplacement
--   ⑥ Contrôle de collecte — la mesure tourne-t-elle encore ?
--
-- ⚠️ On compte des VISITES DISTINCTES (`count(distinct session_id)`), pas des
-- événements. C'est possible ici parce que la table porte un identifiant de
-- visite — contrairement à `analytics_events` (site vitrine), dont l'entonnoir
-- ne se lit qu'en proportions. Ne pas recopier cette requête là-bas telle
-- quelle.
--
-- ⚠️ Les `lag()` sont calculés dans la CTE `entonnoir`, en amont de tout
-- filtre. Une fonction de fenêtrage s'évalue APRÈS le WHERE : la redescendre
-- dans un sous-select filtré la ferait renvoyer null.
--
-- Pour changer la période, modifier `jours` dans la CTE `parametres`.
-- ════════════════════════════════════════════════════════════════════════

with parametres as (
  select 7 as jours
),

periodes as (
  select 'courante' as periode,
         now() - (select jours from parametres) * interval '1 day' as debut,
         now()                                                     as fin
  union all
  select 'precedente',
         now() - (select jours from parametres) * 2 * interval '1 day',
         now() - (select jours from parametres) * interval '1 day'
),

-- Le parcours, dans l'ordre. Ajouter une étape ici suffit à l'intégrer au
-- rapport : rien n'est codé en dur ailleurs.
etapes (rang, event_type, libelle) as (
  values
    (1, 'landing_view',            'Arrivée sur la landing'),
    (2, 'landing_cta_audit_click', 'Clic vers l''audit'),
    (3, 'audit_view',              'Page d''audit ouverte'),
    (4, 'csv_preview_loaded',      'Fichier CSV accepté'),
    (5, 'audit_submitted',         'Audit lancé'),
    (6, 'audit_success',           'Résultat obtenu'),
    (7, 'cta_calendly_click',      'Clic prise de rendez-vous')
),

comptes as (
  select p.periode,
         e.rang,
         e.libelle,
         count(distinct a.session_id) as visites
  from periodes p
  cross join etapes e
  left join audit_events a
         on a.event_type = e.event_type
        and a.session_id is not null
        and a."timestamp" >= p.debut
        and a."timestamp" <  p.fin
  group by 1, 2, 3
),

-- Base 100 % = l'étape de rang 1. Sans elle, tous les pourcentages sortent null.
socle as (
  select periode, max(visites) filter (where rang = 1) as base
  from comptes
  group by 1
),

entonnoir as (
  select c.periode,
         c.rang,
         c.libelle,
         c.visites,
         s.base,
         lag(c.visites) over (partition by c.periode order by c.rang) as etape_precedente
  from comptes c
  join socle s using (periode)
),

courante as   (select * from entonnoir where periode = 'courante'),
precedente as (select * from entonnoir where periode = 'precedente'),

-- Perte en points de pourcentage entre deux étapes consécutives : c'est là
-- qu'il faut travailler en priorité.
chutes as (
  select libelle,
         etape_precedente - visites as perdus,
         case when etape_precedente > 0
              then round(100.0 * (etape_precedente - visites) / etape_precedente, 1)
         end as taux_perte
  from courante
  where etape_precedente is not null
    and etape_precedente > 0
),

attente as (
  select (properties->>'duration_ms')::numeric as ms
  from audit_events, periodes p
  where p.periode = 'courante'
    and event_type = 'audit_success'
    -- `properties->>'x' is not null` plutôt que l'opérateur jsonb `?` :
    -- certains clients SQL prennent le point d'interrogation pour un
    -- paramètre lié et cassent la requête.
    and properties->>'duration_ms' is not null
    and "timestamp" >= p.debut and "timestamp" < p.fin
),

abandons as (
  select count(*) as n,
         round(avg((properties->>'duration_ms')::numeric) / 1000, 1) as secondes_moyennes
  from audit_events, periodes p
  where p.periode = 'courante'
    and event_type = 'audit_abandoned'
    and "timestamp" >= p.debut and "timestamp" < p.fin
)

-- ── ① ENTONNOIR ─────────────────────────────────────────────────────────
select '① Entonnoir'                                        as bloc,
       c.rang || '. ' || c.libelle                          as ligne,
       c.visites::text                                      as valeur,
       coalesce(round(100.0 * c.visites / nullif(c.base, 0), 1)::text || ' %', '—')
                                                            as "% du départ",
       case when c.etape_precedente is null then '—'
            when c.etape_precedente = 0     then '—'
            else '−' || round(100.0 * (c.etape_precedente - c.visites)
                              / c.etape_precedente, 1)::text || ' %'
       end                                                  as "perte vs étape préc.",
       coalesce(p.visites::text, '0') || ' il y a 7 j'      as tendance,
       c.rang                                               as tri
from courante c
left join precedente p on p.rang = c.rang

union all

-- ── ② LA PLUS GROSSE CHUTE ──────────────────────────────────────────────
select '② Plus grosse chute',
       coalesce((select libelle from chutes order by taux_perte desc nulls last limit 1),
                'aucune donnée'),
       coalesce((select perdus::text || ' visites perdues' from chutes
                 order by taux_perte desc nulls last limit 1), '—'),
       coalesce((select taux_perte::text || ' %' from chutes
                 order by taux_perte desc nulls last limit 1), '—'),
       'étape à travailler en priorité', '', 10

union all

-- ── ③ ATTENTE n8n ───────────────────────────────────────────────────────
-- Le moment le plus fragile du parcours : 30 à 50 s d'attente.
-- `::numeric` obligatoire : percentile_cont renvoie un double precision, et
-- round(double, int) n'existe pas en PostgreSQL — seul round(numeric, int).
select '③ Attente n8n', 'Durée médiane (p50)',
       coalesce(round((percentile_cont(0.5) within group (order by ms) / 1000)::numeric, 1)::text || ' s', '—'),
       '', '', '', 20
from attente
union all
select '③ Attente n8n', 'Durée p90 (les plus lents)',
       coalesce(round((percentile_cont(0.9) within group (order by ms) / 1000)::numeric, 1)::text || ' s', '—'),
       '', '', '', 21
from attente
union all
select '③ Attente n8n', 'Durée maximale',
       coalesce(round(max(ms) / 1000, 1)::text || ' s', '—'),
       '', '', '', 22
from attente
union all
select '③ Attente n8n', 'Abandons pendant l''attente',
       n::text,
       coalesce(secondes_moyennes::text || ' s en moyenne avant de partir', '—'),
       'partis avant le résultat', '', 23
from abandons

union all

-- ── ④ POURQUOI ÇA ÉCHOUE ────────────────────────────────────────────────
select '④ Échecs',
       case a.event_type when 'csv_rejected' then 'CSV refusé · '
                         else 'Audit en échec · ' end
         || coalesce(a.properties->>'error_code', 'inconnu'),
       count(*)::text,
       count(distinct a.session_id)::text || ' visite(s)',
       '', '', 30
from audit_events a, periodes p
where p.periode = 'courante'
  and a.event_type in ('csv_rejected', 'audit_failed')
  and a."timestamp" >= p.debut and a."timestamp" < p.fin
group by 1, 2

union all

-- ── ⑤ QUEL BOUTON TRAVAILLE ─────────────────────────────────────────────
select '⑤ Boutons',
       case a.event_type when 'landing_cta_audit_click' then 'Vers l''audit · '
                         else 'Vers Calendly · ' end
         || coalesce(a.properties->>'location', 'non précisé'),
       count(*)::text,
       count(distinct a.session_id)::text || ' visite(s)',
       '', '', 40
from audit_events a, periodes p
where p.periode = 'courante'
  and a.event_type in ('landing_cta_audit_click', 'cta_calendly_click')
  and a."timestamp" >= p.debut and a."timestamp" < p.fin
group by 1, 2

union all

-- ── ⑥ CONTRÔLE DE COLLECTE ──────────────────────────────────────────────
-- Le projet Supabase du plan gratuit se met en pause après ~1 semaine sans
-- activité, et les insertions échouent alors EN SILENCE. Si la date ci-dessous
-- est vieille de plusieurs jours alors que le site reçoit du trafic, la
-- collecte s'est arrêtée.
select '⑥ Contrôle',
       'Dernier événement reçu',
       coalesce(to_char(max("timestamp") at time zone 'Europe/Paris',
                        'DD/MM/YYYY HH24:MI'), 'AUCUN — collecte à vérifier'),
       coalesce(age(now(), max("timestamp"))::text, '—'),
       count(*) filter (where "timestamp" >= now() - interval '24 hours')::text
         || ' événement(s) sur 24 h',
       '', 50
from audit_events

order by tri, ligne;


-- ════════════════════════════════════════════════════════════════════════
-- ANNEXE — purge des données de mesure (à activer)
--
-- ⚠️ La politique de confidentialité annonce une conservation de 12 mois.
-- Tant que la purge ci-dessous n'est pas planifiée, cette promesse n'est pas
-- tenue. Deux façons de la respecter :
--
--   a) Manuellement, une fois par an, en exécutant :
--        delete from audit_events where "timestamp" < now() - interval '12 months';
--
--   b) Automatiquement, avec pg_cron (à exécuter UNE fois, en dehors de ce
--      snippet — c'est une modification du projet, pas une lecture) :
--
--        create extension if not exists pg_cron;
--        select cron.schedule(
--          'purge-audit-events',
--          '23 4 1 * *',   -- le 1er de chaque mois à 04h23 UTC ; heure décalée
--                          -- volontairement, les tâches à l'heure ronde
--                          -- s'entassent dans la file d'attente
--          $$delete from audit_events where "timestamp" < now() - interval '12 months'$$
--        );
--
-- Pour vérifier ensuite : select * from cron.job;
-- ════════════════════════════════════════════════════════════════════════
