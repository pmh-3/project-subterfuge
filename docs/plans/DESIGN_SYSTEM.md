# Midnight Wire — Design System Specification

> Source of truth distilled from the reference mockup `midnight-wire-all-screens.jsx`. This doc feeds **Phase 1** (visual restyle) and **Phase 2** (tokenization into `client/src/design-system/`). When the Phase 2 agent writes `client/src/design-system/README.md`, it should mirror this document with implementation notes layered on top.
>
> Reference file should be copied into the repo at `docs/plans/assets/midnight-wire-reference.jsx` before Phase 1 starts so it doesn't drift away from `~/Downloads`.

---

## 1. Design Philosophy

Cold-war espionage dossier, **lit on a bright desk**. Aged-paper warmth, near-black ink, restrained olive only when something is active. Modern, minimal layout — 1960s flavor comes from typography choices, not from skeuomorphic decoration.

**Inviolable rules.** Encode these as lint targets / code-review tripwires in Phase 2:

- **No shadows.** Anywhere. (The only shadow in the reference is on the phone-frame mockup chrome.)
- **No gradients.**
- **No decorative imagery, no scuffed-paper textures, no rubber stamps.** The previous "Cold War Bureau" treatment is gone.
- **One accent color only: olive.** Used exclusively for *active* states (selected tab, current player, focused field). Never for static decoration.
- **Ruled lines, not boxes.** Sections separate with a 1px horizontal rule (`border` color), not with new background panels.
- **Typewriter font is metadata only.** Labels, op codes, timestamps, "HOST" badges. Never body text, never primary buttons.
- **Border radius is 2px.** Universal. Only exceptions: 3px on card "folder tabs," 50% on avatar circles.

---

## 2. Color Tokens

Values are taken directly from the reference JSX. Semantic names below are the **canonical** names Phase 2 will use — they differ from the JSX shorthand (`C.ink`, `C.bg`) which is just a sketch.

| Token | Value | Use |
|---|---|---|
| `background` | `#F6F2E8` | Page background. Outermost surface on every screen. |
| `surface` | `#EEEADC` | Card / dossier tint. Sits on `background`. Also used for the status-bar strip in mockup chrome. |
| `surfaceHover` | `#EEEADC` | Hover state for ghost buttons (same value as `surface`). |
| `inkPrimary` | `#1C1408` | Primary text and primary-button fill. "Near-black, warm." |
| `inkSecondary` | `#5A4E30` | Secondary text (helper copy, deselected segment labels). |
| `inkMuted` | `#9A8E70` | Metadata, captions, deselected nav labels, placeholder text fallback. |
| `inkOnDark` | `#FDFBF6` | Text on `inkPrimary` (primary buttons) and on `danger` (neutralize button). Slight warmth — not pure white. |
| `accent` | `#2A3A18` | **Olive.** Active states only: selected nav indicator, current-player left-edge, op-code highlight, briefing step numbers. |
| `accentHover` | `#3A4F24` | Hover/pressed accent. |
| `accentTint` | `rgba(42,58,24,0.08)` | Faint olive fill for active backgrounds where the accent shouldn't dominate. |
| `accentText` | `#3A6A2A` | Olive used as *text* (e.g. "Identity Confirmed" label) — slightly brighter than `accent` for legibility at small sizes. |
| `success` | `#2A5A1A` | Confirmation copy (e.g. "✓ Target Neutralized"). |
| `successSurface` | `rgba(40,90,30,0.10)` | Confirmation card fill. |
| `successBorder` | `rgba(40,90,30,0.30)` | Confirmation card border. |
| `danger` | `#6E1C1C` | Maroon. "Neutralize" / "Eliminate" actions. Never used decoratively. |
| `dangerHover` | `#8A2424` | Hold-to-confirm fill animation; danger button hover. |
| `border` | `rgba(28,20,8,0.14)` | Default 1px border / horizontal rule. |
| `borderStrong` | `rgba(28,20,8,0.26)` | Selected-state border, input underline, strong card border. |
| `placeholder` | `rgba(28,20,8,0.30)` | Input placeholder text. |

