# 01 — Swaps Workstream (items #1, #2, #7)

> Implements **D1** (per-game swap budget + correct copy/icon), **D2** (one shared budget spends on
> directive *or* target, infinite only), and the swap surface of **#2** (copy scope).
> Conforms to `00-decisions.md`. Depends on the data model + services in
> `05-infinite-mode-independent-targets.md` — this doc **references** `pickIndependentTarget` and
> `swapTarget` (defined in 05), it does **not** redefine them.
> Exact user-facing wording is owned by `02-terminology.md`; this doc marks every new/changed string key
> and its placement, and defers final text to 02.

---

## Overview

Three coupled changes to the swap surface:

1. **#1 / D1** — Confirm the per-game budget is already correct in the data layer (no decrement bug),
   lock the semantics so **no new-contract path ever writes `rerollsUsed`**, and fix the *perception*
   bug with copy + a refresh icon on the Swap control.
2. **#2** — Rescope the swap copy so it reads "per game, not per target," using the canonical glossary
   terms **Mission** (the to-do) and **Swap** (the action).
3. **#7 / D2** — Add a second control, **Swap Target** (infinite only), sharing the *same* per-game
   budget as **Swap Mission**. New service `swapTarget` (from 05) + a new `executeSwapTarget` handler in
   `app/game/[id].tsx` mirroring `executeScramble`. Classic mode shows **Swap Mission only**.

The budget itself (`maxRerolls` on the game, `rerollsUsed` per player) is unchanged in shape. What changes
is: one more thing can spend it (target swap), and the UI/copy finally communicate that it is a whole-game
allowance.

---

## Current state (file:line)

### Budget semantics — already correct, no literal bug
- `client/src/constants.ts:9` — `export const DEFAULT_MAX_REROLLS = 5;`
- `client/src/types/index.ts:26` — `rerollsUsed?: number;` (per-player accumulator);
  `client/src/types/index.ts:43` — `maxRerolls?: number;` (per-game budget).
- `rerollsUsed` is written in exactly three places, and **only ever set to 0 or incremented** — it is a
  per-game accumulator that is **never reset on a new contract**:
  - `gameService.ts:200` — `startGame` sets `rerollsUsed: 0` (initial).
  - `gameService.ts:156` — `joinGame` mid-join sets `rerollsUsed: 0` (initial for a newcomer).
  - `gameService.ts:557` — `scrambleTask` sets `rerollsUsed: currentRerolls + 1` (the **only** increment;
    guarded by the `>= maxRerolls` check at `gameService.ts:548`).
- **Confirmed:** there is **no decrement and no per-contract reset**. Respawn/inheritance today does not
  touch `rerollsUsed` at all. Per D1, the reported "swaps reset to depleted on a fresh contract" is a
  **copy/UX** problem, not a logic bug. Cross-check: the E-model `computeIndependentKill`
  (`05-…§3`) writes `victimUpdate`/`assassinUpdate` with fresh directive/target but **must not** include
  `rerollsUsed` — verify this when 05 lands (see Acceptance).

### Swap UI — `client/src/features/game/components/ContractView.tsx`
- `:40` — `const effectiveMaxRerolls = maxRerolls ?? DEFAULT_MAX_REROLLS;`
- `:41` — `const rerollsLeft = effectiveMaxRerolls - (player.rerollsUsed || 0);`
- `:42` — `const showSwap = effectiveMaxRerolls > 0;`
- `:43` — `const canShuffle = showSwap && !isPending && rerollsLeft > 0;` (the single gate today).
- `:72-86` — the swap block: one `Button` titled `strings.CONTRACT_SWAP_DIRECTIVE` calling `onScramble`,
  `disabled={!canShuffle || loading}`, plus a hint `dynamicStrings.objectiveSwapsLeft(rerollsLeft)` at `:83`.
- Props (`:21-29`): `player, targetAvatarId, isPending, onLogKill, onScramble, loading, maxRerolls`. No mode
  flag and no target-swap handler yet.

### Handler + wiring — `client/app/game/[id].tsx`
- `:192-201` — `executeScramble` (calls `scrambleTask(id!, user!.uid)`, toggles `actionLoading`, shows
  `GAME_ALERT_FAILED_REASSIGN` on error). This is the template for `executeSwapTarget`.
- `:451-464` — the `ContractView` render: passes `player={me}`, `onScramble={executeScramble}`,
  `maxRerolls={game.maxRerolls}`, etc. Note `isInfinite` is already computed in this component (used at
  `:444-446`, `:248`) and is available to pass down.

