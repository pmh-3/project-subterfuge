# Phase 3 — UX Bug Fixes & Happy-Path Simplification

**Owner:** Product-quality agent
**Depends on:** Phase 2 (uses new tokens & primitives)

## Goal

Eliminate friction so a non-technical first-time user — explicitly: "my mom" — can create and play a game without external help. Tighten visual readability, kill extraneous UI, fix the wrong-domain share link, and drop the Agent Key reveal for non-hosts.

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
- Grep for `midnightwire.co` and replace with `midnightwire.app`. Likely lives in:
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

## Deliverables

- All seven work items closed.
- Updated flowchart for UX-4 appended to this plan.
- Contrast-check script under `scripts/`.
- Verified working share link on `midnightwire.app`.
- Handoff note appended.

## Success Criteria

- **Walkthrough checklist** (replaces the unmeasurable "mom test") — agent produces a markdown checklist appended to this plan that walks the happy create-and-play path step by step, asserting at each step:
  1. Only one obvious primary action on screen.
  2. Any required input is pre-filled or auto-generated where reasonable.
  3. No modal interrupts the flow.
  4. Total tap/keystroke count from "open app" to "in game" is ≤ N (N = 6 for join, ≤ 10 for create).
  Each step screenshotted.
- Automated contrast check script returns clean (all text/background pairings ≥ WCAG AA).
- No instance of `midnightwire.co` remains anywhere in the repo (grep + git history if practical).
- Non-host join flow has exactly two screens before being in the game.
- `npm run verify` green.

## Open Questions

- Toast/banner: roll our own using design-system `Card` + `Text`, or pull a dependency? (Recommend: roll our own — one component, no deps.)

## Locked

- **No first-time tutorial overlay.** Briefing tab is the only onboarding surface.
