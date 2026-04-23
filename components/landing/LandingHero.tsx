"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const container: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

const kpis = [
  { label: "RDV analysés", value: "4 520",    bg: "bg-kpiVolume", fg: "text-kpiVolume-fg" },
  { label: "No-shows",     value: "542",      bg: "bg-kpiSignal", fg: "text-kpiSignal-fg" },
  { label: "Taux",         value: "12 %",     bg: "bg-kpiTaux",   fg: "text-kpiTaux-fg"   },
  { label: "CA perdu",     value: "22 400 €", bg: "bg-kpiArgent", fg: "text-kpiArgent-fg" },
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto max-w-4xl px-6 pt-12 pb-6 text-center md:pt-20"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
        >
          Audit gratuit · 60 secondes
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.15] text-slate-900 md:text-6xl"
        >
          Combien votre cabinet perd-il vraiment chaque année en rendez-vous manqués&nbsp;?
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg"
        >
          Chargez votre export Doctolib. Recevez un rapport chiffré sur votre
          taux de no-shows, le CA perdu et les créneaux à risque — sans inscription.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/audit"
            className="inline-flex items-center rounded-xl bg-primaryDark px-5 py-3 text-sm font-medium text-white transition-shadow hover:shadow-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
          >
            Lancer mon audit
          </Link>
          <a
            href="#comment-ca-marche"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            Voir un exemple de rapport
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mx-auto max-w-4xl px-6 pb-16 md:pb-24"
      >
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          Exemple de résultats
        </p>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((k) => (
            <li
              key={k.label}
              className={`${k.bg} rounded-2xl border border-gray-200/60 p-4`}
            >
              <span className="block text-xs font-medium text-slate-600">{k.label}</span>
              <span className={`mt-1 block font-serif text-2xl font-semibold ${k.fg}`}>
                {k.value}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
