# Backlog

> Single source of truth for bugs, tech debt, and remaining work.
> Items are grouped by category and prioritized within each group.
> When an item is completed, check the box and note the date.

---

## Bugs

These are actual defects in the current code that could cause incorrect behavior during gameplay.

- [ ] **BUG-1: `startGame` race condition** — `startGame` reads players with `getDocs` then writes with `writeBatch` (not a transaction). If a player joins between the read and the commit, they get no target, no task, and no one targets them. The chain silently breaks. **Fix:** Wrap the entire read→shuffle→write in a `runTransaction`. *Severity: High. Affects game integrity.*

- [ ] **BUG-2: `endGame` doesn't mark alive players as ELIMINATED** — When the host ends the game early, the winner is determined by kill count, but all remaining ALIVE players keep `status: 'ALIVE'` in Firestore. The UI hides this because it checks `game.status === 'COMPLETED'`, but the player data is inconsistent. **Fix:** In the `endGame` batch, set all non-winner alive players to `status: 'ELIMINATED'`. *Severity: Medium. Data inconsistency, no visible UX bug.*

- [ ] **BUG-3: Game code collision** — `generateGameCode()` creates a random 4-letter code but never checks Firestore for an existing game with that ID. A collision would overwrite an active game. **Fix:** Check `getDoc(gameRef).exists()` before writing; retry with a new code if taken. *Severity: Low probability, catastrophic impact.*

- [ ] **BUG-4: Stale reads in `adminForceEliminate`** — Reads all players outside the transaction to find the assassin, then uses that stale data inside the transaction. If the assassin is eliminated between the read and the transaction, the re-linking could be wrong. **Fix:** Move the player query inside the transaction. *Severity: Medium. Race window is small but real.*

- [ ] **BUG-5: Stale reads in `recoverIdentity`** — Same pattern: `getDocs(playersRef)` happens outside the transaction, but the writes inside reference that data. **Fix:** Move reads inside transaction. *Severity: Medium.*

- [ ] **BUG-6: `useLocalSearchParams` non-null assertion** — `[id].tsx` uses `id!` without guarding for undefined. If the route is reached without a parameter (e.g., malformed deep link), the app crashes. **Fix:** Add early return with redirect to lobby if `id` is falsy. *Severity: Low. Edge case.*

---

## Security

- [ ] **SEC-1: Firebase config hardcoded in source** — `client/src/services/firebase/config.ts` exports literal `firebaseConfig` values instead of loading from env / `expo-constants`. Firebase web API keys are not secret, but env-based config is the standard pattern for multi-environment deploys and keeps project IDs out of the bundle diff. **Fix:** Move values to `app.config.js` `extra` or `.env` + `expo-constants`, gitignore secrets file if any non-public keys are added later.

---

## Tech Debt

Infrastructure and code quality improvements that make the codebase more maintainable, secure, and agent-friendly.

- [ ] **DEBT-1: Tighten Firestore security rules** — Current rules allow any authenticated user to update any game/player document. Host-only operations (`startGame`, `endGame`, `adminForceEliminate`) should be enforced server-side. **Approach:** Add `request.auth.uid == resource.data.hostId` checks for game updates, or migrate critical operations to Cloud Functions.

- [x] **DEBT-2: Path aliases** — `@/` → `client/src/` codemodded across `app/` and `src/` (Phase 5, 2026-06-07).

- [x] **DEBT-3: Runtime validation on Firestore data** — Zod schemas in `client/src/types/schemas.ts`; `parseGame` / `parsePlayer` in `firestoreParse.ts` at `useGame` and `gameService` boundaries (Phase 5, 2026-06-07).

- [x] **DEBT-4: CI/CD pipeline** — `.github/workflows/ci.yml`: `npm run verify` + web export on PR/main (Phase 5, 2026-06-07).

- [x] **DEBT-5: React component tests** — Jest dual-project config + 5 smoke tests in `src/__tests__/components/` (Phase 5, 2026-06-07). Extend coverage as screens change.

- [ ] **DEBT-6: Callsign case normalization** — `joinGame` compares callsigns with `.toUpperCase()` but stores the original casing. "Agent X" and "AGENT X" are treated as the same identity but display differently. **Fix:** Normalize to consistent casing on storage, or store a separate `callsign_normalized` field.

- [ ] **DEBT-7: Remove `game.playerIds[]` redundancy** — The `playerIds` array on the game document is maintained separately from the `players` subcollection and can diverge. Either deprecate the array and query the subcollection, or keep them in sync within transactions.

---

## Feature Work

Remaining items from the product roadmap and plans.

- [ ] **FEAT-1: Notifications** — In-app banners when a player is eliminated. Web: Notification API + service worker. iOS: expo-notifications + APNs + Cloud Functions trigger.

- [ ] **FEAT-2: Mugshot Upload** — Player photo as profile image via expo-image-picker + Firebase Storage.

- [ ] **FEAT-3: Infinite Game Mode** — Respawn / score-attack mode (`game.mode: 'INFINITE'`). Decision locked in `docs/adr/0004-continuous-game-mode-shape.md`; implementation plan in `docs/plans/04-continuous-game-mode.md`. Mission Control chip exists but disabled.

- [ ] **FEAT-4: Cloud Functions migration** — Move game-critical operations to Firebase Cloud Functions for server-side authority. Pure logic already in `gameLogic.ts`.

---

## Completed (Refactor Phases 0–5)

### Phase 0 — Housekeeping (2026-06-07)
- [x] Baseline commit, `npm run verify`, font packages, SEC-1 filed

### Phase 1 — Design System (2026-06-07)
- [x] Midnight Wire tokens + 19 primitives, `@/` alias, `design-system.mdc`, gallery route

### Phase 2 — Screen Migration (2026-06-07)
- [x] All 11 screens migrated; `theme.ts` deleted; legacy components removed

### Phase 3 — UX Bug Fixes (2026-06-07)
- [x] Contrast fix + `check-contrast` in verify; lobby flow compression; host-only Agent Key reveal; `midnightwire.app` domain; `useLayout()`; inline `Banner` errors

### Phase 5 — Agent-Friendly Codebase (2026-06-07)
- [x] `AGENTS.md` at repo root
- [x] Cursor rules audited; `game-modes.mdc` added
- [x] Path alias codemod complete
- [x] Zod validation at Firestore read boundaries
- [x] GitHub Actions CI
- [x] Component test scaffolding (5 smoke tests)
- [x] 5 ADRs in `docs/adr/`
- [x] 4 in-repo skills in `.cursor/skills/`

### Earlier cleanup sprint
- [x] Remove dead code; extract constants; `useHoldToConfirm`; dedupe elimination/task logic
- [x] Jest + 27 pure-logic tests; ESLint + Prettier; `firestore.rules`
- [x] `gameLogic.ts` extraction; `ErrorBoundary`; 7 Cursor rules (now 9)
