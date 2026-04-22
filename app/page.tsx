"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  UploadCloud, ShieldCheck, Activity, TrendingUp,
  Download, PieChart, Clock, MapPin, Star, Building2,
  CheckCircle2, ChevronDown, Zap, Lock,
} from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ShuffleTestimonials } from "@/components/ui/testimonial-cards";
import { FaqSection } from "@/components/ui/faq-section";

/* ─── Count-up animation ─── */
function CountUpNumber({
  target, decimals = 0, suffix = "", className = "",
}: { target: number; decimals?: number; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let start: number | null = null;
        const duration = 1800;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else setCount(target);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const formatted = decimals > 0
    ? count.toFixed(decimals).replace(".", ",")
    : Math.round(count).toString();

  return <span ref={ref} className={className}>{formatted}{suffix}</span>;
}

/* ─── FAQ Item ─── */
const FAQItem = ({
  q, a, isOpen, onClick,
}: {
  q: string;
  a: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) => (
  <div className={`border-b border-gray-100 transition-all duration-300 ${isOpen ? "bg-gray-50" : ""}`}>
    <button
      onClick={onClick}
      className="w-full text-left py-6 px-6 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
      aria-expanded={isOpen}
    >
      <span className="font-heading font-semibold text-gray-900 text-lg pr-8">{q}</span>
      <ChevronDown
        className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="pb-6 px-6 text-gray-600 leading-relaxed">{a}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Animations ─── */
const fadeInUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

/* ─── Page ─── */
export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [rdvPerDay, setRdvPerDay] = useState<number>(35);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ROI Calculator */
  const rdvMois = rdvPerDay * 20;
  const noShowsMois = rdvMois * 0.062;
  const perteMois = Math.round(noShowsMois * 150);
  const perteAn = perteMois * 12;

  const faqs = [
    { q: "C'est vraiment gratuit ?", a: "Oui, l'audit de base est 100% gratuit et sans engagement." },
    {
      q: "Mes données patients sont-elles sécurisées ?",
      a: "L'export CSV ne contient aucune donnée nominative patient. Conforme RGPD, hébergé en France, aucun nom n'est stocké.",
    },
    { q: "Ça fonctionne avec quel logiciel ?", a: "L'audit fonctionne avec tout export Doctolib au format CSV." },
    {
      q: "Combien de temps ça prend ?",
      a: "L'analyse est immédiate. Vous obtenez votre rapport en moins de 60 secondes après l'upload.",
    },
    {
      q: "Que contient le rapport gratuit ?",
      a: "Il contient votre taux de no-shows réel, les créneaux les plus à risque, et l'impact financier estimé sur votre chiffre d'affaires.",
    },
    {
      q: "Et après l'audit ?",
      a: "Vous pouvez utiliser ces informations pour ajuster votre organisation, ou souscrire à nos services pour une automatisation complète de la récupération des no-shows.",
    },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">

      {/* ─── NAV ─── */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "glass-panel"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className={`font-heading font-bold text-xl tracking-tight ${isScrolled ? "text-slate-900" : "text-white"}`}>
                PerfIAmatic
              </span>
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#comment-ca-marche" className={`text-sm font-medium transition-colors duration-200 ${isScrolled ? "text-slate-600 hover:text-primary" : "text-white/60 hover:text-white"}`}>
                Comment ça marche
              </a>
              <a href="#impact" className={`text-sm font-medium transition-colors duration-200 ${isScrolled ? "text-slate-600 hover:text-primary" : "text-white/60 hover:text-white"}`}>
                Impact
              </a>
              <Link
                href="/audit"
                className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-light transition-all duration-200 shadow-md btn-glow"
              >
                Lancer l&apos;audit gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO — DARK ─── */}
      <section className="mesh-bg grid-overlay relative pt-32 pb-20 lg:pt-44 lg:pb-36 overflow-hidden min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
              {/* Badge */}
              <motion.div variants={fadeInUp} className="mb-7">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.14] text-white/80 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Audit IA — Cabinets médicales
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.0] tracking-tight mb-7">
                <span className="text-white/50 block">Chaque rendez-vous</span>
                <span className="text-white block">manqué vous coûte</span>
                <span className="text-gradient-indigo block">{perteAn.toLocaleString("fr-FR")} €/an</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-white/60 mb-10 leading-relaxed">
                Taux exact, créneaux à risque, CA perdu.<br className="hidden sm:block" />
                Analysez vos données Doctolib en 60 secondes — gratuit, sans inscription.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-start">
                <Link href="/audit" className="btn-glow inline-flex items-center justify-center gap-2.5 bg-primary text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-200 shadow-lg">
                  <UploadCloud className="w-5 h-5" aria-hidden="true" />
                  Lancer mon audit gratuit
                </Link>
                <a href="#comment-ca-marche" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/20 text-white/70 font-semibold text-base hover:bg-white/[0.06] hover:text-white transition-all duration-200">
                  Voir comment ça marche
                </a>
              </motion.div>

              {/* Micro-badges */}
              <motion.div variants={fadeInUp} className="flex items-center gap-5 mt-7 flex-wrap">
                {[
                  { icon: ShieldCheck, label: "RGPD" },
                  { icon: Lock, label: "HDS" },
                  { icon: Zap, label: "60 sec" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-white/40 text-xs font-semibold">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Dashboard mockup (exact HTML version) */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block animate-float"
            >
              {/* Main card */}
              <div className="glass-dark-strong rounded-3xl p-6 shadow-2xl relative z-10">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-0.5">Rapport d&apos;audit</p>
                    <p className="text-white font-heading font-semibold text-base">Cabinet Dr. Martin — Nov. 2024</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true" />
                    <span className="text-red-300 text-xs font-semibold">7,4% no-shows</span>
                  </div>
                </div>

                {/* Gauge ring + progress bars */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-label="Score 70/100">
                      <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                        strokeDasharray="263.9" strokeDashoffset="79" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-heading font-bold text-white text-xl leading-none">70</span>
                      <span className="text-white/40 text-[9px] mt-0.5">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/50 text-xs">Score performance</span>
                        <span className="font-heading text-white font-semibold text-sm">Améliorable</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/50 text-xs">Taux du secteur</span>
                        <span className="font-heading text-white/70 font-semibold text-sm">6,2%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-white/20" style={{ width: "56%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 KPI mini-cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3.5">
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1.5">No-shows</p>
                    <p className="font-mono text-white font-semibold text-lg tabular-nums">124</p>
                    <p className="text-red-400 text-[10px] font-medium mt-0.5">↑ +12% /mois</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3.5">
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1.5">CA perdu</p>
                    <p className="font-mono font-semibold text-lg tabular-nums text-gradient-cyan">18 600€</p>
                    <p className="text-white/30 text-[10px] mt-0.5">sur 12 mois</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3.5">
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1.5">Pic de risque</p>
                    <p className="font-mono text-white font-semibold text-lg tabular-nums">Lundi</p>
                    <p className="text-amber-400 text-[10px] font-medium mt-0.5">9h – 11h</p>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3 font-medium">No-shows par jour</p>
                  <div className="flex items-end justify-between gap-1.5" style={{ height: "48px" }}>
                    {[
                      { j: "Lun", h: "68%", highlight: true },
                      { j: "Mar", h: "42%", highlight: false },
                      { j: "Mer", h: "55%", highlight: false },
                      { j: "Jeu", h: "38%", highlight: false },
                      { j: "Ven", h: "72%", highlight: true },
                    ].map((d) => (
                      <div key={d.j} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end" style={{ height: "40px" }}>
                          <div
                            className="w-full rounded-t-sm"
                            style={{
                              height: d.h,
                              background: d.highlight
                                ? "linear-gradient(to top, #f97316, #ef4444)"
                                : "rgba(99,102,241,0.35)",
                            }}
                          />
                        </div>
                        <span className={`text-[9px] font-medium ${d.highlight ? "text-red-400" : "text-white/40"}`}>{d.j}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="glass-dark-strong absolute -bottom-8 -left-10 rounded-2xl p-4 shadow-xl z-20 flex items-center gap-3 min-w-[180px]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Récupérable</p>
                  <p className="text-white font-heading font-bold text-base">+6 200€/an</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP — LIGHT ─── */}
      <section className="py-5 bg-white border-y border-[#E8ECF2]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 items-center">
            {[
              { icon: ShieldCheck, label: "RGPD Compliant", sub: "Données anonymisées", color: "text-success" },
              { icon: MapPin, label: "Hébergé en France", sub: "Serveurs OVH France", color: "text-primary" },
              { icon: Star, label: "4.9/5 · 47 avis", sub: "Cabinets dentaires", color: "text-warning" },
              { icon: Building2, label: "100+ cabinets", sub: "Nous font confiance", color: "text-accent" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                  <badge.icon className={`w-5 h-5 ${badge.color}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{badge.label}</p>
                  <p className="text-xs text-slate-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT SHOWCASE — LIGHT + ContainerScroll ─── */}
      <section className="bg-white overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                Aperçu du rapport
              </span>
              <h2 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 leading-tight mt-4 tracking-tight">
                Voyez exactement{" "}
                <span className="text-gradient-indigo">ce que l&apos;IA analyse</span>
              </h2>
              <p className="text-slate-500 text-lg mt-4 max-w-xl mx-auto font-medium">
                Un rapport structuré, chiffré et actionnable — des données précises sur chaque aspect de vos absences.
              </p>
            </div>
          }
        >
          {/* Dashboard inside 3D card — DARK inside LIGHT for dramatic contrast */}
          <div className="h-full flex flex-col bg-[#18181B] overflow-hidden rounded-[22px]">
            {/* Browser chrome */}
            <div style={{ background: "#1C1C2E", padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(239,68,68,0.8)" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(251,191,36,0.8)" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(52,211,153,0.8)" }} />
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "6px", padding: "5px 12px", textAlign: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontFamily: "monospace" }}>
                  perfiamatic.fr/audit/resultats
                </span>
              </div>
            </div>

            {/* App content */}
            <div className="flex-1 overflow-y-auto bg-[#0E0F1C] p-6 space-y-4">
              {/* 3 KPI cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Taux no-shows",
                    value: "7.4",
                    unit: "%",
                    dot: "#f87171",
                    subColor: "#fca5a5",
                    sub: "Au-dessus de la moyenne (6,2%)",
                    gradient: false,
                  },
                  {
                    label: "CA perdu / an",
                    value: "18 600",
                    unit: "€",
                    dot: "#fbbf24",
                    subColor: "#fde68a",
                    sub: "Potentiellement récupérable",
                    gradient: true,
                  },
                  {
                    label: "Rendez-vous analysés",
                    value: "1 674",
                    unit: "",
                    dot: "#34d399",
                    subColor: "#6ee7b7",
                    sub: "Période : sept.–nov. 2024",
                    gradient: false,
                  },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 20px" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: "8px" }}>
                      {kpi.label}
                    </p>
                    {kpi.gradient ? (
                      <p style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, background: "linear-gradient(135deg, #06B6D4, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                        {kpi.value}<span style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", WebkitTextFillColor: "rgba(255,255,255,0.45)" }}>{kpi.unit}</span>
                      </p>
                    ) : (
                      <p style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                        {kpi.value}<span style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)" }}>{kpi.unit}</span>
                      </p>
                    )}
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: kpi.dot, display: "inline-block" }} />
                      <span style={{ color: kpi.subColor, fontSize: "11px" }}>{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Report preview */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" aria-hidden="true">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>Analyse IA — Synthèse exécutive</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>Généré en 54 secondes</p>
                  </div>
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
                  <p style={{ marginBottom: "10px" }}>
                    Votre cabinet présente un taux de no-shows de{" "}
                    <span style={{ color: "#a5b4fc", fontWeight: 500 }}>7,4%</span>, soit 1,2 point au-dessus de la médiane du secteur dentaire français. Ce niveau d&apos;absence représente une perte annuelle estimée à{" "}
                    <span style={{ color: "#06B6D4", fontWeight: 600 }}>18 600€</span> de chiffre d&apos;affaires net.
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.35)" }}>
                    L&apos;analyse des patterns temporels révèle une concentration significative sur les créneaux du{" "}
                    <span style={{ color: "#fbbf24", fontWeight: 500 }}>lundi matin (9h–11h)</span> et du{" "}
                    <span style={{ color: "#fbbf24", fontWeight: 500 }}>vendredi après-midi</span>, représentant à eux seuls 43% des absences. Une stratégie de rappel ciblée sur ces fenêtres pourrait réduire votre taux de 35 à 45%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* ─── METRICS — LIGHT ─── */}
      <section id="metrics" className="py-24 bg-[#FAFBFC] border-t border-[#E8ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="font-heading text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Des données qui stimulent la{" "}
              <span className="text-gradient-indigo">croissance de votre clinique</span>
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-lg text-slate-600">
              Rejoignez les centaines de professionnels de santé qui ont transformé leurs données Doctolib en rentabilité.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, value: "21x", label: "ROI moyen constaté", iconColor: "text-primary", iconBg: "bg-primary/10" },
              { icon: Clock, value: "18 Jours", label: "Délai de récupération", iconColor: "text-accent", iconBg: "bg-accent/10" },
              { icon: Activity, value: "9,7/10", label: "Score de satisfaction cabinet", iconColor: "text-success", iconBg: "bg-success/10" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="soft-card rounded-3xl p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-16 h-16 mx-auto ${s.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <s.icon className={`w-8 h-8 ${s.iconColor}`} aria-hidden="true" />
                </div>
                <h3 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">{s.value}</h3>
                <p className="text-slate-600 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — DARK ─── */}
      <section id="comment-ca-marche" className="py-24 mesh-bg grid-overlay relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-primary-light font-bold tracking-wider uppercase text-xs mb-4 block">
              PROCESSUS SIMPLE
            </motion.span>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Du CSV brut à un<br />plan d&apos;action clinique.
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-lg text-white/60">
              Trois étapes simples pour libérer tout le potentiel de votre cabinet.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {[
              { step: "01", icon: Download,   title: "Exportez votre CSV",   desc: "Connectez-vous à Doctolib et exportez votre historique de rendez-vous au format CSV standard. Aucune intégration n'est requise.", accent: "from-primary/20 to-primary/5",  border: "border-primary/40",  iconColor: "text-primary-light" },
              { step: "02", icon: UploadCloud, title: "Upload sécurisé",      desc: "Glissez-déposez votre CSV dans notre zone sécurisée. Les données sont traitées localement et immédiatement anonymisées.",       accent: "from-accent/20 to-accent/5",   border: "border-accent/40",   iconColor: "text-accent" },
              { step: "03", icon: PieChart,    title: "Audit IA instantané",  desc: "Obtenez un tableau de bord visuel indiquant précisément les zones de perte de revenus et les opportunités d'optimisation.",       accent: "from-cyan/20 to-cyan/5",      border: "border-cyan/40",     iconColor: "text-cyan" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center group">
                <div className={`w-24 h-24 mx-auto bg-gradient-to-b ${item.accent} border-2 ${item.border} rounded-3xl flex items-center justify-center mb-8 relative z-10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]`}>
                  <span className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white/[0.08] border border-white/20 text-white/50 font-bold flex items-center justify-center text-xs">
                    {item.step}
                  </span>
                  <item.icon className={`w-10 h-10 ${item.iconColor}`} aria-hidden="true" />
                </div>
                <h4 className="text-xl font-heading font-bold mb-3 text-white">{item.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER — LIGHT ─── */}
      <section id="impact" className="py-24 bg-white border-t border-[#E8ECF2]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="font-heading text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Ce que <span className="text-gradient-indigo">Doctolib</span> ne vous dit pas.
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-lg text-slate-600">
              Découvrez la différence entre les données brutes et les insights actionnables.
            </motion.p>
          </div>

          {/* VS Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-5xl mx-auto relative"
          >
            <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-xl">

              {/* Left — SANS AUDIT */}
              <div className="bg-slate-50 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-slate-500 text-sm font-bold leading-none">✕</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sans audit</span>
                </div>
                <ul className="space-y-5">
                  {[
                    "Vous estimez votre taux de no-shows à l'intuition",
                    "L'impact financier réel reste invisible",
                    "Aucun pattern identifié sur les créneaux à risque",
                    "Impossible de justifier un investissement de correction",
                    "Vous perdez du revenu sans le mesurer",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-danger text-[10px] font-bold leading-none">✕</span>
                      </div>
                      <span className="text-slate-600 text-[15px] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — AVEC PERFIAMATIC */}
              <div className="bg-navy p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Avec Audit</span>
                </div>
                <ul className="space-y-5">
                  {[
                    "Votre taux exact calculé à la virgule près",
                    "CA perdu annualisé, chiffré à l'euro",
                    "Créneaux et jours à risque identifiés précisément",
                    "Comparaison avec le benchmark du secteur dentaire",
                    "Recommandations priorisées pour agir immédiatement",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-success/20 border border-success/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-success text-[10px] font-bold leading-none">✓</span>
                      </div>
                      <span className="text-white/90 text-[15px] leading-snug font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* VS badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg ring-4 ring-white">
                <span className="text-white text-xs font-extrabold tracking-wide">VS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── IMPACT CHIFFRÉ — DARK ─── */}
      <section className="py-24 mesh-bg grid-overlay relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

          {/* Badge */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/60 text-xs font-semibold uppercase tracking-widest mb-8">
            Chiffres secteur
          </motion.div>

          {/* Title */}
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-16 tracking-tight">
            La réalité des cabinets médicaux
          </motion.h2>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-12">

            {/* 6,2% */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="flex flex-col items-center">
              <p className="text-6xl lg:text-7xl font-heading font-extrabold text-gradient-indigo mb-4 tabular-nums">
                <CountUpNumber target={6.2} decimals={1} suffix="%" />
              </p>
              <p className="text-white font-bold text-lg mb-2">Taux moyen de no-shows</p>
              <p className="text-white/40 text-sm leading-relaxed max-w-[220px]">en France dans les cabinets médicaux et dentaires</p>
            </motion.div>

            {/* 150€ */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="flex flex-col items-center">
              <p className="text-6xl lg:text-7xl font-heading font-extrabold text-gradient-cyan mb-4 tabular-nums">
                <CountUpNumber target={150} suffix="€" />
              </p>
              <p className="text-white font-bold text-lg mb-2">Perdu par créneau manqué</p>
              <p className="text-white/40 text-sm leading-relaxed max-w-[220px]">en chiffre d&apos;affaires net par consultation non honorée</p>
            </motion.div>

            {/* 60s */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="flex flex-col items-center">
              <p className="text-6xl lg:text-7xl font-heading font-extrabold text-white mb-4 tabular-nums">
                <CountUpNumber target={60} suffix="s" />
              </p>
              <p className="text-white font-bold text-lg mb-2">Pour votre rapport complet</p>
              <p className="text-white/40 text-sm leading-relaxed max-w-[220px]">upload, analyse IA et génération du PDF en moins d&apos;une minute</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS — LIGHT ─── */}
      <section className="py-24 bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <motion.span initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-primary font-bold tracking-wider uppercase text-xs mb-4 block">
              ILS L&apos;ONT DÉJÀ FAIT
            </motion.span>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">
              L&apos;impact mesuré par <span className="text-gradient-indigo">vos confrères</span>
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-slate-500 text-lg max-w-xl mx-auto">
              Glissez les cartes pour découvrir leurs témoignages.
            </motion.p>
          </div>

          {/* Shuffle testimonial cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          >
            {/* Cards */}
            <div className="shrink-0">
              <ShuffleTestimonials />
            </div>

            {/* Side stats */}
            <div className="flex flex-col gap-6 max-w-xs w-full">
              {[
                { value: "37 000€", label: "récupérés en moyenne", sub: "par cabinet après mise en place", color: "text-gradient-indigo" },
                { value: "60s", label: "pour obtenir le rapport complet", sub: "sans inscription, sans engagement", color: "text-gradient-cyan" },
                { value: "100%", label: "des cabinets trouvent des insights", sub: "qu'ils ne soupçonnaient pas", color: "text-gradient-indigo" },
              ].map((stat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="soft-card rounded-2xl px-6 py-5 flex items-center gap-5">
                  <p className={`text-3xl font-heading font-extrabold tabular-nums shrink-0 ${stat.color}`}>{stat.value}</p>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm leading-snug">{stat.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SIMULATOR — DARK ─── */}
      <section className="py-24 mesh-bg grid-overlay relative overflow-hidden">
        <div className="w-full max-w-2xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass-dark rounded-3xl p-8 md:p-12 text-center border border-white/[0.08]">
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4 tracking-tight">
              Simulez vos <span className="text-gradient-cyan">pertes actuelles</span>
            </h2>
            <p className="text-base text-white/60 mb-10 max-w-xl mx-auto">
              Ajustez le curseur pour estimer le manque à gagner de votre clinique selon votre volume de rendez-vous.
            </p>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="font-semibold text-white/70 text-sm">RDV par jour</label>
                <span className="text-xl font-bold text-primary-light bg-primary/20 px-4 py-1.5 rounded-xl border border-primary/30">{rdvPerDay}</span>
              </div>
              <input type="range" min="20" max="80" step="5" value={rdvPerDay}
                onChange={(e) => setRdvPerDay(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="Nombre de rendez-vous par jour" />
            </div>

            <div className="bg-white/[0.05] rounded-3xl p-8 md:p-10 mb-8 border border-white/[0.08]">
              <p className="text-white/40 font-medium mb-3 text-sm">Vous perdez environ</p>
              <div className="text-4xl md:text-5xl font-bold text-danger mb-3 font-heading tracking-tight tabular-nums">
                {perteMois.toLocaleString("fr-FR")} € <span className="text-2xl text-red-400">/ mois</span>
              </div>
              <div className="text-lg font-semibold text-white/50">
                soit <span className="text-gradient-cyan tabular-nums">{perteAn.toLocaleString("fr-FR")} € / an</span>
              </div>
            </div>

            <p className="text-xs text-white/30 mb-8">
              *Basé sur un taux national de 6,2%, un panier moyen de 150€ et 20 jours/mois
            </p>

            <Link href="/audit"
              className="btn-glow inline-flex justify-center items-center w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-200 shadow-lg">
              Lancer l&apos;Audit Gratuit →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ — LIGHT ─── */}
      <section className="py-24 bg-white border-t border-[#E8ECF2]">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <FaqSection
            faqs={faqs}
            imageUrl="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=830&h=844&auto=format&fit=crop"
            imageAlt="Cabinet dentaire moderne"
            label=""
            title="Questions fréquentes"
            subtitle="Tout ce que vous devez savoir sur l'audit flash PerfIAmatic — gratuit, sécurisé, en 60 secondes."
          />
        </div>
      </section>

      {/* ─── FINAL CTA — DARK (gradient) ─── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4338CA] via-[#6366F1] to-[#7C3AED]" />
        {[
          "w-96 h-96 -top-24 -right-24 opacity-20",
          "w-64 h-64 bottom-0 left-10 opacity-10",
          "w-48 h-48 top-1/2 left-1/3 opacity-10",
        ].map((cls, i) => (
          <div key={i} className={`absolute rounded-full border border-white/30 ${cls}`} aria-hidden="true" />
        ))}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-5">
            Prochaine étape
          </motion.p>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Vous perdez en moyenne 27 000€ par an.
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Vérifiez votre chiffre en 60 secondes — c&apos;est gratuit.
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Link href="/audit"
              className="inline-flex justify-center items-center bg-white text-[#4338CA] hover:bg-white/90 px-10 py-4 rounded-full text-lg font-extrabold transition-all shadow-2xl hover:-translate-y-0.5 transform duration-200">
              Découvrir ce que je perds vraiment →
            </Link>
          </motion.div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-sm text-white/50 mt-6 flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Gratuit · Sans inscription · 60 secondes
          </motion.p>
        </div>
      </section>

      {/* ─── FOOTER — DARK ─── */}
      <footer className="bg-ink border-t border-white/[0.07] text-white/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Activity className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-white">PerfIAmatic</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors duration-200">Politique de Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors duration-200">CGU</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Contact</a>
            </div>
            <div className="text-sm">&copy; {new Date().getFullYear()} PerfIAmatic. Tous droits réservés.</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
