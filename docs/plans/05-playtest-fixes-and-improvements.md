# Plan 05 — Playtest Fixes & Improvements

> **SUPERSEDED.** The owner reviewed this and locked the decisions. The authoritative, implementation-ready
> packet now lives at **[`docs/plans/overhaul/`](overhaul/README.md)** — point implementing agents there.
> This file is kept only as the original options-and-recommendations analysis that fed those decisions.

> Status: **Proposed** (planning only — no code changed yet)
> Source: batch of bugs + improvements from owner playtesting, investigated by 5 parallel code audits.
> Companion decisions to be recorded as ADRs where marked.

This plan covers 14 items across 5 clusters. Each item lists **current behavior (with file:line evidence)**, the **fix**, and — where a real choice exists — **options with a recommendation**. Decision points that need the owner's call are collected in the **Decision Log** at the bottom.

---

## Master table

| # | Item | Cluster | Type | Severity | Effort | Decision? |
|---|------|---------|------|----------|--------|-----------|
| 1 | Swaps "decremented" on elimination / new contract | Swaps | Bug | High (perceived) | S | **D1** |
| 2 | Not clear swaps are per-game not per-target | Swaps/Copy | Copy | Med | XS | ties to D1 |
| 7 | Swap your **target** like a directive (limited) | Swaps | Feature | Med | M | **D2** |
| 3 | Awkward language; simplify; build glossary | Copy | Copy | High | M | **D3** |
| 5 | Leaderboard: kills-made vs times-eliminated | UI/UX | Usability | High | S | **D8** |
| 4 | Font sizes too small; promote key text | UI/UX | Usability | Med | S | D9 |
| 8 | Remove game code from active screen | UI/UX | Cleanup | Low | XS | no |
| 9 | Flow simplification for fast onboarding | UI/UX | Cleanup | Med | M | no |
| 6 | Restore host config page; default Infinite+Easy | Config | Usability | High | S–M | **D4** |
| 13 | Edit game settings mid-game | Admin | Feature | Med | S | **D6** |
| 14 | Full host control: disputes, confirm-on-behalf | Admin | Feature | High | M | **D7** |
| 10 | Infinite: one player "targeted" repeatedly | Infinite | Bug/UX | High | — | part of D5 |
| 11 | Infinite: target swapped without warning | Infinite | Bug | **High** | L | **D5** |
| 12 | Infinite: rethink target+directive inheritance | Infinite | Design | High | M | part of D5 |

Effort key: XS < S < M < L.

---

## Recommended sequencing

**Phase 1 — Low-risk clarity & correctness wins** (mostly independent, ship first)
- #1 swap-semantics fix + #2 copy scope
- #8 remove game code from active screen
- #5 leaderboard kills vs deaths + #4 typography promotions
- #3 copy pass + `docs/GLOSSARY.md`

**Phase 2 — Host config & control**
- #6 restore config page + defaults (Infinite + Easy)
- #13 mid-game editable settings
- #14 pending-confirmations admin panel

**Phase 3 — Infinite-mode mechanics redesign** (highest risk; lock D5 first)
- #11 + #10 + #12 as one coherent change: in-place reinsert + respawn cooldown + fresh directive on kill

