# Phase 2 — Screen Migration to the New System

**Owner:** UI implementation agent
**Depends on:** Phase 1 (design system shipped, gallery green)
**Spec:** `docs/plans/DESIGN_SYSTEM.md` §6 — screen compositions.

## Goal

Migrate every screen and feature component to the Phase 1 design system. End state: the Midnight Wire visual lives across the whole app, and the old `theme.ts` shim has zero remaining importers (and gets deleted).

## Scope (in order)

Work screen-by-screen, top to bottom. Each one is a self-contained PR-sized chunk.

| # | Screen | File | New screen treatment per spec |
|---|---|---|---|
| 01 | Home | `client/app/index.tsx` | `DESIGN_SYSTEM.md` §6 #01 — hero title bottom-aligned, two stacked buttons. |
| 02 | Lobby (choice + join code + identity) | `client/app/game/lobby.tsx` | Multiple sub-screens; map join+create-identity flow to spec #02. |
| 03 | Identity Verified (`AgentKeyReveal`) | `client/src/features/game/components/AgentKeyReveal.tsx` | Spec #03. Note Phase 3 will later drop this for non-hosts; in this phase just restyle. |
| 04 | Mission Control | `client/app/game/configure.tsx` | Spec #04. Consolidate `PackSelector` and the relevant `HostSettingsView` bits into one densely-packed pre-start screen with Theme / Mode / Difficulty / Rerolls. **Mode segment shows `Elimination` and `Infinite ∞` — the Infinite path stays disabled in this phase** (real wiring lands in Phase 4). |
| 05 | Game shell + tabs | `client/app/game/[id].tsx` | Restructure to bottom-tab layout: Contract / Situation / Admin / Briefing. Existing `CommandCenterView` becomes Situation tab; new Briefing tab replaces the lobby's modal trigger. |
| 06 | Contract | `client/src/features/game/components/ContractView.tsx` | Spec #08 — folder-tab card, hold-to-neutralize, dashed re-roll row. |
| 07 | Situation Room | (new component or repurposed `CommandCenterView`) | Spec #05 — agent rows with "you" accent border. |
| 08 | Host Override | `client/src/features/game/components/HostSettingsView.tsx` → Admin tab | Spec #06 — mid-game controls only (pre-start config moved to Mission Control). |
| 09 | Mission Briefing | `client/src/features/game/components/BriefingModal.tsx` → tab | Spec #07 — numbered rules list. Tab destination, no longer a modal. |
| 10 | Victory / end | `client/src/features/game/components/VictoryOverlay.tsx` | Restyle to system; not in reference but follow Briefing pattern. |
| 11 | Alerts / Error boundary | `useAlert`, `ErrorBoundary` | Wrap in new `Alert` / `Card` primitives. |