**Deltas from earlier message:** the JSX uses `bg #F6F2E8` and `ink #1C1408` (warmer/slightly darker than the `#F8F4EC` / `#1A1608` floated mid-thought). Locking in the JSX values.

**What's gone.** The previous dark palette (`background` dark, `paper`/`paperWarm`, `surfaceFaint`/`surfaceTint`/`surfaceMuted`, `holdOverlay`, etc.) is fully retired. Phase 2 keeps old token *names* as deprecated re-exports pointing at the new values long enough to migrate, then deletes them.

---

## 3. Typography

Four families, each with a specific job. Mixing jobs is the most common drift to police.

| Family | Token | Use | Don't use for |
|---|---|---|---|
| Cormorant Garamond | `serif` | Display titles, screen titles, target name on Contract, agent initial in avatar circle. | Body copy, buttons, labels. |
| Outfit | `sans` | Body copy, button labels, list-item names, helper text, input text. | Numeric codes, metadata, screen titles. |
| Special Elite | `typewriter` | Labels, eyebrows, "STEP 1 OF 2," "HOST," "OP CODE," all-caps metadata. Always uppercase, always tracked. | Sentences. Anything you'd read more than three words of. |
| JetBrains Mono | `mono` | Agent Key digits, op code value, KEY 968, score numbers, segmented-control numeric values. | Anything that isn't a code or number. |

Web font loading: `@import` from Google Fonts:
```
Cormorant Garamond (400, 500, 600, italic-400)
Outfit (300, 400, 500, 600)
Special Elite (400)
JetBrains Mono (400, 500)
```

### Type scale

Derived from the JSX. Names are semantic; values are exact.

| Token | Family | Size | Weight | Letter-spacing | Line-height | Use |
|---|---|---|---|---|---|---|
| `displayHero` | serif | 46 | 600 | -0.01em | 0.95 | Home title ("Midnight Wire"). |
| `displayLarge` | serif | 32 | 600 | 0.01em | 1.0 | Contract target name. |
| `display` | serif | 28 | 500 | normal | 1.2 | Agent Setup title. |
| `title` | serif | 26 | 500 | normal | normal | Screen titles (Mission Control, Situation Room, etc). |
| `codeHero` | mono | 64 | 400 | 0.12em | 1.0 | Agent Key reveal digits. |
| `codeLarge` | mono | 20 | 400 | 0.18em | normal | Op Code in Contract header. |
| `codeMedium` | mono | 18 | 400 | normal | normal | Score in Situation Room rows. |
| `codeSmall` | mono | 13 | 400 | normal | normal | Rerolls segmented buttons. |
| `codeMicro` | mono | 9–11 | 400 | normal | normal | "KEY 968" sublabel, briefing step numbers. |
| `bodyInput` | sans | 18 | 300 | 0.02em | normal | Text input value. |
| `body` | sans | 13–14 | 400–500 | normal | 1.6 | Directive copy, briefing rules, list-item names. |
| `bodySmall` | sans | 11–12 | 500 | normal | 1.7 | Helper text under headlines. |
| `buttonLarge` | sans | 12 | 600 | 0.10em (uppercase) | normal | Primary buttons. |
| `buttonSmall` | sans | 11 | 600 | 0.10em (uppercase) | normal | Small primary buttons. |
| `buttonGhost` | sans | 12 | 500 | 0.08em (uppercase) | normal | Ghost / secondary buttons. |
| `label` | typewriter | 8 | 400 | 0.22em (uppercase) | normal | Default label / eyebrow. Most common. |
| `labelLarge` | typewriter | 8 | 400 | 0.28em (uppercase) | normal | Hero-screen eyebrows ("Protocol"). |
| `labelMicro` | typewriter | 7 | 400 | 0.10–0.18em (uppercase) | normal | Nav tab labels, "conf.", "HOST" badge, sub-meta. |
| `metaMicro` | typewriter | 8–10 | 400 | 0.14–0.20em (uppercase) | normal | Hold-to-confirm copy, "← BACK," "← EXIT OPERATION." |

