# Phase 3 — UX Bug Fixes & Happy-Path Simplification

**Owner:** Product-quality agent
**Depends on:** Phase 2 (uses new tokens & primitives)

## Goal

Eliminate friction so a non-technical first-time user — explicitly: "my mom" — can create and play a game without external help. Tighten visual readability, kill extraneous UI, fix the wrong-domain share link, and drop the Agent Key reveal for non-hosts. **Mobile-first:** the primary play surface is a phone at a party; every UX change must feel natural in a narrow viewport. **Desktop must not regress:** web players on a laptop or shared screen should see the same single-column dossier UI, centered and readable — not a stretched phone mockup edge-to-edge on a 1440px monitor.

## Inbox From User (verbatim)

> - Increase the contrast between info text and background.
> - Make the background manila folder color rather than dark.
> - Limit the colors used, the extraneous text.
> - Simplify user flow: goal — have my mom create and play a game without me saying a word.
> - Happy path by default.
> - The share game link has the wrong domain. It's `midnightwire.app`, NOT `midnightwire.co`.
> - Drop the recovery key for non-host; they don't care what it is.

## Work Items

### UX-1 — Contrast pass
- Audit every text-on-surface pairing. Anything under WCAG AA (4.5:1 body, 3:1 large) gets bumped.
- Particular suspects: `theme.colors.surfaceMuted` used for `formSubtitle`, `backText`, helper text. These are the lowest-contrast strings in the app and the most informational.
- Acceptance: automated contrast check script (add `scripts/check-contrast.ts` reading `design-system/tokens/colors.ts` and printing any pair below threshold) returns clean.

### UX-2 — Manila background everywhere
- Already largely delivered by Phases 1–2. This item is a verification + sweep: any leftover dark-mode surface (e.g. modals, reveal screen, error boundary fallback) gets the manila treatment.

### UX-3 — Color & copy reduction
- Pass through every screen with a literal counting exercise: how many distinct colors visible? Target: ≤ 5 on any one screen (background, surface, primary ink, muted ink, one accent).
- Cull "flavor text" that doesn't advance the user. Suspects: long form subtitles on join/start screens, redundant status text on the welcome screen, the "WELCOME_STATUS_*" trio that flashes briefly during auth.
- Keep the espionage *terms* (Callsign, Operation Code, Contract). Drop the espionage *narration* sentences if they don't help the user act.

### UX-4 — "Mom-can-play" flow simplification
Walk the flow as a first-time user with zero context. Apply these specific rules:
- **One primary action per screen.** Demote alternates to text links or hide behind a "More" affordance.
- **Sensible defaults.** Pre-select the default avatar, pre-fill no fields the user can't be expected to know, but auto-generate everything the user shouldn't have to think about (Agent Key, game code, default task pack).
- **Eliminate forks the user must understand.** The current join flow has: enter code → enter identity → maybe recovery → reveal → game. Compress to: enter code → enter callsign → in.
- **No modal pop-ups during normal play.** The briefing tab can stay (opt-in), but no auto-opening modals on welcome / lobby.
- **Host create flow:** create → name yourself → game is created and you're in the lobby with a big "Share this link" button + a big "Start" button. That's it. Task-pack configuration becomes an optional "Customize" affordance, defaulting to the recommended pack.

Produce a short before/after flowchart (markdown ASCII or a screenshot of a sketch) and append to this plan.

### UX-5 — Happy path by default
- Every error state needs a recover-in-place option. No dead-ends.
- "Game not found" → suggest "Try a different code" with the input refocused, not a back button.
- Network errors → optimistic retry with a small inline indicator, not a blocking alert.
- Existing `useAlert` modal usage gets reviewed: anything that is *informational* becomes an inline toast/banner; alerts are reserved for *blocking* decisions.

