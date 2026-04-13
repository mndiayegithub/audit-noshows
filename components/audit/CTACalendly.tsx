"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
  caPerduAn: number;
  caPerduGoogle?: number;
  email?: string;
}

const CHECKLIST = [
  "Sans engagement",
  "20 minutes chrono",
  "Je vous montre ce que votre cabinet peut récupérer concrètement",
] as const;

export default function CTACalendly({ caPerduAn, caPerduGoogle, email }: Props) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#";
  const impactTotal = caPerduAn + (caPerduGoogle ?? 0);

  const urlWithPrefill = email
    ? `${calendlyUrl}${calendlyUrl.includes("?") ? "&" : "?"}email=${encodeURIComponent(email)}`
    : calendlyUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="bg-navy rounded-3xl p-8 md:p-12 shadow-soft text-center"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 border border-success/30 text-success text-xs font-semibold uppercase tracking-wider mb-5">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        Prochaine étape
      </div>

      {/* Titre */}
      <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white mb-3 tracking-tight">
        Découvrez comment récupérer ces{" "}
        <span className="text-warning">{impactTotal.toLocaleString("fr-FR")} €</span>
        {" "}en 90 jours.
      </h2>

      <p className="text-slate-400 font-medium mb-8 max-w-md mx-auto">
        Un appel de 20 minutes suffit pour identifier exactement ce que votre cabinet peut récupérer.
      </p>

      {/* CTA */}
      <a
        href={urlWithPrefill}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white text-navy px-8 py-4 rounded-full font-extrabold text-lg hover:bg-slate-50 focus:ring-2 focus:ring-white/40 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform cursor-pointer"
      >
        Réserver mon appel de 20 minutes
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </a>

      {/* Checklist */}
      <ul className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
        {CHECKLIST.map((item) => (
          <li key={item} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
