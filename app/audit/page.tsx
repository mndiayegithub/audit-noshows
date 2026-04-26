"use client";

import { useState, useEffect, useCallback, createElement } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  UploadCloud, ShieldCheck, TrendingUp, Activity, Sparkles,
  FileText,
} from "lucide-react";
import AuditDashboard from "@/components/audit/AuditDashboard";
import CSVPreview, { type CSVPreviewSnapshot } from "@/components/audit/CSVPreview";
import DegradedConfirmDialog from "@/components/audit/DegradedConfirmDialog";
import CSVErrorCard from "@/components/audit/CSVErrorCard";
import { readCSVAsText } from "@/lib/readCSVAsText";
import type { AuditResponse, GoogleData } from "@/types/audit";
import type { AuditErrorCode } from "@/types/audit-errors";
import {
  trackAuditView,
  trackAuditSubmitted,
  trackAuditSuccess,
  trackAuditFailed,
  trackPdfDownloaded,
} from "@/lib/analytics";

type Etat = "formulaire" | "preview" | "loading" | "resultats" | "erreur";

type StructuredError = {
  error_code: AuditErrorCode | string;
  error: string;
  details?: Record<string, unknown>;
} | null;

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
  const [google, setGoogle] = useState<GoogleData | null>(null);

  // Phase 7 — états additionnels
  const [structuredError, setStructuredError] = useState<StructuredError>(null);
  const [degradedDialogOpen, setDegradedDialogOpen] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<CSVPreviewSnapshot | null>(null);

  // Phase 9 — audit_view (R2 event 3)
  useEffect(() => {
    trackAuditView();
  }, []);

  const handleResetUpload = useCallback(() => {
    setFile(null);
    setStructuredError(null);
    setPreviewSnapshot(null);
    setDegradedDialogOpen(false);
    setEtat("formulaire");
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStructuredError(null);
      setPreviewSnapshot(null);
      setEtat("preview");
    }
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

  const handleSubmit = async (degradedConfirmed: boolean) => {
    if (!file || !nomCabinet.trim()) {
      toast.error("Veuillez sélectionner un fichier CSV et indiquer le nom du cabinet");
      return;
    }
    console.info("[audit] submit", { degradedConfirmed });
    // Phase 9 — audit_submitted (R2 event 6)
    trackAuditSubmitted(degradedConfirmed);
    setEtat("loading");
    setEtapeActuelle(0);
    ETAPES_LOADING.forEach(({ id, delai }) => {
      setTimeout(() => setEtapeActuelle(id), delai);
    });
    try {
      const csvText = await readCSVAsText(file);
      const formData = new FormData();
      formData.append("csv", csvText);
      formData.append("nom_cabinet", nomCabinet.trim());
      formData.append("ca_moyen", String(caMoyen));
      if (email.trim()) formData.append("email", email.trim());
      if (degradedConfirmed) formData.append("degraded_confirmed", "true");
      const response = await fetch("/api/audit", { method: "POST", body: formData });
      const data: AuditResponse = await response.json();
      if (!response.ok) {
        if (data && data.error_code) {
          // Phase 9 — audit_failed (R2 event 8)
          trackAuditFailed(String(data.error_code));
          setStructuredError({
            error_code: data.error_code,
            error: data.error || "Erreur lors du traitement du fichier",
            details: data.details,
          });
          setEtat("erreur");
          return;
        }
        trackAuditFailed(String(response.status));
        throw new Error(data.error || "Erreur serveur");
      }
      if (!data.success) {
        if (data.error_code) {
          trackAuditFailed(String(data.error_code));
          setStructuredError({
            error_code: data.error_code,
            error: data.error || "Erreur lors du traitement du fichier",
            details: data.details,
          });
          setEtat("erreur");
          return;
        }
        trackAuditFailed("UNKNOWN_FAILURE");
        throw new Error(data.error || "Erreur lors de l'analyse");
      }
      // Phase 9 — audit_success (R2 event 7).
      // score = 100 - taux * 3.2 (formula utilisée dans rendu ScoreHero, voir CLAUDE.md).
      // taux est en % (0-100) dans data.stats.global.taux ; data.stats.benchmark.votre_taux idem.
      {
        const tauxNoshow = data.stats?.global?.taux ?? 0;
        const score = Math.max(0, Math.min(100, Math.round(100 - tauxNoshow * 3.2)));
        trackAuditSuccess(score, tauxNoshow);
      }
      setResultats(data);
      setEtat("resultats");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      // Phase 9 — capture client-side exception (timeout, JSON parse, network)
      trackAuditFailed("CLIENT_EXCEPTION");
      setErreur(message);
      setEtat("erreur");
      toast.error(message);
    }
  };

  const reessayer = () => {
    setErreur("");
    setStructuredError(null);
    setFile(null);
    setPreviewSnapshot(null);
    setEtapeActuelle(0);
    setEtat("formulaire");
  };

  const handleDownloadPDF = async () => {
    if (!resultats) return;
    // Phase 9 — pdf_downloaded (R2 event 11). Émis en début de fonction
    // pour capturer l'intention même si la génération échoue ensuite.
    trackPdfDownloaded();
    setIsGeneratingPDF(true);
    try {
      const [{ pdf }, { default: RapportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/audit/RapportPDF"),
      ]);
      type PdfRenderer = (el: ReturnType<typeof createElement>) => { toBlob: () => Promise<Blob> };
      const blob = await (pdf as unknown as PdfRenderer)(createElement(RapportPDF, { resultats, google })).toBlob();
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-x-hidden">

      {/* ─── Nav (minimal — bar removed, only links sit on the page bg) ─── */}
      <nav className="absolute top-0 right-0 z-10 hidden md:flex items-center gap-8 px-6 lg:px-8 h-20">
        <Link href="/#comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-primaryDark transition-colors duration-200">Comment ça marche</Link>
        <Link href="/#impact" className="text-sm font-medium text-slate-600 hover:text-primaryDark transition-colors duration-200">Impact</Link>
      </nav>

      <main
        className={
          etat === "resultats"
            ? "flex-1 w-full"
            : "flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col justify-center"
        }
      >

        {/* ─── FORMULAIRE ─── */}
        {etat === "formulaire" && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 mb-4">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Analyse gratuite &amp; sécurisée
                </div>
                <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-slate-900 mb-3 tracking-tight">
                  Lancez votre audit gratuit.
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  Uploadez votre export de données Doctolib (format CSV) et recevez votre rapport personnalisé en 60 secondes.
                </p>
              </div>

              {/* Micro-steps */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: UploadCloud, step: "1", label: "Uploadez", sub: "votre CSV Doctolib", color: "text-kpiVolume-fg bg-kpiVolume" },
                  { icon: Sparkles,    step: "2", label: "Analysez",  sub: "en 30–60 secondes", color: "text-kpiSignal-fg bg-kpiSignal" },
                  { icon: FileText,    step: "3", label: "Rapport",   sub: "PDF téléchargeable", color: "text-kpiTaux-fg bg-kpiTaux" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-2 relative`}>
                      <s.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-gray-200 text-slate-600 text-[9px] font-bold flex items-center justify-center">{s.step}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                    <p className="text-[10px] text-slate-500">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Carte d'erreur structurée OU dropzone */}
              {structuredError ? (
                <div className="mb-8">
                  <CSVErrorCard error={structuredError} onRetry={handleResetUpload} />
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 flex flex-col items-center justify-center group ${
                    isDragActive
                      ? "border-primaryDark bg-emerald-50"
                      : "border-gray-200 bg-gray-50 hover:bg-emerald-50/40 hover:border-primaryDark/60"
                  }`}
                  aria-label="Zone de dépôt de fichier CSV"
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className={`w-7 h-7 ${isDragActive ? "text-primaryDark" : "text-slate-400"}`} aria-hidden="true" />
                  </div>
                  <p className={`font-serif text-xl mb-1.5 ${isDragActive ? "text-primaryDark" : "text-slate-900"}`}>
                    {file ? file.name : "Déposez votre CSV ici"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {file ? "Cliquez pour modifier" : "Cliquez ou glissez votre export Doctolib"}
                  </p>
                </div>
              )}

              {/* Formulaire */}
              <div className="space-y-5 text-left">
                <div>
                  <label htmlFor="nom_cabinet" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom du cabinet <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="nom_cabinet"
                    type="text"
                    value={nomCabinet}
                    onChange={(e) => setNomCabinet(e.target.value)}
                    placeholder="Ex : Cabinet Dr. Martin"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primaryDark/30 focus:border-primaryDark/60 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ca_moyen" className="block text-sm font-medium text-slate-700 mb-1.5">
                    CA moyen par RDV (€)
                  </label>
                  <input
                    id="ca_moyen"
                    type="number"
                    value={caMoyen}
                    onChange={(e) => setCaMoyen(Number(e.target.value) || 150)}
                    min={1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-primaryDark/30 focus:border-primaryDark/60 transition-all outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email (optionnel, pour recevoir le rapport)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cabinet@exemple.fr"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primaryDark/30 focus:border-primaryDark/60 transition-all outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!file) {
                      toast.error("Veuillez sélectionner un fichier CSV");
                      return;
                    }
                    setEtat("preview");
                  }}
                  className="w-full bg-primaryDark hover:bg-[#053b2d] text-white py-3 rounded-full font-semibold text-sm transition-shadow hover:shadow-cta mt-2 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
                >
                  <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  Générer l&apos;audit flash
                </button>
                <div className="text-center mt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  Chiffrement 256-bit ·{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="underline decoration-dotted underline-offset-2 hover:text-slate-700"
                  >
                    Conforme RGPD
                  </Link>{" "}
                  · Aucun nom patient stocké
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PREVIEW (D-02) ─── */}
        {etat === "preview" && file && !structuredError && (
          <div className="max-w-xl mx-auto w-full">
            <CSVPreview
              file={file}
              onContinue={(degraded) => {
                if (!nomCabinet.trim()) {
                  toast.error("Veuillez indiquer le nom du cabinet");
                  setEtat("formulaire");
                  return;
                }
                if (degraded) {
                  setDegradedDialogOpen(true);
                } else {
                  handleSubmit(false);
                }
              }}
              onCancel={handleResetUpload}
              onError={(err) => {
                setStructuredError(err);
                setEtat("erreur");
              }}
              onReady={(snapshot) => setPreviewSnapshot(snapshot)}
            />
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              Cabinet : <span className="font-medium text-slate-700">{nomCabinet || "—"}</span>
            </div>
          </div>
        )}

        {/* ─── LOADING ─── */}
        {etat === "loading" && (
          <div className="max-w-lg mx-auto w-full text-center" aria-live="polite" aria-label="Analyse en cours">
            <h2 className="font-serif text-3xl md:text-4xl leading-[1.1] text-slate-900 mb-2 tracking-tight">
              Analyse en cours…
            </h2>
            <p className="text-slate-600 mb-8">Temps estimé : 30–60 secondes</p>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-left">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-primaryDark transition-all duration-500 ease-out relative"
                  style={{ width: `${(etapeActuelle / 4) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
              <ul className="space-y-4">
                {ETAPES_LOADING.map((etape) => (
                  <li key={etape.id} className={`flex items-center gap-3 ${etapeActuelle >= etape.id ? "text-slate-900" : "text-slate-300"}`}>
                    {etapeActuelle >= etape.id ? (
                      <span className="w-6 h-6 rounded-full bg-kpiSignal text-kpiSignal-fg flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border-2 border-gray-200" />
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
          <>
            {resultats.degraded && (
              <div className="max-w-5xl mx-auto w-full px-4 pt-6">
                <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                  <strong className="font-semibold">Audit partiel</strong> : {resultats.ignored_count ?? 0} ligne(s)
                  ignorée(s) sur le fichier importé ({Math.round((resultats.reco_rate ?? 0) * 100)} % reconnues).
                </div>
              </div>
            )}
            <AuditDashboard
              stats={resultats.stats}
              rapport={resultats.rapport_texte ?? ""}
              google={google}
              onGoogleChange={setGoogle}
              onDownloadPDF={handleDownloadPDF}
              isGeneratingPDF={isGeneratingPDF}
            />
          </>
        )}

        {/* ─── ERREUR ─── */}
        {etat === "erreur" && (
          <div className="max-w-xl mx-auto w-full">
            {structuredError ? (
              <CSVErrorCard error={structuredError} onRetry={handleResetUpload} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-semibold" aria-hidden="true">!</div>
                <h1 className="font-serif text-2xl md:text-3xl text-slate-900 mb-2 tracking-tight">Une erreur est survenue</h1>
                <p className="text-slate-600 mb-8">{erreur}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={reessayer}
                    className="bg-primaryDark hover:bg-[#053b2d] text-white px-6 py-3 rounded-full text-sm font-semibold transition-shadow hover:shadow-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
                  >
                    Réessayer
                  </button>
                  <Link href="/" className="px-6 py-3 border border-gray-200 bg-white text-slate-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                    Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DegradedConfirmDialog (toujours monté, contrôlé) */}
      <DegradedConfirmDialog
        open={degradedDialogOpen}
        onOpenChange={setDegradedDialogOpen}
        recoRate={previewSnapshot?.recoRate ?? 0}
        ignoredCount={previewSnapshot?.ignoredCount ?? 0}
        totalRows={previewSnapshot?.totalRows ?? 0}
        onConfirm={() => {
          setDegradedDialogOpen(false);
          handleSubmit(true);
        }}
        onCancel={handleResetUpload}
      />
    </div>
  );
}
