# 03 — UI / UX Spec: Typography, Leaderboard, Game-Code Cleanup, Onboarding

> Implements the UI/UX slice of the overhaul: **#4/D9 typography**, **#5/D8 leaderboard kills vs
> deaths**, **#8 remove game code from the active screen**, **#9/D9 flow + onboarding**.
> Conforms to `00-decisions.md` (D8, D9). Data-model context for the leaderboard numbers comes from
> `05-infinite-mode-independent-targets.md` (`killCount`, `respawnCount`, `pendingEliminations`).
>
> **String KEYS are owned by `02-terminology.md`** (not yet landed). This doc *references* keys by name
> (`INTEL_ELIMINATIONS_MADE`, `INTEL_TIMES_ELIMINATED`, `deathCount`, coach/tooltip keys); their exact
> English copy is defined there and must match `docs/GLOSSARY.md`. Do not add copy to `strings.ts` under a
> different name — coordinate with the terminology workstream.
>
> Engineering rules (from `00-decisions.md`): design-system tokens/primitives only, no inline hex, copy
> only in `strings.ts`, gate on `npm run verify` (lint + typecheck + check-contrast + jest) from `client/`.

---

## Overview

Four independent UI changes, orderable in any sequence (no shared code beyond `strings.ts`):

| # | Item | Primary files | Risk |
|---|------|---------------|------|
| #4 / D9 | Typography — promote usages **and** bump tokens | `design-system/tokens/typography.ts`, `ContractView.tsx`, `CommandCenterView.tsx`, `app/game/[id].tsx` | Low (visual only) |
| #5 / D8 | Leaderboard: two labeled numbers (kills vs deaths) + icons | `CommandCenterView.tsx`, new icon components, `gameLogic.ts` (sort) | Low |
| #8 | Remove game code from the active/leaderboard screen | `CommandCenterView.tsx`, `app/game/[id].tsx` | Low (prop cleanup) |
| #9 / D9 | First-run coach card, button subtitles, tab-name consistency | `ContractView.tsx`, new `CoachCard`, `app/game/[id].tsx`, `strings.ts` | Low–Med |

Guiding priority from **D9**: the text players actually *need* to read is the **target callsign** and the
**directive**. Those get first-class treatment; chrome (labels, codes, nav) is secondary.

---

## #4 / D9 — Typography

### Current state

Scale defined in `client/src/design-system/tokens/typography.ts`; `Text.tsx` maps `variant → style` via
`getTextVariantStyle` and applies `muted → colors.inkMuted` (`Text.tsx:24`).

Helpers:
- `tracking(fontSize, em)` — em→px letter-spacing (`typography.ts:4`).
- `typewriterSize(size)` — **floors Special Elite to 10px on Android only** (`typography.ts:9-11`). iOS/web get
  the raw size, so a 9px `labelMicro` renders **9px on iOS and web**.

Full scale (px = declared `fontSize`; typewriter variants pass through `typewriterSize`, Android-floored to 10):

| Variant | px | Family / weight | textTransform | Where used (representative) |
|---|---|---|---|---|
| `displayHero` | 46 | serif 600 | — | Landing / hero |
| `displayLarge` | 32 | serif 600 | — | **Target callsign** (`ContractView.tsx:57`) |
| `display` | 28 | serifMedium 500 | — | Winner callsign (`CommandCenterView.tsx:105`), compromised title (`[id].tsx:386`) |
| `title` | 26 | serifMedium 500 | — | Sheet/section titles, error text |
| `codeHero` | 64 | mono 400 | — | Big code display |
| `codeLarge` | 20 | mono 400 | — | — |
| `codeMedium` | 18 | mono 400 | — | **Game code value** in `GameCodeTag` (`GameCodeTag.tsx:21`) |
| `codeSmall` | 14 | mono 400 | — | — |
| `codeMicro` | 12 | mono 400 | — | — |
| `bodyInput` | 18 | sansLight 300 | — | **Directive** (`ContractView.tsx:69`, overridden to sansSemibold/600 via `styles.directive`) |
| `body` | 16 | sansMedium 500 | — | Callsign in `AgentRow` (`AgentRow.tsx:36`), briefing paragraphs |
| `bodySmall` | 14 | sansMedium 500 | — | **Leaderboard score** (`CommandCenterView.tsx:62`, muted), compromised sub-line (`[id].tsx:390`, muted), killed-by |
| `buttonLarge` | 14 | sansSemibold 600 | upper | Primary buttons |
| `buttonSmall` | 13 | sansSemibold 600 | upper | — |
| `buttonGhost` | 14 | sansMedium 500 | upper | Ghost buttons |
| `label` | **10** | typewriter 400 | upper | **Nav tabs** (`NavBar.tsx:37`), section headers (`CommandCenterView.tsx:69`), field labels (`ContractView.tsx:52,66`) |
| `labelLarge` | **10** | typewriter 400 | upper | — |
| `labelMicro` | **9** | typewriter 400 | upper | Winner sub (`CommandCenterView.tsx:106`), swap hint (`ContractView.tsx:82`), lobby hints, `GameCodeTag` label |
| `metaMicro` | 12 | typewriter 400 | upper | Pending-confirmation notice (`ContractView.tsx:93`) |