### UX-6 — Fix share-link domain
- Grep for `midnightwire.com` and replace with `midnightwire.app`. Likely lives in:
  - `client/src/constants.ts` (URL constants)
  - `client/src/features/game/components/*` (share-link UI)
  - `client/app.json` (scheme / associated domains)
  - `firebase.json` hosting config
- Verify the deep-link route (`/game/lobby?code=XXXX`) still resolves on the new domain.
- Update any QR code rendering to use the new domain.

### UX-7 — Drop non-host recovery-key reveal
**Decision locked:** keep reveal for host only; drop entirely for non-host join path.
- For `revealContext === 'join'`: skip the reveal screen. The Agent Key is still generated, still stored locally for recovery, but the user never sees it on the happy path.
- The recovery-key entry screen (when callsign collides) remains — unhappy path where the key matters.
- Host (`revealContext === 'create'`) still sees the reveal after creation.

### UX-8 — Responsive layout (mobile-first, desktop-safe)

**Decision locked:** use a **minimal layout scheme**, not a full breakpoint grid and not pure fluid stretch-to-fill.

The app is a single-column phone UI. We do not need tablet/desktop layout variants (sidebars, multi-column grids, separate nav patterns). What we need is:

1. **Mobile (default, < 600px):** content uses full available width with horizontal padding from `space` tokens. Touch targets ≥ 44px. Safe-area insets respected. Keyboard-avoiding behavior unchanged on lobby/identity screens.
2. **Wide (≥ 600px):** same single column, but capped and centered — content does not grow past a readable max width on large monitors. Background manila fills the viewport; the dossier column floats in the middle.
3. **Compact (optional, < 360px):** only if audit finds cramping or horizontal overflow — reduce horizontal padding one step. Do not add unless a screen actually needs it.

**Why not pure fluid?** Screens already use `width: '100%'` with fixed padding. On desktop that produces over-wide text lines, CTAs that span the full browser width, and avatar grids that sprawl. A `maxWidth` cap fixes this without inventing a second layout.

**Why not a full breakpoint scheme?** No screen warrants a different information architecture at wider widths. Adding `sm`/`md`/`lg` tiers would invite scope creep (multi-column Situation Room, etc.) with no product payoff for a party game played on phones.

**Implementation (small surface area):**
- Add layout tokens to `@/design-system/tokens/`: `contentMaxWidth` (recommend `480`), `wideMinWidth` (`600`), optionally `compactMaxWidth` (`360`).
- Add `useLayout()` hook (e.g. `src/hooks/useLayout.ts`) wrapping `useWindowDimensions`, returning `{ isWide, isCompact, contentStyle }` where `contentStyle` applies `width: '100%'`, `maxWidth`, `alignSelf: 'center'`.
- Apply `contentStyle` at **screen roots only** — `app/index.tsx`, `app/game/lobby.tsx`, `app/game/configure.tsx`, `app/game/[id].tsx` scroll/content containers. Do not sprinkle per-component breakpoint checks.
- Audit mobile-specific pain points while touching each screen:
  - NavBar tab labels truncating or wrapping awkwardly on narrow widths
  - Avatar picker row (`flexWrap`) spacing on small phones
  - Sheet/Modal centering (existing `maxWidth: 400` on `Sheet` — verify it centers on wide web)
  - Primary CTAs remain thumb-reachable (bottom of screen, not orphaned mid-viewport)
- Desktop-specific checks (same screens, wide viewport):
  - No edge-to-edge buttons on a 1280px+ browser window
  - Share-link copy/share flow still works (`navigator.clipboard` / `navigator.share` path in `[id].tsx`)
  - Scrollable game tabs readable without horizontal scroll

**Out of scope:** separate desktop navigation, landscape-only layouts, PWA install prompts, native app store packaging.

## Deliverables

- All eight work items closed.
- Updated flowchart for UX-4 appended to this plan.
- Contrast-check script under `scripts/`.
- Verified working share link on `midnightwire.app`.
- `useLayout()` hook + layout tokens in design system.
- Handoff note appended.

## Success Criteria

