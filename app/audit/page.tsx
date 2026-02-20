"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import RapportPDF from "@/components/audit/RapportPDF";
import type { AuditResponse } from "@/types/audit";

type Etat = "formulaire" | "loading" | "resultats" | "erreur";

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
    <div className="min-h-screen flex flex-col bg-brand-dark">
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
            <div>
              <h1 className="text-3xl font-bold text-gold">
                Résultats de l&apos;audit
              </h1>
              <p className="text-slate-300 mt-1">
                {resultats.stats.nom_cabinet} • Période analysée :{" "}
                {resultats.stats.periode.nb_mois} mois
              </p>
            </div>

            {/* 5 cards statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-card">
                <p className="text-sm text-slate-400 mb-1">📊 Total RDV</p>
                <p className="text-2xl font-bold text-white">
                  {resultats.stats.global.total_rdv.toLocaleString()}
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-card">
                <p className="text-sm text-slate-400 mb-1">❌ No-shows</p>
                <p className="text-2xl font-bold text-white">
                  {resultats.stats.global.no_shows.toLocaleString()}
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-card">
                <p className="text-sm text-slate-400 mb-1">📉 Taux no-shows</p>
                <p className="text-2xl font-bold text-white">
                  {resultats.stats.global.taux}%
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-card">
                <p className="text-sm text-slate-400 mb-1">💸 CA perdu/an</p>
                <p className="text-2xl font-bold text-white">
                  {resultats.stats.global.ca_perdu_an.toLocaleString()} €
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-4 shadow-card">
                <p className="text-sm text-slate-400 mb-1">
                  📈 Potentiel récupérable
                </p>
                <p className="text-2xl font-bold text-gold">
                  {resultats.stats.potentiel.passage_45.toLocaleString()} €/an
                </p>
              </div>
            </div>

            {/* Top 3 créneaux à risque */}
            {resultats.stats.top_3_pires?.length > 0 && (
              <div className="bg-surface rounded-xl border border-white/10 p-6 shadow-card">
                <h2 className="text-lg font-semibold text-gold mb-4">
                  🔴 Top 3 créneaux à risque
                </h2>
                <ul className="space-y-3">
                  {resultats.stats.top_3_pires.map((creneau, index) => {
                    const caPerduAnnuel = Math.round(
                      creneau.ca_perdu * (12 / resultats.stats.periode.nb_mois)
                    );
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
              </div>
            )}

            {/* Top 3 créneaux performants */}
            {resultats.stats.top_3_meilleurs?.length > 0 && (
              <div className="bg-surface rounded-xl border border-white/10 p-6 shadow-card">
                <h2 className="text-lg font-semibold text-gold mb-4">
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
              </div>
            )}

            {/* Rapport IA */}
            {resultats.rapport_texte && (
              <div className="bg-surface rounded-xl border border-white/10 p-6 shadow-card">
                <h2 className="text-lg font-semibold text-gold mb-4">
                  Rapport d&apos;analyse IA
                </h2>
                <div className="rapport-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-2xl font-bold mt-8 mb-4 text-gold first:mt-0"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl font-bold mt-6 mb-3 text-gold pl-0 ml-0"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg font-semibold mt-4 mb-2 text-slate-200 pl-0 ml-0"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-3 text-slate-300 leading-relaxed pl-0 ml-0"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-4 mb-3 space-y-1 text-slate-300 ml-0"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-4 mb-3 space-y-1 text-slate-300 ml-0"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-relaxed" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="font-semibold text-slate-100"
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
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-6 py-3 border border-gold/50 rounded-lg text-slate-200 hover:bg-gold/10 hover:border-gold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
                href="mailto:contact@perfiamatic.com?subject=Demande%20Audit%20Complet%20-%201500€"
                className="px-6 py-3 bg-gold text-brand-dark hover:bg-gold-light rounded-lg font-semibold transition-colors"
              >
                Passer à l&apos;Audit Complet (1 500 €)
              </a>
            </div>
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