### Service — `client/src/features/game/gameService.ts`
- `scrambleTask` at `:526-559` (directive swap; increments budget at `:557`). Unchanged by this workstream
  except it now conceptually shares the budget with `swapTarget` — no code change needed for sharing since
  both read/write the same `rerollsUsed`.
- `swapTarget(gameId, playerId)` is **new** and specified in `05-…§4f` — **not redefined here**.

### Strings — `client/src/strings.ts`
- `:150` — `CONTRACT_SWAP_DIRECTIVE: 'SWAP DIRECTIVE',`
- `:232` — `objectiveSwapsLeft: (n: number) => \`${n} swap${n === 1 ? '' : 's'} left\`,` (dynamicStrings).
- `:85` — `CONFIGURE_OBJECTIVE_SWAPS_HINT: 'How many times each player can trade their mission for a new random one.',`
- `:258` — `serviceErrors.NO_MORE_OBJECTIVE_CHANGES: 'No more objective changes allowed',` (thrown by
  `scrambleTask` at `:549`).

### Design-system affordances (for the refresh icon)
- `client/src/design-system/index.ts:13` exports `IconShuffle` — a **circular refresh arrow**
  ("shuffle / reroll affordance", `IconShuffle.tsx`). This is the exact Tabler-style `refresh` icon D1 asks
  for; reuse it, do not add a new asset.
- **`Button` has no icon slot** today (`Button.tsx:17-26` — props are `title/onPress/variant/size/…`).
  To put an icon on the swap control, either (a) extend `ButtonProps` with an optional `leftIcon?:
  React.ReactNode` rendered before the `title` (`Button.tsx:78-83`), or (b) compose a small labeled row
  (Icon + Button) in ContractView. **Prefer (a)** — it is reusable and keeps ContractView declarative.
  Decision deferred to the uiux workstream, but this doc requires the icon to appear on both swap buttons.

---

## Changes

### C1 — Types (`client/src/types/index.ts`)
No new fields for this workstream. `rerollsUsed` (`:26`) and `maxRerolls` (`:43`) are sufficient — the
budget is shared by reusing the same `rerollsUsed`. (The `pendingEliminations` queue and target fields are
owned by 05.)

### C2 — Service (`client/src/features/game/gameService.ts`)
- **No change to `scrambleTask`** (`:526-559`). It already enforces and increments the shared budget.
  *(Optional cleanup, defer to 02: the error key `NO_MORE_OBJECTIVE_CHANGES` at `:549` should become the
  mode-neutral `NO_MORE_SWAPS` — see New strings. If renamed, update the throw here and the
  `serviceErrors` entry together.)*
- **Add `swapTarget(gameId, playerId)`** — **defined in `05-…§4f`**, referenced here. Contract that this
  UI relies on:
  - throws if `!isInfiniteMode(game)` (target swap is infinite-only),
  - throws `PLAYER_NOT_ALIVE` if not alive,
  - throws `NO_MORE_SWAPS` (or current `NO_MORE_OBJECTIVE_CHANGES`) when `rerollsUsed >= maxRerolls`,
  - picks a new target via `pickIndependentTarget(playerId, players, avoidId: player.targetId)`,
  - writes `{ targetId, targetCallsign, rerollsUsed: used + 1 }` on the caller's doc only.
  Because it increments the same `rerollsUsed`, the budget is automatically shared with `scrambleTask`.
- **Lock D1 invariant:** ensure the E-model kill/respawn/join paths in 05
  (`computeIndependentKill`, `computeIndependentJoin`) **never emit `rerollsUsed`** in their update maps.
  A newcomer is initialized to `rerollsUsed: 0` in `joinGame` (as today, `:156`); an existing player who is
  killed and respawns keeps their accumulated `rerollsUsed` untouched. This is an assertion on 05's output,
  enforced by the unit test in Tests below.

### C3 — Handler (`client/app/game/[id].tsx`)
Add `executeSwapTarget` directly after `executeScramble` (`:192-201`), mirroring it:

```ts
const executeSwapTarget = async () => {
  try {
    setActionLoading(true);
    await swapTarget(id!, user!.uid);
  } catch {
    showAlert({
      title: strings.ALERT_OPERATION_FAILED_TITLE,
      message: strings.GAME_ALERT_FAILED_SWAP_TARGET, // new key — see New strings
    });
  } finally {
    setActionLoading(false);
  }
};
```

- Import `swapTarget` alongside the existing `scrambleTask` import.
- Reuse the existing shared `actionLoading` state so both swap buttons show the same busy state and can't
  be double-fired.