**Phase 4 — Target-swap feature** (#7) — builds on the Phase 3 chain helpers, do last.

Rationale: Phases 1–2 are safe, high-visibility, and unblock playtesting. Phase 3 changes core mechanics and needs the most design lock + simulation testing; #7 reuses its remove-and-reinsert primitive, so it follows.

---

## Cluster A — Swaps / rerolls

### #1 — "Swaps decremented when eliminated / on new contract" (the bug)

**Root cause (not a literal decrement).** `rerollsUsed` is written in only 3 places — `startGame` sets 0 (`gameService.ts:200`), mid-game `joinGame` sets 0 (`gameService.ts:156`), `scrambleTask` increments (`gameService.ts:557`). No elimination/inheritance/respawn path touches it. It is a **per-game accumulator that never resets when a player receives a brand-new target + directive** (classic assassin inheritance `gameLogic.ts:85-90`; infinite respawn `gameLogic.ts:217-225`). `ContractView.tsx:41` shows `maxRerolls − rerollsUsed`, so after a kill you see a *fresh contract but the same depleted count* → feels like "getting a new directive ate my swaps."

**D1 — options:**
- **(1a) Per-contract reset (recommended).** Add `rerollsUsed: 0` to the assassin update in `computeEliminationUpdates` (`gameLogic.ts:85-90`), the victim respawn update in `computeInstantInfiniteElimination` (`gameLogic.ts:217-225`), and the admin respawn write (`gameService.ts:455-463`). Swaps become "per contract" — matches player intuition. Side effect: a killer on a streak gets fresh swaps each kill (fine reward). Small test updates.
- **(1b) Keep per-game, fix copy only (see #2).** Zero logic risk; but doesn't satisfy the "new directive should be swappable" expectation.
- **(1c) Hybrid:** reset on infinite respawn only. Inconsistent across modes; harder to explain.

Recommendation: **1a** — the UI already frames swaps against the currently-shown directive, so per-contract is the honest semantics.

### #2 — Copy: swaps scope

Ground truth today = **per-game** (`maxRerolls` on game doc; `rerollsUsed` never resets). Only surfaced string is `dynamicStrings.objectiveSwapsLeft` = "N swaps left" (`strings.ts:232`, rendered `ContractView.tsx:83`) with no scope word. If we adopt **1a**, copy becomes "N swaps left for this target"; if **1b**, "N swaps left this game." Either way the scope word is the load-bearing fix. Also fix `CONFIGURE_OBJECTIVE_SWAPS_HINT`.

### #7 — Swap your target (feature)

Feasible. The chain-safe transform already exists: remove player P from the cycle (predecessor absorbs P's old target) and reinsert P at a new anchor — this is `pickChainInsertionAnchor` (`gameLogic.ts:110`) + `computeChainInsertionUpdates` (`gameLogic.ts:127`), with an added predecessor-rewire step. Needs ≥3 alive players to change anything. `validateAliveTargetChain` (`gameLogic.ts:287`) gates correctness.

**D2 — options:**
- **(7a) New `swapTargetChain` pure fn + `swapTarget` transactional service, shared reroll budget (recommended).** Minimal new surface, reuses insertion helpers, one "swaps" pool. Con: target-swap and directive-swap compete for the same budget; copy must cover both actions.
- **(7b) Separate budget** (`targetSwapsUsed` / `maxTargetSwaps`): schema + constant + UI additions; tune independently. Heaviest.
- **(7c) Infinite-only first:** trivial chain safety (reuses existing relocation); defer classic. Inconsistent across modes.

Recommendation: **7a**, escalate to 7b only if playtests show the two swap types need independent tuning. Sequence after Phase 3 (shares the reinsert primitive).

---

## Cluster B — Copy / terminology (#3, plus #2, #5 wording)

**Core problem:** one concept, many names. Worst offenders: the **to-do** has 6 names (Directive / Mission / Objective / Task / Contract / "Mission Objective"); **remove-a-player** has 5+ (Neutralize / Eliminate / Compromise / Kill / Terminate); **swap** has 5 (Swap / Reroll / Scramble / Shuffle / "objective change"); **game session** 4 (Operation / Op / Game / Protocol); **spy name** 4 (Callsign / name / cover / identity); **reconnect code** — user sees "Agent Key" but the error says "Recovery PIN" (`serviceErrors.INVALID_RECOVERY_PIN`).

Nearly all copy lives in `client/src/strings.ts`, so a terminology pass is centralized and cheap.

**D3 — direction:** *Simplify the chrome, keep a light spy skin.* Standardize on the words the briefing already teaches. Proposed canonical terms (retire the synonyms):

| Concept | Canonical | Retire |
|---|---|---|
| Player | **Agent** | player, operative, asset, assassin (UI) |
| Spy name | **Callsign** | name, cover, identity |
| Game session | **Game** | Operation, Op, Protocol |
| Room code | **Game Code** | OP CODE, Operation Code |
| The to-do | **Mission** | Directive, Objective, Task, Contract (as the to-do) |
| Trade the to-do | **Swap** ("Swap mission") | Reroll, Scramble, Shuffle |
| Remove a player | **Eliminate** (status) / **Catch** (field verb) | Neutralize, Compromise, Kill, Terminate |
| Reconnect code | **Agent Key** | Recovery PIN, Encryption Key |
| Host/house | **Host** | Bureau, Admin (as labels) |
| Results screen | **Leaderboard** | Situation Room, Command Center, Intel |
| How-to screen | **How to play** | Briefing, Info |
| Setup screen | **Game Settings** | Mission Control, Customize |
| Score mode | **Infinite** | Score attack, Continuous |
| Win threshold | **Score to win** | "Mission Success" (collides w/ Victory title) |

Deliverable: **`docs/GLOSSARY.md`** (voice guardrail + canonical table + banned-synonym grep list), linked from `AGENTS.md` and `README.md`; record the decision as **`docs/adr/0006-terminology-canon.md`**. Code identifiers (`killCount`, `rerollsUsed`, `callsign`) may keep their names — only user-facing strings must conform.

Alt direction: keep heavy theme everywhere (rename *toward* "Operation/Neutralize"). More churn, less first-timer clarity — not recommended.

---

## Cluster C — UI / UX

### #5 — Leaderboard kills vs deaths (**D8**)

Today each row shows only `killCount` as "N Elimination(s)" (`CommandCenterView.tsx:61-65`) — **ambiguous** (read as "times *I* was eliminated"). Data for both numbers already exists:
- **Kills made** = `killCount`.
- **Times eliminated** = INFINITE: `respawnCount` (increments each elimination, `gameLogic.ts:222`, `gameService.ts:459`); CLASSIC: `status === 'ELIMINATED' ? 1 : 0`.

No schema change needed. Show two labeled numbers, e.g. **"Eliminations made: 3 · Times eliminated: 1"** or a K/D pair `3 / 1` with a one-line legend. New strings (`INTEL_TIMES_ELIMINATED`, a `deathCount` dynamic). **D8** = pick the labels/format (recommend explicit "Eliminations made" vs "Times eliminated"; sort kills-desc, tiebreak fewer deaths).

### #4 — Typography (D9)

Scale in `typography.ts`. Problems: leaderboard score is `bodySmall` 14px **and muted** (`CommandCenterView.tsx:61-64`) — highest-value info, lowest weight; `labelMicro` renders **9px** on iOS/web (Android floors to 10); nav tabs + all section headers are 10px condensed typewriter; the directive is only 18px (`ContractView.tsx:69`). Two levers (do either/both):
- **Promote usages (low risk):** un-mute + enlarge the leaderboard score; bump directive to ~20-22px; enlarge the "THEIR CONTRACT" sub-line.
- **Bump tokens:** `labelMicro` 9→11/12, `label` 10→12. Removes all sub-10px text + the iOS/Android split.
- Also decide `allowFontScaling` (Dynamic Type) — several variants hard-code lineHeight and would clip if enabled.

### #8 — Remove game code from active screen

The active-play game code is `CommandCenterView.tsx:119-130` (`GameCodeTag` in the Leaderboard header, shown ACTIVE + COMPLETED). Lobby (`GameLobbyView.tsx:47`) and the Invite sheet (`InviteAgentsSheet.tsx:41`) keep theirs. The Situation tab already has an "INVITE AGENTS" button opening that sheet, so removing the header tag loses nothing. Fix: drop `trailing={<GameCodeTag/>}` from that header; remove now-unused `onCopyGameCode`/`gameId` plumbing at `[id].tsx:491` as cleanup.

### #9 — Flow simplification (prioritized)

- **High:** surface the core loop on first Contract view (today LOBBY→ACTIVE jumps straight to CONTRACT with no explanation, `[id].tsx:135-137`; the good briefing copy is buried in INFO). Add a one-time coach card. Plain-language subtitles under jargon buttons ("NEUTRALIZE TARGET" → hint "Mark that your mission on them succeeded").
- **Medium:** collapse the 3-names-for-one-screen inconsistency (tab "LEADERBOARD"/"LOBBY" vs header vs "Situation/Command Center"). Bump the compromised sub-line size.
- **Low:** friendlier lobby empty-state; confirm the removal of `HoldToConfirm` (destructive actions now fire on single tap — `ContractView.tsx:98-105`) is intentional; `bodyInput` uses thin sansLight 300.

---

## Cluster D — Host config & admin

### #6 — Restore config page; default Infinite + Easy (**D4**)

**Current flow:** Home → lobby identity → `createGame` (writes `status:'LOBBY'`, **no `mode`** ⇒ every game is CLASSIC, `gameService.ts:37-68`) → game-room lobby → Start → `startGame` shuffles immediately. `configure.tsx` **exists and works** (packs, mode, kill goal, difficulty, maxRerolls; saves at `:179-223`) but is only reachable via a "Customize Game" button in the Admin tab (`HostSettingsView.tsx:62-72`) — the default host never sees it. It is also the **only** place INFINITE is selectable. `status:'CONFIGURING'` is in the type/schema but never written (vestigial).

**D4 — options:**
- **(6A) Route host to `/game/configure` right after `createGame` (recommended).** One redirect change in `lobby.tsx:126`; reuse `configure.tsx` verbatim. Joiners unaffected.
- **(6B) Make `CONFIGURING` a real gate.** `createGame` writes `CONFIGURING`; `[id].tsx` shows config / redirects while configuring; retires the dead status; lets early joiners see "host is configuring." More surface (spectator/redirect branches in `[id].tsx:115-119` need a `CONFIGURING` sibling).
- **(6C) Inline config in the lobby view.** One screen, but bloats `GameLobbyView` and duplicates `configure.tsx`.

Recommendation: **6A now** + flip `configure.tsx` defaults to `gameMode='infinite'` (`:109`) and `difficulty='Easy'` (`:112`); also default `mode:'INFINITE'`+`infiniteConfig` in `createGame` so bypassing config still yields the intended default. Layer in **6B** later if you want early-joiner correctness and to retire `CONFIGURING`.

### #13 — Edit settings mid-game (**D6**)

Already editable: **kill goal** (`handleUpdateKillGoal` `[id].tsx:302-317`, safe — re-read each elimination). Safety:
- **Safe to expose:** kill goal (done), **maxRerolls** (cap-check only), **difficulty/packs** (affect *future* draws only — label "applies to new missions").
- **Unsafe:** **mode** switch (different code paths/fields ⇒ corruption) and **manual player-set edits** (breaks the chain). Route player changes only via `joinGame` / `adminForceEliminate`.

Recommendation: expose kill goal + maxRerolls + difficulty/packs in the Admin tab; block mode + manual roster edits.

### #14 — Full host control / dispute resolution (**D7**)

Today confirm/deny is **target-only** — `[id].tsx:382` gates on `me?.pendingEliminationBy`; handlers pass `user!.uid`. The host has no visibility/control over another player's pending confirmation. **But** `confirmElimination(gameId, targetId)` derives the assassin from the *target's own* `pendingEliminationBy` (`gameService.ts:380`) and checks no caller identity — **so it already works for any target.** `denyElimination(gameId, targetId)` likewise. `adminForceEliminate` re-links correctly but awards **no kill credit** (`incrementKillCount=false`), so it's a distinct "remove without credit" tool. All data for a pending-confirmations view is already in the `players` array from `useGame`.

**D7 — recommended plan:**
- **(a) Pending Confirmations panel** in the Admin tab: list every player with `pendingEliminationBy != null` as "challenger → target: mission," with host **Confirm** → `confirmElimination(id, targetId)` (ratify a real kill, awards credit) and **Deny** → `denyElimination(id, targetId)`.
- **(b)** Keep `adminForceEliminate` as the separate "remove, no credit" action — don't merge (the credit difference matters for score-attack).
- **(c)** Richer per-player state chips (ALIVE/PENDING/target/killCount/rerollsUsed) — all fields already exist.

No service or schema changes strictly required. Prefer this panel over a separate "notification center" (the pending list *is* the notification set). Handle the benign `NO_PENDING_ELIMINATION` race (target + host both act) gracefully. **Gap to note:** no server-side host auth — any client can call these (pre-existing). Optional hardening: Firestore rules host guard (ties to backlog DEBT-1).

---

## Cluster E — Infinite-mode mechanics (#10 / #11 / #12) — **D5**

These three are one problem. Structural facts: the chain is a **single directed cycle**; each kill rewrites exactly 3 pointers (assassin's, victim's, and **one bystander's**); **respawn is instant** — the ADR-0004 "60s cooldown" was never implemented (no `RESPAWNING`/`respawnAt` anywhere).

### #11 — Target swapped from under a bystander (root cause)
`computeChainInsertionUpdates` returns `anchorUpdate` (`gameLogic.ts:154-157`), applied at `gameService.ts:319-320`. The "anchor" is an innocent bystander whose outgoing target is silently rerouted to make room for the respawned victim. Same rewrite fires on mid-game join (`gameService.ts:161`) and admin-eliminate (`gameService.ts:465`). `ContractView` just renders the new pointer with **no notification** (`ContractView.tsx:69-70`). Structurally unavoidable *if* you reinsert the victim anywhere other than in front of their killer.

### #10 — "One player targeted repeatedly"
Anchor is chosen **uniformly** with no memory (`gameLogic.ts:123`), so at **N≥4 it's perception**, not per-player bias — amplified by instant respawn (re-killable in seconds) and inherited-target chain-killing (#12). **At N=2 it's a real bias:** the `excludeTargetId` filter empties the pool, so the fallback forces the victim to respawn facing their own killer (`gameLogic.ts:118`).

### #12 — Inheritance leak
On a kill the assassin inherits the victim's **target** (`gameLogic.ts:167-171,210-215`) *and* **directive** (`gameLogic.ts:198,230`). At N=2 the killer openly holds the victim's mission — a direct info leak in the exact mode where only 2 people play.

### D5 — options matrix (for "no target ever swapped out from under a player")

| Option | Idea | Chain | Bystander swap? | Effort |
|---|---|---|---|---|
| **(a) In-place reinsert** | Respawn victim into their own former slot: assassin still hunts victim; assassin does **not** inherit W. Only assassin + victim pointers touched. | single cycle preserved | **No** | Low |
| (b) Respawn cooldown | Victim `RESPAWNING` out of cycle, re-inserted after delay | preserved | Yes at re-insert unless combined w/ (a) | Med (net-new) |
| (c) Batch reshuffle when several out | Re-insert downed players together periodically | preserved | Yes, en masse | Med-High |
| (d) Timed global reshuffle | Countdown rebuilds whole chain; eliminated rejoin | trivially valid | Everyone (but announced/expected) | Med |
| (e) Shared targets (drop cycle) | Multiple hunters per target; victim is a new leaf | **breaks** `validateAliveTargetChain` + linking | No, but high cost | High |

**Recommendation (composed design):** **(a) in-place reinsert + (b) short respawn cooldown + fresh directive on kill (#12).**
- (a) guarantees no bystander is ever swapped (fixes #11) and *simplifies* the invariant.
- (a) alone would make the victim immediately re-hunted by the same killer (reintroduces #10's feel) — the **cooldown (b)** breaks that repeat-kill loop, and gives the designed "dose of frustration."
- **Fresh directive unconditionally** (drop `gameLogic.ts:230` inheritance → `tasks[rng]`) removes the N=2 leak with **zero** chain-integrity risk. Drop **target** inheritance only *within* (a) (assassin keeps hunting the in-place victim) — a fully-random assassin target would break the cycle and drag in (e)'s cost.
- `isGameOver` / kill-goal win condition unchanged.

**(d)** is the clean alternative if you want round-based play (bigger UX change). **Avoid (c) and (e).**

Record as **`docs/adr/0007-infinite-mode-target-stability.md`** (supersedes/annexes ADR-0004). Test via the existing simulation harness (`gameLogic.infinite.simulation.test.ts`) with new invariants: "no bystander targetId changes on a kill" and "assassin never inherits a directive."

---

## Testing & verification

- Pure-logic changes (#1, #5 compute, #7, #12, D5) → unit tests in `gameLogic.test.ts` / `gameLogic.infinite*.test.ts` **first** (TDD), extend the simulation harness with the new invariants above.
- Service changes (#6, #13, #14) → exercise transaction paths; watch the `NO_PENDING_ELIMINATION` race.
- Copy/UI (#2, #3, #4, #8, #9) → snapshot/smoke tests + `check-contrast`.
- Everything gates on `npm run verify` (lint + typecheck + contrast + jest) from `client/`.

---

## Decision Log (owner input needed)

| ID | Decision | Recommendation |
|----|----------|----------------|
| **D1** | Swap budget: per-contract reset vs per-game vs hybrid | Per-contract reset (1a) |
| **D2** | Target-swap: shared budget vs separate vs infinite-only | Shared budget (7a) |
| **D3** | Terminology: simplify chrome + glossary vs keep heavy theme | Simplify + `GLOSSARY.md` + ADR-0006 |
| **D4** | Config restore: redirect (6A) vs CONFIGURING gate (6B) vs inline (6C); defaults | 6A + Infinite/Easy defaults; 6B later |
| **D5** | Infinite redesign: (a)/(b)/(c)/(d)/(e) | (a) in-place + (b) cooldown + fresh directive |
| **D6** | Mid-game editable settings scope | kill goal + maxRerolls + difficulty/packs; not mode/roster |
| **D7** | Admin control: pending-confirmations panel vs notification center | Panel reusing confirm/deny + state chips |
| **D8** | Leaderboard labels/format | "Eliminations made" vs "Times eliminated" |
| **D9** | Typography: promote usages and/or bump tokens; allowFontScaling | Both promotions + `labelMicro`/`label` bump |
