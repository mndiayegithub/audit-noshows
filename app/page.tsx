"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { UploadCloud, ShieldCheck, Activity, CalendarX, TrendingUp, Download, PieChart, Clock } from "lucide-react";

const FAQItem = ({ q, a, isOpen, onClick }: { q: string, a: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={`border-b border-gray-100 transition-all duration-300 ${isOpen ? 'bg-gray-50' : ''}`}>
      <button onClick={onClick} className="w-full text-left py-6 px-6 flex justify-between items-center focus:outline-none">
        <span className="font-heading font-semibold text-gray-900 text-lg pr-8">{q}</span>
        <span className="text-primary text-2xl font-light w-6 text-center shrink-0">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="pb-6 px-6 text-gray-600 leading-relaxed">{a}</div>
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

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: any = {
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
      a: "L'export CSV ne contient aucune donnée nominative patient. Conforme RGPD, hébergé en France, aucun nom n'est stocké."
    },
    {
      q: "Ça fonctionne avec quel logiciel ?",
      a: "L'audit fonctionne avec tout export Doctolib au format CSV."
    },
    {
      q: "Combien de temps ça prend ?",
      a: "L'analyse est immédiate. Vous obtenez votre rapport en moins de 60 secondes après l'upload."
    },
    {
      q: "Que contient le rapport gratuit ?",
      a: "Il contient votre taux de no-shows réel, les créneaux les plus à risque, et l'impact financier estimé sur votre chiffre d'affaires."
    },
    {
      q: "Et après l'audit ?",
      a: "Vous pouvez utiliser ces informations pour ajuster votre organisation, ou souscrire à nos services pour une automatisation complète de la récupération des no-shows."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-200 selection:text-brand-900 overflow-x-hidden">
      
      {/* HEADER */}
      <nav 
        id="navbar"
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100" : "glass-panel"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">
                PerfIAmatic
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Impact</a>
              <Link 
                href="/audit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Démarrer l&apos;Audit Gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Exclusif cliniques médicales
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight"
              >
                Vos données Doctolib révèlent <br/>
                <span className="text-accent">ce que vous perdez vraiment.</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Taux exact, créneaux à risque, CA perdu. <br className="hidden sm:block" />
                Analysez votre export en 60 secondes — gratuit, sans inscription.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link 
                  href="/audit"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
                >
                  <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Importer un CSV Doctolib
                </Link>
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 font-medium">
                  <ShieldCheck className="text-emerald-500 w-5 h-5" />
                  100% Gratuit & Sécurisé
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual / Dashboard mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-10 animate-float"
            >
              <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-2xl bg-white/40 relative z-20">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
                  <h3 className="font-heading font-semibold text-slate-800">Aperçu du Cabinet</h3>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Mock UI element 1 */}
                  <div className="bg-white/70 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <CalendarX className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">CA perdu (30j)</p>
                        <p className="font-heading font-bold text-xl text-slate-900">3 820 €</p>
                      </div>
                    </div>
                    <span className="bg-red-100 text-danger text-xs font-bold px-2.5 py-1 rounded-full">Actionnable</span>
                  </div>
                  
                  {/* Mock UI element 2 */}
                  <div className="bg-white/70 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-xl">
                        <Clock className="text-accent w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Taux no-shows</p>
                        <p className="font-heading font-bold text-xl text-slate-900">7,4%</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-warning text-xs font-bold px-2.5 py-1 rounded-full">À risque</span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60">
                    <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider">Analyse IA Sécurisée en cours...</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass-panel rounded-2xl p-4 shadow-xl border border-white flex items-center gap-4 animate-pulse-slow hover:animate-none transition-all cursor-pointer z-30">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <TrendingUp className="text-success w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">ROI MOYEN</p>
                  <p className="font-heading font-extrabold text-2xl text-slate-800">21x</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section id="metrics" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Des données qui stimulent la <span className="text-gradient">croissance de votre clinique</span>.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-600">
              Ne laissez plus de place au hasard dans votre agenda. Rejoignez les centaines de professionnels de santé qui ont transformé leurs données Doctolib en rentabilité absolue.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <motion.div variants={fadeInUp} className="glass-panel hover:-translate-y-2 transition-transform duration-300 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl text-center group bg-gradient-to-b from-white to-slate-50">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">21x</h3>
              <p className="text-slate-600 font-medium">ROI moyen constaté</p>
            </motion.div>
            
            {/* Stat 2 */}
            <motion.div variants={fadeInUp} className="glass-panel hover:-translate-y-2 transition-transform duration-300 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl text-center group bg-gradient-to-b from-white to-slate-50">
              <div className="w-16 h-16 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">18 Jours</h3>
              <p className="text-slate-600 font-medium">Délai de récupération</p>
            </motion.div>
            
            {/* Stat 3 */}
            <motion.div variants={fadeInUp} className="glass-panel hover:-translate-y-2 transition-transform duration-300 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl text-center group bg-gradient-to-b from-white to-slate-50">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">9,7/10</h3>
              <p className="text-slate-600 font-medium">Score de satisfaction cabinet</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment-ca-marche" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span variants={fadeInUp} className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">PROCESSUS SIMPLE</motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Du CSV brut à un <br/>plan d&apos;action clinique.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-300">
              Trois étapes simples pour libérer tout le potentiel de votre agenda Doctolib.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>

            {[
              {
                step: "1",
                icon: <Download className="w-10 h-10 text-blue-400 group-hover:text-white transition-colors" />,
                title: "Exportez votre CSV",
                desc: "Connectez-vous à Doctolib et exportez votre historique de rendez-vous au format CSV standard. Aucune intégration n'est requise.",
                borderColor: "border-blue-500/30 group-hover:border-blue-400",
                shadowColor: "shadow-[0_0_30px_rgba(14,165,233,0.1)] group-hover:shadow-[0_0_40px_rgba(14,165,233,0.3)]",
                badgeBg: "bg-blue-500"
              },
              {
                step: "2",
                icon: <UploadCloud className="w-10 h-10 text-purple-400 group-hover:text-white transition-colors" />,
                title: "Upload Sécurisé",
                desc: "Glissez-déposez votre CSV dans notre zone sécurisée. Les données sont traitées localement et immédiatement anonymisées.",
                borderColor: "border-purple-500/30 group-hover:border-purple-400",
                shadowColor: "shadow-[0_0_30px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]",
                badgeBg: "bg-purple-500"
              },
              {
                step: "3",
                icon: <PieChart className="w-10 h-10 text-emerald-400 group-hover:text-white transition-colors" />,
                title: "Audit IA Instantané",
                desc: "Obtenez un tableau de bord visuel indiquant précisément les zones de perte de revenus et les opportunités d'optimisation.",
                borderColor: "border-emerald-500/30 group-hover:border-emerald-400",
                shadowColor: "shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]",
                badgeBg: "bg-emerald-500"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                <div className={`w-24 h-24 mx-auto bg-slate-800 border-2 ${item.borderColor} rounded-3xl flex items-center justify-center mb-8 relative z-10 transition-colors duration-300 ${item.shadowColor} group-hover:scale-105`}>
                  <span className={`absolute -top-4 -right-4 w-8 h-8 rounded-full ${item.badgeBg} text-white font-bold flex items-center justify-center text-sm shadow-lg`}>{item.step}</span>
                  {item.icon}
                </div>
                <h4 className="text-xl font-heading font-bold mb-3">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section id="impact" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Ce que <span className="text-gradient">Doctolib</span> ne vous dit pas.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-600">
              Découvrez la différence entre les données brutes et les insights actionnables.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-3xl p-8 md:p-12 border-l-4 border-l-slate-300 shadow-sm"
            >
              <h3 className="text-2xl font-heading font-bold text-slate-900 mb-10">La réalité cachée</h3>
              <ul className="space-y-6">
                {[
                  "Votre taux de no-shows réel",
                  "Quels créneaux sont les plus à risque",
                  "Ce que ça représente en euros perdus",
                  "Comment vous situez-vous vs le secteur"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-slate-400 mt-1 text-xl font-bold">✗</span>
                    <span className="text-slate-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-50/30 rounded-3xl p-8 md:p-12 border-l-4 border-l-primary shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 -right-4 w-32 h-32 bg-primary mix-blend-multiply filter blur-3xl opacity-10 rounded-full"></div>
              <h3 className="text-2xl font-heading font-bold text-slate-900 mb-10 relative z-10">Ce que l&apos;Audit révèle</h3>
              <ul className="space-y-6 relative z-10">
                {[
                  "Taux exact mesuré sur votre historique",
                  "Top 3 créneaux catastrophiques identifiés",
                  "CA perdu calculé à l'euro près",
                  "Benchmark vs cabinets de votre secteur"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-primary mt-1 text-xl font-bold">✓</span>
                    <span className="text-slate-800 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 mix-blend-multiply filter blur-3xl opacity-50 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-100 mix-blend-multiply filter blur-3xl opacity-50 rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6 tracking-tight">L&apos;impact mesuré par <span className="text-gradient">vos confrères</span></motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-600 max-w-3xl mx-auto">
              Découvrez comment d&apos;autres professionnels de santé optimisent leur agenda grâce à nos analyses.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Après l'audit, nous avons pris conscience du manque à gagner réel.",
                author: "37 000€ récupérés",
                sub: "Cabinet dentaire · Lyon"
              },
              {
                text: "En 60 secondes je voyais mon chiffre exact. Personne ne m'avait jamais montré ça.",
                author: "Chiffre exact révélé",
                sub: "Chirurgien-dentiste · Amiens"
              },
              {
                text: "La liste d'attente a rempli 3 créneaux le premier lundi.",
                author: "3 créneaux remplis",
                sub: "Cabinet dentaire · Paris 15ème"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 md:p-10 rounded-3xl shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow bg-gradient-to-b from-white to-slate-50"
              >
                <div>
                  <div className="flex gap-1 text-emerald-500 text-xl mb-6">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className="text-slate-900 font-medium text-lg leading-relaxed mb-8">&quot;{t.text}&quot;</p>
                </div>
                <div>
                  <div className="text-sm font-bold text-primary mb-1">→ {t.author}</div>
                  <div className="text-xs font-medium text-slate-500">{t.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULATOR */}
      <section className="py-24 bg-slate-50 relative w-full overflow-hidden border-t border-slate-200">
        {/* Decorative bg blur */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

        <div className="w-full max-w-2xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel bg-white/60 rounded-[3rem] p-8 md:p-12 text-center border border-slate-200 shadow-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 mb-4">Simulez vos <span className="text-gradient">pertes actuelles</span></h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">Ajustez le curseur pour estimer le manque à gagner de votre clinique selon votre volume de rendez-vous.</p>
            
            <div className="mb-10">
              <div className="flex justify-between items-end mb-6">
                <label className="font-semibold text-slate-700">Nombre de RDV par jour</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">{rdvPerDay}</span>
                </div>
              </div>
              <div className="relative pt-2 pb-6">
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  step="5"
                  value={rdvPerDay}
                  onChange={(e) => setRdvPerDay(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 md:p-12 mb-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <p className="text-slate-500 font-medium mb-3">Vous perdez environ</p>
              <div className="text-4xl md:text-5xl font-bold text-danger mb-3 font-heading tracking-tight">
                {perteMois.toLocaleString('fr-FR')}€ <span className="text-2xl text-red-400">/ mois</span>
              </div>
              <div className="text-xl font-semibold text-slate-500">
                soit <span className="text-slate-900">{perteAn.toLocaleString('fr-FR')}€ / an</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-10">
              *Basé sur un taux national de 6,2%, un panier moyen de 150€ et 20 jours/mois
            </p>

            <Link 
              href="/audit"
              className="inline-flex justify-center items-center w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Lancer l&apos;Audit Gratuit →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-slate-900">Questions fréquentes</h2>
          </div>
          
          <div className="border-t border-slate-100">
            {faqs.map((faq, i) => (
              <FAQItem 
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2 variants={fadeInUp} className="font-heading text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Vous perdez en moyenne 27 000€ par an.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Vérifiez votre chiffre en 60 secondes — c&apos;est gratuit.
          </motion.p>
          
          <motion.div variants={fadeInUp}>
            <Link 
              href="/audit"
              className="inline-flex justify-center items-center bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Découvrir ce que je perds vraiment →
            </Link>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-sm text-blue-200 mt-6 flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4" /> Gratuit · Sans inscription · 60 secondes
          </motion.p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">PerfIAmatic</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions Générales d&apos;Utilisation</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>

            <div className="text-sm">
              &copy; {new Date().getFullYear()} PerfIAmatic. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
