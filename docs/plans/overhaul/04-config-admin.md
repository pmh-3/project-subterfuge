# 04 — Host Config & Admin Workstream

> Implements **#6 / D4** (configure before Create Game), **#13 / D6** (mid-game editable
> settings + mid-game join), and **#14 / D7** (Pending Confirmations panel).
> Conforms to `00-decisions.md` (D4, D6, D7) and depends on the data model in
> `05-infinite-mode-independent-targets.md` (the `pendingEliminations[]` FIFO queue and the
> `confirmElimination(gameId, targetId, assassinId?)` / `denyElimination(...)` signatures).
>
> **Copy is owned by `02-terminology.md`.** Every new string key referenced here is *declared*
> here but *defined* (final wording + glossary alignment) in `02`. This spec does not add strings
> to `strings.ts` directly — it lists the keys `02` must add.
>
> **Ordering dependency:** the queue-based service signatures in §3 and the panel in §3.3 assume
> `05` (§2a, §4c/§4d) has landed. If `05` is not yet merged when this workstream starts, land the
> §1 flow change (which is independent of the queue) first, then the §2 mid-game edits, then gate
> §3 on `05`.

---

## Overview

Three host-facing changes:

1. **#6 / D4 — Configure before Create Game.** Today the host taps "Start Operation", fills in
   identity, and `createGame` writes a game doc with **no `mode` field** — which
   `isClassicMode` treats as CLASSIC (`gameLogic.ts:98-100`). The host lands straight in the
   game; the only way to reach `configure.tsx` is the "Customize Game" button buried in the
   Admin tab (`HostSettingsView.tsx:62-72`). Result: the intended default (Infinite) is never
   reached unless the host detours through Admin → Customize. **New flow:** identity → configure
   (settings first) → Create Game (writes the doc *with* mode + config) → land in the **lobby** to
   invite. Defaults become mode=Infinite, difficulty=Easy, and `createGame` itself defaults to
   `mode:'INFINITE'` so any code path that bypasses configure still yields Infinite, not silent
   Classic.

2. **#13 / D6 — Mid-game editable settings + mid-game join.** Expose in the Host tab, while
   `status === 'ACTIVE'`: kill goal (already wired via `handleUpdateKillGoal`), `maxRerolls`, and
   difficulty/packs (labeled *applies to future missions only* — verified safe below). Block mode
   switching and manual roster edits. Mid-game **join** is already permitted for infinite in
   `joinGame` (`gameService.ts:97-99`); `05 §4e` makes it clean (newcomer gets an independent
   target + fresh directive, no bystander disturbed). Classic stays LOBBY-only.

3. **#14 / D7 — Pending Confirmations panel.** Under the `05` queue model each player carries a
   `pendingEliminations[]` FIFO queue. Add a Host-tab panel listing **every** queued entry across
   **all** players as `assassin → target : mission`, with host **Confirm**
   (`confirmElimination(gameId, targetId, assassinId)` — credits the assassin) and **Deny**
   (`denyElimination(gameId, targetId, assassinId)`) per entry. `adminForceEliminate` stays a
   **separate** "remove without credit" action. Also enrich the per-player roster chips.

---

## Item #6 / D4 — Configure before Create Game

### Current state

- **Entry point** — `app/index.tsx:98-103`: "Start Operation" button routes to
  `/game/lobby?mode=start`.
- **Lobby create** — `app/game/lobby.tsx`:
  - `renderStartContent` (`:376-390`) collects identity, then its CTA calls `handleCreate`.
  - `handleCreate` (`:116-135`): `createGame(user.uid, callsign, key, avatarId)` →
    `setPendingGameId` → `setMode('reveal')`.
  - `handleRevealComplete` (`:198-202`): after the Agent-Key reveal animation, pushes
    `/game/{pendingGameId}` — i.e. **straight into the game**, never into configure.
