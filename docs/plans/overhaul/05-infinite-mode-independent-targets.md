# 05 — Infinite Mode: Independent, Lockable Targets (Option E)

> Implements **D5** (+ enables **D2** target-swap and **D6** mid-game join).
> Decision record: `adr-0007-infinite-independent-targets.md`.
> **Classic mode is unchanged** by this document. Everything here is scoped to `mode === 'INFINITE'`.

This is the highest-risk workstream. Build it **test-first** and land it behind the existing mode branch so
classic play is never affected.

---

## 1. The model

**Today (to be removed for infinite):** infinite mode reuses the classic **single directed cycle** (Hamiltonian
ring). Every kill re-links the ring, which forces **one innocent bystander's** target to move
(`gameLogic.ts:154-157` `anchorUpdate`, applied at `gameService.ts:319-320`) — the "target swapped without
warning" bug. Respawn re-inserts the victim at a random anchor.

**New (Option E):** infinite mode uses **independent target assignments**.
- Each ALIVE agent has exactly **one** target (`targetId`), which is a distinct, non-self ALIVE agent.
- **In-degree is unconstrained:** 0…N−1 agents may target the same person. **Shared targets are allowed.**
- There is **no cycle invariant.** The chain is a general functional graph (each node out-degree 1).
- A target is **locked**: it changes only when the owner swaps it, scores a kill, or the target leaves the game.

### Invariant (replaces the Hamiltonian check for infinite)
> For every agent P with `status === 'ALIVE'`: `P.targetId` is set, `P.targetId !== P.uid`, and the referenced
> agent exists and has `status === 'ALIVE'`. No constraint on how many agents share a target.

(Classic keeps the existing `validateAliveTargetChain` Hamiltonian check. Add a new
`validateIndependentTargets(players)` for infinite — see §6.)

---

## 2. Data model changes

Edit `client/src/types/index.ts` **and** `client/src/types/schemas.ts` together, then `firestoreParse.ts` flows through automatically.

### 2a. Stacked pending confirmations (replaces the singular pending fields)
Shared targets mean a victim can be caught by **several** assassins at once; every claim must be **preserved and
queued** (D5). Replace the two singular fields with a **queue**.

**Remove** from `Player`:
```ts
pendingEliminationBy?: string;
pendingTaskDescription?: string;
```

**Add** to `Player`:
```ts
pendingEliminations?: PendingElimination[];   // FIFO queue; [] or undefined = none
```
```ts
export interface PendingElimination {
  assassinId: string;        // who claims the catch
  assassinCallsign: string;  // denormalized for host panel + victim screen (no extra reads)
  taskDescription: string;   // the assassin's directive at claim time (what they made you do)
  claimedAt: number;         // Date.now(); used for FIFO ordering + display
}
```

**Zod (`schemas.ts`):**
```ts
export const PendingEliminationSchema = z.object({
  assassinId: z.string(),
  assassinCallsign: z.string(),
  taskDescription: z.string(),
  claimedAt: z.number(),
});
// in PlayerSchema:
pendingEliminations: z.array(PendingEliminationSchema).nullish(),
```

> **Classic mode** also migrates to this queue but will only ever hold **0 or 1** entry (single hunter). This
> unifies the confirm/deny UI and the host panel across both modes. See §8 for the classic touch-points.

### 2b. Fields reused as-is (no schema change)
- `killCount` — eliminations made. Incremented on each confirmed kill.
- `respawnCount` — **times eliminated** (D8). Incremented each time a pending elimination against this player is
  confirmed. Already exists (`gameLogic.ts:222`, `gameService.ts:459`).
- `rerollsUsed` / `maxRerolls` — the shared swap budget (D1/D2). Unchanged semantics.

### 2c. Fields/statuses NOT added
- **No** `RESPAWNING` status, **no** `respawnAt`, **no** cooldown timer (D5: instant respawn).
- Infinite agents are only ever `ALIVE` during play, `WINNER`/`ELIMINATED` at game end.

---

## 3. New pure functions (`gameLogic.ts`) — build test-first

All are pure (no Firebase), accept an injectable `rng: () => number = Math.random` for deterministic tests.

