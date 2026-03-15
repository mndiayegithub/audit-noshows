"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, Variants, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Counter = ({ from, to, duration, format }: { from: number; to: number; duration: number; format?: (v: number) => string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * easeProgress);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, from, to, duration]);

  return <span ref={ref}>{format ? format(value) : Math.round(value)}</span>;
};

const FAQItem = ({ q, a, isOpen, onClick }: { q: string, a: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={`border-b border-white/10 transition-all duration-300 ${isOpen ? 'border-l-[3px] border-l-gold bg-white/5' : ''}`}>
      <button onClick={onClick} className="w-full text-left py-6 px-6 flex justify-between items-center focus:outline-none">
        <span className="font-heading font-semibold text-white text-lg pr-8">{q}</span>
        <span className="text-gold text-2xl font-light w-6 text-center shrink-0">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="pb-6 px-6 text-slate-300 leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [rdvPerDay, setRdvPerDay] = useState<number>(35);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // ROI Calculator
  const rdvMois = rdvPerDay * 20;
  const noShowsMois = rdvMois * 0.062;
  const perteMois = Math.round(noShowsMois * 150);
  const perteAn = perteMois * 12;

  const faqs = [
    {
      q: "C'est vraiment gratuit ?",
      a: "Oui, l'audit de base est 100% gratuit et sans engagement."
    },
    {
      q: "Mes données patients sont-elles sécurisées ?",
      a: "L'export CSV ne contient aucune donnée nominative patient. Conforme RGPD, hébergé en France."
    },
    {
      q: "Ça fonctionne avec quel logiciel ?",
      a: "L'audit fonctionne avec tout export Doctolib au format CSV."
    },
    {
      q: "Combien de temps ça prend ?",
      a: "L'export Doctolib prend 2 minutes. L'analyse prend 60 secondes."
    },
    {
      q: "Que se passe-t-il après l'audit ?",
      a: "Vous recevez votre rapport complet. Si vous souhaitez aller plus loin, nous pouvons discuter d'une solution sur mesure pour votre cabinet."
    },
    {
      q: "Est-ce adapté à mon type de cabinet ?",
      a: "Oui — solo, groupe, centre de santé. L'outil s'adapte à votre profil."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-slate-200 font-sans relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-hex-pattern opacity-[0.03] pointer-events-none z-0" />

      {/* 1. NAVIGATION STICKY */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-brand-dark/90 backdrop-blur-md border-white/10 py-3 shadow-lg" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center shrink-0" aria-label="PerfIAmatic - Accueil">
              <Image
                src="/logo.png"
                alt="PerfIAmatic"
                width={200}
                height={45}
                className="h-[2.2rem] w-auto object-contain"
                priority
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#pourquoi" className="text-sm font-medium text-slate-300 hover:text-gold transition-colors">Pourquoi PerfIAmatic</a>
              <a href="#comment" className="text-sm font-medium text-slate-300 hover:text-gold transition-colors">Comment ça marche</a>
              <a href="#resultats" className="text-sm font-medium text-slate-300 hover:text-gold transition-colors">Résultats</a>
              <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-gold transition-colors">FAQ</a>
            </nav>

            <Link
              href="/audit"
              className="hidden sm:inline-block bg-gold text-brand-dark px-6 py-2.5 rounded-lg font-heading font-semibold text-sm hover:bg-gold-light hover:shadow-glow-gold transition-all"
            >
              Commencer l&apos;audit gratuit →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24">
        {/* 2. HERO */}
        <section className="hero relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-hex-pattern opacity-[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            className="max-w-4xl mx-auto text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-6xl font-heading font-bold text-white mb-6 leading-tight"
            >
              Combien vous coûtent réellement <span className="text-gold">vos rendez-vous non honorés</span> ?
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Analysez votre historique Doctolib et découvrez exactement <br className="hidden sm:block" />
              combien vous perdez chaque mois.<br/>
              <span className="font-medium text-white mt-3 inline-block">Gratuit. Sans inscription. En 60 secondes.</span>
            </motion.p>
            
            <motion.div variants={fadeInUp}>
              <Link
                href="/audit"
                className="inline-block bg-gold text-brand-dark px-8 py-4 rounded-xl font-heading font-semibold text-lg hover:bg-gold-light transition-all shadow-card hover:shadow-glow-gold hover:-translate-y-1 mb-4"
              >
                <motion.span
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="inline-block"
                >
                  Commencer l&apos;audit gratuit →
                </motion.span>
              </Link>
              
              <p className="text-sm text-slate-400 italic mt-3">
                Déjà utilisé par des cabinets dentaires à Paris, Lyon, Amiens, Bordeaux...
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. BANDE LOGOS / PREUVES */}
        <section className="py-8 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 opacity-60">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-300">Analyse basée sur les données de :</span>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <div className="text-2xl font-bold tracking-tight text-white">Doctolib</div>
              <div className="text-2xl font-bold tracking-tighter text-white">DREES</div>
              <div className="hidden md:block h-6 w-px bg-white/20"></div>
              <div className="text-sm font-medium text-slate-300">30 millions de RDV analysés</div>
            </div>
          </div>
        </section>

        {/* 4. SECTION "POURQUOI PERFIAMATIC" */}
        <section id="pourquoi" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
            >
              {/* Colonne Gauche - Problème */}
              <motion.div variants={fadeInUp} className="bg-surface rounded-2xl p-8 md:p-10 border-l-[4px] border-red-500 border-y border-r border-y-white/5 border-r-white/5 shadow-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <svg className="w-24 h-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-8">Ce que Doctolib ne vous dit pas</h3>
                <ul className="space-y-5">
                  {[
                    "Votre taux de no-shows réel",
                    "Quels créneaux sont les plus à risque",
                    "Ce que ça représente en euros perdus",
                    "Comment vous comparez au secteur"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="text-red-500 text-xl mt-0.5 shrink-0">❌</span>
                      <span className="text-slate-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Colonne Droite - Solution */}
              <motion.div variants={fadeInUp} className="bg-med-green/5 rounded-2xl p-8 md:p-10 border-l-[4px] border-med-green border-y border-r border-y-med-green/20 border-r-med-green/20 shadow-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <svg className="w-24 h-24 text-med-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-8">Ce que PerfIAmatic révèle</h3>
                <ul className="space-y-5">
                  {[
                    "Taux exact mesuré sur votre historique",
                    "Top 3 créneaux catastrophiques identifiés",
                    "CA perdu calculé à l'euro près",
                    "Benchmark vs cabinets de votre secteur"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="text-gold text-xl mt-0.5 shrink-0">✅</span>
                      <span className="text-slate-200 text-lg font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 5. SECTION "COMMENT ÇA MARCHE" */}
        <section id="comment" className="py-24 px-4 bg-brand-darker border-y border-white/5 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Comment ça marche</h2>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
            >
              {/* Flèches de connexion (desktop) */}
              <div className="hidden md:block absolute top-[4.5rem] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-med-blue/30 via-gold/30 to-med-green/30 z-0" />

              {[
                {
                  num: "01",
                  title: "Exportez votre CSV",
                  desc: "2 clics dans Doctolib. Aucune installation requise.",
                  icon: (
                    <svg className="w-8 h-8 text-med-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )
                },
                {
                  num: "02",
                  title: "L'IA analyse vos données",
                  desc: "Notre algorithme traite votre historique en temps réel.",
                  icon: (
                    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )
                },
                {
                  num: "03",
                  title: "Recevez votre rapport",
                  desc: "Taux réel, créneaux à risque, CA perdu. En 60 secondes.",
                  icon: (
                    <svg className="w-8 h-8 text-med-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                }
              ].map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="relative z-10 flex flex-col items-center text-center mt-6">
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[100px] font-bold text-gold/5 font-heading pointer-events-none select-none">
                    {step.num}
                  </div>
                  <div className="w-20 h-20 rounded-full bg-brand-dark border-[3px] border-white/10 flex items-center justify-center mb-6 shadow-xl relative z-10">
                    <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white mb-3 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed max-w-[250px] relative z-10">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 6. SECTION STATS */}
        <section className="py-20 border-y border-med-blue/20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-0 md:divide-x divide-med-blue/20 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-3">
                  <Counter from={0} to={6.2} duration={2} format={(v) => v.toFixed(1).replace('.', ',') + '%'} />
                </div>
                <div className="text-sm font-medium text-slate-300">
                  Taux moyen no-shows dentaires France
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-3">
                  <Counter from={0} to={22} duration={2} format={(v) => Math.round(v).toString() + ' 000€'} />
                </div>
                <div className="text-sm font-medium text-slate-300">
                  Perdus en moyenne par cabinet/an
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-3">
                  <Counter from={0} to={60} duration={1.5} format={(v) => Math.round(v).toString() + ' sec'} />
                </div>
                <div className="text-sm font-medium text-slate-300">
                  Pour connaître votre chiffre exact
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-3">
                  <Counter from={0} to={21} duration={2} format={(v) => Math.round(v).toString() + 'x'} />
                </div>
                <div className="text-sm font-medium text-slate-300">
                  ROI moyen constaté
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 7. SECTION "APERÇU DU RAPPORT" */}
        <section id="resultats" className="py-24 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Voici ce que vous allez recevoir</h2>
              <p className="text-xl text-slate-400">Un rapport complet et personnalisé pour votre cabinet</p>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Mockup Window */}
              <motion.div 
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-surface rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(201,168,76,0.15)] overflow-hidden relative z-10"
                style={{ transformPerspective: 1000 }}
              >
                {/* Browser bar */}
                <div className="bg-brand-darker px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-4 flex-1 flex justify-center">
                    <div className="bg-white/5 rounded-md px-6 py-1.5 text-xs text-slate-400 flex items-center gap-2 border border-white/5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      audit.perfiamatic.fr/resultats
                    </div>
                  </div>
                </div>
                
                {/* Dashboard content simplified mockup */}
                <div className="p-6 md:p-10 bg-brand-dark/50">
                  <div className="h-8 w-64 bg-gold/20 rounded mb-8"></div>
                  
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-surface rounded-xl p-4 border border-white/5">
                        <div className="h-3 w-16 bg-white/10 rounded mb-3"></div>
                        <div className="h-6 w-24 bg-white/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Highlighted KPI */}
                  <div className="bg-surface border border-gold/30 rounded-xl p-8 mb-8 relative">
                    <div className="h-4 w-40 bg-med-blue/40 rounded mb-3 mx-auto"></div>
                    <div className="h-12 w-56 bg-gold/80 rounded mx-auto"></div>
                    
                    {/* Annotation CA Perdu */}
                    <div className="absolute -right-6 md:-right-40 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
                      <svg className="w-12 h-12 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="text-gold font-medium bg-brand-darker px-4 py-2 rounded-lg border border-gold/30 whitespace-nowrap shadow-lg">
                        CA perdu calculé en temps réel
                      </span>
                    </div>
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="bg-surface rounded-xl p-6 border border-white/5 h-48 relative">
                      {/* Fake chart */}
                      <div className="absolute bottom-6 left-6 right-6 h-32 flex items-end justify-between gap-2">
                        <div className="w-full bg-white/10 h-[40%] rounded-t-sm"></div>
                        <div className="w-full bg-white/10 h-[60%] rounded-t-sm"></div>
                        <div className="w-full bg-med-blue/40 h-[90%] rounded-t-sm"></div>
                        <div className="w-full bg-white/10 h-[30%] rounded-t-sm"></div>
                        <div className="w-full bg-white/10 h-[50%] rounded-t-sm"></div>
                      </div>
                    </div>

                    <div className="bg-surface rounded-xl p-6 border border-white/5 h-48 relative">
                       {/* Fake gauge */}
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-32 h-16 border-t-[16px] border-x-[16px] border-med-green/40 rounded-t-full border-b-0"></div>
                       </div>
                      {/* Annotation Position */}
                      <div className="absolute -left-6 md:-left-44 top-1/2 -translate-y-1/2 hidden md:flex flex-row-reverse items-center gap-3">
                        <svg className="w-12 h-12 text-med-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-med-blue font-medium bg-brand-darker px-4 py-2 rounded-lg border border-med-blue/30 whitespace-nowrap shadow-lg">
                          Votre position vs secteur
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Report */}
                  <div className="mt-8 bg-surface rounded-xl p-8 border border-white/5 relative">
                    <div className="h-6 w-48 bg-gold/50 rounded mb-6"></div>
                    <div className="space-y-4">
                      <div className="h-3 w-full bg-white/10 rounded"></div>
                      <div className="h-3 w-5/6 bg-white/10 rounded"></div>
                      <div className="h-3 w-4/6 bg-white/10 rounded"></div>
                      <div className="h-3 w-full bg-white/10 rounded"></div>
                    </div>
                    
                    {/* Annotation AI */}
                    <div className="absolute -right-6 md:-right-48 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
                      <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="text-slate-300 font-medium bg-brand-darker px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap shadow-lg">
                        Plan d&apos;action personnalisé par l&apos;IA
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 8. TÉMOIGNAGES */}
        <section className="py-20 border-y border-white/5 bg-brand-darker">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  result: "37 000€ récupérés",
                  quote: "Après l'audit PerfIAmatic, nous avons pris conscience du manque à gagner. Leur système nous a permis de récupérer un CA énorme dès la première année.",
                  author: "Cabinet dentaire",
                  city: "Lyon"
                },
                {
                  result: "Chiffre exact révélé",
                  quote: "En 60 secondes je voyais mon chiffre exact. Personne ne m'avait jamais montré la réalité de ces créneaux perdus avec autant de précision.",
                  author: "Chirurgien-dentiste",
                  city: "Amiens"
                },
                {
                  result: "3 créneaux remplis",
                  quote: "La liste d'attente automatique a rempli 3 créneaux le premier lundi d'utilisation de leur solution après l'audit.",
                  author: "Cabinet dentaire",
                  city: "Paris 15ème"
                }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="bg-surface rounded-xl p-8 border border-white/10 shadow-card flex flex-col justify-between hover:border-gold/30 transition-colors"
                >
                  <div>
                    <div className="text-gold tracking-widest text-xl mb-5">★★★★★</div>
                    <p className="text-lg text-slate-300 italic mb-6 leading-relaxed">
                      &quot;{t.quote}&quot;
                    </p>
                    <p className="text-gold font-bold text-xl mb-6 font-heading">{t.result}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                    <span className="text-xl">🦷</span>
                    <div>
                      <p className="font-semibold text-white">{t.author}</p>
                      <p className="text-sm text-slate-400">{t.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 9. SECTION ROI INTERACTIVE */}
        <section className="py-24 px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-12"
            >
              Simulez vos pertes actuelles
            </motion.h2>
            
            <motion.div 
              variants={fadeInUp}
              className="bg-surface rounded-2xl p-8 md:p-12 border border-med-blue/30 shadow-card"
            >
              <div className="mb-12">
                <div className="flex justify-between items-end mb-6">
                  <label className="text-xl font-medium text-slate-200">Nombre de RDV par jour</label>
                  <span className="text-4xl font-heading font-bold text-med-blue bg-med-blue/10 px-4 py-1 rounded-lg">{rdvPerDay}</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  step="1" 
                  value={rdvPerDay} 
                  onChange={(e) => setRdvPerDay(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-med-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(79,195,247,0.6)]"
                  style={{
                    background: `linear-gradient(to right, #4FC3F7 0%, #4FC3F7 ${(rdvPerDay-20)/60 * 100}%, rgba(255,255,255,0.1) ${(rdvPerDay-20)/60 * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <div className="flex justify-between text-sm font-medium text-slate-500 mt-4">
                  <span>20 RDV</span>
                  <span>80 RDV</span>
                </div>
              </div>

              <div className="bg-brand-dark/50 rounded-xl p-8 text-center border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-med-blue/5 pointer-events-none"></div>
                <p className="text-xl text-slate-300 mb-3 relative z-10">Vous perdez environ</p>
                <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 relative z-10">
                  {perteMois.toLocaleString()}€ <span className="text-2xl text-slate-400 font-normal">/ mois</span>
                </div>
                <p className="text-xl text-slate-300 relative z-10">
                  soit <span className="text-gold font-bold text-3xl mx-1">{perteAn.toLocaleString()}€</span> par an
                </p>
                <p className="text-sm text-slate-500 mt-8 relative z-10">
                  *Calcul basé sur le taux moyen national de 6,2%, un panier moyen de 150€ et 20 jours travaillés/mois.
                </p>
              </div>
              
              <div className="mt-10 text-center">
                <Link
                  href="/audit"
                  className="inline-block bg-med-blue/10 text-med-blue border border-med-blue/30 px-8 py-4 rounded-xl font-heading font-semibold text-lg hover:bg-med-blue hover:text-brand-dark transition-all shadow-lg hover:shadow-glow-blue"
                >
                  Calculer mon chiffre exact →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 10. SECTION FAQ */}
        <section id="faq" className="py-24 px-4 bg-brand-darker border-y border-white/5">
          <div className="max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-12"
            >
              Questions Fréquentes
            </motion.h2>
            
            <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-card">
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index} 
                  q={faq.q} 
                  a={faq.a} 
                  isOpen={openFaq === index} 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* 11. CTA FINAL */}
        <section className="py-32 px-4 text-center relative z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto relative z-10"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Vous perdez peut-être <span className="text-gold">20 000€</span> <br className="hidden md:block"/>par an sans le savoir.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-300 mb-12">
              Vérifiez en 60 secondes — c&apos;est gratuit.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href="/audit"
                className="inline-block bg-gold text-brand-dark px-12 py-5 rounded-xl font-heading font-bold text-xl hover:bg-gold-light transition-all shadow-card hover:shadow-glow-gold hover:-translate-y-1 mb-6 w-full sm:w-auto"
              >
                Découvrir ce que je perds vraiment →
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
              <p className="text-slate-300 font-medium">
                Gratuit · Sans inscription · 60 secondes
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
                <span>🔒 Données confidentielles — Conforme RGPD</span>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* 12. FOOTER */}
      <footer className="bg-brand-dark border-t border-white/10 pt-16 pb-8 z-10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Col 1 */}
            <div>
              <Image
                src="/logo.png"
                alt="PerfIAmatic"
                width={200}
                height={45}
                className="h-[2.5rem] w-auto object-contain mb-6"
              />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                Spécialiste anti-no-shows <br/>cabinets dentaires.
              </p>
            </div>
            
            {/* Col 2 */}
            <div>
              <h4 className="text-white font-heading font-bold mb-6 text-lg">Liens rapides</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="/audit" className="hover:text-gold transition-colors font-medium">Audit gratuit</Link></li>
                <li><a href="#comment" className="hover:text-gold transition-colors font-medium">Comment ça marche</a></li>
                <li><a href="mailto:contact@perfiamatic.com" className="hover:text-gold transition-colors font-medium">Contact</a></li>
              </ul>
            </div>
            
            {/* Col 3 */}
            <div>
              <h4 className="text-white font-heading font-bold mb-6 text-lg">Mentions légales</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-gold transition-colors font-medium">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-gold transition-colors font-medium">Mentions légales</a></li>
                <li><a href="#" className="hover:text-gold transition-colors font-medium">RGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2026 PerfIAmatic</p>
            <a href="mailto:contact@perfiamatic.com" className="hover:text-gold transition-colors font-medium">
              contact@perfiamatic.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}