- **Service** — `gameService.ts:37-68` `createGame` writes:
  ```ts
  status: 'LOBBY', selectedPacks: ['basic_training'], difficultySetting: 'Mixed',
  maxRerolls: DEFAULT_MAX_REROLLS,
  ```
  and **no `mode`, no `infiniteConfig`** ⇒ `isClassicMode` returns true (`gameLogic.ts:98-100`)
  ⇒ the game is CLASSIC by omission. This is the silent-classic bug D4 fixes.
- **Configure** — `app/game/configure.tsx`:
  - Defaults: `gameMode='elimination'` (`:109`), `difficulty='Mixed'` (`:112`),
    `maxRerolls=5` (`:113`), `selectedPackIds=['basic_training']` (`:107`).
  - It is the **only** screen where INFINITE is selectable (`SegmentChips`, `:272-287`).
  - `handleAuthorize` (`:179-223`): `updateDoc` on an **existing** game doc (writes
    `selectedPacks`, `difficultySetting`, `maxRerolls`, `status:'LOBBY'`, `mode`,
    `infiniteConfig`), then `router.replace('/game/{gameId}')`.
  - Reached today only from `HostSettingsView.tsx:62-72` "Customize Game"
    (`router.push('/game/configure?id={gameId}')`).
- **Vestigial status** — `types/index.ts:33`: `Game.status` union includes `'CONFIGURING'`, but
  it is **never written** anywhere in the codebase (grep-confirmed: `createGame` writes `'LOBBY'`,
  `configure` writes `'LOBBY'`, `startGame` writes `'ACTIVE'`). It is dead.

### Changes

**Chosen order:** identity **first** (in the lobby, as today), then configure, then Create Game
inside configure's save. Rationale: identity collection + the Agent-Key reveal animation already
live in the lobby and are orthogonal to game settings; keeping them first means configure operates
on a real game doc (host player already created) exactly as it does today, so `configure.tsx`'s
load path (`getDoc(games/{gameId})`, `:123-153`) needs no change. The only re-sequencing is *where
the host lands after Create Game* (lobby, not the game) and *when the mode/config is written* (at
create, via configure).