```ts
// Pick a fresh target for `agentId`: a random ALIVE agent, never self, and (when possible) never `avoidId`
// (used so a swap/kill actually changes the target). Falls back to allowing `avoidId` only if it is the
// sole option. Throws if no eligible target exists.
export function pickIndependentTarget(
  agentId: string,
  players: Pick<Player,'uid'|'status'>[],
  avoidId?: string,
  rng?: () => number,
): string;

// Kill resolution for infinite. Victim respawns instantly; assassin gets fresh target + fresh directive.
// No anchor, no bystander writes.
export function computeIndependentKill(
  victim: Pick<Player,'uid'|'callsign'|'respawnCount'>,
  assassinId: string,
  assassinKillCount: number,
  allPlayers: Player[],
  tasks: string[],
  eliminatedBy: string,          // assassinId, or 'ADMIN' when host-confirmed
  incrementKillCount: boolean,   // false for admin no-credit removals
  rng?: () => number,
): {
  victimUpdate: Record<string, unknown>;   // status ALIVE, respawnCount+1, fresh directive, eliminatedBy/At
  assassinUpdate: Record<string, unknown>; // fresh targetId+callsign, fresh directive, killCount(+1?)
};

// Fresh assignment for a brand-new (mid-game join) or reset agent.
export function computeIndependentJoin(
  newAgentId: string,
  players: Player[],
  tasks: string[],
  rng?: () => number,
): { targetId: string; targetCallsign: string; taskDescription: string };

// Infinite-mode integrity check (replaces the Hamiltonian walk for infinite).
export function validateIndependentTargets(
  players: Pick<Player,'uid'|'targetId'|'status'>[],
): { valid: boolean; errors: string[] };
```

### Behavior detail
- `computeIndependentKill.victimUpdate`:
  ```
  status: 'ALIVE',
  respawnCount: (victim.respawnCount || 0) + 1,
  taskDescription: <fresh tasks[rng]>,   // fresh contract on respawn
  eliminatedBy, eliminatedAt: Date.now(),
  // targetId: KEEP the victim's existing target (no surprise to the victim). Do NOT rewrite it.
  ```
  The victim keeps their own target (they were the one caught; their assignment is not a surprise). If the kept
  target is somehow invalid (target left game), reassign via `pickIndependentTarget`.
- `computeIndependentKill.assassinUpdate`:
  ```
  targetId: pickIndependentTarget(assassinId, players, avoidId: victim.uid),
  targetCallsign: <that agent's callsign>,
  taskDescription: <fresh tasks[rng]>,
  ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
  ```
  `avoidId: victim.uid` so the assassin doesn't instantly re-lock the same person (variety). If the victim is the
  only other agent (2-player infinite), fall back to targeting the victim again — but with a **fresh directive**,
  so there is still no information leak.

### DELETED for infinite (do not call these from the infinite path anymore)
- `pickChainInsertionAnchor`, `computeChainInsertionUpdates`, `computeInstantInfiniteElimination`,
  `resolveAssassinTargetAfterKill`, `computeMidGameJoinUpdates` — all become dead code for infinite. Remove them
  (and their tests) **only after** confirming nothing else references them; classic does **not** use them. Run
  `mcp__scout__dead_code` / `grep` before deleting. If any are still referenced, leave them and mark `@deprecated`.

---

## 4. Service layer (`gameService.ts`)

### 4a. `startGame` (infinite branch)
No change to the assignment step: reuse `buildTargetChain` as the **initial** independent assignment. A cycle is
a valid independent assignment where everyone starts hunted exactly once; it then evolves into an independent
graph as kills happen. Keep `rerollsUsed: 0`, `killCount: 0`, `respawnCount: 0` initialization.

