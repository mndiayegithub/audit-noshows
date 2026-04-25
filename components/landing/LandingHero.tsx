"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import MiniDashboard from "./MiniDashboard";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const container: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24 md:items-center"
      >
        {/* Left — text + CTAs */}
        <div>
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            Audit gratuit · 60 secondes
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-5 font-serif text-4xl leading-[1.1] text-slate-900 md:text-6xl"
          >
            Combien les no-shows coûtent-ils vraiment à votre cabinet&nbsp;?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base text-slate-600 md:text-lg"
          >
            Chargez votre export de données de rendez-vous et recevez un rapport chiffré sur votre
            taux de no-shows, le CA perdu et les créneaux à risque sans inscription.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
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
              Comment ça marche
            </a>
          </motion.div>
        </div>

        {/* Right — mini dashboard mockup */}
        <motion.div variants={fadeUp} className="md:pl-4">
          <MiniDashboard />
        </motion.div>
      </motion.div>
    </section>
  );
}
