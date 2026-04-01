---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (or build check via `next build`) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx next build 2>&1 | tail -5` |
| **Full suite command** | `npx next build && npx next start &; sleep 3; curl -s http://localhost:3000/login | grep -q "RankUp"` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build 2>&1 | tail -5`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01..04 | integration | `curl -s -X POST http://localhost:3000/api/auth/login -d '{"email":"rep@rankup.app","password":"demo1234"}' -H 'Content-Type: application/json'` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | DSGN-01..06 | build | `npx next build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — Next.js, Drizzle, Tailwind, iron-session dependencies installed
- [ ] `next.config.ts` — valid Next.js config
- [ ] `tsconfig.json` — TypeScript configuration

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark theme visual correctness | DSGN-01 | Visual check | Open /board, verify #0A0E17 background, cyan accents |
| Responsive layout | DSGN-06 | Visual check | Resize browser to tablet (768px), verify no sidebar, stacked layout |
| All 24 assets render | DSGN-05 | Visual check | Check favicon, logo, icons in rendered pages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
