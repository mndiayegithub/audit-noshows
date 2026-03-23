"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import RapportPDF from "@/components/audit/RapportPDF";
import GraphiqueParJour from "@/components/GraphiqueParJour";
import GaugeBenchmark from "@/components/GaugeBenchmark";
import type { AuditResponse } from "@/types/audit";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

type Etat = "formulaire" | "loading" | "resultats" | "erreur";

// ─── Calcul du score de performance ──────────────────────────────────────────
function calcScore(taux: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - taux * 3.2)));
}

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Excellent",     color: "#4CAF50", tw: "text-med-green",  bgTw: "bg-med-green/10",    borderTw: "border-med-green/40"   };
  if (score >= 60) return { label: "Bien",           color: "#F59E0B", tw: "text-yellow-400", bgTw: "bg-yellow-400/10",   borderTw: "border-yellow-400/40"  };
  if (score >= 40) return { label: "À améliorer",    color: "#F97316", tw: "text-orange-400", bgTw: "bg-orange-400/10",   borderTw: "border-orange-400/40"  };
  return             { label: "Critique",        color: "#EF4444", tw: "text-red-400",    bgTw: "bg-red-500/10",      borderTw: "border-red-500/40"     };
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────
function ScoreCard({ stats }: { stats: import("@/types/audit").AuditStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  const score  = calcScore(stats.global.taux);
  const config = getScoreConfig(score);

  // SVG arc constants (270° gauge)
  const R    = 72;
  const CX   = 96;
  const CY   = 96;
  const CIRC = 2 * Math.PI * R;   // ≈ 452.4
  const ARC  = CIRC * 0.75;       // 270° visible track
  const GAP  = CIRC - ARC;

  // Intersection observer — trigger animation once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Counter animation 0 → score
  useEffect(() => {
    if (!visible) return;
    let raf: number;
    const start = performance.now();
    const duration = 1400;
    const run = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [visible, score]);

  const progressArc = ARC * (displayed / 100);

  const taux = stats.global.taux;
  const categories = [
    {
      label: "Taux no-shows",
      value: `${taux}%`,
      status: taux <= 5  ? "OPTIMAL"      : taux <= 10 ? "À SURVEILLER" : "À RISQUE",
      statusCls: taux <= 5 ? "text-med-green bg-med-green/15" : taux <= 10 ? "text-yellow-400 bg-yellow-400/15" : "text-red-400 bg-red-500/10",
    },
    {
      label: "Vs benchmark secteur",
      value: stats.benchmark.optimal,
      status: stats.benchmark.ecart <= 1 ? "CONFORME" : `+${stats.benchmark.ecart.toFixed(1)} pts`,
      statusCls: stats.benchmark.ecart <= 1 ? "text-med-green bg-med-green/15" : "text-orange-400 bg-orange-400/15",
    },
    {
      label: "CA perdu / an",
      value: `${stats.global.ca_perdu_an.toLocaleString("fr-FR")} €`,
      status: stats.global.ca_perdu_an > 30000 ? "IMPACT FORT" : stats.global.ca_perdu_an > 10000 ? "IMPACT MOYEN" : "IMPACT FAIBLE",
      statusCls: stats.global.ca_perdu_an > 30000 ? "text-red-400 bg-red-500/10" : stats.global.ca_perdu_an > 10000 ? "text-orange-400 bg-orange-400/15" : "text-med-green bg-med-green/15",
    },
    {
      label: "Créneaux à risque",
      value: `${stats.top_3_pires?.length ?? 0} identifiés`,
      status: (stats.top_3_pires?.length ?? 0) > 0 ? "À TRAITER" : "RAS",
      statusCls: (stats.top_3_pires?.length ?? 0) > 0 ? "text-orange-400 bg-orange-400/15" : "text-med-green bg-med-green/15",
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      initial="hidden"
      animate="visible"
      className="bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-card"
    >
      {/* Top label */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Score de performance no-shows</p>
        <p className="text-xs text-slate-500 hidden sm:block">VOS RÉSULTATS PERSONNALISÉS</p>
      </div>

      {/* Body: gauge ＋ categories */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">

        {/* ── Jauge SVG ────────────────── */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <svg width="192" height="192" viewBox="0 0 192 192" aria-label={`Score ${score}/100`}>
            {/* Track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="14"
              strokeDasharray={`${ARC} ${GAP}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
            {/* Active */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={config.color}
              strokeWidth="14"
              strokeDasharray={`${progressArc} ${CIRC - progressArc}`}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
              style={{ filter: `drop-shadow(0 0 6px ${config.color}88)` }}
            />
            {/* Score number */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize="38" fontWeight="bold" fontFamily="DM Sans, sans-serif">
              {displayed}
            </text>
            <text x={CX} y={CY + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="15" fontFamily="DM Sans, sans-serif">
              /100
            </text>
          </svg>

          {/* Badge label */}
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${config.bgTw} ${config.tw} ${config.borderTw}`}>
            {config.label}
          </span>

          {/* Legend */}
          <div className="flex gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Critique</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Moyen</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-med-green inline-block" />Optimal</span>
          </div>
        </div>

        {/* ── Séparateur vertical ───────── */}
        <div className="hidden md:block self-stretch w-px bg-white/10 mx-2" />

        {/* ── Indicateurs ──────────────── */}
        <div className="flex-1 w-full space-y-2.5">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5"
            >
              <span className="text-slate-300 text-sm">{cat.label}</span>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-white font-semibold text-sm">{cat.value}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${cat.statusCls}`}>
                  {cat.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip — Potentiel récupérable */}
      <div className="bg-med-blue/10 border-t border-med-blue/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-slate-300 text-sm font-medium">Potentiel récupérable estimé</span>
        <span className="text-med-blue font-heading font-bold text-xl md:text-2xl tracking-tight">
          +{stats.potentiel.passage_45.toLocaleString("fr-FR")} €/an
        </span>
      </div>
    </motion.div>
  );
}

const ETAPES_LOADING = [
  { id: 1, texte: "Lecture du fichier CSV...", delai: 0 },
  { id: 2, texte: "Analyse des données...", delai: 3000 },
  { id: 3, texte: "Calcul des statistiques...", delai: 8000 },
  { id: 4, texte: "Génération du rapport IA...", delai: 15000 },
];

export default function AuditPage() {
  const [etat, setEtat] = useState<Etat>("formulaire");
  const [file, setFile] = useState<File | null>(null);
  const [nomCabinet, setNomCabinet] = useState("");
  const [caMoyen, setCaMoyen] = useState(150);
  const [email, setEmail] = useState("");
  const [resultats, setResultats] = useState<AuditResponse | null>(null);
  const [erreur, setErreur] = useState("");
  const [etapeActuelle, setEtapeActuelle] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection?.errors[0]?.code === "file-too-large") {
        toast.error("Le fichier ne doit pas dépasser 10 Mo");
      } else if (rejection?.errors[0]?.code === "file-invalid-type") {
        toast.error("Seuls les fichiers CSV sont acceptés");
      } else {
        toast.error("Erreur lors de l'upload du fichier");
      }
    },
  });

  const handleSubmit = async () => {
    if (!file || !nomCabinet.trim()) {
      toast.error("Veuillez sélectionner un fichier CSV et indiquer le nom du cabinet");
      return;
    }

    setEtat("loading");
    setEtapeActuelle(0);

    // Affichage séquentiel des étapes (cosmétique uniquement)
    ETAPES_LOADING.forEach(({ id, delai, texte }) => {
      setTimeout(() => {
        setEtapeActuelle(id);
      }, delai);
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;

      const formData = new FormData();
      formData.append("csv", csvText);
      formData.append("nom_cabinet", nomCabinet.trim());
      formData.append("ca_moyen", String(caMoyen));
      if (email.trim()) formData.append("email", email.trim());

      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          body: formData,
        });

        const data: AuditResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur serveur");
        }

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de l'analyse");
        }

        setResultats(data);
        setEtat("resultats");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Une erreur est survenue";
        setErreur(message);
        setEtat("erreur");
        toast.error(message);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const reessayer = () => {
    setEtat("formulaire");
    setErreur("");
    setFile(null);
    setEtapeActuelle(0);
  };

  const handleDownloadPDF = async () => {
    if (!resultats) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(<RapportPDF resultats={resultats} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nomCabinet = resultats.stats.nom_cabinet
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `Audit_NoShows_${nomCabinet}_${date}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark relative">
      <div className="fixed inset-0 bg-hex-pattern opacity-[0.03] pointer-events-none" />
      
      {/* Header */}
      <header className="bg-brand-dark border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center shrink-0" aria-label="PerfIAmatic - Accueil">
              <Image
                src="/logo.png"
                alt="PerfIAmatic"
                width={246}
                height={55}
                className="h-[2.73rem] w-auto object-contain"
                priority
              />
            </Link>
            <nav>
              <Link
                href="/"
                className="text-slate-300 hover:text-gold transition-colors font-medium"
              >
                Accueil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        {etat === "formulaire" && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gold">
              Audit Flash No-Shows
            </h1>
            <p className="text-slate-300">
              Uploadez votre fichier CSV d&apos;export de rendez-vous pour
              obtenir une analyse complète en quelques secondes.
            </p>

            {/* Zone dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-gold bg-gold/10"
                  : "border-white/30 hover:border-gold/50 text-slate-300"
              }`}
            >
              <input {...getInputProps()} />
              <p className={isDragActive ? "text-gold" : ""}>
                {file
                  ? `Fichier sélectionné : ${file.name}`
                  : "Glissez-déposez votre fichier CSV ici, ou cliquez pour sélectionner"}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Fichiers .csv uniquement, max 10 Mo
              </p>
            </div>

            {/* Formulaire */}
            <div className="bg-surface rounded-xl border border-white/10 p-6 space-y-4 shadow-card">
              <div>
                <label
                  htmlFor="nom_cabinet"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Nom du cabinet <span className="text-red-400">*</span>
                </label>
                <input
                  id="nom_cabinet"
                  type="text"
                  value={nomCabinet}
                  onChange={(e) => setNomCabinet(e.target.value)}
                  placeholder="Ex : Cabinet Dr. Martin"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-brand-dark/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-gold focus:border-gold/50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="ca_moyen"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  CA moyen par RDV (€)
                </label>
                <input
                  id="ca_moyen"
                  type="number"
                  value={caMoyen}
                  onChange={(e) => setCaMoyen(Number(e.target.value) || 150)}
                  min={1}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-brand-dark/50 text-white focus:ring-2 focus:ring-gold focus:border-gold/50"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Email (optionnel, pour recevoir le rapport)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cabinet@exemple.fr"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-brand-dark/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-gold focus:border-gold/50"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-gold text-brand-dark py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
              >
                Générer l&apos;Audit Flash
              </button>
            </div>
          </div>
        )}

        {etat === "loading" && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gold">
              Analyse en cours...
            </h1>
            <p className="text-slate-300">
              Temps estimé : 30-60 secondes
            </p>
            <div className="bg-surface rounded-xl border border-white/10 p-8 shadow-card">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-gold transition-all duration-500 ease-out"
                  style={{
                    width: `${(etapeActuelle / 4) * 100}%`,
                  }}
                />
              </div>
              <ul className="space-y-3">
                {ETAPES_LOADING.map((etape) => (
                  <li
                    key={etape.id}
                    className={`flex items-center gap-3 ${
                      etapeActuelle >= etape.id
                        ? "text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    {etapeActuelle >= etape.id ? (
                      <span className="text-gold">✓</span>
                    ) : (
                      <span className="w-5" />
                    )}
                    {etape.texte}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {etat === "resultats" && resultats && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="flex flex-col items-center text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gold">
                Résultats de l&apos;audit
              </h1>
              <p className="text-slate-300 mt-2 text-lg">
                {resultats.stats.nom_cabinet} • Période analysée :{" "}
                {resultats.stats.periode.nb_mois} mois
              </p>
            </motion.div>

            {/* Score de performance */}
            <ScoreCard stats={resultats.stats} />

            {/* Cards statistiques */}
            <motion.div
              className="flex flex-col gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "📊 Total RDV", value: resultats.stats.global.total_rdv.toLocaleString(), color: "text-white" },
                  { label: "❌ No-shows", value: resultats.stats.global.no_shows.toLocaleString(), color: "text-white" },
                  { label: "📉 Taux no-shows", value: `${resultats.stats.global.taux}%`, color: "text-white" },
                  { label: "💸 CA perdu/an", value: `${resultats.stats.global.ca_perdu_an.toLocaleString()} €`, color: "text-white" },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    variants={fadeInUp}
                    custom={i}
                    className="bg-surface rounded-xl border border-white/10 p-4 shadow-card transition-all duration-300 hover:shadow-xl hover:border-white/20 hover:-translate-y-0.5"
                  >
                    <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Potentiel récupérable */}
              <motion.div
                variants={fadeInUp}
                custom={4}
                className="bg-surface rounded-xl border border-gold/50 p-8 text-center shadow-card transition-all duration-300 hover:shadow-glow-gold hover:border-gold hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Glow subtil en fond */}
                <div className="absolute inset-0 bg-gold/5 animate-pulse" style={{ animationDuration: '3s' }} />
                
                <div className="relative z-10">
                  <p className="text-med-blue font-heading font-semibold mb-2 uppercase tracking-wider text-sm md:text-base">
                    Potentiel récupérable/an
                  </p>
                  <p className="text-4xl md:text-[48px] font-heading font-bold text-gold">
                    {resultats.stats.potentiel.passage_45.toLocaleString()} €
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Graphique 1 : Bar chart */}
              {resultats.stats.par_jour && resultats.stats.par_jour.length > 0 && (
                <GraphiqueParJour parJour={resultats.stats.par_jour} />
              )}

              {/* Graphique 2 : Gauge */}
              <GaugeBenchmark tauxActuel={resultats.stats.global.taux} />
            </div>

            {/* Top 3 créneaux à risque */}
            {resultats.stats.top_3_pires?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-red-500/5 rounded-xl border border-red-500/20 p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:border-red-500/40"
              >
                <h2 className="text-lg font-heading font-semibold text-red-400 mb-4">
                  🔴 Top 3 créneaux à risque
                </h2>
                <ul className="space-y-3">
                  {resultats.stats.top_3_pires.map((creneau, index) => {
                    const caPerduAnnuel = creneau.ca_perdu;
                    return (
                      <li
                        key={index}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-white/10 last:border-0"
                      >
                        <span className="font-medium text-slate-200">
                          {creneau.jour} à {creneau.heure}
                        </span>
                        <span className="text-slate-400">
                          {creneau.taux}% • {creneau.noShows}/{creneau.total} no-shows
                        </span>
                        <span className="text-red-400 font-medium">
                          {caPerduAnnuel.toLocaleString()} € perdus/an
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {/* Séparateur visuel */}
            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-med-blue/20 w-16 md:w-32"></div>
              <div className="w-2 h-2 rounded-full bg-med-blue/50 mx-4"></div>
              <div className="h-px bg-med-blue/20 w-16 md:w-32"></div>
            </div>

            {/* Top 3 créneaux performants */}
            {resultats.stats.top_3_meilleurs?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-med-green/5 rounded-xl border border-med-green/20 p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:border-med-green/40"
              >
                <h2 className="text-lg font-heading font-semibold text-med-green mb-4">
                  🟢 Top 3 créneaux performants
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                  Ces créneaux présentent un taux de no-shows optimal. Analysez
                  pourquoi ils performent mieux et appliquez les mêmes conditions
                  aux créneaux à risque.
                </p>
                <ul className="space-y-3">
                  {resultats.stats.top_3_meilleurs.map((creneau, index) => (
                    <li
                      key={index}
                      className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-white/10 last:border-0"
                    >
                      <span className="font-medium text-slate-200">
                        {creneau.jour} à {creneau.heure}
                      </span>
                      <span className="text-slate-400">
                        {creneau.noShows}/{creneau.total} no-shows
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {`${creneau.taux}% no-shows`}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Rapport IA */}
            {resultats.rapport_texte && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-surface rounded-xl border border-white/10 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-xl hover:border-white/20"
              >
                <h2 className="text-xl font-heading font-bold text-gold mb-6">
                  Rapport d&apos;analyse IA
                </h2>
                <div className="rapport-markdown text-slate-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-2xl font-heading font-bold mt-8 mb-4 text-gold first:mt-0"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl font-heading font-bold mt-10 mb-5 text-gold border-t border-med-blue/30 pt-6 first:border-0 first:mt-0"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg font-heading font-semibold mt-6 mb-3 text-slate-200"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-4 text-slate-300 leading-relaxed"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="space-y-3 mb-6 [&>li]:bg-white/5 [&>li]:rounded-lg [&>li]:p-4 [&>li]:border [&>li]:border-white/5 [&>li]:text-slate-300"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-5 space-y-4 mb-6 text-slate-300 marker:text-med-blue marker:font-bold"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-relaxed text-slate-300" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="font-semibold text-white"
                          {...props}
                        />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic text-slate-200" {...props} />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="bg-white/10 text-med-blue rounded px-1.5 py-0.5 text-sm font-mono"
                          {...props}
                        />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="border-med-blue/20 my-6" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-gold/50 pl-4 my-4 text-slate-300 italic"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {resultats.rapport_texte.replace(
                    /RECOMMANDATIONS PRIORITAIRES/g,
                    "ACTIONS IMMÉDIATES (7 PREMIERS JOURS)"
                  )}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Boutons d'action */}
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            >
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-6 py-3 border-2 border-gold bg-transparent text-gold rounded-xl font-heading font-semibold hover:bg-gold/10 hover:border-gold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-glow-gold active:scale-[0.98]"
                >
                  {isGeneratingPDF ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    "📥 Télécharger ce rapport en PDF"
                  )}
                </button>
                <a
                  href="mailto:contact@perfiamatic.com?subject=Demande%20Audit%20Complet"
                  className="px-6 py-3 bg-gold text-brand-dark hover:bg-gold-light rounded-xl font-heading font-semibold transition-all duration-200 hover:shadow-glow-gold hover:-translate-y-0.5 active:scale-[0.98] flex items-center"
                >
                  Passer à l&apos;Audit Complet →
                </a>
              </div>
              <p className="text-sm text-slate-400">
                🔒 Données confidentielles — Conforme RGPD
              </p>
            </motion.div>
          </div>
        )}

        {etat === "erreur" && (
          <div className="space-y-8">
            <div className="bg-surface border border-red-500/30 rounded-xl p-8">
              <h1 className="text-xl font-bold text-red-400 mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-slate-300 mb-6">{erreur}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={reessayer}
                  className="bg-gold text-brand-dark hover:bg-gold-light px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Réessayer
                </button>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-gold font-medium transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer – identité PerfIAmatic */}
      <footer className="bg-brand-darker border-t border-white/10 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2025 PerfIAmatic</p>
          <a
            href="mailto:contact@perfiamatic.com"
            className="text-slate-400 text-sm hover:text-gold transition-colors"
          >
            contact@perfiamatic.com
          </a>
        </div>
      </footer>
    </div>
  );
}
