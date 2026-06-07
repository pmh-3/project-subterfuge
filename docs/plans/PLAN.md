# Project Subterfuge — Master Plan

> Orchestration document. Each phase has a dedicated plan file in this folder that a specialist agent should pick up and execute. The orchestrator owns sequencing, gates, and review handoffs — implementation lives entirely in the sub-plans.

---

## Locked Decisions (pre-flight)

| # | Decision |
|---|---|
| 1 | Aesthetic spec: `docs/plans/DESIGN_SYSTEM.md`. Reference: `docs/plans/assets/midnight-wire-reference.jsx`. |
| 2 | **Phase order flipped:** design system first, then screen migration. Avoids restyling twice. |
| 3 | Briefing is a **bottom-tab inside the game**, not a modal. |
| 4 | Avatars: keep existing **SVG set**, recolor for light background. |
| 5 | Continuous mode = **Infinite (respawn / score-attack)**. Internal flag `mode: 'INFINITE'`. |
| 6 | Recovery-key reveal: **host-only** on happy path; non-host join skips it. |
| 7 | Mission Control consolidates pre-start config into a single screen; Admin tab is mid-game only. |
| 8 | Domain: `midnightwire.app` (Phase 3 sweep). |
| 9 | Espionage terminology stays; only visuals + flow change. |
| 10 | Path alias `@/` → `client/src/`. |

---

## Phases (sequenced)

| # | Phase | Plan file | Depends on |
|---|---|---|---|
| 0 | Housekeeping (1h) | `00-housekeeping.md` | — |
| 1 | Design System Build | `01-design-system.md` | Phase 0 |
| 2 | Screen Migration | `02-screen-migration.md` | Phase 1 |
| 3 | UX Bug Fixes & Happy-Path Simplification | `03-ux-bug-fixes.md` | Phase 2 |
| 4 | Infinite Game Mode | `04-continuous-game-mode.md` | Phase 3 |
| 5 | Agent-Friendly Codebase | `05-codebase-agent-friendliness.md` | Phase 4 |

All sequential. Phase 2 cannot start until Phase 1's gallery is green on web (and iOS sim if available).

---

## Orchestration Rules

1. **The orchestrator does not write code.** Each phase dispatches to a specialist agent with its plan file as the brief.
2. **Each phase ends with a written handoff** appended to the bottom of its plan file: what shipped, what changed in repo structure, screenshots, any deviations.
3. **No phase merges without:**
   - `npm run verify` (lint + typecheck + test) green in `client/`.
   - Screenshots of any user-visible change on **web AND iOS sim** (if iOS sim unavailable, web-only is acceptable with a flag).
   - Relevant `.cursor/rules/*.mdc` updated if conventions changed.
4. **Backlog updates.** When a phase closes a `docs/BACKLOG.md` item, check it off in the same commit.
5. **No Cursor branding** in commits, PRs, or external-facing output (per user rule).

---

## Cross-Cutting Tripwires Agents Should Know

These are things that have already bitten this codebase or are about to. Each plan repeats the relevant subset, but they're listed here so the orchestrator can spot them during review.

- **Race conditions in game writes.** `writeBatch` instead of `runTransaction` caused `BUG-1`. Any new write path in Phase 4 must use `runTransaction`.
- **Stale reads outside transactions** (BUG-4, BUG-5). Reads belong inside the same transaction as their writes.
- **`game.playerIds[]` drift.** Don't trust the array; query the subcollection.
- **No server-side auth enforcement.** Host-only operations are UI-gated only. Don't pretend otherwise; document for the user but don't fix in scope.
- **`as Game` / `as Player` casts** with no runtime validation. Phase 5 lands zod; until then, treat snapshot data as suspect.
- **React Native letter-spacing is px not em.** Calls out in `DESIGN_SYSTEM.md` §7.
- **Jest is node-env with RN mocked.** Component tests don't work until Phase 5 reconfigures.

---

## Open Questions Tracker

Each plan tracks its own open questions under `## Open Questions`. The orchestrator's job between phases is to chase these down with the user, not to guess.

All pre-flight questions are answered. Remaining items in each plan's `## Open Questions` section are non-blocking — the executing agent decides or defers.
