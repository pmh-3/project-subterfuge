# Phase 1 — Design System Build

**Owner:** Design-systems agent
**Depends on:** Phase 0
**Spec:** `docs/plans/DESIGN_SYSTEM.md` is the source of truth for every token, component, and rule in this phase. Implement it faithfully. Deviations require an ADR.

> **Ordering note.** This used to be Phase 2 ("systemize after re-skin"). Flipped per decision: build the system first, then Phase 2 migrates screens onto it. Saves one pass through every screen.

## Goal

Stand up `client/src/design-system/` with tokens and primitive components implementing the Midnight Wire spec. **No screen changes in this phase.** Existing screens keep rendering with old `theme.ts` values — that file becomes a temporary deprecation shim that re-exports new tokens under old names. Phase 2 will swap screens over to the new primitives.

## Scope

In:
- `client/src/design-system/tokens/` — `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `elevation.ts`, `motion.ts`, `index.ts`. Values exact per `DESIGN_SYSTEM.md` §2–4.
- `client/src/design-system/components/` — primitives per `DESIGN_SYSTEM.md` §5. Initial set: `Button`, `IconButton`, `Input`, `Card` (incl. folder-tab variant), `Rule`, `Stack`, `Row`, `Text` (with variant prop), `Divider`, `Badge`, `Modal`/`Sheet`, `Alert`, `Avatar`, `ScreenHeader`, `NavBar`, `AgentRow`, `SegmentChips`, `PillSegments`, `HoldToConfirm`. Each in its own file.
- `client/src/design-system/index.ts` barrel.
- `client/src/design-system/examples/Gallery.tsx` — dev-only route (gated by `__DEV__`) rendering every primitive × variant against `background`. Route registered under `app/_dev/gallery.tsx`.
- `client/src/design-system/README.md` — token cheat-sheet + "when to use what" matrix + "add a primitive" recipe.
- `client/src/theme.ts` — reduced to a re-export shim mapping every old token name → its new design-system equivalent. Mark file `@deprecated`. Old token names (`paperWarm`, `surfaceFaint`, `surfaceTint`, `surfaceMuted`, `holdOverlay`, `statsBackground`, `darkOverlay`, `alertBackground`, `paper`) map to the closest new equivalent (or `background` / `surface` as catch-alls) so existing screens don't break.
- Path alias `@/` → `client/src/` in `tsconfig.json` + `babel.config.js` + `jest.config.js` `moduleNameMapper`. New design-system imports use `@/design-system`. (This is DEBT-2 from BACKLOG; landing it here keeps the system import path clean from day one.)
- `.cursor/rules/design-system.mdc` — pointer + lint rules (no inline hex/rgba outside the system; no shadow props; no `theme.ts` imports in new code).

Out (handled in Phase 2):
- Touching any file under `client/app/**` or `client/src/features/**`.
- Deleting `client/src/components/Button.tsx` etc. — those keep working via the old theme shim until Phase 2 swaps call sites.

## Inputs / Decisions Locked

- **Spec.** `DESIGN_SYSTEM.md`.
- **Reference.** `docs/plans/assets/midnight-wire-reference.jsx`.
- **Avatars.** Keep existing SVG set (`client/src/components/avatars/`); recolor/re-weight for the light background as part of building the `Avatar` primitive. No emoji.
- **Path alias.** `@/*` (single char), not `~/` and not a scoped name.
- **Fonts.** Cormorant Garamond, Outfit, Special Elite (already installed), JetBrains Mono — packages installed in Phase 0. Load in `app/_layout.tsx` via `useFonts`; on web the design-system README documents the `@import` fallback.

## Approach

1. **Tokens first.** Land all six token files. `theme.ts` becomes a shim that re-exports from `@/design-system/tokens`. Run the app — nothing should change visually.
2. **Path alias.** Land `@/` in tsconfig, babel, and jest. Codemod is not required yet; only the design-system files use `@/` for now.
3. **Type primitive first** (`Text`). Every other primitive depends on it. All variants from `DESIGN_SYSTEM.md` §3 enumerated, default styling baked in (uppercase + letter-spacing for label variants).
4. **Layout primitives** (`Stack`, `Row`, `Rule`, `Divider`, `Card`). These are tiny and unblock everything else.
5. **Form primitives** (`Button`, `IconButton`, `Input`, `SegmentChips`, `PillSegments`, `HoldToConfirm`).
6. **Composite primitives** (`Avatar`, `Badge`, `AgentRow`, `ScreenHeader`, `NavBar`, `Modal`/`Sheet`, `Alert`).
7. **Gallery.** Build it as you go — every new primitive shows up there immediately with all variants. Gallery is the validation surface for this phase.
8. **README + rule.** Write the README from the gallery (it should be derivable). Add `.cursor/rules/design-system.mdc`.

## Cross-platform Gotchas

These bit the original implementation; explicitly check during this phase:

- `letterSpacing` in React Native is **absolute pixels**, not `em`. Define a helper `tracking(fontSize, em)` and use it in `typography.ts` token derivation.
- `textTransform: 'uppercase'` works on RN ≥0.55 — fine, but verify on iOS sim (sometimes glyph spacing differs).
- `rgba(...)` strings work on RN for `borderColor` and `backgroundColor`. Don't convert to 8-digit hex.
- Special Elite renders thin on Android at 7–8px. Use `Platform.select` to bump to 9 on Android only.
- Web fonts on Expo Router: existing `_layout.tsx` already has a web-only CSS injection block. Mirror that pattern for the new fonts so web doesn't FOUT.

## Definition of Done

- All listed primitives exist, importable from `@/design-system`.
- Gallery route renders every primitive × variant cleanly on **web AND iOS sim**. Screenshots of both attached to handoff note.
- `theme.ts` is a shim; all old token names still resolve.
- `npm run verify` green.
- `.cursor/rules/design-system.mdc` added.
- `client/src/design-system/README.md` written.
- Handoff note (appended below) lists: every primitive shipped, any spec deviations + ADR link, anything the spec didn't anticipate.

## Things Phase 2 Will Care About (record discoveries here)

- Tokens or primitives the spec missed.
- Primitives that turned out to need additional variants.
- Components in `client/src/components/` that map 1:1 to new primitives (so Phase 2 can codemod them).

## Open Questions

- Modal/Sheet API: declarative `<Modal open=...>` or imperative `useSheet()` hook? Recommend declarative for predictability; existing `useAlert()` stays as a convenience wrapper.
- `HoldToConfirm` reuses the existing `useHoldToConfirm` hook untouched; only the visual shell changes. Confirm.
