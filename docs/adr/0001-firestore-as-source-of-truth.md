# ADR 0001: Firestore as Source of Truth

## Context

Subterfuge is a real-time multiplayer party game. All players must see consistent game state (targets, eliminations, lobby roster) without manual refresh. The MVP team is small and web-first.

## Decision

Use **Firebase Firestore** as the single source of truth for all game state. React components subscribe via `onSnapshot` (`useGame` hook); mutations go through `gameService.ts`. No client-side global store (Redux, Zustand).

## Consequences

- **Positive:** Real-time sync is built-in; minimal backend code for MVP; Expo client talks directly to Firestore.
- **Negative:** No server-side authority for host-only actions (UI-gated only); security rules are permissive; race conditions must be handled carefully (`runTransaction` vs `writeBatch`).
- **Follow-up:** Cloud Functions migration tracked as FEAT-4 / DEBT-1 in `docs/BACKLOG.md`.