Concretely, two viable wirings — **Option A is recommended** (smallest diff, preserves the
existing Agent-Key reveal placement and configure's load-from-doc contract):

**Option A (recommended): create the doc at identity, configure edits it, land in lobby.**

1. `app/index.tsx:98-103` — leave routing to the lobby (`/game/lobby?mode=start`); the flow change
   is downstream, so index.tsx needs no change beyond copy (D4 retires old words — see string keys
   below; owned by `02`).
2. `app/game/lobby.tsx` `handleCreate` (`:116-135`) — after `createGame(...)` resolves with
   `newGameId`, keep the Agent-Key reveal (`setMode('reveal')`), but change
   `handleRevealComplete` (`:198-202`) to route to **configure** instead of the game:
   ```ts
   router.replace(`/game/configure?id=${pendingGameId}`);
   ```
   (Use `replace` so Back from configure does not return to the reveal animation.)
3. `app/game/configure.tsx` `handleAuthorize` (`:179-223`) — unchanged in structure (it already
   `updateDoc`s the doc with `mode`/`infiniteConfig`/`status:'LOBBY'`), but change the final
   navigation (`:213`) from `router.replace('/game/{gameId}')` to route into the **lobby view of
   the game** so the host can invite. The game screen `[id].tsx` already renders the lobby when
   `status === 'LOBBY'` (`:466-479` `GameLobbyView`), so `router.replace('/game/{gameId}')` is
   already correct — **no change needed** here beyond confirming the host lands on the lobby tab.
   (Since the game is still `LOBBY`, `[id].tsx` shows `GameLobbyView` with Invite + Start. ✔)
4. **Defaults** in `configure.tsx`:
   - `:109` `gameMode` state default `'elimination'` → **`'infinite'`**.
   - `:112` `difficulty` state default `'Mixed'` → **`'Easy'`**.
   - Keep `maxRerolls=5` (`:113`) and `selectedPackIds=['basic_training']` (`:107`).
   - Note: `configure.tsx` overwrites these from the loaded doc when present (`:139-148`), so the
     new defaults only bite for a fresh doc that has no `mode` yet — which is exactly the
     create-flow case. Because the state string is `'infinite'`, the `SegmentChips` value
     (`:273`) shows Infinite selected and the kill-goal block (`:290-332`) renders on first paint.

**Service default (defense in depth) —** `gameService.ts:42-51` `createGame`. Even though Option A
routes every host through configure (which writes `mode` explicitly), make `createGame` itself
default to Infinite so **any** bypass (deep link, test, future caller) yields the intended default
rather than silent Classic:
```ts
const newGame: Game = {
  id: gameId,
  hostId,
  status: 'LOBBY',
  playerIds: [hostId],
  createdAt: Date.now(),
  selectedPacks: ['basic_training'],
  difficultySetting: 'Easy',            // was 'Mixed' — align with D4 default
  maxRerolls: DEFAULT_MAX_REROLLS,
  mode: 'INFINITE',                     // NEW — no more silent-classic
  infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: DEFAULT_INFINITE_KILL_GOAL } }, // NEW
};
```
`DEFAULT_INFINITE_KILL_GOAL` (`constants.ts:13` = 5) is already imported-adjacent; add the import
if missing. This makes `Game` construction here match the `Game` type (`types/index.ts:30-44`)
with `mode` + `infiniteConfig` populated. configure's `handleAuthorize` still overwrites all of
these when the host changes them, so no conflict.

> **Why not also default in `types`/schema?** The type already allows `mode?: GameMode`
> (optional). Making it required would ripple into `firestoreParse` for legacy docs. Keep it
> optional in the type; enforce the default at the **write site** (`createGame`) and interpret a
> missing `mode` as Classic at the **read site** (`isClassicMode`, unchanged) for backward compat
> with any pre-existing docs. New docs always carry `mode`.

**Fate of `status: 'CONFIGURING'` — RECOMMENDATION: RETIRE IT.**

The vestigial value is never written and the recommended flow does not need a distinct
"configuring" state: the host player exists and the game sits at `LOBBY` throughout configuration,
which is semantically correct (a lobby with no other players yet). Introducing a real
`CONFIGURING` gate would add a state that `[id].tsx` and every `status` switch must now handle,
for no product benefit — configuration is a client-side screen, not a shared server state other
players observe.

- **Action:** remove `'CONFIGURING'` from the `Game.status` union at `types/index.ts:33`
  (→ `'LOBBY' | 'ACTIVE' | 'COMPLETED'`) and from the corresponding Zod enum in
  `types/schemas.ts` (the `GameSchema` status field — grep for `'CONFIGURING'`).
- **Verify before deleting:** `grep -rn "CONFIGURING" client/src client/app` must return only the
  type + schema declarations (no reads/writes). Confirmed at spec time: no runtime references.
- If, contrary to this recommendation, the implementer wants a hard gate (e.g. to prevent Start
  before configure completes), the alternative is to write `CONFIGURING` in `createGame` and flip
  to `LOBBY` in `handleAuthorize` — but D4 explicitly leaves this to implementer's choice, and the
  retire path is simpler and lower-risk. **Retire.**

**Joiners unaffected.** `handleJoin` / `handleRecoverJoin` (`lobby.tsx:137-196`) and
`joinGame` (`gameService.ts:70+`) are untouched. Joiners never see configure.

### New strings referenced (owned by `02-terminology`)

- `INDEX_START_OPERATION` (retitle of `LOBBY_START_OPERATION` per glossary — "Create Game" /
  "New Operation" wording per D4).
- `CONFIGURE_CREATE_GAME_BUTTON` — configure's primary CTA when in the create flow (may reuse
  `CONFIGURE_AUTHORIZE_BUTTON`; `02` decides final wording — "Create Game").
- No new keys strictly required if `02` chooses to reuse existing `CONFIGURE_*` copy; this item is
  mostly routing + defaults.

---

## Item #13 / D6 — Mid-game editable settings + mid-game join

### Current state

- **Kill goal (already editable mid-game):** `HostSettingsView.tsx:76-91` renders a `PillSegments`
  bound to `onUpdateKillGoal` **only** when `isGameActive && isInfinite`. Wired in `[id].tsx:445-446`
  to `handleUpdateKillGoal` (`:302-317`), which `updateDoc`s `infiniteConfig.endCondition`.