### 4b. `challengeTarget` — append to the queue (do not overwrite)
Currently sets the singular `pendingEliminationBy` (`gameService.ts:235-238`). Change to **append** a
`PendingElimination` to the target's `pendingEliminations` array (use `arrayUnion` or a transactional read-modify-write).
- **Guard against duplicates:** if the same `assassinId` already has a pending entry against this target, no-op
  (don't stack duplicates from a double-tap).
- Preserve the existing pre-checks (game ACTIVE, both agents ALIVE).
- Denormalize `assassinCallsign` + `taskDescription` from the assassin's current doc at claim time.

### 4c. `confirmElimination(gameId, targetId, assassinId?)` — pop one queued entry
Extend the signature with an **optional** `assassinId`:
- If `assassinId` omitted → resolve the **head** of the queue (FIFO) — used by the victim's own screen.
- If `assassinId` given → resolve **that specific** entry — used by the host panel (D7) and to disambiguate.
- Inside the transaction:
  1. Read game + all players (reads first — keep the existing transaction discipline).
  2. Find the target's `pendingEliminations`; select the entry (head or matching `assassinId`). If none → throw
     `NO_PENDING_ELIMINATION` (benign; another actor already resolved it).
  3. **Infinite:** apply `computeIndependentKill(victim, entry.assassinId, assassinKillCount, players, tasks,
     eliminatedBy=entry.assassinId, incrementKillCount=true)`. Write `victimUpdate` + `assassinUpdate`.
     **Remove only the resolved entry** from `pendingEliminations` (keep the rest — the queue stacks).
     **Classic:** keep existing `applyClassicElimination`, then clear the (single) queue.
  4. Re-check `isGameOver` (unchanged) after the write; on win, set game COMPLETED + statuses (as today).
- **Important:** because entries stack, confirming Ava's claim leaves Cy's claim intact; the victim confirms Cy
  next (another kill for Cy, `respawnCount` +1 again). Each confirmed entry is an independent elimination event.

### 4d. `denyElimination(gameId, targetId, assassinId?)` — drop one queued entry
Same selection rule (head or specific). Remove just that entry; award nothing. Other queued entries remain.

### 4e. `joinGame` (mid-game infinite) — clean, no bystander writes (D6)
Replace the anchor/reinsert transaction (`gameService.ts:141-163`) with:
```
newPlayerFields = computeIndependentJoin(playerId, allPlayers, tasks)
transaction.set(newPlayerRef, { ...identity, status:'ALIVE', killCount:0, respawnCount:0,
                                rerollsUsed:0, pendingEliminations:[], ...newPlayerFields })
transaction.update(gameRef, { playerIds: arrayUnion(playerId) })
```
No existing player is touched. (Coverage note: a newcomer may be un-hunted until someone rolls onto them — see §7.)

### 4f. `swapTarget(gameId, playerId)` — NEW (enables D2, infinite only)
Mirror `scrambleTask`'s budget shape but swap the **target** instead of the directive, inside a transaction:
```
if !isInfiniteMode(game) → throw (target swap is infinite-only)
if player.status !== 'ALIVE' → throw PLAYER_NOT_ALIVE
if (rerollsUsed || 0) >= (maxRerolls ?? DEFAULT_MAX_REROLLS) → throw NO_MORE_SWAPS
newTargetId = pickIndependentTarget(playerId, players, avoidId: player.targetId)
update player: { targetId:newTargetId, targetCallsign:<callsign>, rerollsUsed: used+1 }
```
Only the caller's doc changes. `scrambleTask` (directive swap) is unchanged except it now shares the same budget
(it already increments `rerollsUsed`; that IS the shared budget — no code change needed for sharing).

### 4g. `adminForceEliminate` (infinite) — clarify the two host actions
Two distinct host actions (keep them separate, D7):
- **Confirm-on-behalf** (a real catch is disputed / player won't confirm): host calls
  `confirmElimination(gameId, targetId, assassinId)` for a queued entry → **credits** the assassin.
- **Force-remove** (player quit / disruptive; no credit): mark the target `ELIMINATED` **permanently** (they do
  NOT respawn — this is a removal, not a kill), clear their `pendingEliminations`, and **reassign every agent who
  was targeting the removed player** via `pickIndependentTarget` (this reassignment is legitimate and expected —
  the target left the game). Surface a small "target left the game — new target assigned" banner to affected
  hunters. This is the **only** place a bystander's target changes without their action, and it is justified.

---

## 5. Worked examples (use these as test fixtures)

Players A, B, C, D (infinite). Directives abbreviated `d1…`.

### 5.1 Simple kill
Start: `A→B`, `B→C`, `C→B`, `D→A` (note: C and A do **not** exist as a ring; B is shared by A and C).
A catches B, confirms.
- A: `killCount+1`, fresh target ≠ B (say `A→D`), fresh directive.
- B: `respawnCount+1`, stays ALIVE, keeps `B→C`, fresh directive.
- C, D: **untouched.** (C still hunts B — fine.)
- No bystander swap. ✔

### 5.2 Shared target, stacked confirmations
Start: `A→B`, `C→B` (both hunt B). A and C both catch B and challenge.
- B.`pendingEliminations` = `[{A,…}, {C,…}]` (FIFO).
- B confirms head → A scored; B `respawnCount=1`, fresh directive, keeps `B→…`; queue = `[{C,…}]`.
- B confirms next → C scored; B `respawnCount=2`, fresh directive; queue = `[]`.
- Both assassins credited; **no claim lost.** ✔

### 5.3 Deny one, keep the other
From 5.2 after A scored, queue = `[{C,…}]`. B denies C → queue = `[]`, C gets no credit (dispute). ✔

### 5.4 Two-player infinite (leak check)
`A↔B`. A catches B, confirms → A `killCount+1`, fresh target = B (only option) **but fresh directive**; B respawns
with fresh directive. Neither holds the other's old directive → **no leak.** ✔

### 5.5 Target swap
A (`A→B`) taps Swap-Target, budget available → `A→C` (or D), `rerollsUsed+1`. Only A changes. ✔

---

## 6. Validation & tests

Rebuild `client/src/__tests__/gameLogic.infinite.simulation.test.ts` around the new invariants. Required assertions:
- **No bystander swap:** for any single confirmed kill, exactly the victim's and assassin's docs change target-
  relevant fields; **no third agent's `targetId` changes.** (The only exception: force-remove in §4f.)
- **No inheritance:** the assassin's post-kill `taskDescription` is **not** equal to the victim's pre-kill
  directive (fresh draw), and the assassin's new `targetId` is chosen fresh (≠ victim when N>2).
- **Queue integrity:** confirming/denying one entry preserves all other queued entries; FIFO order honored.
- **Independent-target invariant** holds after every operation (`validateIndependentTargets`).
- **Long-run simulation:** run thousands of random kills/joins/swaps; assert the invariant never breaks, no agent
  is starved of a target (unless legitimately the only one left), and kill goal terminates the game.
- **Fairness probe (informational):** over a long run, log the distribution of "times eliminated" per seat to
  confirm no structural bias remains (addresses #10). Not a hard assertion — random variance is expected.
- Keep `gameLogic.classicRegression.test.ts` green (classic must be untouched).

---

## 7. Open considerations (decide during implementation; defaults given)
- **Coverage / "safe" agents.** Independent assignment doesn't guarantee everyone is currently hunted (e.g. a
  fresh joiner). **Default: accept for v1** — it self-balances as kills reassign hunters. A later optional
  "soft rebalance" may retarget only hunters whose target is *already* gone, never a live one. Do not build the
  rebalance now unless playtests demand it.
- **Assassin re-locking the same victim.** Prevented by `avoidId: victim.uid` when N>2. At N=2 it's unavoidable
  and harmless (fresh directive each time).
- **Duplicate challenges.** `challengeTarget` must no-op if the same assassin already has a queued entry.

---

## 8. Touch-point checklist (for the implementer)
Pure logic (`gameLogic.ts`): add §3 functions; retire the 5 deleted infinite helpers after dead-code check.
Types: `types/index.ts` + `schemas.ts` (§2); `firestoreParse.ts` needs no logic change.
Service (`gameService.ts`): `challengeTarget` (append), `confirmElimination`/`denyElimination` (queue + optional
`assassinId`), `joinGame` infinite branch (§4e), new `swapTarget` (§4f), `adminForceEliminate` infinite (§4g).
UI (cross-refs to other specs):
- Compromised screen `app/game/[id].tsx:382` — gate on `me?.pendingEliminations?.length`; show the head entry;
  if `length > 1` show "N agents are claiming you — confirm each." Confirm/Deny act on the head.
- Contract view — add the **Swap Target** control next to Swap Directive (see `01-swaps.md`).
- Host Pending-Confirmations panel — iterate every player's `pendingEliminations` (see `04-config-admin.md`, D7).
- Strings — new/renamed copy in `strings.ts` (see `02-terminology.md`): `NO_MORE_SWAPS`, swap-target labels,
  multi-claim victim copy, "target left the game" banner.
Docs: land `adr-0007-infinite-independent-targets.md` into `docs/adr/0007-...md` and annex ADR-0004.

## 9. Sequencing within this workstream
1. Types + schema (§2), with parse tests.
2. Pure functions (§3) + unit tests (§5 fixtures) + rebuilt simulation (§6). **All green before any wiring.**
3. Service changes (§4) behind the `isInfiniteMode` branch; classic paths untouched.
4. UI wiring (defer to `01`/`04` specs, which depend on this data model).
5. Dead-code removal + ADR + `npm run verify`.
