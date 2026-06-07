# Phase 0 — Housekeeping (do this first, ~1 hour)

**Owner:** Any agent (orchestrator can dispatch first).
**Depends on:** Nothing. P0 (src tree) is resolved.

A small grab-bag of repo-hygiene items that every later phase implicitly assumes are done. Get them out of the way before any larger work starts.

## Tasks

1. **Initial commit.** Repo has "No commits yet." Stage everything currently on disk and commit as `chore: initial baseline`. Without a baseline we can't diff phases or revert if something goes sideways.

2. **Restore `docs/BACKLOG.md` (and the other staged-deleted docs).** They exist in the index but not in the working tree (`git status` shows them as `deleted`). Bring them back with `git restore docs/BACKLOG.md docs/DEVELOPMENT_PRINCIPLES.md docs/INDUCTION.md docs/Mission_Control_Plan.md docs/PHASE_3_ROADMAP.md docs/archive/PHASE_1_COMPLETE.md`. `BACKLOG.md` is the canonical bug/debt tracker; Phase 5 grooms it but earlier phases will check items off as they ship.

3. **Add `typecheck` + `verify` scripts to `client/package.json`:**

   ```json
   "typecheck": "tsc --noEmit",
   "verify": "npm run lint && npm run typecheck && npm test"
   ```

   Run it once and confirm green. Every later phase's DoD is "`npm run verify` is green."

4. **Install missing font packages** that the design system requires:

   ```
   npm install @expo-google-fonts/cormorant-garamond @expo-google-fonts/outfit @expo-google-fonts/jetbrains-mono
   ```

   Leave `@expo-google-fonts/playfair-display` and `@expo-google-fonts/inter` installed for now — Phase 1 (design system) will swap them out and Phase 2 (screen migration) deletes them once nothing imports them.

5. **Confirm the app runs on web AND iOS sim** with the new font packages installed (loaded but unused is fine). Capture two screenshots, attach to handoff note. If iOS sim isn't trivially available to the running agent, web is acceptable but flag it.

6. **Confirm Firebase config.** `client/src/services/firebase/config.ts` exists — verify it loads from a non-committed source (env / `expo-constants`). If it has secrets in the file, file a SEC ticket in `BACKLOG.md` and continue.

## Definition of Done

- `git log` shows the initial baseline commit.
- `docs/BACKLOG.md` is present in the working tree.
- `npm run verify` green.
- New font packages in `package.json`.
- App still boots on web (and iOS sim if feasible).
- Handoff note appended below.

## Handoff note

**Completed:** 2026-06-07

### What shipped
- Initial baseline commit (`chore: initial baseline`) with full `client/` tree, plan docs, and restored `docs/` files.
- `typecheck` + `verify` scripts added to `client/package.json`; `npm run verify` green (lint warnings only, 0 errors; 27/27 tests pass).
- Font packages installed: `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/outfit`, `@expo-google-fonts/jetbrains-mono` (legacy `playfair-display` + `inter` left in place per plan).
- `SEC-1` filed in `docs/BACKLOG.md`: Firebase config is hardcoded in `client/src/services/firebase/config.ts` (not env/`expo-constants`).

### Screenshots
- Web welcome screen: `docs/plans/assets/phase-0/web-welcome.png` (app boots on `localhost:8081`).
- **iOS sim: not verified** — Xcode command-line tools / `simctl` unavailable in this environment (`xcrun: unable to find utility "simctl"`).

### Deviations
- Added `.DS_Store` to `.gitignore` (was untracked noise).
- Root `package-lock.json` omitted from commit (no root `package.json`; `client/package-lock.json` is the canonical lockfile).