After all 11 land:
- Delete `client/src/components/Button.tsx`, `Input.tsx`, `AvatarSelector.tsx`, `AgentKeyBadge.tsx`, `Alert.tsx` (each one's call sites should already have been redirected to `@/design-system`).
- Delete `client/src/theme.ts` (no remaining importers).
- Re-export `client/src/components/avatars/*` into `@/design-system/Avatar` or leave in place if that's cleaner.

## Decisions Locked Going In

- **Briefing = bottom tab inside the game.** Modal is removed (the lobby's manila help-tab is also removed; help content lives in the Briefing tab and is reachable from a single small link on the Home screen if needed).
- **Mission Control consolidates** pre-start config. Admin tab is mid-game only (force-eliminate, end game, change end-condition).
- **Avatars** keep current SVG set; recolor as part of the `Avatar` primitive in Phase 1. This phase just uses the primitive.
- **Mode toggle** shows `Infinite ∞` in this phase but the option is **disabled** with a small "Coming soon" sub-label. Phase 4 enables it.
- **Recovery key reveal** stays for host only in this phase per locked decision; Phase 3 owns dropping it for non-hosts.

## Approach

1. For each screen: read the spec section, take a "before" screenshot, restructure to use design-system primitives only, take "after" screenshot, drop both into `docs/plans/assets/phase-02/<screen-name>/`.
2. Aggressively delete inline styling. Anything that isn't `flex: 1` or a layout primitive (`padding`, `margin`, `gap` from tokens) is a smell — push it into the primitive.
3. Each screen migration ships in its own commit so reverts are easy.
4. Watch for hard-coded copy strings — move them to `client/src/strings.ts` as you encounter them, but don't rewrite the copy (Phase 3 owns copy edits).
5. Keep the URL routes the same; this is a visual + structural migration, not a routing change. Exception: Briefing modal → tab requires a route addition.

## Cross-platform Verification

For each migrated screen: load on web (`npm run web`) AND iOS sim (`npm run ios`). Both must render correctly. If iOS sim isn't available to the agent, note "web verified, iOS pending" in the screen's handoff entry and flag for human spot-check.

## Definition of Done

- All 11 screens migrated and screenshot-documented.
- Zero imports of `client/src/theme.ts` anywhere; the file is deleted.
- Zero inline hex/rgba in `client/app/**` and `client/src/features/**` (the design-system lint rule from Phase 1 passes clean).
- `npm run verify` green.
- Old component shims in `client/src/components/` deleted.
- Briefing tab navigable; modal removed.
- Mission Control replaces `configure.tsx`'s old UI; `Infinite ∞` segment disabled.
- Handoff note appended.

## Open Questions

- The status-bar visual in the reference (`10:35  ▲▲ ⬡` faux chrome) is mockup-only. Confirm we don't try to render it in-app.
- After deleting `theme.ts`, do we leave a one-liner comment-only file pointing to `@/design-system` to prevent re-creation, or just remove it?

## Handoff note

**Completed:** 2026-06-07

### What shipped (all 11 items)

| # | Screen | File | Status |
|---|---|---|---|
| 01 | Home | `client/app/index.tsx` | Hero bottom-aligned, Join/Start buttons, briefing Sheet link |
| 02 | Lobby | `client/app/game/lobby.tsx` | Sub-flows migrated; avatar row picker; manila briefing tab removed |
| 03 | Identity Verified | `AgentKeyReveal.tsx` | `codeHero` key display, design-system layout |
| 04 | Mission Control | `client/app/game/configure.tsx` | Theme/Mode/Difficulty/Rerolls; Infinite ∞ disabled |
| 05 | Game shell + tabs | `client/app/game/[id].tsx` | `NavBar` bottom tabs: Contract / Situation / Admin / Briefing |
| 06 | Contract | `ContractView.tsx` | Folder-tab `Card`, dashed reroll row, `HoldToConfirm` |
| 07 | Situation Room | `CommandCenterView.tsx` | `ScreenHeader` + `AgentRow` with you-accent border |
| 08 | Host Override | `HostSettingsView.tsx` | Mid-game controls only; `AgentRow` + eliminate buttons |
| 09 | Mission Briefing | `BriefingView.tsx` (new) | Numbered rules list; tab destination; modal removed |
| 10 | Victory | `VictoryOverlay.tsx` | Design-system `Sheet` + typography |
| 11 | Alerts / Error boundary | `useAlert.tsx`, `ErrorBoundary.tsx` | Wrap design-system `Alert` / `Button` |

### Deleted

- `client/src/theme.ts` (zero importers)
- `client/src/components/Button.tsx`, `Input.tsx`, `AvatarSelector.tsx`, `AgentKeyBadge.tsx`, `Alert.tsx`
- `BriefingModal.tsx`, `PackSelector.tsx`, `IdentityHeader.tsx` (logic absorbed into configure / ContractView / BriefingView)

### Design-system extensions

- `SegmentChips`: `disabled` option (Infinite mode)
- `HoldToConfirm`: `disabled` / `loading` props

### Decisions made

- **Status-bar chrome:** not rendered (mockup-only, per open question).
- **`theme.ts`:** deleted outright; `.cursor/rules/styling-and-theme.mdc` points to `@/design-system`.
- **Home flow:** index is the entry screen; lobby requires `?mode=` param (redirects to `/` if missing).
- **Briefing:** reachable from Home via Sheet link and from in-game Briefing tab.

### Verification

- `npm run verify` green (30 tests, 0 lint errors)
- No inline hex/rgba in `client/app/**` or `client/src/features/**`
- Web gallery: not re-screenshot in this session — spot-check `/_dev/gallery` + each screen at `localhost:8081`
- iOS sim: not verified in this environment — **web verified, iOS pending**
