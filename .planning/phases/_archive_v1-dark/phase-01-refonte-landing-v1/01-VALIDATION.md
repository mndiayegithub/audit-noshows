---
phase: 1
slug: refonte-landing-v2
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none currently — visual/UX phase, no unit test infra required |
| **Config file** | none (eslint + tsc only) |
| **Quick run command** | `npm run lint && npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~40s build / ~10s lint+typecheck |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** `npm run build` must succeed; Lighthouse ≥ 85 desktop on `/`
- **Max feedback latency:** 40 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| To be filled by planner from REQ-1.1 → REQ-1.14 | — | — | REQ-1.x | — | N/A (static landing, no secrets) | build/typecheck/visual | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `next-themes` dependency added to `package.json` — prerequisite for all theming tasks
- [ ] `tailwind.config.ts` updated with `darkMode: 'class'` — prerequisite for dark/light CSS variable overrides
- [ ] `app/globals.css` theme tokens declared under `:root` + `.light` — prerequisite for all section components
- [ ] `app/layout.tsx` wrapped with `<ThemeProvider>` and `suppressHydrationWarning` added — prerequisite to avoid flash
- [ ] `app/audit/layout.tsx` created with `forcedTheme="light"` — prerequisite to protect audit page

*No unit test framework currently installed. Phase delivers static UI — verification is build success, type-safety, visual matching, and Lighthouse score.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Toggle dark/light persists after reload | REQ-1.2 | DOM + localStorage + SSR interaction not unit-testable here | Open `/`, click toggle, reload, verify theme preserved |
| No flash-of-incorrect-theme on initial load | REQ-1.2 | Requires real browser render timing | Hard reload `/` with network throttled, verify no white flash in dark mode |
| `/audit` unaffected by landing theme toggle | REQ-1.12 | Route-level scoping requires navigation | Toggle to dark on `/`, navigate to `/audit`, verify page remains light |
| Marquee pause-on-hover works | REQ-1.5 | Framer Motion animation state change needs real pointer | Hover logos, verify animation pauses; leave, verify resumes |
| Lighthouse ≥ 85 desktop | REQ-1.11 | Performance measurement requires running Lighthouse | `lhci autorun` or Chrome DevTools Lighthouse on `/` |
| Responsive at 375 / 768 / 1440 | REQ-1.10 | Visual verification | DevTools device mode, verify each breakpoint matches sketches 005D/006A/007B/008C |
| Copy matches voice validated | REQ-1.13 | Editorial judgment | Read-through against sketch-findings skill |

---

## Validation Sign-Off

- [ ] All tasks have automated verify (build/lint/typecheck) or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all dependency installations + theming foundation
- [ ] Manual verifications documented for all visual/interactive behaviors
- [ ] Feedback latency < 40s (build) / <10s (lint+typecheck)
- [ ] `nyquist_compliant: true` set in frontmatter after planner assigns tasks

**Approval:** pending
