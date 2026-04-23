"use client";
import { useEffect, useState } from "react";

/**
 * Tracks which section ID occupies the viewport center via IntersectionObserver.
 *
 * `rootMargin: "-40% 0px -40% 0px"` keeps the observer window focused on the
 * central 20% of the viewport so transitions between sections are predictable
 * regardless of section height.
 *
 * Returns `null` when no section ID is observable (SSR, empty list, or
 * mid-transition where no section intersects the center band).
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // pick the one closest to top of viewport
          visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  return active;
}