### Problems (legibility)

1. **Leaderboard score** is `bodySmall` (14px) **+ `muted`** (`CommandCenterView.tsx:61-65`) — the single most
   glanceable stat in infinite mode is small and low-contrast.
2. **`labelMicro` is 9px** and renders 9px on **iOS and web** (Android floors to 10 via `typewriterSize`). 9px
   uppercase typewriter is below the ~11px accessibility floor; used for winner sub-line, swap hint, etc.
3. **Directive** is effectively 18px (`bodyInput`, restyled to sansSemibold in `styles.directive`) — this is a
   *primary* read (what the player must do) yet barely larger than body.
4. **Nav tabs and section headers are 10px** (`label`) — usable but tight; the nav is the app's main wayfinding.
5. **Compromised sub-line** ("their objective was …") is `bodySmall` + `muted` (`[id].tsx:390`) on the most
   consequential screen in the game.

### Changes

Two levers, both applied (D9: *promote usages **and** bump tokens*).

#### (a) Promote usages — bigger/un-muted where the text matters

1. **Leaderboard score** (`CommandCenterView.tsx:61-65`) — un-mute and enlarge. Change `renderKillMetric`
   (which becomes the two-number metric in #5) from `variant="bodySmall" muted` to **`variant="body"`
   (16px), not muted**, with the icons carrying secondary color. Numbers read at full ink.
2. **Directive** (`ContractView.tsx:69`) — bump from `bodyInput` (18px) to **~20–22px**. Preferred: add a
   dedicated `directive` variant (see token edits) at **21px**, sansSemibold 600, `lineHeight ~28`, and use it
   instead of `bodyInput` + the local `styles.directive` override. Keeps the "what you must do" line clearly
   the largest body text on the Contract card, second only to the target callsign.
3. **Target callsign** (`ContractView.tsx:57`) — already `displayLarge` (32px); **keep**, it is correctly the
   single largest element. Ensure it is never truncated (numberOfLines unset / wraps). This is the #1 priority
   text per D9; no size change needed, just protect it.
4. **Compromised sub-line** (`[id].tsx:390`) — bump from `bodySmall` + `muted` to **`body` (16px), not muted**.

#### (b) Bump tokens — raise the small typewriter labels

Exact edits in `client/src/design-system/tokens/typography.ts`:

```diff
- label: labelBase(10, 0.22),
- labelLarge: labelBase(10, 0.28),
- labelMicro: labelBase(9, 0.12),
+ label: labelBase(12, 0.20),
+ labelLarge: labelBase(12, 0.26),
+ labelMicro: labelBase(11, 0.12),
```

Rationale for the tracking tweak: at larger px the same *em* tracking yields more absolute px; nudge `label`
em down slightly (0.22→0.20) so 12px uppercase typewriter doesn't over-space. `labelMicro` em unchanged.

Add a **`directive`** variant for lever (a) item 2 (so the Contract screen stops hand-rolling `styles.directive`):

```ts
// in TextVariant union
| 'directive'
// in textVariants
directive: {
  fontFamily: fontFamily.sansSemibold,
  fontSize: 21,
  fontWeight: '600',
  letterSpacing: tracking(21, 0.01),
  lineHeight: 21 * 1.35,
},
```

Then in `ContractView.tsx` replace `variant="bodyInput" style={styles.directive}` with `variant="directive"`
and delete the `styles.directive` block (its font overrides become the token).

> After bumping `labelMicro` to 11 and `label`/`labelLarge` to 12, the Android `typewriterSize` floor (10) is
> now below every label token, so it only ever affects `metaMicro` edge cases — leave `typewriterSize` as-is;
> it remains a correct safety net. Update `typography.test.ts` expectations if any assert the old sizes
> (current test asserts `typewriterSize(7)===10` and `typewriterSize(12)===12`, both still valid — no change
> needed there, but add coverage for the new token sizes, see Tests).

#### `allowFontScaling` decision

- **Keep RN's default `allowFontScaling={true}`** for the reader-critical text (target callsign, directive,
  body, leaderboard numbers, compromised copy) so OS Dynamic Type / font-size accessibility settings are
  honored. Do **not** globally disable scaling.
