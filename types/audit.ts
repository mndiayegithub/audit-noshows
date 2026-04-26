export interface AuditStats {
  nom_cabinet: string;
  periode: { debut: string; fin: string; nb_mois: number };
  global: {
    total_rdv: number;
    no_shows: number;
    honores: number;
    taux: number;
    ca_moyen: number;
    ca_perdu_mois: number;
    ca_perdu_an: number;
  };
  benchmark: { votre_taux: number; optimal: string; ecart: number };
  top_3_pires: Array<{
    jour: string;
    heure: string;
    total: number;
    noShows: number;
    taux: number;
    ca_perdu: number;
  }>;
  top_3_meilleurs: Array<{
    jour: string;
    heure: string;
    total: number;
    noShows: number;
    taux: number;
    ca_perdu: number;
  }>;
  potentiel: { passage_5: number; passage_45: number };
  par_jour?: Array<{
    jour: string;
    total_rdv: number;
    no_shows: number;
    taux: number;
  }>;
  // Champs additionnels optionnels venant de n8n
  stats_par_jour?: Array<{ jour: string; total: number; noShows: number; taux: number }>;
  stats_par_praticien?: Array<{
    praticien: string;
    total: number;
    noShows: number;
    taux: number;
    ca_perdu: number;
  }>;
  stats_par_mois?: Array<{
    mois: string;       // "YYYY-MM"
    total_rdv: number;
    no_shows: number;
    taux: number;       // % 0-100, arrondi 1 décimale
  }>;
  par_heure?: Array<{
    tranche?: string;
    slot?: string;
    heure?: string;
    count?: number;
    no_shows?: number;
    noShows?: number;
    value?: number;
  }>;
}

export interface AuditResponse {
  success: boolean;
  stats: AuditStats;
  rapport_texte: string;
  pdf_url: string | null;
  email_sent: boolean;
  // Phase 7 — REQ #3 (mode dégradé)
  degraded?: boolean;
  reco_rate?: number;          // 0..1
  ignored_count?: number;
  sample_ignored?: Array<{ ligne?: number; raison?: string; valeur?: string }>;
  // Phase 7 — REQ #2 (cas erreur)
  error?: string;
  error_code?: import("./audit-errors").AuditErrorCode;
  details?: Record<string, unknown>;
}

export interface GoogleData {
  name: string;
  rating: number;
  user_ratings_total: number;
  formatted_address?: string;
}
