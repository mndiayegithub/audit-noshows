"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  testimonial: string;
  author: string;
  role: string;
  result: string;
  avatarUrl: string;
}

interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: Testimonial;
  position: "front" | "middle" | "back";
}

export function TestimonialCard({ handleShuffle, testimonial, position }: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? 2 : position === "middle" ? 1 : 0,
      }}
      animate={{
        rotate: position === "front" ? "-5deg" : position === "middle" ? "0deg" : "5deg",
        x: position === "front" ? "0%" : position === "middle" ? "30%" : "60%",
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(e: any) => { dragRef.current = e.clientX; }}
      onDragEnd={(e: any) => {
        if (dragRef.current - e.clientX > 150) handleShuffle();
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 flex flex-col h-[420px] w-[320px] select-none rounded-3xl border border-white/[0.08] bg-[#0E0F1C]/80 p-7 shadow-2xl backdrop-blur-md gap-5 ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Avatar + author */}
      <div className="flex items-center gap-4">
        <img
          src={testimonial.avatarUrl}
          alt={`Avatar de ${testimonial.author}`}
          className="pointer-events-none h-14 w-14 rounded-full border-2 border-primary/30 object-cover shrink-0"
        />
        <div>
          <p className="font-heading font-bold text-white text-sm leading-tight">{testimonial.author}</p>
          <p className="text-white/40 text-xs mt-0.5">{testimonial.role}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-warning fill-warning" aria-hidden="true" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-white/70 text-[15px] leading-relaxed italic flex-1">
        &ldquo;{testimonial.testimonial}&rdquo;
      </p>

      {/* Result badge */}
      <div className="mt-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary-light text-xs font-bold">
          → {testimonial.result}
        </span>
      </div>

      {/* Drag hint on front card */}
      {isFront && (
        <p className="text-white/20 text-[10px] text-center -mb-1 font-medium tracking-wide">
          ← Glissez pour voir le suivant
        </p>
      )}
    </motion.div>
  );
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    testimonial: "Après l'audit, nous avons pris conscience du manque à gagner réel. On ne savait même pas qu'on perdait autant. Maintenant on agit avec des données précises.",
    author: "Dr. Martin",
    role: "Cabinet dentaire · Lyon",
    result: "37 000€ récupérés",
    avatarUrl: "https://i.pravatar.cc/128?img=11",
  },
  {
    id: 2,
    testimonial: "En 60 secondes je voyais mon chiffre exact. Personne ne m'avait jamais montré ça aussi clairement. C'est devenu un outil de pilotage indispensable.",
    author: "Dr. Leroy",
    role: "Chirurgien-dentiste · Amiens",
    result: "Chiffre exact révélé",
    avatarUrl: "https://i.pravatar.cc/128?img=33",
  },
  {
    id: 3,
    testimonial: "La liste d'attente a rempli 3 créneaux le premier lundi. L'audit a identifié exactement les heures à risque — on a pu réagir immédiatement.",
    author: "Dr. Dupont",
    role: "Cabinet dentaire · Paris 15ème",
    result: "3 créneaux remplis dès J+1",
    avatarUrl: "https://i.pravatar.cc/128?img=47",
  },
];

export function ShuffleTestimonials() {
  const [positions, setPositions] = React.useState<Array<"front" | "middle" | "back">>(
    ["front", "middle", "back"]
  );

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev] as Array<"front" | "middle" | "back">;
      next.unshift(next.pop()!);
      return next;
    });
  };

  return (
    <div className="flex justify-center items-center py-8">
      {/* Container wide enough to include the stacked back cards (320 + ~60% offset) */}
      <div className="relative h-[420px] w-[520px]">
        {TESTIMONIALS.map((t, index) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            handleShuffle={handleShuffle}
            position={positions[index]}
          />
        ))}
      </div>
    </div>
  );
}