- To protect the **fixed-width chrome** (uppercase typewriter `label`/`labelLarge`/`labelMicro` in the nav bar
  and tight tags) from breaking layout at extreme scales, set a **`maxFontSizeMultiplier` of ~1.4** on those
  label variants (via a prop on `Text` where the variant is a label used in a constrained row: `NavBar`,
  `GameCodeTag`). This is a cap, not a disable — small type still scales up to a point. Implement as an opt-in
  `Text` prop pass-through; do not bake a global cap into `Text` (body/directive must scale freely).

### Accessibility rationale

- Minimum on-screen body/interactive text target is **~11px**; bumping `labelMicro` 9→11 clears the floor on
  **iOS/web** (Android already floored to 10, now 11). `label` 10→12 improves the nav and section headers.
- `check-contrast.js` audits **color pairs only** (WCAG 4.5:1), not size. `inkMuted` already passes contrast,
  so un-muting the leaderboard score is a *legibility/emphasis* win rather than a contrast fix — but combining
  small size **and** muted color is what made the score hard to read; removing the `muted` and enlarging both
  address it. No new color pairs are introduced, so `check-contrast` stays green.

### New strings referenced
None new for #4 (typography is token/variant-only). The `directive` restyle reuses existing directive copy.

### Tests
- `typography.test.ts`: assert new token sizes — `textVariants.label.fontSize === 12`,
  `textVariants.labelMicro.fontSize === 11`, and `textVariants.directive.fontSize === 21`. Keep existing
  `typewriterSize` assertions.
- Snapshot: update `ContractView` / `CommandCenterView` / `Home` snapshots that capture the changed sizes.
- `npm run check-contrast` must pass unchanged (no new color pairs).

### Acceptance criteria
- [ ] `labelMicro` renders **≥ 11px** on iOS/web; `label`/`labelLarge` render **12px**.
- [ ] Directive renders at **~21px** via a `directive` variant; `styles.directive` override removed from `ContractView`.
- [ ] Leaderboard score is **not muted** and renders at **body (16px)**.
- [ ] Compromised sub-line renders at **body (16px), not muted**.
- [ ] Target callsign unchanged at `displayLarge` (32px) and never truncated.
- [ ] `allowFontScaling` left enabled for reader text; label chrome capped at `maxFontSizeMultiplier ≈ 1.4`.
- [ ] `npm run verify` green.

---

## #5 / D8 — Leaderboard: eliminations made vs times eliminated

### Current state

`CommandCenterView.tsx:61-65` renders **only** `killCount` as `dynamicStrings.eliminationCount(n)` →
`"N Elimination(s)"` (`strings.ts:233-234`). This is ambiguous: a reader can't tell kills-scored from
times-died, and infinite mode's whole point is score-attack. The metric sits in `AgentRow`'s **`trailing`**
slot (`AgentRow.tsx:15,48`; wired at `CommandCenterView.tsx:80`).

`sortPlayersByLeaderboard` (`gameLogic.ts:341-347`) sorts by `killCount` desc, tiebreak `callsign` — **no
death tiebreak** yet.

Fields already exist on `Player` (`types/index.ts:24-25`): `killCount?`, `respawnCount?`, plus `status`
(`:16`) and `eliminatedBy` (`:23`). **No schema change is required** — confirmed: both numbers derive from
existing fields.

### Changes

**Two labeled numbers in the trailing slot, using icons to cut wordiness (D8).**

Compute both values per row via a pure helper in `gameLogic.ts`:

