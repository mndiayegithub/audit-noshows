"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";
import type { GoogleData } from "@/types/audit";

const BENCHMARK_AVIS = 87;

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type EtatGoogle = "idle" | "loading" | "success" | "not_found" | "error";

interface Props {
  nomCabinet: string;
  onSuccess: (data: GoogleData) => void;
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 ${star <= filled ? "text-warning fill-warning" : "text-slate-200 fill-slate-200"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function DiagnosticGoogle({ nomCabinet, onSuccess }: Props) {
  const [etat, setEtat] = useState<EtatGoogle>("idle");
  const [inputValue, setInputValue] = useState(nomCabinet);
  const [result, setResult] = useState<GoogleData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const avisConfig =
    result && result.user_ratings_total > BENCHMARK_AVIS
      ? { text: "text-success", bg: "bg-green-50", border: "border-success/20", label: "Vous êtes bien positionné" }
      : result && result.user_ratings_total >= 70
      ? { text: "text-warning", bg: "bg-orange-50", border: "border-warning/20", label: "Vous êtes dans la moyenne" }
      : { text: "text-danger", bg: "bg-red-50", border: "border-danger/20", label: "Vous avez un déficit de visibilité" };

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      inputRef.current?.focus();
      return;
    }
    setEtat("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `/api/google-places?input=${encodeURIComponent(inputValue.trim())}`
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur serveur");
      }

      if (!data.found) {
        setEtat("not_found");
        return;
      }

      const googleData: GoogleData = {
        name: data.name,
        rating: data.rating,
        user_ratings_total: data.user_ratings_total,
        formatted_address: data.formatted_address,
      };
      setResult(googleData);
      setEtat("success");
      onSuccess(googleData);
    } catch (err: any) {
      console.error("Erreur diagnostic Google:", err);
      setErrorMsg(err.message || "Erreur inconnue");
      setEtat("error");
    }
  };

  const motionProps = reducedMotion
    ? {}
    : { variants: sectionVariants, initial: "hidden", animate: "visible" };

  return (
    <motion.div
      {...motionProps}
      className="bg-white rounded-3xl border border-slate-100 border-t-4 border-t-primary p-8 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Search className="w-4 h-4 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">
          Diagnostic Google — Visibilité du cabinet
        </h2>
      </div>
      <p className="text-slate-500 font-medium mb-8 ml-11">
        Découvrez combien de nouveaux patients vous échappent chaque mois faute de visibilité.
      </p>

      <AnimatePresence mode="wait">
        {(etat === "idle" || etat === "not_found" || etat === "error") && (
          <motion.div
            key="form"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex : Cabinet dentaire Dr. Martin Paris"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm outline-none"
                aria-label="Nom du cabinet à rechercher"
              />
              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px cursor-pointer shrink-0"
              >
                Lancer l&apos;analyse
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {etat === "not_found" && (
              <div className="flex items-start gap-3 bg-orange-50 border border-warning/20 rounded-xl px-5 py-4">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-slate-700 font-medium text-sm">
                  Cabinet non trouvé — essayez un nom plus précis (ex : ajoutez la ville) ou{" "}
                  <button
                    onClick={() => setEtat("idle")}
                    className="text-primary underline font-bold hover:no-underline focus:outline-none focus:ring-1 focus:ring-primary rounded cursor-pointer"
                  >
                    passez cette étape
                  </button>
                  .
                </p>
              </div>
            )}

            {etat === "error" && (
              <div className="flex items-start gap-3 bg-red-50 border border-danger/20 rounded-xl px-5 py-4">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-slate-700 font-medium text-sm">
                  Analyse temporairement indisponible{errorMsg ? ` — ${errorMsg}` : ""}.{" "}
                  <button
                    onClick={() => setEtat("idle")}
                    className="text-primary underline font-bold hover:no-underline focus:outline-none focus:ring-1 focus:ring-primary rounded cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    Réessayer
                  </button>
                  .
                </p>
              </div>
            )}
          </motion.div>
        )}

        {etat === "loading" && (
          <motion.div
            key="loading"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-4"
            aria-live="polite"
            aria-label="Analyse en cours"
          >
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Analyse en cours...</p>
          </motion.div>
        )}

        {etat === "success" && result && (
          <motion.div
            key="results"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Note + étoiles */}
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Note Google</p>
              <p className="text-7xl font-heading font-extrabold text-slate-900 tabular-nums">
                {result.rating.toFixed(1)}
                <span className="text-3xl text-slate-400 font-normal"> / 5</span>
              </p>
              <StarRating rating={result.rating} />
              <p className="text-slate-400 text-sm mt-1">
                {result.name}
                {result.formatted_address ? ` · ${result.formatted_address}` : ""}
              </p>
            </div>

            {/* Nombre d'avis */}
            <div className={`rounded-2xl border p-5 ${avisConfig.bg} ${avisConfig.border}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Nombre d&apos;avis
                  </p>
                  <p className={`text-4xl font-heading font-extrabold tabular-nums ${avisConfig.text}`}>
                    {result.user_ratings_total.toLocaleString("fr-FR")}
                    <span className="text-lg font-normal text-slate-500 ml-2">avis</span>
                  </p>
                </div>
                <span className={`text-sm font-bold px-4 py-2 rounded-full border ${avisConfig.bg} ${avisConfig.text} ${avisConfig.border}`}>
                  {avisConfig.label}
                </span>
              </div>
            </div>

            {/* Benchmark + écart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Benchmark national
                </p>
                <p className="text-2xl font-heading font-bold text-slate-900 tabular-nums">
                  {BENCHMARK_AVIS} avis
                </p>
                <p className="text-sm text-slate-400 mt-1">Moyenne cabinets dentaires France</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Votre écart
                </p>
                <p className={`text-2xl font-heading font-bold tabular-nums ${result.user_ratings_total >= BENCHMARK_AVIS ? "text-success" : "text-danger"}`}>
                  {result.user_ratings_total >= BENCHMARK_AVIS ? "+" : ""}
                  {result.user_ratings_total - BENCHMARK_AVIS} avis
                </p>
                <p className="text-sm text-slate-400 mt-1">vs la moyenne nationale</p>
              </div>
            </div>

            {/* Impact statique */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
              <p className="text-slate-700 font-medium text-sm leading-relaxed">
                Un cabinet avec 50 avis de plus convertit en moyenne{" "}
                <strong className="text-slate-900">3–5 nouveaux patients/mois supplémentaires</strong>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
