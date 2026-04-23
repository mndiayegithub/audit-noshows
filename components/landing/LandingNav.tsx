"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40 h-[72px] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75",
        "transition-shadow duration-200",
        scrolled ? "shadow-sm border-b border-gray-200" : "border-b border-transparent",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primaryDark text-white"
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight text-slate-900">GetLostRevenue</span>
        </Link>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <li><a href="#comment-ca-marche" className="hover:text-slate-900">Comment ça marche</a></li>
          <li><a href="#pour-qui" className="hover:text-slate-900">Pour qui ?</a></li>
          <li><a href="#faq" className="hover:text-slate-900">FAQ</a></li>
        </ul>

        {/* CTA */}
        <Link
          href="/audit"
          className="inline-flex items-center rounded-xl bg-primaryDark px-4 py-2 text-sm font-medium text-white transition-shadow hover:shadow-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryDark focus-visible:ring-offset-2"
        >
          Lancer mon audit
        </Link>
      </nav>
    </header>
  );
}