```ts
// gameLogic.ts — pure, mode-aware
export function getDeathCount(player: Pick<Player,'respawnCount'|'status'>, isInfinite: boolean): number {
  return isInfinite ? (player.respawnCount || 0) : (player.status === 'ELIMINATED' ? 1 : 0);
}
```

- **Eliminations made** = `player.killCount || 0` (both modes).
- **Times eliminated** = `getDeathCount(player, isInfinite)` →
  - **infinite:** `respawnCount` (a death that respawned; may exceed 1),
  - **classic:** `status === 'ELIMINATED' ? 1 : 0` (single life).

Replace `renderKillMetric` with a two-metric renderer (still passed as `AgentRow trailing`), e.g.:

```tsx
const renderScore = (player: Player) => (
  <Row gap={4} align="center">
    <Row gap={1} align="center" accessibilityLabel={dynamicStrings.eliminationsMadeA11y(kills)}>
      <IconTarget size={14} color={colors.inkSecondary} />
      <Text variant="body">{kills}</Text>
    </Row>
    <Row gap={1} align="center" accessibilityLabel={dynamicStrings.timesEliminatedA11y(deaths)}>
      <IconSkull size={14} color={colors.inkSecondary} />
      <Text variant="body">{deaths}</Text>
    </Row>
  </Row>
);
```

Notes:
- Uses the **un-muted `body` (16px)** number from #4 (a); icons carry `inkSecondary`.
- **Icons** (Tabler-style, following the existing `IconShuffle` pattern — `react-native-svg` `Path`, `size` +
  `color` props, exported from `design-system/index.ts`):
  - `IconTarget` — crosshair / target ring = **eliminations made** (kills).
  - `IconSkull` — skull / downed marker = **times eliminated** (deaths).
  - Add `client/src/design-system/components/IconTarget.tsx` and `IconSkull.tsx`; export both from
    `design-system/index.ts` alongside `IconShuffle` (`index.ts:13`).
- **Accessibility:** the visual is icon+number (no visible words), so each metric needs an
  `accessibilityLabel` from the plain-language strings (`INTEL_ELIMINATIONS_MADE` / `INTEL_TIMES_ELIMINATED`)
  so screen readers announce "3 eliminations made, 1 time eliminated". Icons alone are not self-describing.
- Keep the display compact so it fits the row's trailing slot next to a wrapping callsign.

**Sort** — update `sortPlayersByLeaderboard` to tiebreak by **fewer deaths** before callsign. It must know the
mode to compute deaths; pass `isInfinite` (the only caller is `CommandCenterView.tsx:41`, already gated on
`isInfinite`):

```ts
export function sortPlayersByLeaderboard(players: Player[], isInfinite = true): Player[] {
  return [...players].sort((a, b) => {
    const killDiff = (b.killCount || 0) - (a.killCount || 0);
    if (killDiff !== 0) return killDiff;
    const deathDiff = getDeathCount(a, isInfinite) - getDeathCount(b, isInfinite); // fewer deaths first
    if (deathDiff !== 0) return deathDiff;
    return a.callsign.localeCompare(b.callsign);
  });
}
```

`dynamicStrings.eliminationCount` becomes unused after this change — remove it (and `INTEL_ELIMINATION` /
`INTEL_ELIMINATIONS` if nothing else references them; grep first). New copy lives in `02-terminology.md`.

### New strings referenced (owned by `02-terminology.md`)
- `INTEL_ELIMINATIONS_MADE` — label / a11y for kills ("Eliminations made").
- `INTEL_TIMES_ELIMINATED` — label / a11y for deaths ("Times eliminated").
- `deathCount(n)` — dynamic pluralizer for the times-eliminated number (and/or the a11y helpers
  `eliminationsMadeA11y(n)` / `timesEliminatedA11y(n)` built on those two labels).

### Tests
- `gameLogic` unit: `getDeathCount` — infinite returns `respawnCount`; classic returns 1 iff `ELIMINATED`.
- `gameLogic` unit: `sortPlayersByLeaderboard` — equal kills → fewer deaths ranks higher; equal kills+deaths →
  callsign order.
- `CommandCenterView` snapshot/smoke: renders both numbers with both icons; screen-reader labels present.
- `npm run verify` green (typecheck catches the new `sortPlayersByLeaderboard` signature at the call site).

