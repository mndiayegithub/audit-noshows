import type { ReactNode } from "react";

/**
 * Nested segment layout for the /audit subtree.
 *
 * Forces light-mode scope locally so the dashboard refonte (Phase 02)
 * renders with the clinique-claire DA regardless of any ancestor theme.
 * Kept as a Server Component — no "use client" on purpose.
 *
 * `text-ink` is not defined in tailwind.config.ts, falling back to
 * `text-slate-900` per PLAN 02-01 instructions.
 */
export default function AuditLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 antialiased">
      {children}
    </div>
  );
}
