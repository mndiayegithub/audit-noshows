"use client";

import { useEffect } from "react";
import { trackLandingView } from "@/lib/analytics";

/** Phase 9 — déclenche `landing_view` au mount de `app/page.tsx` (RSC). */
export default function LandingViewTracker() {
  useEffect(() => {
    const referrer =
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : undefined;
    trackLandingView(referrer);
  }, []);
  return null;
}