### Acceptance criteria
- [ ] Each leaderboard row shows **two** numbers: kills (target icon) and deaths (skull icon).
- [ ] Infinite deaths = `respawnCount`; classic deaths = `ELIMINATED ? 1 : 0`.
- [ ] Sort = kills desc → fewer deaths → callsign; verified by unit test.
- [ ] Icons have text/`accessibilityLabel` equivalents for screen readers.
- [ ] No Firestore schema change; `killCount`/`respawnCount`/`status` reused as-is.
- [ ] `dynamicStrings.eliminationCount` removed; new keys sourced from `02-terminology.md`.

---

## #8 — Remove game code from the active / leaderboard screen

### Current state (confirmed)

- The **only** active-play game-code display is the `GameCodeTag` in the **Leaderboard header** of
  `CommandCenterView.tsx:119-130` (`ScreenHeader trailing`, rendered whenever `gameId && onCopyGameCode` — i.e.
  ACTIVE **and** COMPLETED, since `CommandCenterView` is the SITUATION tab for both). Props feeding it:
  `gameId` and `onCopyGameCode` (`CommandCenterView.tsx:25-27,121-129`), passed from `[id].tsx:490-491`.
- The Situation tab **already** has an **INVITE AGENTS** button (`CommandCenterView.tsx:139-148`, gated on
  `onOpenInvite`) that opens `InviteAgentsSheet` — which itself shows the code + QR (`InviteAgentsSheet.tsx:40-41`).
  So removing the header tag does **not** strand the host: the code is still reachable one tap away via Invite.
- **Keep** the two legitimate code surfaces: `GameLobbyView.tsx:47` (lobby header) and
  `InviteAgentsSheet.tsx:41` (invite sheet). These are pre-start / invite contexts where the code belongs.

Rationale: during live play the code is clutter and a mild opsec/immersion break; it belongs to invitation,
not to the leaderboard.

### Changes

1. **`CommandCenterView.tsx`** — remove the `ScreenHeader trailing` `GameCodeTag` block (`:121-130`); the
   header becomes `<ScreenHeader title={strings.INTEL_HEADER_TITLE} />`.
2. Remove the now-unused props `gameId` and `onCopyGameCode` from `CommandCenterViewProps` (`:25-27`) and the
   destructure (`:35,38`). Drop the `GameCodeTag` import (`:12`) if unused elsewhere in the file (it is).
3. **`app/game/[id].tsx:483-493`** — at the `CommandCenterView` call site, remove `gameId={game.id}` and
   `onCopyGameCode={handleCopyGameCode}`. Leave `onOpenInvite` (Invite still works).
4. **Do not delete `handleCopyGameCode`** (`[id].tsx:281-284`) — it is still used by
   `InviteAgentsSheet onCopyCode` (`[id].tsx:554`) and `GameLobbyView onCopyGameCode` (`[id].tsx:474`).
   Removing it would break those; keep it.

### New strings referenced
None (removal only).

### Tests
- `CommandCenterView` snapshot: no `GameCodeTag` in the header for ACTIVE and COMPLETED states.
- Smoke: Invite button still present; opening the sheet still shows the code (unchanged path).
- `npm run verify` — typecheck confirms the removed props have no remaining references.

### Acceptance criteria
- [ ] No game code shown on the Situation/Leaderboard screen during ACTIVE or COMPLETED.
- [ ] Code still available in the **lobby header** and the **Invite Agents sheet**.
- [ ] `gameId` / `onCopyGameCode` props removed from `CommandCenterView` and its call site; `handleCopyGameCode` retained.

---

## #9 / D9 — Flow + onboarding

### Current state

- The core loop is well summarized in `BriefingView` via `briefingParagraphs` (`strings.ts:221`, rendered
  `BriefingView.tsx:32-37,62-66`) — but it is **buried in the INFO tab**; a new player never sees it in flow.
- On start, `[id].tsx:132-137` jumps `LOBBY → ACTIVE` **straight to the CONTRACT tab** with **no explanation** —
  the player lands on "NEUTRALIZE TARGET / SWAP DIRECTIVE" cold.
- The primary Contract action `CONTRACT_NEUTRALIZE_TARGET` ("NEUTRALIZE TARGET", `strings.ts:154`) and
  `CONTRACT_SWAP_DIRECTIVE` are jargon with **no plain-language helper** (`ContractView.tsx:74-81,98-105`).
