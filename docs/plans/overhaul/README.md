# Subterfuge Overhaul — Implementation Packet

> **Point your implementing agent at this directory.** Read this README first, then execute in the build order
> below. Everything needed to implement the overhaul flawlessly is in this folder. No code has been written yet —
> these are specs.

## What this is
A batch of playtest bugs + improvements, investigated against the real code and turned into implementation-grade
specs. The headline change is a **redesign of infinite mode** to independent, lockable targets (Option E), which
also unlocks target-swaps and clean mid-game joins. Classic (single-elimination) mode is intentionally left
unchanged except for shared copy/UI and the pending-confirmation data-model migration.

## How to use this packet
1. Read `00-decisions.md` — the **canonical** product decisions. If any spec disagrees with it, that file wins.
2. Read `05-infinite-mode-independent-targets.md` — the core mechanics redesign that other specs depend on.
3. Implement in the **build order** below. Each spec is self-contained with current-state (file:line), exact
   changes, new strings, tests, and acceptance criteria.
4. Work **test-first** for all game logic. Gate every step on `npm run verify` (from `client/`).

## Terminology note (for reading these internal docs)
The words **directive / task / mission** all denote the same concept — the thing you engineer your target to do.
The **canonical user-facing term is "Mission"** (see `docs/GLOSSARY.md`); the code field stays `taskDescription`.
Internal specs sometimes say "directive" for historical reasons — treat it as "mission."

## Documents
| File | Covers | Items |
|------|--------|-------|
| `00-decisions.md` | Canonical locked decisions D1–D9 + engineering rules | all |
| `05-infinite-mode-independent-targets.md` | Infinite-mode redesign (Option E), data model, functions, tests | #10, #11, #12, enables #7, #6-join |
| `adr-0007-infinite-independent-targets.md` | ADR for the infinite redesign (→ `docs/adr/0007`) | D5 |
| `01-swaps.md` | Per-game swap budget + copy; target-swap feature | #1, #2, #7 |
| `02-terminology.md` | Old→new string rename map; awkward-copy cleanup; leaderboard wording | #3, #2, #5-copy |
| `docs/GLOSSARY.md` (repo root docs) | Living canonical glossary (deliverable, not just a spec) | #3 |
| `adr-0006-terminology-canon.md` | ADR for terminology canon (→ `docs/adr/0006`) | D3 |
| `03-ui-ux.md` | Typography, leaderboard kills/deaths, remove game code, coach card/flow | #4, #5, #8, #9 |
| `04-config-admin.md` | Config-before-create + defaults; mid-game settings/join; host pending-confirmations panel | #6, #13, #14 |

On implementation, move the ADRs to `docs/adr/` and link `docs/GLOSSARY.md` + the ADRs from `AGENTS.md`
("Where the source of truth lives") and `README.md`.

## Build order (recommended)
**Phase 1 — Foundational data + core mechanics (do first; everything else depends on it)**
- `05` §2 types/schema migration (`pendingEliminationBy`/`pendingTaskDescription` → `pendingEliminations[]`) + parse tests.
- `05` §3 pure functions + `05` §5/§6 unit + rebuilt simulation tests. **All green before wiring.**
- `05` §4 service changes behind the `isInfiniteMode` branch (classic untouched).

**Phase 2 — Low-risk clarity wins (parallelizable, independent)**
- `01` swap semantics + per-game copy + refresh icon.
- `03` remove game code from active screen; leaderboard kills/deaths; typography promotions + token bumps.
- `02` terminology rename pass + `docs/GLOSSARY.md` + ADR-0006 (land the string renames the other specs reference).

**Phase 3 — Host config & control**
- `04` config-before-create + Infinite/Easy defaults; mid-game editable settings; mid-game join wiring.
- `04` §D7 pending-confirmations panel (needs Phase 1's queue model).

**Phase 4 — Feature + polish**
- `01` §#7 target-swap UI (needs Phase 1's `swapTarget` + `pickIndependentTarget`).
- `03` coach card + tooltips/subtitles; flow cleanup.

Rationale: Phase 1 lands the data model + mechanics that #7, #14, and the compromised-screen UI all build on.
Phases 2 are safe and shippable independently. Do the mechanics redesign behind the mode branch so classic play
is never at risk.

## Decision summary (see `00-decisions.md` for detail)
- **D1** swaps per-game; only the Swap button charges; refresh icon.
- **D2** one shared budget → swap mission or target (infinite only).
- **D3** simplify + canonical glossary.
- **D4** configure before Create Game; defaults Infinite + Easy.
- **D5** infinite = independent lockable targets; **no cooldown**; shared-target confirmations **stack** (FIFO).
- **D6** mid-game editable: kill goal + maxRerolls + difficulty/packs; block mode + roster; mid-game join in infinite.
- **D7** host pending-confirmations panel (confirm/deny on behalf); keep force-remove separate.
- **D8** leaderboard: "Eliminations made" vs "Times eliminated" + icons.
- **D9** typography: promote usages + bump tokens; prioritize target + directive; coach card + tooltips.

## Verification
Every change gates on `npm run verify` (lint + typecheck + check-contrast + jest) from `client/`. Game-logic
changes are TDD (tests before implementation). Classic-mode regression (`gameLogic.classicRegression.test.ts`)
must stay green throughout.