- **`maxRerolls`:** editable **only** in `configure.tsx:358-362` (LOBBY-time). Not exposed in the
  Host tab during ACTIVE.
- **difficulty / packs:** editable **only** in `configure.tsx` (`:334-363`, `:246-266`). Not
  exposed during ACTIVE.
- **Task resolution:** `resolveAvailableTasks` (`gameService.ts:23-32`) reads
  `gameData.selectedPacks` + `gameData.difficultySetting` **at call time**. It is called by
  `startGame` (`:187`), `confirmElimination` (`:366`, for the respawn directive), `scrambleTask`
  (`:552`), and `adminForceEliminate` (`:424`). Player docs store the *already-drawn*
  `taskDescription` string; changing packs/difficulty does **not** rewrite any existing
  assignment — it only changes the pool the **next** draw samples from. **Confirmed: packs +
  difficulty affect future missions only.** ✔
- **Mid-game join:** `joinGame` (`gameService.ts:97-99`) permits join when
  `status === 'LOBBY' || (isInfiniteMode && status === 'ACTIVE')`. Classic during ACTIVE is
  rejected (`OPERATION_ALREADY_IN_PROGRESS`, `:101-103`). The infinite mid-game insert today uses
  the anchor/reinsert path (`:141-163`) — which `05 §4e` replaces with `computeIndependentJoin`
  (no bystander writes).

### Changes

**Expose three editable settings in the Host tab (ACTIVE + infinite only).** Extend
`HostSettingsView` with new props and a new "Mission settings" section rendered under the existing
kill-goal block (`HostSettingsView.tsx:76-91`):

New props on `HostSettingsViewProps` (`:20-34`):
```ts
maxRerolls?: number;
onUpdateMaxRerolls?: (n: number) => void;
difficulty?: DifficultySetting;
onUpdateDifficulty?: (d: DifficultySetting) => void;
selectedPacks?: string[];
availablePacks?: TaskPack[];
onUpdatePacks?: (ids: string[]) => void;
```

UI (add after the kill-goal `infiniteSection`, gated `isGameActive && isInfinite`):
- **Swaps budget** — `PillSegments` over `[1,3,5,10]` (mirror `configure.tsx:358-362`) bound to
  `onUpdateMaxRerolls`. Label `HOST_SWAPS_BUDGET_LABEL`.
- **Difficulty** — `PillSegments` over `['Mixed','Easy','Medium','Hard']`
  (mirror `configure.tsx:341-348`) bound to `onUpdateDifficulty`. Label `HOST_DIFFICULTY_LABEL`.
- **Task packs** — reuse the multi-select card list pattern from `configure.tsx` (`TaskPackCard`,
  `:37-98`) or a compact chip variant, bound to `onUpdatePacks`. Label `HOST_TASK_PACKS_LABEL`.
- **Shared caption under all three future-only settings** (difficulty + packs at minimum):
  `HOST_FUTURE_MISSIONS_ONLY_HINT` — *"Applies to future missions only. Current assignments are
  unchanged."* (`maxRerolls` also takes effect forward-looking: it is compared live in
  `scrambleTask`/`swapTarget`, so raising it immediately grants more swaps and lowering it caps
  new swaps without clawing back used ones — note this in the hint or a sub-caption.)

Handlers in `[id].tsx` (alongside `handleUpdateKillGoal`, `:302-317`), each a thin `updateDoc`:
```ts
const handleUpdateMaxRerolls = useCallback(async (n: number) => {
  await updateDoc(doc(db, 'games', id!), { maxRerolls: n });
}, [id]);
const handleUpdateDifficulty = useCallback(async (d: DifficultySetting) => {
  await updateDoc(doc(db, 'games', id!), { difficultySetting: d });
}, [id]);
const handleUpdatePacks = useCallback(async (ids: string[]) => {
  if (ids.length === 0) return;              // never allow empty selection
  await updateDoc(doc(db, 'games', id!), { selectedPacks: ids });
}, [id]);
```
Wrap each in the existing `try/catch → showAlert` shape used by `handleUpdateKillGoal`. Pass them
into `HostSettingsView` in the `[id].tsx:430-447` block, gated on `isInfinite` (pass `undefined`
for classic so the section does not render). The host will need `availablePacks` — fetch via
`fetchTaskPacks()` (same call configure uses, `configure.tsx:29`) in `[id].tsx` and pass down, or
lazy-load inside `HostSettingsView` on first render of the packs sub-section.