- **Tab-name inconsistency (3 names for 1 screen):** the nav tab `key: 'SITUATION'` shows label
  `GAME_TAB_LEADERBOARD` ("LEADERBOARD") when active/completed and `GAME_TAB_LOBBY` ("LOBBY") in lobby
  (`[id].tsx:324-327`); the same screen's header title is `INTEL_HEADER_TITLE` = "LEADERBOARD"
  (`CommandCenterView.tsx:120`) and its internal key is "Situation". A player sees **Situation / Leaderboard /
  Lobby** for what is one destination.
- **Destructive actions are now single-tap.** `HoldToConfirm` / `useHoldToConfirm` were **removed** (see repo
  git status: `D client/src/design-system/components/HoldToConfirm.tsx`, `D client/src/hooks/useHoldToConfirm.ts`).
  So NEUTRALIZE TARGET, confirm-elimination, force-eliminate, end-game are all **immediate** on tap.
- `@/utils/storage` (`storage.get/save/delete`, SecureStore→AsyncStorage fallback) is already used for
  one-time UI flags (e.g. the mid-join banner, `[id].tsx:245-259`) — reuse it for first-run flags.

### Changes (prioritized)

#### HIGH — First-run Coach Card on the first Contract view

Add a one-time, dismissible **coach card** shown the first time a player lands on the CONTRACT tab of any game,
bridging the abrupt LOBBY→CONTRACT jump (`[id].tsx:135-137`).

- New component `client/src/features/game/components/CoachCard.tsx` (or a `design-system` `CoachCard` if reused):
  a `Card` with a short 2–3 line explanation of the loop (find your target → get them to do the directive →
  NEUTRALIZE → confirm), and a single **"GOT IT"** dismiss button.
- Content: a condensed version of `briefingParagraphs` (do **not** dump all of INFO). Keep it to the one loop
  sentence + "tap NEUTRALIZE when they comply."
- **Placement:** rendered at the top of `ContractView` (above the target card) OR as an overlay on first
  CONTRACT render. Prefer inline-at-top so it doesn't block the screen.
- **One-time + dismissible via `@/utils/storage`:** key **`coach_contract_seen`** (global, not per-game — a
  player learns the loop once). On mount, `storage.get('coach_contract_seen')`; render the card only if unset.
  On dismiss, `storage.save('coach_contract_seen', '1')` and hide. Mirror the existing mid-join-banner pattern
  (`[id].tsx:245-259`) for the async read/one-shot guard. State lives in `[id].tsx` (which owns storage and the
  tab), passed to `ContractView` as `showCoach` + `onDismissCoach`, keeping `ContractView` presentational.

#### MED — Tooltips / subtitles under jargon buttons

Add plain-language helper text under the primary Contract action so "NEUTRALIZE TARGET" is self-explanatory
without opening INFO.

