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

## Tech Debt

Infrastructure and code quality improvements that make the codebase more maintainable, secure, and agent-friendly.

- [ ] **DEBT-1: Tighten Firestore security rules** — Current rules allow any authenticated user to update any game/player document. Host-only operations (`startGame`, `endGame`, `adminForceEliminate`) should be enforced server-side. **Approach:** Add `request.auth.uid == resource.data.hostId` checks for game updates, or migrate critical operations to Cloud Functions.

- [ ] **DEBT-2: Path aliases** — All imports use long relative paths like `../../src/features/game/gameService`. Configure `@/` alias in `tsconfig.json` + `babel.config.js` so imports become `@/features/game/gameService`. Reduces agent import errors.

- [ ] **DEBT-3: Runtime validation on Firestore data** — Every Firestore read uses `as Game` / `as Player` type assertions with no runtime validation. If schema drifts (e.g., a field is missing), it fails silently. **Approach:** Add Zod schemas for `Game` and `Player`, validate on `onSnapshot` reads.

- [ ] **DEBT-4: CI/CD pipeline** — No automated checks. A GitHub Actions workflow running `npm test`, `npm run lint`, and `tsc --noEmit` on PRs would catch regressions before merge.

- [ ] **DEBT-5: React component tests** — Only pure logic is tested (27 tests). Key interaction flows (hold-to-confirm, elimination confirmation, lobby join) have no automated coverage. **Approach:** Add `@testing-library/react-native` and write smoke tests for critical screens.

- [ ] **DEBT-6: Callsign case normalization** — `joinGame` compares callsigns with `.toUpperCase()` but stores the original casing. "Agent X" and "AGENT X" are treated as the same identity but display differently. **Fix:** Normalize to consistent casing on storage, or store a separate `callsign_normalized` field.

- [ ] **DEBT-7: Remove `game.playerIds[]` redundancy** — The `playerIds` array on the game document is maintained separately from the `players` subcollection and can diverge. Either deprecate the array and query the subcollection, or keep them in sync within transactions.

---

## Feature Work

Remaining items from the Phase 3 roadmap and new ideas surfaced during the refactor.

- [ ] **FEAT-1: Notifications** — In-app banners when a player is eliminated. Web: Notification API + service worker. iOS: expo-notifications + APNs + Cloud Functions trigger. *(Phase 3, Priority 2)*

- [ ] **FEAT-2: Mugshot Upload** — Player photo as profile image via expo-image-picker + Firebase Storage. Display in ContractView and Command Center. *(Phase 3, Priority 3)*

- [ ] **FEAT-3: Continuous / Multi-Contract Game Mode** — Major gameplay shift: respawn mode, multi-contract mode, or continuous loop. *(Phase 3, Priority 4)*

- [ ] **FEAT-4: Cloud Functions migration** — Move game-critical operations (`startGame`, `confirmElimination`, `adminForceEliminate`) to Firebase Cloud Functions for server-side authority. Eliminates cheating vector and solves the host-auth problem. Pure logic is already extracted to `gameLogic.ts` to make this straightforward.

---

## Completed (This Refactor)

For reference, work completed during the code cleanup sprint:

- [x] Remove dead code (unused styles, exports, stale scripts, duplicate CSV)
- [x] Extract magic numbers to `constants.ts`, inline colors to `theme.ts`
- [x] Extract `useHoldToConfirm` hook and `getAvatarDisplay` utility
- [x] Deduplicate gameService elimination logic (`computeEliminationUpdates`)
- [x] Deduplicate task resolution logic (`resolveAvailableTasks` / `pickRandomTask`)
- [x] Replace all `catch(e: any)` with proper `instanceof Error` narrowing
- [x] Consolidate remaining inline rgba colors to theme tokens
- [x] Archive stale docs, update TECHNICAL_ROADMAP schema, rewrite README
- [x] Set up Jest + ts-jest, write 27 tests across 5 suites
- [x] Install ESLint (expo config) + Prettier, add `lint` and `format` scripts
- [x] Create `firestore.rules` and `firestore.indexes.json`
- [x] Extract pure game logic to `gameLogic.ts` (shuffle, target chain, win detection, elimination computation)
- [x] Add `ErrorBoundary` component, wrap root layout
- [x] Create 7 Cursor rules for agent onboarding