**Blocked mid-game (explicitly NOT exposed):**
- **Mode switch (classic ↔ infinite).** Do not render any mode control in the Host tab during
  ACTIVE. Rationale to encode as a code comment + this spec: the two modes use **different code
  paths and different fields** — classic runs the Hamiltonian single-cycle
  (`validateAliveTargetChain`, `computeEliminationUpdates`) and has no `killCount`/`respawnCount`
  semantics; infinite (post-`05`) runs `validateIndependentTargets` + `pendingEliminations[]`
  queues. Flipping mode mid-game would leave target graphs and pending state in a shape the other
  mode's invariants reject — chain/graph corruption. (D6: "game mode … corrupts state".)
- **Manual roster edits (add/remove/rename a player by hand).** All roster mutation must route
  through `joinGame` (add) and `adminForceEliminate` force-remove (remove). Rationale: a hand-added
  player would lack a valid `targetId`/directive and break `validateIndependentTargets`; a
  hand-removed player would orphan every hunter pointing at them. `05 §4g` force-remove is the
  **only** sanctioned removal (it reassigns orphaned hunters). The Host tab already exposes
  per-player Eliminate (`HostSettingsView.tsx:118-126`) → that is the sanctioned path; do not add a
  raw delete/edit.

**Mid-game join (D6):**
- **Infinite: supported and clean.** `joinGame` already allows it (`gameService.ts:97-99`); once
  `05 §4e` lands, the newcomer is assigned via `computeIndependentJoin` (random ALIVE target +
  fresh directive), and **no existing player's `targetId` is touched** (`05 §4e`, §5 no-bystander
  assertion). The newcomer may be temporarily un-hunted until a kill reassigns a hunter onto them —
  accepted for v1 (`05 §7`). No Host-tab UI change is required for join; players join via the
  invite code / link exactly as in lobby. Optionally surface a small "Agent joined mid-operation"
  line in the roster.
- **Classic: pre-start only.** Unchanged — `joinGame` rejects ACTIVE classic
  (`gameService.ts:101-103`). The lobby invite affordances remain LOBBY-only for classic.

### New strings referenced (owned by `02-terminology`)

- `HOST_SWAPS_BUDGET_LABEL`
- `HOST_DIFFICULTY_LABEL`
- `HOST_TASK_PACKS_LABEL`
- `HOST_FUTURE_MISSIONS_ONLY_HINT`
- `HOST_MISSION_SETTINGS_SECTION` (optional section header)
- (kill-goal label `HOST_MISSION_SUCCESS_LABEL` already exists.)

---

## Item #14 / D7 — Pending Confirmations panel (full host control)

### Current state

- **Data (post-`05`):** each `Player` carries `pendingEliminations?: PendingElimination[]`
  (`05 §2a`), each entry `{ assassinId, assassinCallsign, taskDescription, claimedAt }`. Today
  (pre-`05`) the fields are the singular `pendingEliminationBy` / `pendingTaskDescription`
  (`types/index.ts:20-21`) — this panel is specified against the `05` queue and lands after it.