- In `ContractView.tsx`, under the NEUTRALIZE button (`:98-105`), add a `labelMicro`-ish subtitle (now ≥11px
  after #4) reading the plain-language `CONTRACT_NEUTRALIZE_HINT` (e.g. "Tap when your target completes the
  directive"). Mirror the existing swap-hint pattern (`ContractView.tsx:82-84`, `styles.swapHint`).
- Optionally add `CONTRACT_SWAP_DIRECTIVE_HINT` clarifying that swapping burns a limited swap (the count is
  already shown via `objectiveSwapsLeft`). Keep it to one line each; do not over-explain.
- These are **static subtitles**, not hover tooltips (touch UI). No new component required — reuse `Text` +
  `Stack`, following the swap-hint layout.

#### MED — Fix the 3-names-for-one-screen tab inconsistency

Pick **one** canonical name for the shared roster/standings destination and use it everywhere. Canonical word
is owned by `02-terminology.md` / `docs/GLOSSARY.md`; this doc specifies the *mechanical* consolidation:

- The nav tab label should be **stable** (not swap LEADERBOARD↔LOBBY↔Situation). Options: (a) one label always
  (e.g. the glossary's canonical roster word) regardless of phase, or (b) keep at most a lobby vs in-play
  distinction if the terminology doc mandates it — but eliminate the **third** name ("Situation") from
  user-facing surfaces. The internal `TabKey` `'SITUATION'` may keep its identifier (code identifiers are
  exempt per D3); only user-visible strings must unify.
- Align `INTEL_HEADER_TITLE` (`CommandCenterView.tsx:120`) with the chosen tab label so the header and the tab
  match.
- Touch-points: `[id].tsx:324-327` (tab label), `strings.ts:128-132` (`GAME_TAB_*`),
  `strings.ts:166` (`INTEL_HEADER_TITLE`). Exact strings from `02-terminology.md`.

#### LOW — Flag: destructive actions are now single-tap (product confirmation)

`HoldToConfirm`/`useHoldToConfirm` were removed, so NEUTRALIZE TARGET (`ContractView.tsx:98-105`),
confirm-elimination / deny (`[id].tsx:394-409`), force-eliminate (`[id].tsx:565-571`), and end-game are all
**single-tap, immediate**. This is a **product decision to confirm**, not silently ship:
- If single-tap is intended (faster play, the removal was deliberate), the button-subtitle hints above partly
  mitigate accidental taps by clarifying intent — acceptable.
- If not, reinstate a lightweight confirm (e.g. the existing `useAlert()` confirm dialog, already used for
  force-eliminate via the `Sheet` at `[id].tsx:557-579`) on the most destructive irreversible actions
  (end-game, force-eliminate). **Do not** re-introduce `HoldToConfirm` without product sign-off.
- **Action:** surface to product owner; default (pending answer) = keep single-tap for NEUTRALIZE (reversible
  via deny), keep the existing `Sheet` confirm for force-eliminate/end-game which already exists.

### New strings referenced (owned by `02-terminology.md`)
- `COACH_CONTRACT_TITLE`, `COACH_CONTRACT_BODY`, `COACH_DISMISS` — coach card copy + "GOT IT".
- `CONTRACT_NEUTRALIZE_HINT` (and optionally `CONTRACT_SWAP_DIRECTIVE_HINT`) — button subtitles.
- Unified roster/standings tab label(s) replacing the LEADERBOARD/LOBBY/Situation split (`GAME_TAB_*`,
  `INTEL_HEADER_TITLE`).

### Tests
- `CoachCard` unit/smoke: renders when flag unset; calls `storage.save('coach_contract_seen','1')` and hides on
  dismiss; does **not** render when flag set (mock `storage`).
- `ContractView` snapshot: NEUTRALIZE subtitle present; coach card shown only when `showCoach`.
- Tab consistency: assert the SITUATION tab label and `INTEL_HEADER_TITLE` resolve to the **same** string.
- `npm run check-contrast` unchanged; `npm run verify` green.

### Acceptance criteria
- [ ] First-run coach card appears once on the first CONTRACT view and never again (persisted via
      `@/utils/storage` key `coach_contract_seen`); dismissible.
- [ ] Plain-language subtitle under NEUTRALIZE TARGET (and optionally SWAP DIRECTIVE).
- [ ] The shared roster/standings screen has **one** user-facing name across nav tab and header (no
      "Situation" leak); code identifier `TabKey` may remain.
- [ ] Single-tap destructive-action behavior explicitly confirmed with product; end-game/force-eliminate retain
      their existing `Sheet`/alert confirm.
- [ ] `npm run verify` green.

---

## Cross-item test summary

Run from `client/`:
- `npm run verify` = lint + typecheck + **check-contrast** + jest (the gate).
- **check-contrast** validates color pairs only; none of these items add color pairs, so it must stay green.
- Snapshot updates expected for `ContractView`, `CommandCenterView`, and any `typography`/`Home` snapshots.
- New unit tests: `getDeathCount`, `sortPlayersByLeaderboard` (death tiebreak), typography token sizes,
  `CoachCard` storage gating.

## Dependencies / coordination
- **`02-terminology.md`** owns every new string key referenced here (`INTEL_ELIMINATIONS_MADE`,
  `INTEL_TIMES_ELIMINATED`, `deathCount`, coach + hint keys, unified tab labels). This doc must land its copy
  before the components can import them; until then, stub against agreed key names.
- **`05-infinite-mode-independent-targets.md`** migrates `pendingEliminationBy`/`pendingTaskDescription` →
  `pendingEliminations[]`. The compromised-screen typography bump (#4, `[id].tsx:389-392`) is field-name
  agnostic, but coordinate so the enlarged sub-line reads the queue head's `taskDescription` after that
  migration lands.
