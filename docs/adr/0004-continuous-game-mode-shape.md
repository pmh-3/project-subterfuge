# ADR 0004: Continuous Game Mode Shape

## Context

Classic Subterfuge ends when one player remains. Playtest feedback called for longer sessions and score-based competition without ending the social loop.

## Decision

Add a second game mode **`INFINITE`** (UI label: "Infinite ∞"):

- **Shape:** Respawn / score-attack — eliminated players re-enter after a cooldown with a new target; winner by kill goal (timer end condition reserved in schema, not MVP).
- **Data:** `game.mode: 'CLASSIC' | 'INFINITE'`; absence of field = classic for back-compat.
- **Player fields (planned):** `respawnAt`, `respawnCount`; extended status includes `RESPAWNING`.
- **Logic:** New pure functions in `gameLogic.ts` (`computeRespawnUpdates`, `isGameOver`, etc.) branched from `gameService.ts`.

**Status:** Decision locked in master plan (`docs/plans/PLAN.md`); implementation tracked in Phase 4 plan. Mission Control shows the mode chip disabled until shipped.

## Consequences

- **Positive:** Clear extension point without breaking existing games; classic path stays default.
- **Negative:** Significant new surface area (Contract cooldown UI, leaderboard sort, host mid-game config); must use transactions throughout.
- **Regression:** Classic games without `mode` must behave identically to pre-Phase-4 behavior.
