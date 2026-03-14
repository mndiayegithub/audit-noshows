"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
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

export default function HomePage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-slate-200 font-sans relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hex-pattern opacity-[0.03] pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-brand-dark border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
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
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* SECTION 1 — Hero */}
        <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 px-4 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            className="max-w-4xl mx-auto text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
              <svg className="w-12 h-12 text-gold opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.5 2 6 5 6 8.5C6 11.5 7.5 14 7.5 14L8 19C8 20 8.5 22 12 22C15.5 22 16 20 16 19L16.5 14C16.5 14 18 11.5 18 8.5C18 5 15.5 2 12 2ZM11 18H9.5C9.2 18 9 17.8 9 17.5V14H11V18ZM14.5 18H13V14H15V17.5C15 17.8 14.8 18 14.5 18Z" />
              </svg>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-6xl font-heading font-bold text-white mb-6 leading-tight"
            >
              Combien vous coûtent vraiment <span className="text-gold">vos no-shows</span> ?
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Analysez votre historique Doctolib et découvrez exactement <br className="hidden sm:block" />
              combien vous perdez chaque mois.<br/>
              <span className="font-medium text-white mt-3 inline-block">Gratuit. Sans inscription. En 30 secondes.</span>
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
              
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-2">
                <span>🔒 Données confidentielles</span>
                <span className="hidden sm:inline">•</span>
                <span>Conformité RGPD</span>
                <span className="hidden sm:inline">•</span>
                <span>Hébergé en France</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 2 — Bande de stats */}
        <section className="py-12 border-y border-med-blue/20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-med-blue/20 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-2">
                  <Counter from={0} to={6.2} duration={2} format={(v) => v.toFixed(1).replace('.', ',') + '%'} />
                </div>
                <div className="text-sm text-slate-300">
                  Taux moyen de no-shows dentaires en France
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-2">
                  15k€ – 22k€
                </div>
                <div className="text-sm text-slate-300">
                  Perdus en moyenne par cabinet chaque année
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="px-4">
                <div className="text-4xl md:text-5xl font-heading font-bold text-med-blue mb-2">
                  <Counter from={0} to={30} duration={1.5} format={(v) => Math.round(v).toString() + ' sec'} />
                </div>
                <div className="text-sm text-slate-300">
                  Pour connaître votre chiffre exact
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3 — Les 3 cards */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: (
                    <svg className="w-8 h-8 text-med-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Rapide",
                  desc: "Uploadez votre export Doctolib CSV. Résultats personnalisés en 30 secondes."
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  ),
                  title: "Précis",
                  desc: "Taux réel mesuré. Créneaux à risque identifiés. Pas une estimation — vos données exactes."
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-med-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Rentable",
                  desc: "ROI moyen de 21x. Récupérez des milliers d'euros de CA perdu dès les 18 premiers jours."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-med-blue/20 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-med-blue/40"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-heading font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 — Témoignages */}
        <section className="py-20 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
              className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 pb-6 md:pb-0 scrollbar-hide"
            >
              {[
                {
                  quote: "Après l'audit PerfIAmatic, nous avons réduit notre taux de no-shows de 7,2% à 4,9%. Soit 37 000€ récupérés par an.",
                  author: "Cabinet dentaire — Lyon"
                },
                {
                  quote: "En 30 secondes j'ai su exactement ce que je perdais chaque mois. Personne ne m'avait jamais montré ce chiffre.",
                  author: "Chirurgien-dentiste — Amiens"
                },
                {
                  quote: "La liste d'attente automatique a rempli 3 créneaux le premier lundi d'utilisation.",
                  author: "Cabinet dentaire — Paris 15ème"
                }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="snap-center shrink-0 w-[85vw] md:w-auto bg-surface rounded-xl p-8 border-l-[3px] border-med-blue border-y border-r border-y-white/5 border-r-white/5 shadow-card flex flex-col justify-between"
                >
                  <p className="text-lg text-white italic mb-6 leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.5 2 6 5 6 8.5C6 11.5 7.5 14 7.5 14L8 19C8 20 8.5 22 12 22C15.5 22 16 20 16 19L16.5 14C16.5 14 18 11.5 18 8.5C18 5 15.5 2 12 2Z" />
                    </svg>
                    <p className="font-heading font-semibold text-gold">
                      {t.author}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 5 — ROI */}
        <section className="py-24 px-4">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-12"
            >
              Le calcul est simple
            </motion.h2>
            
            <motion.div 
              variants={fadeInUp}
              className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10 shadow-card hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-4 text-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-white/10 gap-1">
                  <span className="text-slate-300">Cabinet type</span>
                  <span className="font-semibold text-white sm:text-right">35 RDV/jour — panier moyen 150€</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-300">Taux no-shows réel</span>
                  <span className="font-semibold text-med-blue">6,2%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-300">Créneaux perdus/mois</span>
                  <span className="font-semibold text-white">26</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-300">CA perdu/mois</span>
                  <span className="font-semibold text-white">3 900€</span>
                </div>
                <div className="flex justify-between items-center pb-6">
                  <span className="text-slate-300">CA perdu/an</span>
                  <span className="font-bold text-2xl text-white">46 800€</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gold/30 bg-gold/5 -mx-8 -mb-8 px-8 pb-8 md:-mx-12 md:-mb-12 md:px-12 md:pb-12 rounded-b-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <div className="text-slate-300 mb-1">Système anti-no-shows PerfIAmatic</div>
                    <div className="font-semibold text-white text-xl">1 800€ <span className="text-sm font-normal text-slate-400">/ an</span></div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-med-blue font-bold text-3xl mb-1">ROI : 21x</div>
                    <div className="text-med-green font-medium">Récupération en 18 jours</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 6 — Badge RGPD */}
        <section className="py-12 px-4">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeInUp}
              className="bg-surface rounded-xl p-8 border border-med-blue/30 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="bg-med-blue/10 p-4 rounded-full shrink-0">
                <svg className="w-10 h-10 text-med-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-white mb-3">
                  Vos données restent vos données
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-med-blue">→</span> Hébergé en Europe — Conforme RGPD
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-med-blue">→</span> Aucune donnée patient transmise à des tiers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-med-blue">→</span> Export CSV analysé localement — jamais stocké
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 7 — CTA final */}
        <section className="py-24 px-4 text-center relative z-10 border-t border-white/5 bg-brand-darker">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Vous perdez peut-être <span className="text-gold">20 000€</span> par an sans le savoir.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-300 mb-10">
              Vérifiez en 30 secondes — c&apos;est gratuit.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href="/audit"
                className="inline-block bg-gold text-brand-dark px-10 py-5 rounded-xl font-heading font-bold text-xl hover:bg-gold-light transition-all shadow-card hover:shadow-glow-gold hover:-translate-y-1 mb-4 w-full sm:w-auto"
              >
                Découvrir ce que je perds vraiment →
              </Link>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-slate-400 text-sm">
              Gratuit · Sans inscription · 30 secondes
            </motion.p>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-darker border-t border-white/5 py-8 z-10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm flex flex-col md:flex-row justify-center items-center gap-2">
          <span>© 2026 PerfIAmatic</span>
          <span className="hidden md:inline">—</span>
          <span>Spécialiste anti-no-shows cabinets dentaires</span>
          <span className="hidden md:inline">—</span>
          <a href="mailto:contact@perfiamatic.com" className="hover:text-gold transition-colors">
            contact@perfiamatic.com
          </a>
        </div>
      </footer>
    </div>
  );
}