> **Pattern:** every `typewriter` use is uppercase + tracked. Bake `textTransform: 'uppercase'` and a sensible default `letterSpacing` into the `<Text variant="label*" />` component so authors can't forget.

---

## 4. Spacing & Layout

The reference uses values from a small inconsistent set; normalize to a 2-px scale.

| Token | Value |
|---|---|
| `space.0` | 0 |
| `space.1` | 2 |
| `space.2` | 4 |
| `space.3` | 6 |
| `space.4` | 8 |
| `space.5` | 10 |
| `space.6` | 12 |
| `space.7` | 14 |
| `space.8` | 16 |
| `space.9` | 18 |
| `space.10` | 20 |
| `space.12` | 24 |
| `space.14` | 28 |
| `space.16` | 32 |
| `space.18` | 36 |
| `space.20` | 40 |

**Layout conventions from the reference:**

- Screens use `18–20px` horizontal padding (`space.9` or `space.10`), `14–20px` top, `20–28px` bottom.
- Vertical rhythm between major sections is a `Rule` (1px border-colored line) with `14–20px` breathing room above and below — **not** larger blank gaps.
- Stacked button column gap: `8–10px` (`space.4`–`space.5`).
- Segmented selection groups: `6px` gap (`space.3`).
- List items vertical gap: `6px`.
- Card padding: `18px 16px 16px`.

**Radius scale:**

| Token | Value | Use |
|---|---|---|
| `radius.none` | 0 | Rules, dividers. |
| `radius.sm` | 2 | **Default.** Buttons, cards, inputs, chips, segmented controls, confirmation panels. |
| `radius.md` | 3 | Card "folder tabs" only. |
| `radius.full` | 9999 | Avatar circles, selection-circle icons. |

**Elevation:** none. The token exists in Phase 2 as `elevation.none` and is the only legal value. Don't add more without a design conversation.

---

## 5. Components

For each: when to use, anatomy, exact spec, what *not* to do.

### 5.1 `Button`

**Variants:** `primary`, `ghost`, `danger` (hold-to-confirm only).

| Property | `primary` | `ghost` | `danger` |
|---|---|---|---|
| Background | `inkPrimary` (hover `inkSecondary`) | `transparent` (hover `surface`) | `danger` (fill animation to `dangerHover`) |
| Text color | `inkOnDark` | `inkPrimary` | `inkOnDark` |
| Border | none | `1px solid border` (hover `borderStrong`) | none |
| Font | `buttonLarge` / `buttonSmall` | `buttonGhost` | `metaMicro` (`typewriter` 10px, 0.20em tracking) |
| Padding (md) | `13px 20px` | `12px 20px` | `13px` (centered) |
| Padding (sm) | `9px 16px` | `8px 16px` | — |
| Radius | `radius.sm` | `radius.sm` | `radius.sm` |
| Transition | `background 0.15s` | `all 0.15s` | width-fill `0.05s linear` |

Use:
- `primary` for the single top-priority action on a screen ("Join Operation," "Proceed," "Begin Operation"). One per screen.
- `ghost` for secondary alternates ("Start Operation," "Invite Agents," "Acknowledge").
- `danger` exclusively for the hold-to-confirm Neutralize on Contract. Not for delete confirmations elsewhere — use `ghost` + an alert dialog for those.

**Don't:** put two `primary` buttons next to each other; use `inkSecondary` as the button fill (that's text); add a shadow on hover.

### 5.2 `Input`