### C4 — Wiring (`client/app/game/[id].tsx:451-464`)
Pass the new handler and the mode flag into `ContractView`:
```tsx
<ContractView
  player={me}
  targetAvatarId={targetPlayer?.avatarId}
  isPending={!!targetPlayer?.pendingEliminationBy}  // becomes pendingEliminations-based per 05
  onLogKill={executeChallenge}
  onScramble={executeScramble}
  onSwapTarget={executeSwapTarget}   // NEW
  isInfinite={isInfinite}            // NEW — gates the Swap Target control
  loading={actionLoading}
  maxRerolls={game.maxRerolls}
/>
```
(The `isPending` prop's source will change to `pendingEliminations?.length` when 05 lands; that is 05's
edit, noted here only so the two workstreams don't collide.)

### C5 — UI (`client/src/features/game/components/ContractView.tsx`)
Extend props and render two swap controls that share **one** budget counter.

**Props** (`:21-29`): add
```ts
onSwapTarget?: () => void;
isInfinite?: boolean;
```

**Derived state** (replace `:40-43`):
```ts
const effectiveMaxRerolls = maxRerolls ?? DEFAULT_MAX_REROLLS;
const rerollsLeft = effectiveMaxRerolls - (player.rerollsUsed || 0);
const budgetEnabled = effectiveMaxRerolls > 0;
const hasBudget = rerollsLeft > 0;
const canSwap = budgetEnabled && !isPending && hasBudget && !loading;      // shared gate
const canSwapTarget = canSwap && !!isInfinite && !!onSwapTarget;           // + infinite + handler
```
Note the **shared budget** drives both `canSwap` (mission) and `canSwapTarget` (target); when
`rerollsLeft` hits 0, **both** controls disable together.

**Render** (replace the `:72-86` block). Show the swap section only when `budgetEnabled`:
- **Swap Mission** button — title `strings.CONTRACT_SWAP_MISSION` (renamed from `CONTRACT_SWAP_DIRECTIVE`,
  see New strings), refresh icon (`IconShuffle`), `onPress={onScramble}`,
  `disabled={!canSwap}`, `loading={loading}`. Always rendered (classic **and** infinite).
- **Swap Target** button — title `strings.CONTRACT_SWAP_TARGET`, refresh icon, `onPress={onSwapTarget}`,
  `disabled={!canSwapTarget}`, `loading={loading}`. **Rendered only when `isInfinite`** — in classic it is
  hidden entirely (not just disabled), per D2. When infinite but fewer than 3 players make a distinct
  target impossible, `pickIndependentTarget` still returns a valid (possibly same) target, so the button
  stays enabled; the empty/degenerate case is handled server-side (2-player fallback) — no special
  client gating needed beyond the budget/alive checks. *(If uiux prefers to disable Swap Target when the
  alive roster < 3 so it visibly does nothing, that is an allowed refinement; note it in 02 copy.)*
- **Shared budget hint** — a single line under both buttons (replacing the per-button hint at `:83`):
  `dynamicStrings.swapsLeftThisGame(rerollsLeft)` — communicates the allowance is for the whole game and,
  in infinite, is spent on either control. Exhausted state (`rerollsLeft === 0`) shows
  `strings.NO_MORE_SWAPS` copy instead. Exact wording deferred to 02.

Layout: keep the existing `Stack gap={3}` under the directive; place the two buttons in the stack (mission
first, target second) with the single shared hint last. Reuse `styles.swapAction` / `styles.swapHint`.

### C6 — Copy scope (#2)
The strings must convey **per game, not per target**, using canonical glossary terms (Mission / Swap):
- `objectiveSwapsLeft` (`strings.ts:232`) → rename to `swapsLeftThisGame` and reword to make the
  whole-game scope explicit (e.g. surfaces "X swaps left this game"). Final text → 02.
- `CONFIGURE_OBJECTIVE_SWAPS_HINT` (`strings.ts:85`) → reword to state the budget is **for the whole game**
  and (infinite) can be spent on mission **or** target. Uses "mission," not "objective." Final text → 02.
- `CONTRACT_SWAP_DIRECTIVE` (`strings.ts:150`) → rename to `CONTRACT_SWAP_MISSION`, text "Swap Mission."
  Final casing/text → 02.

These are **string/key** changes; the placements are fixed here, the wording is finalized by 02-terminology.

---

## New strings needed

Add to `client/src/strings.ts` (wording to be finalized by **02-terminology**; keys and placement fixed
here):

| Key | Location | Purpose / draft intent |
|---|---|---|
| `CONTRACT_SWAP_MISSION` | `strings` (rename of `CONTRACT_SWAP_DIRECTIVE` `:150`) | Swap Mission button label. |
| `CONTRACT_SWAP_TARGET` | `strings` | Swap Target button label (infinite only). |
| `swapsLeftThisGame(n)` | `dynamicStrings` (rename of `objectiveSwapsLeft` `:232`) | Shared budget line: "X swaps left this game — spend on mission or target." |
| `NO_MORE_SWAPS` | `strings` (user-facing) | Shown when the shared budget is exhausted (both controls disabled). |
| `GAME_ALERT_FAILED_SWAP_TARGET` | `strings` | Alert message when `swapTarget` throws (mirrors `GAME_ALERT_FAILED_REASSIGN`). |
| `NO_MORE_SWAPS` | `serviceErrors` (rename of `NO_MORE_OBJECTIVE_CHANGES` `:258`) | Mode-neutral service error thrown by `scrambleTask`/`swapTarget`. Optional; if kept as `NO_MORE_OBJECTIVE_CHANGES`, leave `scrambleTask:549` untouched. |
| `CONFIGURE_OBJECTIVE_SWAPS_HINT` (reword) | `strings` `:85` | Whole-game scope; "mission or target" in infinite. |

Note: the two `NO_MORE_SWAPS` rows are different objects (`strings` user-facing vs `serviceErrors` thrown
key). 02 decides whether to unify the naming; keep them distinct in code.

---

## Tests

### Unit — budget is not charged on respawn / inheritance (D1 lock)
`client/src/__tests__/gameLogic.*.test.ts` (co-locate with the 05 E-model tests):
- Given a victim with `rerollsUsed = 3`, `computeIndependentKill(...)` `victimUpdate` **does not** contain a
  `rerollsUsed` key (the victim's budget is untouched by respawn).
- The `assassinUpdate` from `computeIndependentKill(...)` **does not** contain a `rerollsUsed` key.
- `computeIndependentJoin(...)` output **does not** contain `rerollsUsed` (the service, not the pure fn,
  initializes it to 0 for a newcomer).
- Regression: after a simulated kill, the only way `rerollsUsed` changes is through `scrambleTask` /
  `swapTarget` (assert those are the sole writers — grep-level guard or a service test).

### Service — `swapTarget` budget + gating (defined in 05, exercised here)
- `swapTarget` increments `rerollsUsed` by exactly 1 and changes `targetId`/`targetCallsign` only on the
  caller's doc.
- `swapTarget` throws `NO_MORE_SWAPS` when `rerollsUsed >= maxRerolls` (shared budget: a player who used
  all swaps on missions cannot then swap a target).
- `swapTarget` throws in classic mode (`!isInfiniteMode`).
- Shared budget: alternating `scrambleTask` then `swapTarget` decrements the same counter to 0.

### Component smoke — `ContractView`
`client/src/__tests__/components/` (a `ContractView.test.tsx` may need creating):
- Infinite + budget remaining: **both** "Swap Mission" and "Swap Target" render and are enabled; tapping
  each fires `onScramble` / `onSwapTarget` respectively.
- Classic: "Swap Mission" renders; **"Swap Target" is absent** from the tree.
- Budget exhausted (`rerollsUsed === maxRerolls`): both buttons disabled and the exhausted hint
  (`NO_MORE_SWAPS`) shows.
- `isPending`: both swap buttons disabled.
- Shared hint renders once (not once per button) and reflects `rerollsLeft`.

---

## Acceptance criteria

- [ ] Confirmed in code + doc: `rerollsUsed` is a per-game accumulator written only at `startGame:200`,
      `joinGame:156` (both `= 0`), and incremented only at `scrambleTask:557`; **no decrement, no
      per-contract reset**.
- [ ] No new-contract path writes `rerollsUsed`: `computeIndependentKill` `victimUpdate`/`assassinUpdate`
      and `computeIndependentjoin` (05) contain no `rerollsUsed` key (unit-tested).
- [ ] `swapTarget` (from 05) is wired: new `executeSwapTarget` in `app/game/[id].tsx` mirrors
      `executeScramble`; `ContractView` receives `onSwapTarget` + `isInfinite`.
- [ ] Infinite mode shows **two** controls (Swap Mission, Swap Target) sharing **one** budget counter; both
      carry the refresh icon (`IconShuffle`).
- [ ] Classic mode shows **Swap Mission only**; Swap Target is not rendered.
- [ ] When `rerollsLeft` reaches 0, **both** controls disable together and the exhausted copy shows.
- [ ] A single shared-budget hint communicates the allowance is **per game** (and, in infinite, spendable on
      mission **or** target) — copy sourced from `strings.ts`, finalized by 02-terminology.
- [ ] String keys renamed/added per **New strings** table; no user-facing string uses "objective/directive"
      where the glossary says "mission."
- [ ] `npm run verify` (lint + typecheck + check-contrast + jest) passes from `client/`.
