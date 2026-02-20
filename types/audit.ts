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
  // Champs additionnels optionnels venant de n8n
  stats_par_jour?: Array<{ jour: string; total: number; noShows: number; taux: number }>;
  stats_par_praticien?: Array<{
    praticien: string;
    total: number;
    noShows: number;
    taux: number;
    ca_perdu: number;
  }>;
}

export interface AuditResponse {
  success: boolean;
  stats: AuditStats;
  rapport_texte: string;
  pdf_url: string | null;
  email_sent: boolean;
  error?: string;
}