Underline-only. Transparent background, `1px solid borderStrong` bottom border, `bodyInput` font (18/300), `8px` bottom padding. Label above, `8px` gap, using `<Text variant="label" />`.

Don't add a box border. Don't tint the field on focus — bump the border color to `inkPrimary` instead.

### 5.3 `Card` (Dossier)

Anatomy:
- Background: `surface`
- Border: `1px solid border` (or `borderStrong` if it represents the user / is "active")
- Radius: `radius.sm`
- Padding: `18px 16px 16px`
- No shadow.

**Folder-tab variant** (Contract screen): a small attached tab above the card with rounded top corners (`radius.md`), no bottom border, `4px 14px` padding, containing a `labelMicro`. The card below picks up matching top corners.

### 5.4 `Rule`

Horizontal divider: 1px tall, `border` color. Vertical rhythm `14–20px` around it. Use to break sections inside a card or between header and body.

### 5.5 `Label` / eyebrow

`<Text variant="label" />` — `typewriter` 8px, 0.22em letter-spacing, uppercase, `inkMuted`. Used above every titled section and as the standard meta text.

### 5.6 Segmented control / chip group

Two visual flavors in the reference:

- **Themed selection** (Theme picker, Mode picker, Agent Setup cover icons, Situation Room rows): selected = `surface` bg + `borderStrong` border; unselected = `transparent` + `border`. Optional accent: 3px `accent` left border for the "you" row.
- **Pill segmented** (Difficulty, Rerolls): selected = `inkPrimary` bg + `background` text; unselected = `transparent` + `inkMuted` text + `border`. Use this when the choices are small and equivalent (sizes, counts).

### 5.7 `NavBar` (bottom tabs)

- Top border: `1px solid border`.
- Equal-flex tabs, `11px 2px` padding.
- Per tab: `2px solid` bottom border (`accent` if active, `transparent` if not).
- Tab label: `labelMicro` — `typewriter` 7px, 0.12em, uppercase. `accent` if active, `inkMuted` if not.
- No background. No icons. No fill states.

### 5.8 `AgentRow` (list item)

- Padding: `10px 12px`, `10px` gap.
- Avatar: 28px circle, `border`-colored bg, serif initial centered.
- Name: `body` (Outfit 13/500, `inkPrimary`).
- Sub: `mono` 9px `inkFade`, formatted `KEY 968`.
- Right-side metric: `codeMedium` value + `labelMicro` caption underneath.
- "You" / current-user variant: `surface` bg, `borderStrong` border, 3px `accent` left border (border-radius collapses on the left → `0 2px 2px 0`).
- "HOST" badge inline next to name: `labelMicro`, 8px left margin.

### 5.9 Hold-to-confirm

The Neutralize action on Contract:

1. Container: `danger` bg, `radius.sm`, centered `metaMicro` text "NEUTRALIZE TARGET."
2. While held: an absolutely-positioned overlay fills left-to-right with `dangerHover`, width = progress%, transition `0.05s linear`.
3. Text swaps to "CONFIRMING N%" during the hold.
4. On complete: container swap to confirmation panel — `successSurface` bg, `successBorder` border, `success` text "✓ TARGET NEUTRALIZED."
5. Helper line below in `labelMicro` `inkMuted`: "HOLD TO CONFIRM."

This is the only place we use `danger`. The hold mechanic is the existing `useHoldToConfirm` hook — just restyle it.

---

## 6. Screen Compositions

Eight screens in the reference. Each maps to an existing or new file:

| # | Screen | Maps to |
|---|---|---|
| 01 | Home | `client/app/index.tsx` |
| 02 | Agent Setup | `client/app/game/lobby.tsx` (join + create identity step) |
| 03 | Identity Verified | `client/app/game/lobby.tsx` (`AgentKeyReveal`) |
| 04 | Mission Control | `client/app/game/configure.tsx` |
| 05 | Situation Room | `client/app/game/[id].tsx` → "Situation" tab |
| 06 | Host Override | `client/app/game/[id].tsx` → "Admin" tab |
| 07 | Mission Briefing | `client/app/game/[id].tsx` → "Briefing" tab (currently `BriefingModal` — likely promoted to a tab) |
| 08 | Contract | `client/app/game/[id].tsx` → "Contract" tab |

