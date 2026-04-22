"use client";

import { useState, useCallback, useRef, useEffect, createElement } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  UploadCloud, ShieldCheck, TrendingUp, Activity, Sparkles,
  CheckCircle, FileText, Search,
} from "lucide-react";
import GraphiqueParJour from "@/components/GraphiqueParJour";
import GaugeBenchmark from "@/components/GaugeBenchmark";
import DiagnosticGoogle from "@/components/audit/DiagnosticGoogle";
import ScoreGlobal from "@/components/audit/ScoreGlobal";
import CTACalendly from "@/components/audit/CTACalendly";
import type { AuditResponse, GoogleData } from "@/types/audit";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type Etat = "formulaire" | "loading" | "resultats" | "erreur";

function calcScore(taux: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - taux * 3.2)));
}

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Optimal",   color: "#10B981", tw: "text-success", bgTw: "bg-success/10", borderTw: "border-success/30" };
  if (score >= 60) return { label: "Moyen",      color: "#F59E0B", tw: "text-warning", bgTw: "bg-warning/10", borderTw: "border-warning/30" };
  return             { label: "Critique",    color: "#EF4444", tw: "text-danger",  bgTw: "bg-danger/10",  borderTw: "border-danger/30"  };
}

/* ─── ScoreCard (dark) ─── */
function ScoreCard({ stats }: { stats: import("@/types/audit").AuditStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  const score  = calcScore(stats.global.taux);
  const config = getScoreConfig(score);

  const R    = 72;
  const CX   = 96;
  const CY   = 96;
  const CIRC = 2 * Math.PI * R;
  const ARC  = CIRC * 0.75;
  const GAP  = CIRC - ARC;

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
      statusCls: taux <= 5 ? "text-success bg-success/10 border-success/30" : taux <= 10 ? "text-warning bg-warning/10 border-warning/30" : "text-danger bg-danger/10 border-danger/30",
    },
    {
      label: "Vs benchmark secteur",
      value: stats.benchmark.optimal,
      status: stats.benchmark.ecart <= 1 ? "CONFORME" : `+${stats.benchmark.ecart.toFixed(1)} pts`,
      statusCls: stats.benchmark.ecart <= 1 ? "text-success bg-success/10 border-success/30" : "text-warning bg-warning/10 border-warning/30",
    },
    {
      label: "CA perdu / an",
      value: `${stats.global.ca_perdu_an.toLocaleString("fr-FR")} €`,
      status: stats.global.ca_perdu_an > 30000 ? "IMPACT FORT" : stats.global.ca_perdu_an > 10000 ? "IMPACT MOYEN" : "IMPACT FAIBLE",
      statusCls: stats.global.ca_perdu_an > 30000 ? "text-danger bg-danger/10 border-danger/30" : stats.global.ca_perdu_an > 10000 ? "text-warning bg-warning/10 border-warning/30" : "text-success bg-success/10 border-success/30",
    },
    {
      label: "Créneaux à risque",
      value: `${stats.top_3_pires?.length ?? 0} identifiés`,
      status: (stats.top_3_pires?.length ?? 0) > 0 ? "À TRAITER" : "RAS",
      statusCls: (stats.top_3_pires?.length ?? 0) > 0 ? "text-warning bg-warning/10 border-warning/30" : "text-success bg-success/10 border-success/30",
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Score de performance</p>
        <p className="text-xs text-slate-400 hidden sm:block">VOS RÉSULTATS PERSONNALISÉS</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        {/* Gauge SVG */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <svg width="192" height="192" viewBox="0 0 192 192" aria-label={`Score ${score}/100`}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9"
              strokeWidth="14" strokeDasharray={`${ARC} ${GAP}`} strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={config.color}
              strokeWidth="14" strokeDasharray={`${progressArc} ${CIRC - progressArc}`}
              strokeLinecap="round" transform={`rotate(135 ${CX} ${CY})`} />
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#0F172A" fontSize="38" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              {displayed}
            </text>
            <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748B" fontSize="15" fontFamily="Plus Jakarta Sans, sans-serif">
              /100
            </text>
          </svg>

          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${config.bgTw} ${config.tw} ${config.borderTw}`}>
            {config.label}
          </span>

          <div className="flex gap-3 text-xs text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger inline-block" aria-hidden="true" />Critique</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" aria-hidden="true" />Moyen</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" aria-hidden="true" />Optimal</span>
          </div>
        </div>

        <div className="hidden md:block self-stretch w-px bg-slate-200 mx-2" aria-hidden="true" />

        {/* Indicateurs */}
        <div className="flex-1 w-full space-y-2.5">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium text-sm">{cat.label}</span>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-slate-900 font-bold text-sm">{cat.value}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${cat.statusCls}`}>
                  {cat.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-yellow-50 border-t border-yellow-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-yellow-700 text-sm font-semibold">Potentiel récupérable estimé</span>
        <span className="text-yellow-600 font-heading font-bold text-xl md:text-2xl tracking-tight tabular-nums">
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
  const [googleData, setGoogleData] = useState<GoogleData | null>(null);
  const [showGoogleSection, setShowGoogleSection] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection?.errors[0]?.code === "file-too-large") toast.error("Le fichier ne doit pas dépasser 10 Mo");
      else if (rejection?.errors[0]?.code === "file-invalid-type") toast.error("Seuls les fichiers CSV sont acceptés");
      else toast.error("Erreur lors de l'upload du fichier");
    },
  });

  const handleSubmit = async () => {
    if (!file || !nomCabinet.trim()) {
      toast.error("Veuillez sélectionner un fichier CSV et indiquer le nom du cabinet");
      return;
    }
    setEtat("loading");
    setEtapeActuelle(0);
    ETAPES_LOADING.forEach(({ id, delai }) => {
      setTimeout(() => setEtapeActuelle(id), delai);
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
        const response = await fetch("/api/audit", { method: "POST", body: formData });
        const data: AuditResponse = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur serveur");
        if (!data.success) throw new Error(data.error || "Erreur lors de l'analyse");
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

  const reessayer = () => { setEtat("formulaire"); setErreur(""); setFile(null); setEtapeActuelle(0); };

  const handleDownloadPDF = async () => {
    if (!resultats) return;
    setIsGeneratingPDF(true);
    try {
      const [{ pdf, Font }, { default: RapportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/audit/RapportPDF"),
      ]);
      const base = window.location.origin;
      Font.register({ family: "PlusJakartaSans", fonts: [
        { src: `${base}/fonts/PlusJakartaSans-Bold.woff`, fontWeight: 700 },
        { src: `${base}/fonts/PlusJakartaSans-ExtraBold.woff`, fontWeight: 800 },
      ]});
      Font.register({ family: "Inter", fonts: [
        { src: `${base}/fonts/Inter-Regular.woff`, fontWeight: 400 },
        { src: `${base}/fonts/Inter-Medium.woff`, fontWeight: 500 },
        { src: `${base}/fonts/Inter-Bold.woff`, fontWeight: 700 },
      ]});
      Font.register({ family: "Mono", fonts: [
        { src: `${base}/fonts/JetBrainsMono-Regular.ttf`, fontWeight: 400 },
        { src: `${base}/fonts/JetBrainsMono-Bold.ttf`, fontWeight: 700 },
      ]});
      type PdfRenderer = (el: ReturnType<typeof createElement>) => { toBlob: () => Promise<Blob> };
      const blob = await (pdf as unknown as PdfRenderer)(createElement(RapportPDF, { resultats })).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nom = resultats.stats.nom_cabinet.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `Audit_NoShows_${nom}_${date}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Erreur génération PDF:", error);
      toast.error(`PDF : ${msg}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-800 font-sans overflow-x-hidden">

      {/* ─── Nav ─── */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <Activity className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-slate-900">PerfIAmatic</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200">Comment ça marche</Link>
              <Link href="/#impact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200">Impact</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col justify-center">

        {/* ─── FORMULAIRE ─── */}
        {etat === "formulaire" && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-soft">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Analyse Gratuite &amp; Sécurisée
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
                  { icon: UploadCloud, step: "1", label: "Uploadez", sub: "votre CSV Doctolib", color: "text-primary bg-primary/10" },
                  { icon: Sparkles,    step: "2", label: "Analysez",  sub: "en 30–60 secondes", color: "text-accent bg-accent/10" },
                  { icon: FileText,    step: "3", label: "Rapport",   sub: "PDF téléchargeable", color: "text-success bg-success/10" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-2 relative`}>
                      <s.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center">{s.step}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{s.label}</p>
                    <p className="text-[10px] text-slate-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 flex flex-col items-center justify-center group ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 bg-slate-50/50 hover:bg-primary/[0.06] hover:border-primary/60"
                }`}
                aria-label="Zone de dépôt de fichier CSV"
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                  <UploadCloud className={`w-7 h-7 ${isDragActive ? "text-primary" : "text-slate-400"}`} aria-hidden="true" />
                </div>
                <p className={`font-heading font-semibold text-lg mb-1.5 ${isDragActive ? "text-primary" : "text-slate-900"}`}>
                  {file ? file.name : "Déposez votre CSV ici"}
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  {file ? "Cliquez pour modifier" : "Cliquez ou glissez votre export Doctolib"}
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-5 text-left">
                <div>
                  <label htmlFor="nom_cabinet" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nom du cabinet <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nom_cabinet"
                    type="text"
                    value={nomCabinet}
                    onChange={(e) => setNomCabinet(e.target.value)}
                    placeholder="Ex : Cabinet Dr. Martin"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ca_moyen" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    CA moyen par RDV (€)
                  </label>
                  <input
                    id="ca_moyen"
                    type="number"
                    value={caMoyen}
                    onChange={(e) => setCaMoyen(Number(e.target.value) || 150)}
                    min={1}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email (optionnel, pour recevoir le rapport)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cabinet@exemple.fr"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all outline-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="btn-glow w-full bg-primary hover:bg-primary-light text-white py-4 rounded-full font-bold text-lg transition-all mt-2 flex items-center justify-center gap-2 group shadow-lg"
                >
                  <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  Générer l&apos;Audit Flash
                </button>
                <div className="text-center mt-4 text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  Chiffrement 256-bit · Conforme RGPD · Aucun nom patient stocké
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── LOADING ─── */}
        {etat === "loading" && (
          <div className="max-w-lg mx-auto w-full text-center" aria-live="polite" aria-label="Analyse en cours">
            <h2 className="text-3xl font-heading font-extrabold text-slate-900 mb-2 tracking-tight">
              Analyse en cours...
            </h2>
            <p className="text-slate-500 mb-8 font-medium">Temps estimé : 30–60 secondes</p>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-left">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out relative"
                  style={{ width: `${(etapeActuelle / 4) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
              <ul className="space-y-4">
                {ETAPES_LOADING.map((etape) => (
                  <li key={etape.id} className={`flex items-center gap-3 font-medium ${etapeActuelle >= etape.id ? "text-slate-900" : "text-slate-300"}`}>
                    {etapeActuelle >= etape.id ? (
                      <span className="w-6 h-6 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center text-xs font-bold">✓</span>
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

        {/* ─── RÉSULTATS ─── */}
        {etat === "resultats" && resultats && (
          <div className="space-y-8 w-full">
            {/* Header résultats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold mb-3">
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Analyse terminée
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                  Résultats de l&apos;audit — {resultats.stats.nom_cabinet}
                </h1>
                <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" aria-hidden="true" />
                  Période analysée : {resultats.stats.periode.nb_mois} mois
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-6 py-2.5 border-2 border-primary/40 bg-primary/10 text-primary rounded-full font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingPDF ? "Génération..." : "Télécharger PDF"}
                </button>
              </div>
            </motion.div>

            {/* KPI cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
            >
              {[
                { label: "Total RDV", value: resultats.stats.global.total_rdv.toLocaleString("fr-FR"), color: "text-slate-900", accent: "border-l-primary" },
                { label: "No-shows", value: resultats.stats.global.no_shows.toLocaleString("fr-FR"), color: "text-slate-900", accent: "border-l-danger" },
                {
                  label: "Taux no-shows",
                  value: `${resultats.stats.global.taux}%`,
                  color: resultats.stats.global.taux > 5 ? "text-danger" : resultats.stats.global.taux > 3 ? "text-warning" : "text-success",
                  accent: resultats.stats.global.taux > 5 ? "border-l-danger" : resultats.stats.global.taux > 3 ? "border-l-warning" : "border-l-success",
                },
                { label: "CA perdu/an", value: `${resultats.stats.global.ca_perdu_an.toLocaleString("fr-FR")} €`, color: "text-danger", accent: "border-l-danger" },
              ].map((card, i) => (
                <motion.div key={card.label} variants={fadeInUp} custom={i}
                  className={`bg-white rounded-2xl border border-slate-100 shadow-soft border-l-4 p-6 ${card.accent}`}
                >
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-heading font-extrabold tabular-nums ${card.color}`}>{card.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Score */}
            <ScoreCard stats={resultats.stats} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resultats.stats.par_jour && resultats.stats.par_jour.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4">
                  <GraphiqueParJour parJour={resultats.stats.par_jour} />
                </div>
              )}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-4">
                <GaugeBenchmark tauxActuel={resultats.stats.global.taux} />
              </div>
            </div>

            {/* Top 3 créneaux à risque */}
            {resultats.stats.top_3_pires?.length > 0 && (
              <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft border-l-4 border-l-danger p-8"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-danger/20 border border-danger/30 flex items-center justify-center text-danger text-sm font-bold" aria-hidden="true">✕</span>
                  Top 3 créneaux à risque
                </h2>
                <ul className="space-y-0">
                  {resultats.stats.top_3_pires.map((creneau, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
                      <span className="font-extrabold font-heading text-slate-900 text-lg w-1/3">{creneau.jour} à {creneau.heure}</span>
                      <span className="text-slate-500 font-medium w-1/3">
                        <span className="text-danger font-bold mr-1">{creneau.taux}%</span> no-shows
                        <span className="text-sm text-slate-400 ml-2">({creneau.noShows}/{creneau.total})</span>
                      </span>
                      <span className="text-danger font-bold text-lg w-1/3 sm:text-right tabular-nums">
                        {creneau.ca_perdu.toLocaleString("fr-FR")} € perdus/an
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Top 3 créneaux performants */}
            {resultats.stats.top_3_meilleurs?.length > 0 && (
              <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft border-l-4 border-l-success p-8"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center text-success text-sm font-bold" aria-hidden="true">✓</span>
                  Top 3 créneaux performants
                </h2>
                <ul className="space-y-0">
                  {resultats.stats.top_3_meilleurs.map((creneau, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
                      <span className="font-extrabold font-heading text-slate-900 text-lg w-1/3">{creneau.jour} à {creneau.heure}</span>
                      <span className="text-slate-500 font-medium w-1/3">
                        <span className="text-xs text-slate-400 mr-2">({creneau.noShows}/{creneau.total})</span>no-shows
                      </span>
                      <span className="text-success font-bold text-lg w-1/3 sm:text-right">{`${creneau.taux}% no-shows`}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Rapport IA */}
            {resultats.rapport_texte && (
              <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-3xl border border-slate-100 shadow-soft border-t-4 border-t-primary p-8"
              >
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Généré par IA
                  </span>
                  Plan d&apos;action
                </h2>
                <div className="text-slate-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-heading font-bold mt-8 mb-4 text-primary first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-heading font-bold mt-10 mb-5 text-slate-900 border-b border-slate-100 pb-2 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-heading font-bold mt-6 mb-3 text-slate-800" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                      ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-3 mb-6 marker:text-primary marker:font-bold" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-2 border-l-2 border-primary/30" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                      hr: ({ node, ...props }) => <hr className="border-slate-100 my-8" {...props} />,
                    }}
                  >
                    {resultats.rapport_texte}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Bouton Google */}
            {!showGoogleSection && (
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center">
                <button
                  onClick={() => setShowGoogleSection(true)}
                  className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-base transition-all duration-200 shadow-lg cursor-pointer"
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                  Analyser aussi mes avis Google
                </button>
              </motion.div>
            )}

            {showGoogleSection && (
              <DiagnosticGoogle nomCabinet={resultats.stats.nom_cabinet} onSuccess={setGoogleData} />
            )}

            <ScoreGlobal stats={resultats.stats} googleData={googleData} />

            <CTACalendly
              caPerduAn={resultats.stats.global.ca_perdu_an}
              caPerduGoogle={
                googleData && googleData.user_ratings_total < 87
                  ? (87 - googleData.user_ratings_total) * 4 * 150 * 12
                  : undefined
              }
              email={email || undefined}
            />

            {/* Actions finales */}
            <motion.div className="flex flex-col gap-4 items-center mt-8"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors w-full sm:w-auto text-center flex justify-center items-center gap-2"
                >
                  Télécharger ce rapport en PDF
                </button>
                <a
                  href="mailto:contact@perfiamatic.com?subject=Demande%20Audit%20Complet"
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                >
                  Passer à l&apos;Audit Complet →
                </a>
              </div>
              <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Données confidentielles — Conforme RGPD
              </p>
            </motion.div>
          </div>
        )}

        {/* ─── ERREUR ─── */}
        {etat === "erreur" && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-danger/10 border border-danger/20 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-danger/20 border border-danger/30 text-danger rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" aria-hidden="true">!</div>
              <h1 className="text-2xl font-heading font-extrabold text-danger mb-2">Une erreur est survenue</h1>
              <p className="text-slate-600 mb-8 font-medium">{erreur}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={reessayer}
                  className="bg-danger text-white hover:bg-red-600 px-8 py-3 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 transform"
                >
                  Réessayer
                </button>
                <Link href="/" className="px-8 py-3 border border-slate-300 text-slate-600 rounded-full font-bold hover:bg-slate-50 hover:text-slate-900 transition-all">
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
