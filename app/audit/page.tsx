"use client";

import { useState, useCallback, useRef, useEffect, createElement } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UploadCloud, ShieldCheck, TrendingUp, Activity, Sparkles, CheckCircle, FileText } from "lucide-react";
// react-pdf est importé dynamiquement dans handleDownloadPDF pour éviter tout chargement SSR
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
  if (score >= 80) return { label: "Optimal",     color: "#10B981", tw: "text-success",  bgTw: "bg-green-50",    borderTw: "border-success/20"   };
  if (score >= 60) return { label: "Moyen",           color: "#F59E0B", tw: "text-warning", bgTw: "bg-orange-50",   borderTw: "border-warning/20"  };
  return             { label: "Critique",        color: "#EF4444", tw: "text-danger",    bgTw: "bg-red-50",      borderTw: "border-danger/20"     };
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
      statusCls: taux <= 5 ? "text-success bg-emerald-50" : taux <= 10 ? "text-warning bg-amber-50" : "text-danger bg-red-50",
    },
    {
      label: "Vs benchmark secteur",
      value: stats.benchmark.optimal,
      status: stats.benchmark.ecart <= 1 ? "CONFORME" : `+${stats.benchmark.ecart.toFixed(1)} pts`,
      statusCls: stats.benchmark.ecart <= 1 ? "text-success bg-emerald-50" : "text-warning bg-amber-50",
    },
    {
      label: "CA perdu / an",
      value: `${stats.global.ca_perdu_an.toLocaleString("fr-FR")} €`,
      status: stats.global.ca_perdu_an > 30000 ? "IMPACT FORT" : stats.global.ca_perdu_an > 10000 ? "IMPACT MOYEN" : "IMPACT FAIBLE",
      statusCls: stats.global.ca_perdu_an > 30000 ? "text-danger bg-red-50" : stats.global.ca_perdu_an > 10000 ? "text-warning bg-amber-50" : "text-success bg-emerald-50",
    },
    {
      label: "Créneaux à risque",
      value: `${stats.top_3_pires?.length ?? 0} identifiés`,
      status: (stats.top_3_pires?.length ?? 0) > 0 ? "À TRAITER" : "RAS",
      statusCls: (stats.top_3_pires?.length ?? 0) > 0 ? "text-warning bg-amber-50" : "text-success bg-emerald-50",
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
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Top label */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Score de performance</p>
        <p className="text-xs text-slate-400 hidden sm:block">VOS RÉSULTATS PERSONNALISÉS</p>
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
              stroke="#F1F5F9"
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
            />
            {/* Score number */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#0F172A" fontSize="38" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              {displayed}
            </text>
            <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748B" fontSize="15" fontFamily="Plus Jakarta Sans, sans-serif">
              /100
            </text>
          </svg>

          {/* Badge label */}
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${config.bgTw} ${config.tw} ${config.borderTw}`}>
            {config.label}
          </span>

          {/* Legend */}
          <div className="flex gap-3 text-xs text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger inline-block" />Critique</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" />Moyen</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" />Optimal</span>
          </div>
        </div>

        {/* ── Séparateur vertical ───────── */}
        <div className="hidden md:block self-stretch w-px bg-slate-200 mx-2" />

        {/* ── Indicateurs ──────────────── */}
        <div className="flex-1 w-full space-y-2.5">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="text-slate-600 font-medium text-sm">{cat.label}</span>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-slate-900 font-bold text-sm">{cat.value}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border border-current ${cat.statusCls}`}>
                  {cat.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip — Potentiel récupérable */}
      <div className="bg-yellow-50 border-t border-yellow-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-yellow-800 text-sm font-semibold">Potentiel récupérable estimé</span>
        <span className="text-yellow-600 font-heading font-bold text-xl md:text-2xl tracking-tight">
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
      // Import dynamique — react-pdf ne charge JAMAIS côté serveur (évite les erreurs SSR)
      const [{ pdf, Font }, { default: RapportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/audit/RapportPDF"),
      ]);

      // Enregistrement des fonts avec URL absolue (client uniquement)
      // Fonts WOFF (zlib) — format le plus fiable avec fontkit browser
      // JetBrainsMono → TTF valides (déjà OK depuis le début)
      const base = window.location.origin;
      Font.register({
        family: "PlusJakartaSans",
        fonts: [
          { src: `${base}/fonts/PlusJakartaSans-Bold.woff`, fontWeight: 700 },
          { src: `${base}/fonts/PlusJakartaSans-ExtraBold.woff`, fontWeight: 800 },
        ],
      });
      Font.register({
        family: "Inter",
        fonts: [
          { src: `${base}/fonts/Inter-Regular.woff`, fontWeight: 400 },
          { src: `${base}/fonts/Inter-Medium.woff`, fontWeight: 500 },
          { src: `${base}/fonts/Inter-Bold.woff`, fontWeight: 700 },
        ],
      });
      Font.register({
        family: "Mono",
        fonts: [
          { src: `${base}/fonts/JetBrainsMono-Regular.ttf`, fontWeight: 400 },
          { src: `${base}/fonts/JetBrainsMono-Bold.ttf`, fontWeight: 700 },
        ],
      });

      // pdf() attend ReactElement<DocumentProps> mais notre wrapper component est valide
      type PdfRenderer = (el: ReturnType<typeof createElement>) => { toBlob: () => Promise<Blob> };
      const blob = await (pdf as unknown as PdfRenderer)(createElement(RapportPDF, { resultats })).toBlob();
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
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Erreur génération PDF — détail complet:", error);
      toast.error(`PDF : ${msg}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-800 font-sans selection:bg-brand-200 selection:text-brand-900 overflow-x-hidden">
      
      {/* Header */}
      <nav id="navbar" className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">
                PerfIAmatic
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Comment ça marche</Link>
              <Link href="/#impact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Impact</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
        {etat === "formulaire" && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-soft border border-slate-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyse Gratuite & Sécurisée
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">
                  Lancez votre audit gratuit.
                </h1>
                <p className="text-slate-500 font-medium">
                  Uploadez votre export Doctolib et recevez votre rapport personnalisé en 60 secondes.
                </p>
              </div>

              {/* Micro-steps */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: UploadCloud, step: "1", label: "Uploadez", sub: "votre CSV Doctolib", color: "text-primary bg-blue-50" },
                  { icon: Sparkles, step: "2", label: "Analysez vos données", sub: "en 30–60 secondes", color: "text-accent bg-purple-50" },
                  { icon: FileText, step: "3", label: "Rapport PDF", sub: "téléchargeable", color: "text-success bg-emerald-50" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-2 relative`}>
                      <s.icon className="w-5 h-5" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">{s.step}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{s.label}</p>
                    <p className="text-[10px] text-slate-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Zone dropzone */}
              <div
                {...getRootProps()}
                className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 mb-8 flex flex-col items-center justify-center group ${
                  isDragActive
                    ? "border-primary bg-blue-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-primary text-slate-600"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-white shadow-soft rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <p className={`font-heading font-semibold text-xl mb-2 ${isDragActive ? "text-primary" : "text-slate-800"}`}>
                  {file
                    ? file.name
                    : "Lancer l'Audit"}
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  {file ? "Cliquez pour modifier" : "Cliquez ou glissez votre CSV ici"}
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-5 text-left">
                <div>
                  <label
                    htmlFor="nom_cabinet"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Nom du cabinet <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nom_cabinet"
                    type="text"
                    value={nomCabinet}
                    onChange={(e) => setNomCabinet(e.target.value)}
                    placeholder="Ex : Cabinet Dr. Martin"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca_moyen"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    CA moyen par RDV (€)
                  </label>
                  <input
                    id="ca_moyen"
                    type="number"
                    value={caMoyen}
                    onChange={(e) => setCaMoyen(Number(e.target.value) || 150)}
                    min={1}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Email (optionnel, pour recevoir le rapport)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cabinet@exemple.fr"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-6 flex items-center justify-center gap-2 group"
                >
                  <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Générer l{"'"}Audit Flash
                </button>
                <div className="text-center mt-6 text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Chiffrement 256-bit · Conforme RGPD · Aucun nom patient stocké
                </div>
              </div>
            </div>
          </div>
        )}

        {etat === "loading" && (
          <div className="max-w-lg mx-auto w-full text-center">
            <h2 className="text-3xl font-heading font-extrabold text-slate-900 mb-2 tracking-tight">
              Analyse en cours...
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              Temps estimé : 30-60 secondes
            </p>
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-soft text-left">
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out relative"
                  style={{
                    width: `${(etapeActuelle / 4) * 100}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <ul className="space-y-4">
                {ETAPES_LOADING.map((etape) => (
                  <li
                    key={etape.id}
                    className={`flex items-center gap-3 font-medium ${
                      etapeActuelle >= etape.id
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {etapeActuelle >= etape.id ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-success flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                    {etape.texte}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {etat === "resultats" && resultats && (
          <div className="space-y-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold mb-3">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Analyse terminée
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                  Résultats de l{"'"}audit — {resultats.stats.nom_cabinet}
                </h1>
                <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Période analysée : {resultats.stats.periode.nb_mois} mois
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-6 py-2.5 border-2 border-primary bg-white/50 text-primary rounded-full font-bold text-sm hover:bg-blue-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingPDF ? "Génération..." : "Télécharger PDF"}
                </button>
              </div>
            </motion.div>

            {/* KPI ROW */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {[
                { label: "Total RDV", value: resultats.stats.global.total_rdv.toLocaleString(), color: "text-slate-900", border: "border-l-primary" },
                { label: "No-shows", value: resultats.stats.global.no_shows.toLocaleString(), color: "text-slate-900", border: "border-l-danger" },
                { label: "Taux no-shows", value: `${resultats.stats.global.taux}%`, color: resultats.stats.global.taux > 5 ? "text-danger" : resultats.stats.global.taux > 3 ? "text-warning" : "text-success", border: resultats.stats.global.taux > 5 ? "border-l-danger" : resultats.stats.global.taux > 3 ? "border-l-warning" : "border-l-success" },
                { label: "CA perdu/an", value: `${resultats.stats.global.ca_perdu_an.toLocaleString()} €`, color: "text-danger", border: "border-l-danger" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  variants={fadeInUp}
                  custom={i}
                  className={`bg-white rounded-2xl border border-slate-100 border-l-4 p-6 shadow-soft ${card.border}`}
                >
                  <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-heading font-extrabold ${card.color}`}>{card.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Score de performance */}
            <ScoreCard stats={resultats.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Graphique 1 : Bar chart */}
              {resultats.stats.par_jour && resultats.stats.par_jour.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4">
                   <GraphiqueParJour parJour={resultats.stats.par_jour} />
                </div>
              )}

              {/* Graphique 2 : Gauge */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4">
                <GaugeBenchmark tauxActuel={resultats.stats.global.taux} />
              </div>
            </div>

            {/* Top 3 créneaux à risque */}
            {resultats.stats.top_3_pires?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-3xl border border-slate-100 border-l-4 border-l-danger p-8 shadow-soft"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-danger text-sm font-bold">✗</span> Top 3 créneaux à risque
                </h2>
                <ul className="space-y-0">
                  {resultats.stats.top_3_pires.map((creneau, index) => {
                    const caPerduAnnuel = creneau.ca_perdu;
                    return (
                      <li
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100/50 last:border-0"
                      >
                        <span className="font-extrabold font-heading text-slate-900 text-lg w-1/3">
                          {creneau.jour} à {creneau.heure}
                        </span>
                        <span className="text-slate-600 font-medium w-1/3">
                          <span className="text-danger font-bold mr-1">{creneau.taux}%</span> no-shows 
                          <span className="text-sm text-slate-400 ml-2">({creneau.noShows}/{creneau.total})</span>
                        </span>
                        <span className="text-danger font-bold text-lg w-1/3 sm:text-right">
                          {caPerduAnnuel.toLocaleString()} € perdus/an
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {/* Top 3 créneaux performants */}
            {resultats.stats.top_3_meilleurs?.length > 0 && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-3xl border border-slate-100 border-l-4 border-l-success p-8 shadow-soft"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-success text-sm font-bold">✓</span> Top 3 créneaux performants
                </h2>
                <ul className="space-y-0">
                  {resultats.stats.top_3_meilleurs.map((creneau, index) => (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100/50 last:border-0"
                    >
                      <span className="font-extrabold font-heading text-slate-900 text-lg w-1/3">
                        {creneau.jour} à {creneau.heure}
                      </span>
                      <span className="text-slate-600 font-medium w-1/3">
                        <span className="text-sm text-slate-400 mr-2">({creneau.noShows}/{creneau.total})</span>
                        no-shows
                      </span>
                      <span className="text-success font-bold text-lg w-1/3 sm:text-right">
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
                className="bg-white rounded-3xl border border-t-4 border-t-primary border-slate-100 p-8 shadow-soft"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Généré par IA
                  </span>
                  Plan d{"'"}action
                </h2>
                <div className="text-slate-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-heading font-bold mt-8 mb-4 text-primary first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-heading font-bold mt-10 mb-5 text-slate-900 border-b border-slate-200 pb-2 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-heading font-bold mt-6 mb-3 text-slate-900" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-3 mb-6 marker:text-primary marker:font-bold" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-2 border-l-2 border-primary/20" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                      hr: ({ node, ...props }) => <hr className="border-slate-200 my-8" {...props} />,
                    }}
                  >
                    {resultats.rapport_texte}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Boutons d'action */}
            <motion.div
              className="flex flex-col gap-4 items-center mt-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold hover:bg-blue-50 transition-colors w-full sm:w-auto text-center flex justify-center items-center gap-2"
                >
                  Télécharger ce rapport en PDF
                </button>
                <a
                  href="mailto:contact@perfiamatic.com?subject=Demande%20Audit%20Complet"
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto text-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Passer à l{"'"}Audit Complet →
                </a>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Données confidentielles — Conforme RGPD
              </p>
            </motion.div>
          </div>
        )}

        {etat === "erreur" && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-red-50 border border-danger/20 rounded-3xl p-8 text-center shadow-soft">
              <div className="w-16 h-16 bg-red-100 text-danger rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
              <h1 className="text-2xl font-heading font-extrabold text-danger mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-slate-700 mb-8 font-medium">{erreur}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={reessayer}
                  className="bg-danger text-white hover:bg-red-600 px-8 py-3 rounded-full font-bold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Réessayer
                </button>
                <Link
                  href="/"
                  className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Retour à l{"'"}accueil
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