- **`confirmElimination` (`gameService.ts:362-417`):** derives the assassin **from the target's own
  record** — `const assassinId = targetData.pendingEliminationBy` (`:380`) — and performs **no
  caller-identity check** whatsoever. The victim's screen calls it with the victim's own id as the
  *targetId* (`[id].tsx:173` `confirmElimination(id!, user!.uid)`), but nothing binds the call to
  the caller: **host-on-behalf already works today** by passing any `targetId`. Confirmed.
  - Under `05 §4c` the signature gains an optional `assassinId`:
    `confirmElimination(gameId, targetId, assassinId?)` — omitted ⇒ resolve queue **head** (FIFO,
    victim's own screen); provided ⇒ resolve **that specific** queued entry (host panel). This is
    exactly what the panel needs to Confirm a chosen row when a shared target has several stacked
    claims.
- **`denyElimination` (`gameService.ts:241-247`):** clears the singular pending fields; no caller
  check. Under `05 §4d` it becomes `denyElimination(gameId, targetId, assassinId?)` removing just
  the selected entry.
- **`adminForceEliminate` (`gameService.ts:419-524`):** the **separate** no-credit removal
  (`incrementKillCount:false`, `eliminatedBy:'ADMIN'`). `05 §4g` redefines the infinite branch as a
  permanent removal (target does **not** respawn) that reassigns orphaned hunters. Keep it distinct
  from confirm-on-behalf — the credit difference matters for score-attack (D7). Do **not** merge.
- **UI today:** the Host tab has **no** pending panel. The compromised handshake is **target-only**
  — `[id].tsx:382` gates the full-screen Compromised view on `me?.pendingEliminationBy` (→ post-`05`
  `me?.pendingEliminations?.length`), and only that player can Confirm/Deny from their own screen.
  The host has no visibility into who is pending.
- **Host auth:** there is **no server-side check** that the caller is the host on
  `confirmElimination` / `denyElimination` / `adminForceEliminate` — any client can call them
  (pre-existing; Firestore has no rules restricting these writes). See hardening note below.

### Changes

**Add a "Pending Confirmations" panel to `HostSettingsView`** (ACTIVE only; both modes, though it
will hold ≥2 entries only in infinite shared-target cases — classic queues hold 0/1 per `05 §2a`).

Build the flat list in `[id].tsx` (or a small selector) from the live `players` array:
```ts
type PendingRow = {
  targetId: string; targetCallsign: string;
  assassinId: string; assassinCallsign: string;
  taskDescription: string; claimedAt: number;
};
const pendingRows: PendingRow[] = players.flatMap((p) =>
  (p.pendingEliminations ?? []).map((e) => ({
    targetId: p.uid, targetCallsign: p.callsign,
    assassinId: e.assassinId, assassinCallsign: e.assassinCallsign,
    taskDescription: e.taskDescription, claimedAt: e.claimedAt,
  })),
).sort((a, b) => a.claimedAt - b.claimedAt);   // global FIFO for display
```
Pass `pendingRows` + two callbacks into `HostSettingsView`:
```ts
onConfirmPending?: (targetId: string, assassinId: string) => void;
onDenyPending?: (targetId: string, assassinId: string) => void;
pendingRows?: PendingRow[];
```

Panel render (new section in `HostSettingsView`, above the leaderboard, gated
`isGameActive && pendingRows.length > 0`):
- Section header `HOST_PENDING_CONFIRMATIONS_LABEL` with a count.
- One row per entry showing **`assassinCallsign → targetCallsign`** and the mission
  (`taskDescription`) as a subtitle (`AgentRow`-style or a compact custom row), plus two buttons:
  - **Confirm** (`variant="primary"`/accent) → `onConfirmPending(targetId, assassinId)`.
  - **Deny** (`variant="ghost"` or subtle danger) → `onDenyPending(targetId, assassinId)`.
- Empty state: hide the section entirely (no "nothing pending" copy — the absence *is* the signal;
  D7: "the pending list is the notification set").

Handlers in `[id].tsx`:
```ts
const handleConfirmPending = useCallback(async (targetId: string, assassinId: string) => {
  try { await confirmElimination(id!, targetId, assassinId); }
  catch (e) { /* swallow NO_PENDING_ELIMINATION race (below); else showAlert */ }
}, [id]);
const handleDenyPending = useCallback(async (targetId: string, assassinId: string) => {
  try { await denyElimination(id!, targetId, assassinId); }
  catch (e) { /* same race handling */ }
}, [id]);
```

**Confirm vs. force-remove stay separate.** The panel's Confirm = `confirmElimination`
(**credits** the assassin, victim respawns, `respawnCount+1`). The roster's Eliminate button
(`HostSettingsView.tsx:118-126` → `adminForceEliminate`) = **remove without credit** (`05 §4g`
permanent removal + hunter reassignment). Two visibly different actions in two different sections;
never collapse them.

**Richer per-player state chips.** Enhance the roster rows (`HostSettingsView.tsx:99-129`) — all
fields already exist on `Player`, no schema change:
- Status chip: `ALIVE` (or `WINNER`/`ELIMINATED` at end).
- `target` — `targetCallsign` (who they hunt).
- `killCount` — eliminations made (already shown as `trailing`, `:112-116`).
- `respawnCount` — times eliminated (D8).
- `rerollsUsed` / `maxRerolls` — swaps spent.
- **pending count** — `pendingEliminations?.length` (how many assassins are queued on them).

Compose these as small icon+number chips (align with D9 typography / `02` icon usage). Keep the
existing per-player Eliminate button for force-remove.

**Recommendation — panel OVER a separate notification center (D7, explicit).** Do **not** build a
separate notifications surface. A live-rendered list off the `players` snapshot is already the
complete, self-updating set of everything awaiting host action; a second notification store would
duplicate state, risk drift from the source of truth, and add reconciliation work. The panel is the
notification center. (D7: "A separate 'notification center' is not built.")

### Edge cases & hardening

- **Benign `NO_PENDING_ELIMINATION` race.** If the victim confirms/denies from their own screen at
  the same moment the host clicks the panel row, whichever transaction lands second finds the entry
  already popped and throws `NO_PENDING_ELIMINATION` (`gameService.ts:381`, and its `05 §4c` queue
  equivalent when the specific `assassinId` is gone). This is **harmless** — the desired outcome
  already happened. In `handleConfirmPending`/`handleDenyPending`, swallow this specific error
  silently (match on `serviceErrors.NO_PENDING_ELIMINATION`); surface only other errors via
  `showAlert`. The live snapshot removes the row on its own once the write commits.
- **No server-side host auth (pre-existing DEBT).** `confirmElimination`, `denyElimination`, and
  `adminForceEliminate` perform no caller/host check — any client with the game id could call them.
  This predates the overhaul and is **not** introduced here; the panel merely gives the host a UI
  for calls the host is already the intended caller of. **Optional hardening (out of scope for this
  workstream, tie to backlog DEBT-1):** add Firestore Security Rules restricting writes that clear
  `pendingEliminations` / set `status:'ELIMINATED'` by admin to `request.auth.uid == game.hostId`
  (or move these to a callable Cloud Function). Note it in the ADR / backlog; do not block the panel
  on it.

### New strings referenced (owned by `02-terminology`)

- `HOST_PENDING_CONFIRMATIONS_LABEL`
- `HOST_PENDING_CONFIRM_BUTTON`
- `HOST_PENDING_DENY_BUTTON`
- `dynamicStrings.pendingRowSummary(assassinCallsign, targetCallsign)` — the `A → B` line.
- Roster chip labels/icons for `respawnCount`, `rerollsUsed`, pending count (align with D8/D9;
  `02` owns final wording).

---

## Tests

**#6 / D4 — flow + defaults**
- `createGame` writes `mode:'INFINITE'` + `infiniteConfig` + `difficultySetting:'Easy'` (unit /
  integration against the Firestore mock). Assert `isInfiniteMode(createdGame) === true`.
- `configure.tsx` renders with Infinite preselected and Easy difficulty on a fresh doc (component
  test): `gameMode` state = `'infinite'`, kill-goal block visible, difficulty pill = Easy.
- Navigation: after reveal, host routes to `/game/configure?id=...`; after `handleAuthorize`, host
  routes to `/game/{id}` and the game is `LOBBY` (so `[id].tsx` renders `GameLobbyView`).
- Regression: `grep` gate — no runtime references to `'CONFIGURING'` remain after removal; type +
  schema compile without it.
- Joiner flow unchanged: `joinGame` unit tests still green.

**#13 / D6 — mid-game edits + join**
- `handleUpdateMaxRerolls` / `handleUpdateDifficulty` / `handleUpdatePacks` each `updateDoc` only
  their field; empty-packs update is a no-op.
- **Future-only proof:** a difficulty/packs change mid-game does not alter any existing player's
  `taskDescription`; the *next* `scrambleTask`/`confirmElimination` respawn draws from the new pool
  (assert `resolveAvailableTasks` reflects the updated `selectedPacks`).
- Mode control + raw roster edit are **absent** from the Host tab during ACTIVE (component test:
  no mode segment, no delete/rename control).
- Mid-game join (infinite): after `joinGame` on an ACTIVE infinite game, the newcomer has a valid
  independent target and **no existing player's `targetId` changed** (leans on `05 §4e`/§6 tests).
- Classic mid-game join still rejected (`OPERATION_ALREADY_IN_PROGRESS`).

**#14 / D7 — pending panel**
- `confirmElimination(gameId, targetId, assassinId)` resolves the **specific** queued entry;
  other entries on the same target remain (`05 §4c`/§5.2 fixtures).
- `denyElimination(gameId, targetId, assassinId)` drops only that entry; no credit awarded
  (`05 §5.3`).
- `confirmElimination` still derives assassin from the target record when `assassinId` omitted
  (head of queue) — host and victim paths both covered.
- `pendingRows` builder flattens every player's queue into `assassin → target : mission` rows,
  sorted by `claimedAt`.
- `NO_PENDING_ELIMINATION` from a double-resolve is swallowed (no alert) in the host handlers.
- Per-player chips render `killCount` / `respawnCount` / `rerollsUsed` / pending count from
  existing fields.
- `adminForceEliminate` remains no-credit and is reachable only via the roster Eliminate button
  (unchanged path).

**Gate:** `npm run verify` (lint + typecheck + check-contrast + jest) from `client/`.

---

## Acceptance criteria

**#6 / D4 — Configure before Create Game**
- [ ] Host flow is identity → configure → Create Game → **lobby** (host lands on the lobby to
      invite, not inside an already-started game).
- [ ] `configure.tsx` defaults to `gameMode='infinite'` and `difficulty='Easy'`.
- [ ] `createGame` writes `mode:'INFINITE'` + `infiniteConfig` (+ `difficultySetting:'Easy'`) so a
      bypass never yields silent Classic.
- [ ] `status:'CONFIGURING'` is **retired** from `types/index.ts` and `schemas.ts`; no runtime
      references remain.
- [ ] Joiner flow (`handleJoin` / `joinGame`) is unchanged and still works.

**#13 / D6 — Mid-game editable settings + join**
- [ ] Host tab exposes kill goal (already), `maxRerolls`, difficulty, and packs during ACTIVE
      (infinite).
- [ ] Difficulty + packs are labeled *applies to future missions only*; existing assignments are
      provably untouched by the change.
- [ ] Mode switch and manual roster add/remove/rename are **not** available mid-game.
- [ ] Mid-game join works for infinite with no bystander target disturbed; classic stays
      LOBBY-only.

**#14 / D7 — Pending Confirmations panel**
- [ ] Host tab shows a panel listing **every** queued pending elimination across all players as
      `assassin → target : mission`.
- [ ] Confirm calls `confirmElimination(gameId, targetId, assassinId)` (credits the assassin);
      Deny calls `denyElimination(gameId, targetId, assassinId)`; each acts on the specific entry.
- [ ] `adminForceEliminate` remains a **separate** remove-without-credit action.
- [ ] Per-player roster chips show ALIVE/target/killCount/respawnCount/rerollsUsed/pending-count.
- [ ] The benign `NO_PENDING_ELIMINATION` race is swallowed; the panel self-updates from the live
      snapshot.
- [ ] No separate notification center is built — the panel is the notification set.
- [ ] (Optional / DEBT-1) Server-side host-auth hardening for these writes is noted in the
      ADR/backlog, not blocking.
