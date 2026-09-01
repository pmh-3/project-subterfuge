# 00 — Locked Decisions (canonical)

> This is the **source of truth** for every product decision behind the overhaul. Every spec in this
> packet must conform to this file. If a spec and this file disagree, this file wins.
> Decisions were made by the product owner after a 5-track code investigation (Aug 2026).

## Legend
- **Mode terms:** *Classic* = single-elimination (last agent standing). *Infinite* = score-attack (kill goal).
- File:line references point at the code as it exists **before** the overhaul.

---

## D1 — Swap budget is per-game; only the Swap button charges it
- Swaps (rerolls) are a **fixed per-game budget** (`maxRerolls` on the game doc), **not** per-target.
- A new directive received via **respawn** (infinite) or **inheritance** (classic) must **NOT** decrement the
  budget. `rerollsUsed` only increments when the player explicitly taps **Swap**.
- Rationale: swaps must feel **consequential** — a set number for the whole game. Per-contract reset was
  rejected as "too easy."
- Today there is no literal decrement bug; `rerollsUsed` simply never resets (it is a per-game accumulator,
  written only at `startGame` `gameService.ts:200`, mid-join `:156`, and incremented in `scrambleTask` `:557`).
  The perceived bug is a **copy/UX** problem (see D8/terminology): a fresh contract shows the same depleted
  count. Fix = keep per-game semantics + make the copy say so + a refresh-style icon on the Swap control.
- **UI:** add a "refresh"/reroll icon to the Swap control (Tabler-style `refresh`).

## D2 — One shared swap budget spends on directive **or** target (infinite only)
- A single per-game budget. A swap can reroll **either** the directive **or** the target.
- Player-facing framing: *"You get X swaps per game. Swap your directive or your target — choose wisely."*
- **Target-swap is INFINITE-ONLY.** In classic mode the target chain is a strict cycle; a target swap there
  would break it, so classic offers **directive swap only**.
- Depends on D5 (only feasible cleanly under the independent-target model).

## D3 — Simplify + make terminology consistent; build a glossary
- Direction: **simplify the chrome, keep a light spy skin.** Retire synonyms; one canonical word per concept.
- Deliverable: a living **`docs/GLOSSARY.md`** (canonical terms + banned synonyms) + an ADR recording the
  decision. All **user-facing strings** conform; code identifiers may keep their names.
- Canonical table is in `02-terminology.md`.

## D4 — Configure happens **before** "Create Game"
- New flow: host picks settings **first**, then Create Game creates the doc, then land in the **lobby** to invite.
- **Defaults:** mode = **Infinite**, task difficulty = **Easy**.
- Retire old words per the canonical table as part of this screen's copy.
- The vestigial `status: 'CONFIGURING'` may be retired or repurposed — implementer's choice, documented in `04`.

## D5 — Infinite mode moves to **independent, lockable targets** (Option E). COMMITTED.
- **Classic** keeps the single-cycle model (unchanged).
- **Infinite** drops the cycle: each agent has an **independent** target; **multiple agents may share a target**.
- **No respawn cooldown.** Respawn is **instant** — there is **no** `RESPAWNING` status and no timer infra.
- On a kill, the assassin gets a **fresh random target + fresh directive** (never inherits). This removes the
  #12 information leak (including the 2-player directive leak) by construction.
- A player's target **only** changes when (a) they swap it, (b) they score a kill, or (c) their target leaves
  the game (host removal / quit — a legitimate, visible reason). **Never silently pulled out from under them.**
- **Shared-target confirmations STACK.** If several assassins catch the same target, each pending confirmation
  is **queued and preserved** (FIFO) — none is lost. The target (or host) confirms them **one at a time**;
  each confirmation credits that assassin and increments the target's respawn count. "Assassins line up."
- Full spec: `05-infinite-mode-independent-targets.md`. ADR: `adr-0007-infinite-independent-targets.md`.
- Win condition (`isGameOver`, kill goal) is **unchanged**.

## D6 — Mid-game editable settings + mid-game join
- **Editable mid-game (expose in Admin/Host tab):** kill goal (already shipped), `maxRerolls`, difficulty/packs
  (label clearly: *applies to future missions only*).
- **Never editable mid-game:** game **mode** (classic↔infinite corrupts state) and **manual roster edits**
  (route all roster changes through join / host-remove).
- **Mid-game join:** **supported in infinite** and made clean by D5 — a newcomer simply gets a random target +
  directive; **no existing player's target is disturbed.** (Classic remains pre-start join only.)

## D7 — Full host control: pending-confirmations panel
- Add a **Pending Confirmations** panel to the Host tab listing every queued pending elimination
  (`assassin → target : directive`), with host **Confirm** (credits the assassin) and **Deny** actions.
- Reuse the existing services: `confirmElimination` / `denyElimination` already derive the assassin from the
  target's record and check no caller identity, so the host can resolve on anyone's behalf. Under D5 these gain
  an optional `assassinId` to resolve a **specific** queued entry.
- Keep `adminForceEliminate` as a **separate** "remove without credit" action — do not merge (the credit
  difference matters for score-attack).
- A separate "notification center" is **not** built — the pending list is the notification set.

## D8 — Leaderboard shows kills made vs times eliminated, clearly labeled
- Two labeled numbers per agent: **"Eliminations made"** (`killCount`) and **"Times eliminated"**
  (infinite: `respawnCount`; classic: `status === 'ELIMINATED' ? 1 : 0`). Use **icons** to reduce wordiness.
- No new tracked field required. Sort by kills desc; tiebreak by fewer deaths.

## D9 — Typography: promote usages **and** bump tokens
- Prioritize the text players **need** to read: the **target callsign** and the **directive**.
- Un-mute + enlarge the leaderboard score; bump `labelMicro` (9px) and `label` (10px) up; enlarge the directive.
- Add a **coach card** (first-run) + **tooltips/subtitles** under jargon buttons.

---

## Cross-cutting engineering rules (apply to every workstream)
- **Pure logic first, test-first.** New/changed rules live in `client/src/features/game/gameLogic.ts` (zero
  Firebase imports) with unit tests **before** wiring. Firestore I/O stays in `gameService.ts`.
- **Types at boundaries:** update `client/src/types/index.ts` + `client/src/types/schemas.ts` (Zod) together;
  reads go through `firestoreParse.ts`.
- **Copy** lives only in `client/src/strings.ts` and must match `docs/GLOSSARY.md`.
- **Design system only** — tokens/primitives from `@/design-system`; no inline hex; `useAlert()` not `Alert.alert`.
- **Gate everything on** `npm run verify` (lint + typecheck + check-contrast + jest) from `client/`.
