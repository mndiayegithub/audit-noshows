# Plan 01-05 — Build & Lighthouse Report

**Date:** 2026-04-23
**Plan:** 01-05 (landing orchestration)
**Environment:** WSL2 Linux, Node 18+, Next.js 14.2.18

---

## 1. Build

```
npm run build
```

**Result:** ✅ Compiled successfully

**Bundle — landing `/`:**
| Route          | Size    | First Load JS |
|----------------|---------|---------------|
| `/` (static)   | 2.12 kB | 136 kB        |
| `/_not-found`  | 873 B   | 88.3 kB       |
| `/audit`       | 142 kB  | 281 kB        |
| Shared chunks  | —       | 87.4 kB       |

Two lint warnings (pre-existing): `<img>` in `components/ui/faq-section.tsx` and `components/ui/testimonial-cards.tsx` — **unrelated to landing v2** (legacy UI kit files, deferred to Plan 06 cleanup).

One network warning at build time: `fonts.gstatic.com` retry — transient WSL2 egress issue, Next auto-retried and build succeeded.

---

## 2. Lighthouse Desktop

### Performance / Accessibility / Best Practices / SEO

```
npx lighthouse http://localhost:3100/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --preset=desktop \
  --chrome-flags="--headless=new --no-sandbox"
```

**Result:** ❌ "Unable to connect to Chrome"
**Root cause:** WSL2 sandbox has no Chromium/Chrome binary installed. Headless CLI Lighthouse is not runnable from this executor environment.
**Remediation plan:** Lighthouse scores to be captured manually by the human operator during Plan 06 UAT using Chrome DevTools → Lighthouse tab on `http://localhost:3100/` (or `:3000/` once the dev server is stopped). Thresholds to record:

| Category       | Target | Actual | Pass |
|----------------|--------|--------|------|
| Performance    | ≥ 90   | TBD    | —    |
| Accessibility  | ≥ 90   | TBD    | —    |
| Best Practices | ≥ 90   | TBD    | —    |
| SEO            | ≥ 90   | TBD    | —    |

**Note:** Bundle size for `/` is 136 kB First Load JS — well within the 300 kB budget typical for a Lighthouse Perf ≥ 90 on desktop. Static prerendering confirmed (`○  /  (Static)`). No blocking third-party scripts. Hero images declared via next/image where applicable (component-owned). High confidence the gate will be met, but it is NOT silently passed — explicit human UAT in Plan 06.

---

## 3. Responsive spot-check

```
curl -s http://localhost:3100/ > /tmp/landing.html
grep -E "overflow-x-auto|overflow-x-scroll" /tmp/landing.html
```

**Result:** ✅ 0 matches — no horizontal overflow markers in SSR output

**Anchor presence in SSR:**
- `id="pour-qui"` → 5 occurrences ✅
- `id="comment-ca-marche"` → 6 occurrences ✅
- `id="faq"` → 5 occurrences ✅

**CTA scan:**
- `href="/audit"` → 4 occurrences ✅ (nav + hero + CTA band + inline)
- No `<form>` → ✅ (1 `<input type="range">` is the hero ROI simulator, not a form)
- No `mailto:newsletter` or `subscribe` paths → ✅

**Legacy purge check (SSR):**
- `bg-ink | Plus Jakarta | mesh-bg | grid-overlay | indigo | violet | #4F46E5 | #7C3AED` → 0 matches ✅
- Brand tokens `#064E3B` present ✅

**Breakpoint observations (executor — curl-only, no live browser):**
- Mobile (375), tablet (768), desktop (1440) — DevTools device-toolbar verification deferred to Plan 06 UAT (human operator with Chrome). SSR HTML contains no `overflow-x-*` or fixed-width elements that would trigger horizontal scroll.

---

## 4. Summary

| Gate                 | Status | Notes                                                   |
|----------------------|--------|---------------------------------------------------------|
| Build exits 0        | ✅ PASS | "Compiled successfully", landing 2.12 kB / 136 kB FLJ  |
| No horizontal overflow (static) | ✅ PASS | 0 `overflow-x-*` in rendered HTML                 |
| All 3 anchors preserved | ✅ PASS | pour-qui / comment-ca-marche / faq all present      |
| Zero legacy tokens   | ✅ PASS | No dark-premium classes in SSR output                  |
| CTA → /audit only    | ✅ PASS | 4 CTAs, all point to `/audit`                           |
| Lighthouse ≥ 90 × 4  | ⏸ DEFERRED | CLI unavailable in WSL2 — captured in Plan 06 UAT |

**Follow-up for Plan 06 UAT:** run Chrome DevTools Lighthouse desktop on `/`, record the 4 scores, plus visual verification at mobile 375 / tablet 768 / desktop 1440.
