# Agent Guide — Project Subterfuge

Read this file first. It is the canonical entry point for coding agents working in this repo.

## What this is

**Subterfuge** (branded **Midnight Wire**) is a social-deduction party game built with React Native (Expo) and Firebase Firestore. Players receive secret targets and missions, then eliminate targets through social engineering — without getting caught. Web-first; iOS/Android via Expo.

## Where to start

| Doc | Purpose |
|-----|---------|
| [`PRD.md`](PRD.md) | Product vision and mechanics |
| [`docs/plans/`](docs/plans/) | Phased implementation plans |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | Bugs, tech debt, feature backlog |
| [`.cursor/rules/`](.cursor/rules/) | Cursor rules (architecture, design system, Firestore, testing) |
| [`client/src/design-system/README.md`](client/src/design-system/README.md) | UI primitives and tokens |

## Common tasks → entry points

| Task | Start here |
|------|------------|
| Fix a bug | `docs/BACKLOG.md` → relevant service in `client/src/features/game/gameService.ts` |
| Add a screen | `client/src/design-system/README.md` + `client/app/` (Expo Router) |
| Change game logic | `client/src/features/game/gameLogic.ts` (pure functions, unit-tested) |
| Change game writes | `client/src/features/game/gameService.ts` (Firestore I/O only) |
| Add a UI primitive | `client/src/design-system/components/` |
| Update copy / strings | `client/src/strings.ts` |
| Diagnose sync issues | `.cursor/rules/firestore-patterns.mdc` |

## Run / test / lint

All commands run from `client/`:

```bash
cd client && npm install

npm start              # Expo dev server
npx expo start --web   # Web at localhost:8081

npm test               # Jest (unit + component projects)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run verify         # lint + typecheck + contrast check + test — run before declaring done
```

**CI:** GitHub Actions runs `npm run verify` and a web export on every PR and push to `main`. Merges should be blocked until CI is green.

## Conventions (one screen)

- **Imports:** `@/` → `client/src/` (e.g. `@/features/game/gameLogic`, `@/design-system`)
- **State:** Firestore is canonical — no Redux/Zustand. Subscribe via `useGame(gameId)`; mutate via `gameService.ts`
- **Pure logic:** `gameLogic.ts` has zero Firebase imports; always unit-test new rules here first
- **UI:** `@/design-system` tokens and primitives only — no inline hex, no shadows, no gradients
- **Alerts:** `useAlert()` hook — never `Alert.alert` or `window.alert`
- **Storage:** `storage.save/get/delete` from `@/utils/storage` — never `localStorage` / `SecureStore` directly
- **Destructive actions:** `Button` variant `danger` for neutralize / end operation — simple tap, no hold
- **Avatars:** `getAvatarDisplay(avatarId)` from `@/utils/avatarDisplay`
- **Errors:** `catch (e)` + `e instanceof Error` — never `catch (e: any)`
- **Constants:** magic numbers in `@/constants`; colors in `@/design-system/tokens`
- **Game modes:** default is classic elimination. Check `game.mode` before branching; infinite mode is planned (`INFINITE`) but not yet shipped — see `.cursor/rules/game-modes.mdc`
- **Transactions:** multi-doc writes that must be consistent use `runTransaction`, not `writeBatch`
- **Types at boundaries:** Firestore reads use Zod parse (`@/types/firestoreParse`) — no bare `as Game` / `as Player`

## What NOT to do

- Don't use `Alert.alert`, inline hex colors, or recreate `src/theme.ts` (deleted in Phase 2)
- Don't call Firestore from React components — go through `gameService.ts` / `taskService.ts`
- Don't put game rules in `gameService.ts` — extract to `gameLogic.ts` and test
- Don't trust `game.playerIds[]` as source of truth — query the `players` subcollection
- Don't assume server-side host auth — host-only gates are UI-only for MVP
- Don't add Cursor branding to commits or PRs

## Where the source of truth lives

| Domain | Source of truth |
|--------|-----------------|
| Game state | Firestore `games/{id}` + `players` subcollection |
| Game rules | `client/src/features/game/gameLogic.ts` |
| Visual design | `docs/plans/DESIGN_SYSTEM.md` → `client/src/design-system/tokens/` |
| User-facing copy | `client/src/strings.ts` |
| Architecture decisions | `docs/adr/` |
| Agent workflows | `.cursor/skills/` |