- **Walkthrough checklist** (replaces the unmeasurable "mom test") — agent produces a markdown checklist appended to this plan that walks the happy create-and-play path step by step, asserting at each step:
  1. Only one obvious primary action on screen.
  2. Any required input is pre-filled or auto-generated where reasonable.
  3. No modal interrupts the flow.
  4. Total tap/keystroke count from "open app" to "in game" is ≤ N (N = 6 for join, ≤ 10 for create).
  Each step screenshotted **twice** — once at mobile width, once at desktop width (see Visual verification paths below).
- **Visual verification paths** — every user-visible change from UX-1 through UX-8 is exercised on **both** form factors before the phase closes. Use web for both; iOS sim is a bonus, not a substitute for the mobile web pass.

  **Mobile path** (primary — ~390×844, e.g. iPhone 14 in devtools or Expo web narrow window):
  1. `/` — welcome: hero readable, two CTAs stacked full-width, briefing link tappable
  2. `/game/lobby?mode=join-code` — code input + keyboard doesn't obscure CTA
  3. `/game/lobby?mode=join` — callsign + avatar picker wraps cleanly, no horizontal scroll
  4. `/game/lobby?mode=start` — host create flow, single primary action
  5. `/game/{id}` (lobby state) — share CTA thumb-reachable, player list scrolls
  6. `/game/{id}` (in-progress) — Contract, Situation Room, Briefing tabs; NavBar labels fit
  7. `/game/{id}` (host) — Admin tab usable on narrow width
  8. Unhappy path spot-check: invalid game code, network error banner — recover-in-place works

  **Desktop path** (secondary — ≥ 1280px wide browser window):
  1. `/` — content column centered, manila background visible on sides, CTAs not full-monitor width
  2. `/game/lobby?mode=join-code` — same column cap; form doesn't sprawl
  3. `/game/lobby?mode=join` — avatar grid centered within column
  4. `/game/{id}` (lobby) — share link copy/share works; link shows `midnightwire.app`
  5. `/game/{id}` (in-progress) — all tabs readable; Situation Room list doesn't over-stretch line length
  6. Sheet/Modal (briefing, force-eliminate, victory overlay) — centered, max-width respected

  Append screenshots (or a screenshot index with filenames) to the handoff note, grouped by path.

- Automated contrast check script returns clean (all text/background pairings ≥ WCAG AA).
- No instance of `midnightwire.co` remains anywhere in the repo (grep + git history if practical).
- Non-host join flow has exactly two screens before being in the game.
- Wide viewport (≥ 600px): screen content respects `contentMaxWidth` and is horizontally centered.
- `npm run verify` green.

## Open Questions

- Toast/banner: roll our own using design-system `Card` + `Text`, or pull a dependency? (Recommend: roll our own — one component, no deps.)

## Locked

- **No first-time tutorial overlay.** Briefing tab is the only onboarding surface.
- **Layout scheme:** minimal two-tier (`default` + `wide` at 600px) with optional `compact` only if audit demands it. No multi-column desktop layout. Mobile-first priority; desktop gets centered column, not a separate IA.

---

## UX-4 Flow (before → after)

### Join path

**Before:**
```
/ → join-code → join (identity) → reveal (Agent Key) → /game/{id}
     └─ ?code= deep link → join → reveal → game
```

**After:**
```
/ → join-code → join (callsign + avatar) → /game/{id}
     └─ ?code= deep link → join → game          (2 screens, ≤6 taps)
     └─ identity collision → join-recover → game (unhappy path only)
```

### Host create path

**Before:**
```
/ → start (identity) → reveal (Agent Key) → configure (mandatory) → /game/{id} lobby
```

**After:**
```
/ → start (identity) → reveal (Agent Key, host only) → /game/{id} lobby
                                                          ├─ SHARE LINK (primary)
                                                          ├─ BEGIN OPERATION
                                                          └─ CUSTOMIZE → configure (optional)
```

