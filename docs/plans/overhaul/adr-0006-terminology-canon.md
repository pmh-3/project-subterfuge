# ADR 0006: Terminology Canon (Midnight Wire)

- **Status:** Accepted (pending implementation)
- **Date:** 2026-08-31
- **Deciders:** Product owner (overhaul packet, `docs/plans/overhaul/00-decisions.md` D3)

> On implementation, move this file to `docs/adr/0006-terminology-canon.md` and link it from
> `AGENTS.md` (Architecture decisions → `docs/adr/`) and `README.md` (docs list), alongside a
> pointer to `docs/GLOSSARY.md`.

## Context

Midnight Wire's UI copy accreted synonyms across its phases. A single concept routinely had three
or four surface words: a game session was **Operation / Op / Protocol**; the room code was
**OP CODE / Operation Code / Game Code**; the to-do was **Directive / Objective / Task / Contract**;
trading it was **Reroll / Scramble / Shuffle**; removing a player was
**Neutralize / Compromise / Terminate / Kill**; the reconnect code was **Recovery PIN / Agent Key**;
the results screen was **Situation Room / Command Center / Intel / Leaderboard**. All of this lived,
correctly, in one file (`client/src/strings.ts`), which made the inconsistency easy to see and easy
to fix.

The synonym sprawl also produced concrete defects: the win-threshold label "MISSION SUCCESS"
collided with the Victory-overlay title "MISSION SUCCESS", and melodramatic labels ("ADMIT DEFEAT",
"NEUTRALIZE TARGET") obscured what a tap actually did.

## Decision

Adopt a **single canonical word per concept** and retire the synonyms from all user-facing copy
(D3: *simplify the chrome, keep a light spy skin*). Specifically:

- Publish a living glossary at **`docs/GLOSSARY.md`** — canonical terms, banned-synonym grep list,
  and a voice guardrail ("plain word first, spy flavor second").
- Publish the exact old→new rename map, keyed to real `strings.ts` keys, in
  **`docs/plans/overhaul/02-terminology.md`**.
- Canon highlights: **Agent, Callsign, Game, Game Code, Mission, Swap, Eliminate/Catch, Agent Key,
  Host, Leaderboard, How to play, Game Settings, Infinite, Classic, Score to win, Spectator.**
- **User-facing strings only.** Code identifiers and Firestore field names (`killCount`,
  `rerollsUsed`, `callsign`, `taskDescription`, `emergencyPin`, `scrambleTask`, …) may keep their
  names; optional identifier renames are non-blocking cleanup.
- Keep the light spy skin: atmosphere strings ("TOP SECRET", status crawls) stay; only load-bearing
  labels are canonicalized.

## Consequences

- **Positive:** One vocabulary for players, copywriters, and agents. Fixes the "MISSION SUCCESS"
  collision and the swaps-are-per-game copy ambiguity (D1/Bug #2). Plain labels ("CATCH TARGET",
  "CONFIRM: I WAS CAUGHT") are clearer and more accessible. A grep-able banned list makes drift
  catchable in review.
- **Negative / cost:** A broad but mechanical edit across `strings.ts` (branding, dynamic strings,
  service errors, briefing copy). Key names temporarily diverge from their canonical values (e.g.
  `INTEL_HEADER_TITLE` = "LEADERBOARD"); the divergence is documented and the optional key renames
  are deferred so copy and logic changes never mix in one PR.
- **Neutral:** Enforcement is convention + review (grep list), not a lint rule yet. A future lint
  tripwire over `strings.ts` values could harden it, mirroring the design-system inline-hex tripwire
  in ADR 0003.