Key compositional rules visible in the reference:

- **Every in-game screen has the same header**: small `label` "OP CODE GGUC" eyebrow + `title` screen name + 14–16px gap + `Rule`. Extract this into a `<ScreenHeader />` primitive in Phase 2.
- **Every in-game screen has the same bottom**: `<NavBar />` flush to the bottom edge.
- **CTAs stack at the bottom** of the scroll content (or above the nav bar). Primary first, ghost below.
- **Settings screens (Mission Control) are densely packed** but never lose section breaks — each setting block is `Label` → control → `space.8` gap.
- **Information cards (Briefing) use a numbered list pattern**: mono number in `accent` + body text in `inkPrimary`, 14px gap between items.

---

## 7. Implementation Notes for Phase 2

1. Token files under `client/src/design-system/tokens/`:
   - `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `elevation.ts`, `motion.ts` (durations: 50ms `instant`, 150ms `base`, 250ms `slow`), `index.ts`.
2. The current `client/src/theme.ts` becomes a deprecation shim that re-exports from `design-system/tokens` for one migration cycle. The token *names* from this doc are canonical — `surfaceFaint`, `paperWarm`, `holdOverlay`, etc. from the old theme are deleted (or re-mapped during the cycle).
3. Cross-platform notes for React Native:
   - `rgba(...)` border colors must be expressed as `rgba` strings (RN accepts them); don't convert to 8-digit hex unless tested.
   - `letterSpacing` in RN is in absolute pixels, not `em`. Convert at token definition time: `letterSpacing(fontSize, em)` helper.
   - `textTransform: 'uppercase'` works in RN ≥0.55. Safe.
   - Special Elite renders too thin on Android at 7–8px; bump to 9 on Android only via Platform.select if needed.
4. Add `client/src/design-system/examples/Gallery.tsx` (dev-only route) that renders every primitive, all variants, against `background`. This is the agent's "what's available" reference.
5. Add `.cursor/rules/design-system.mdc` that:
   - Forbids inline hex/rgba in `client/app/**` and `client/src/features/**`.
   - Forbids `StyleSheet` values for `shadowColor`, `shadowOpacity`, `shadowRadius`, `elevation > 0`.
   - Points at this doc as the source of truth.
6. Migration codemod (optional but recommended): a small script that maps old theme tokens → new tokens for the first wave of replacements.

---

## 8. Open Questions

- **Avatars.** The reference uses emoji glyphs (🍸 🔭 📻 🗝 🚬) on the cover-select. We currently ship custom SVG avatars. Do we keep SVGs (re-rendered for light bg) or switch to a small icon set that fits the new aesthetic?
- **Briefing as tab vs. modal.** The reference shows Briefing as a bottom-tab destination; today it's a modal triggered by the manila help tab in the lobby. Decision needed in Phase 3.
- **Recovery key reveal (screen 03).** The reference still shows it for everyone. Phase 3 plan says drop for non-hosts. Confirm we want the screen to exist only on the create path.
- **Mode picker copy ("Infinite ∞").** Reference shows the new continuous mode living here. Phase 4 will choose its real name; the visual treatment in screen 04 is the target.
- **Spectator / watcher entry.** Not represented in any of the eight screens. Either drop the feature or design a ninth screen in Phase 3.

---

## 9. Reference Artifacts

- `docs/plans/assets/midnight-wire-reference.jsx` (copy of the original mockup — copy this file in before Phase 1 starts).
- `docs/plans/assets/phase-01/` (before/after screenshots produced by Phase 1).
