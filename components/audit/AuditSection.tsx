import type { ReactNode } from "react";

interface AuditSectionProps {
  id: string;
  eyebrow: string;
  /** Tailwind text-* class, e.g. "text-kpiVolume-fg" */
  eyebrowColor?: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

/**
 * Wrapper for a single dashboard section: eyebrow + Fraunces H2 + optional lede.
 * Attaches `data-audit-section` and `id` for scrollspy + smooth-scroll anchor.
 */
export default function AuditSection({
  id,
  eyebrow,
  eyebrowColor = "text-gray-500",
  title,
  lede,
  children,
}: AuditSectionProps) {
  return (
    <section
      id={id}
      data-audit-section
      className="scroll-mt-6 py-10 md:py-16"
    >
      <div
        className={`mb-2 text-xs font-medium uppercase tracking-wide ${eyebrowColor}`}
      >
        {eyebrow}
      </div>
      <h2 className="mb-2 font-fraunces text-2xl md:text-3xl text-slate-900">
        {title}
      </h2>
      {lede && (
        <p className="mb-6 text-[15px] text-gray-600 max-w-2xl">{lede}</p>
      )}
      {children}
    </section>
  );
}
