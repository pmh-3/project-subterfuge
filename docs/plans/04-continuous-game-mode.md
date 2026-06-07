# Phase 4 — Continuous Game Mode

**Owner:** Gameplay agent
**Depends on:** Phase 3 (clean UX baseline)

## Goal

Add a second game mode that runs **continuously** — players are not permanently removed on elimination. This complements (does not replace) the existing single-elimination mode. Mode is chosen at game creation and is immutable for the life of the game.

## Mode Locked: Infinite (Respawn)

**Decision locked** (matches Mission Control mockup label `Infinite ∞` / "Score attack"):

- Internal flag: `game.mode === 'INFINITE'` (alongside `'CLASSIC'`).
- UI label: **Infinite**.
- Mechanic: eliminated player goes into a short cooldown, then re-inserts into the target chain at a random position with a new target and task. Game ends when a player hits the kill goal. Winner = first to hit kill goal (or, if host ends early, most kills).
- Cooldown is intentionally kept (small dose of frustration is part of the game) but kept **short**. Default 60 seconds.
- **No block on re-targeting recent kills.** If the chain reassigns you to someone you just killed, fine — that's part of the chaos at higher player counts.

### Configurability

| Field | Default | UI | Min / Max |
|---|---|---|---|
| `infiniteConfig.killGoal` | 5 | Pill segments in Mission Control: `3 / 5 / 10 / 20` + custom input | 1 / 99 |
| `infiniteConfig.respawnCooldownMs` | 60_000 | Pill segments: `Off / 30s / 1m / 3m` | 0 / 600_000 |
| `infiniteConfig.endsAt` | not used in MVP | — | — |

Timer-based end condition is **not** in MVP — kill goal only. Add `endCondition.type` schema field anyway so timer can land later without a migration.

### Player-count Targets

Design for **4 to 40 players**. Specific implications:

- Avatar grid in `AgentRow` lists must scroll cleanly at 40.
- Target chain shuffle must produce non-trivially-random chains at 4 players (don't accidentally hand player A → player B → player A loops at low counts; existing `gameLogic.ts` shuffle should already handle this — verify with a test at N=4).
- "Respawning" list section will frequently have 5–10 entries at 40-player games; budget vertical space.
- Firestore reads: 40-player `onSnapshot` per game is fine, but the leaderboard composite index added below becomes load-bearing — confirm it's actually used.

---

## Data Model Changes

`Game` document gets:
- `mode: 'CLASSIC' | 'INFINITE'` (new field; absence = `CLASSIC` for back-compat).
- `infiniteConfig?: { respawnCooldownMs: number; endCondition: { type: 'KILL_GOAL'; value: number } }` — schema leaves room for `type: 'TIMER'` later without migration.
- `endsAt?: Timestamp` — reserved for future timer mode; not written in MVP.

`Player` document gets:
- `killCount: number` (already exists per `BACKLOG.md`? verify — if not, add).
- `respawnAt?: Timestamp` (when set and in the future, player is in cooldown).
- `respawnCount: number`.
- `status` enum extended: `ALIVE | RESPAWNING | ELIMINATED` (`ELIMINATED` only used when the game ends).

## Logic Changes

All new logic goes into `client/src/features/game/gameLogic.ts` as **pure functions** (per existing convention), unit-tested before any Firestore wiring.

New pure functions:
- `computeRespawnUpdates(eliminatedPlayer, allPlayers, config, now): { eliminatedUpdate, chainRelinkUpdates, newTargetForEliminatedOnRespawn }`
- `pickRespawnInsertionPoint(alivePlayers, rngSeed): playerId` — where in the chain to splice the respawned player.
- `isGameOver(game, players, now): { over: boolean; winnerId?: string; reason?: 'TIMER' | 'KILL_GOAL' }`

`gameService.ts` changes:
- `createGame(...)` accepts `mode` + `infiniteConfig`.
- `confirmElimination(...)` branches on `game.mode`: CLASSIC keeps the current behavior, INFINITE calls the new respawn-update computer.
- New `processRespawns(gameId)` function intended to be called on snapshot (client-driven for MVP; flagged for migration to Cloud Function — see DEBT-1 / FEAT-4). Scans for players whose `respawnAt` has elapsed and transitions them back to ALIVE with a fresh target+task.
- New `endInfiniteGame(gameId)` for timer/kill-goal completion.

**Concurrency note:** every write path here must use `runTransaction`, not `writeBatch`. This is the same class of bug as BUG-1 in `BACKLOG.md` — don't repeat it in new code.

## UI Changes

New / changed surfaces:
- **Mission Control screen** — the `Infinite ∞` segment that Phase 2 left disabled is now enabled. Selecting it reveals the `infiniteConfig` fields (cooldown, end condition) inline. Default values pre-selected per "happy path."
- **Contract view** — adds a "Respawning in 4:32" countdown card when the local player is in cooldown. The Contract is hidden during cooldown.
- **Situation Room** — leaderboard sort changes for INFINITE: by kill count, not survival. Add a "Respawning" section under "Active Agents."
- **Admin tab** — host can adjust end conditions mid-game (extend timer, change kill goal). Show current standings.
- **Game-over screen** — copy variant for INFINITE: "Operation concluded" with leaderboard, instead of "Last agent standing."

All UI uses Phase 2 design-system primitives. No new tokens should be needed.

## Testing

- Unit tests for every new pure function in `gameLogic.ts`. Cover: 2-player respawn, eliminating the player about to respawn, simultaneous eliminations, timer expiry mid-elimination.
- Integration smoke test (React Testing Library) on the configure screen — selecting CONTINUOUS reveals the config fields and persists the choice.
- Manual playtest checklist appended to handoff note.

## Firestore Rules & Indexes

- `firestore.rules` — players can read `respawnAt` on other players (needed for the Respawning list); cannot write to it (only via `processRespawns` / `confirmElimination`).
- `firestore.indexes.json` — add a composite index for `games/{gameId}/players` ordered by `killCount desc, callsign asc` for the leaderboard.

## Deliverables

- `mode` field shipped, defaults preserve classic behavior for existing games.
- All three new pure functions with full unit-test coverage.
- All UI surfaces updated.
- Rules + indexes updated and deployed.
- Manual playtest report (≥ 3 players, ≥ 15 minutes) appended to handoff.

## Success Criteria

- A classic-mode game played end-to-end is byte-for-byte identical to pre-Phase-4 behavior (regression check).
- A continuous-mode game runs for the configured duration with no chain breaks and correctly identifies the winner.
- No new `as Game` / `as Player` casts without surrounding runtime validation (lean on whatever Phase 5 introduces, or add inline guards).

## Open Questions

- Should there be a "spectator queue" view for players currently in cooldown so they can watch others? (Defer to post-MVP unless trivial.)
- Does host-mid-game-config-change need a player-side notification? (Defer — host can announce verbally.)
