# ADR 0002: Pure Logic Extraction

## Context

Game rules (target chain shuffle, elimination re-linking, win detection) were initially intertwined with Firestore reads/writes in `gameService.ts`, making them hard to test and risky to change.

## Decision

Extract all **pure game rules** into `client/src/features/game/gameLogic.ts` with **zero Firebase imports**. `gameService.ts` is a thin I/O layer: read Firestore → call pure functions → write results.

Shared helpers: `computeEliminationUpdates`, `buildTargetChain`, `shufflePlayers`, `resolveAvailableTasks` pattern in task service.

## Consequences

- **Positive:** 27+ unit tests cover core rules without mocking Firestore; future Cloud Functions can import the same pure functions.
- **Negative:** Two files to touch for behavioral changes; developers must resist putting logic back in the service layer.
- **Convention:** New gameplay rules → `gameLogic.ts` + test first → wire in `gameService.ts`.