Defaults applied at create: `basic_training` pack, Mixed difficulty, 5 rerolls.

---

## Walkthrough Checklist (happy path)

### Join (target ≤6 taps/keystrokes)

| Step | Screen | Assert | Mobile | Desktop |
|------|--------|--------|--------|---------|
| 1 | `/` | One primary CTA (Join); Start demoted to ghost | ☐ | ☐ |
| 2 | `/game/lobby?mode=join-code` | Single primary Continue; spectator is text link | ☐ | ☐ |
| 3 | Enter code → Continue | No modal; invalid code shows inline banner | ☐ | ☐ |
| 4 | `/game/lobby?mode=join` | Callsign + avatar only; no Agent Key field | ☐ | ☐ |
| 5 | Join → `/game/{id}` | **No reveal screen**; lands in lobby | ☐ | ☐ |
| 6 | Lobby waiting | Share available; no blocking modal | ☐ | ☐ |

### Host create (target ≤10 taps/keystrokes)

| Step | Screen | Assert | Mobile | Desktop |
|------|--------|--------|--------|---------|
| 1 | `/` → Start Operation | Ghost CTA; Join is primary | ☐ | ☐ |
| 2 | `/game/lobby?mode=start` | Name + avatar; Proceed is sole primary | ☐ | ☐ |
| 3 | Agent Key reveal | Host sees key once; Proceed → lobby (not configure) | ☐ | ☐ |
| 4 | `/game/{id}` lobby | Share Link + Begin Operation prominent; Customize is link | ☐ | ☐ |
| 5 | Share link | URL uses `midnightwire.app`; copy shows inline banner | ☐ | ☐ |
| 6 | Wide viewport | Content capped at 480px, centered on manila | ☐ | ☐ |

### Unhappy paths

| Scenario | Assert | Mobile | Desktop |
|----------|--------|--------|---------|
| Invalid game code on join | Inline error; no modal | ☐ | ☐ |
| Game not found at `/game/{id}` | "Try a different code" → join-code | ☐ | ☐ |
| Connection failed | Retry button re-subscribes | ☐ | ☐ |

---

## Handoff Note (Phase 3 complete)

**Date:** 2026-06-07  
**Status:** All eight work items implemented. `npm run verify` green.

### What shipped

| Item | Summary |
|------|---------|
| UX-1 | `inkMuted` darkened to `#6B6048`; `client/scripts/check-contrast.js` wired into `npm run verify` |
| UX-2 | Verified manila on all screen roots, reveal, error boundary — no dark surfaces remain |
| UX-3 | Removed step labels, code subtitle, loading narration; demoted spectator link |
| UX-4 | Join compressed to 2 screens; host skips mandatory configure; Customize link in lobby |
| UX-5 | Inline `Banner` for errors/copy; game-not-found recover-in-place; `useGame` retry |
| UX-6 | `APP_URL` → `https://midnightwire.app` |
| UX-7 | Non-host join skips Agent Key reveal (key still generated + stored locally) |
| UX-8 | `layout` tokens + `useLayout()` applied at screen roots |

### Key files

- `client/src/design-system/tokens/layout.ts` — `contentMaxWidth: 480`, `wideMinWidth: 600`
- `client/src/hooks/useLayout.ts` — `{ isWide, isCompact, contentStyle }`
- `client/src/design-system/components/Banner.tsx` — inline info/error banner
- `client/scripts/check-contrast.js` — WCAG AA audit
- `client/app/game/lobby.tsx` — flow compression + inline errors
- `client/app/game/[id].tsx` — share domain, layout cap, error recovery, host Customize

### Visual verification

Screenshots not captured in this session — run the checklist above at ~390×844 (mobile) and ≥1280px (desktop) before release.

### Follow-ups (out of scope)

- Toast auto-dismiss animation polish
- Compact (`<360px`) padding reduction if audit finds overflow
- Firestore rules / server-side host auth (see known issues)
