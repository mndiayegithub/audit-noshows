"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  imageUrl?: string;
  imageAlt?: string;
  label?: string;
  title?: string;
  subtitle?: string;
}

export function FaqSection({
  faqs,
  imageUrl = "https://images.unsplash.com/photo-1629909615957-f3d4ac95d39c?q=80&w=830&h=844&auto=format&fit=crop",
  imageAlt = "Cabinet dentaire moderne",
  label = "FAQ",
  title = "Questions fréquentes",
  subtitle = "Tout ce que vous devez savoir sur l'audit PerfIAmatic.",
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-center gap-10 md:gap-16 px-4 md:px-0">

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full md:max-w-[340px] shrink-0"
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-[420px] md:h-[520px] rounded-3xl object-cover shadow-xl"
        />
      </motion.div>

      {/* Accordion */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 w-full"
      >
        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">{label}</p>
        <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">{subtitle}</p>

        <div>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-slate-100 py-4 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">
                  {faq.q}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ease-in-out ${
                    openIndex === index ? "rotate-180 text-primary" : ""
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`text-sm text-slate-500 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden max-w-lg ${
                  openIndex === index
                    ? "opacity-100 max-h-[200px] pt-3"
                    : "opacity-0 max-h-0"
                }`}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
