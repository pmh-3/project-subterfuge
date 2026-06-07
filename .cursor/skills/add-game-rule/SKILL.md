---
name: add-game-rule
description: Recipe for adding gameplay logic in gameLogic.ts with tests, exposing via gameService.ts, and branching on game.mode. Use when changing elimination, targets, scoring, or win conditions.
---

# Add Game Rule

## When to use

Changing how the game behaves: eliminations, target chains, win detection, rerolls, or mode-specific rules.

## Prerequisites

Read [`AGENTS.md`](../../AGENTS.md), [`.cursor/rules/game-modes.mdc`](../../rules/game-modes.mdc), and [`.cursor/rules/firestore-patterns.mdc`](../../rules/firestore-patterns.mdc).

## Steps

1. **Pure function in `client/src/features/game/gameLogic.ts`**
   - No Firebase imports
   - Accept plain `Player` / `Game` objects; return update payloads or computed values
   - Name descriptively: `computeXUpdates`, `isGameOver`, etc.

2. **Unit tests in `client/src/__tests__/gameLogic.test.ts`**
   - Cover happy path, edge cases, and classic-mode regression when `mode` is absent

3. **Wire in `gameService.ts`**
   - Read docs with `parseGameOrThrow` / `parsePlayerOrThrow`
   - Branch: `if (gameData.mode === 'INFINITE') { ... } else { ... }` (classic = absent or `'CLASSIC'`)
   - Multi-doc writes: `runTransaction`, all reads before writes

4. **UI** (if player-visible)
   - Update feature components under `client/src/features/game/components/`
   - Use `@/design-system` primitives

5. **Verify**

```bash
cd client && npm run verify
```

## Do not

- Put game rules inline in React components or `gameService.ts` without extracting to `gameLogic.ts`
- Use `writeBatch` when a player could join/leave mid-operation (see BUG-1)
- Trust `game.playerIds[]` — query `players` subcollection
