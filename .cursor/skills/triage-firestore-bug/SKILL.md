---
name: triage-firestore-bug
description: Checklist for diagnosing real-time sync, stale data, and race-condition bugs in Subterfuge Firestore integration.
---

# Triage Firestore Bug

## Symptoms → checks

| Symptom | First look |
|---------|------------|
| UI not updating | `useGame.ts` subscriptions; network tab; Firestore rules |
| Wrong target after join mid-setup | BUG-1: `startGame` uses `writeBatch` not transaction |
| Player has no target/task | Race during `startGame`; verify players subcollection |
| Elimination re-link wrong | Stale read outside transaction (BUG-4, BUG-5) |
| Invalid data crashes UI | Zod parse in `@/types/firestoreParse` — check `__DEV__` warnings |
| Host action rejected | No server-side host auth — check `user.uid === game.hostId` in UI only |

## Diagnosis steps

1. Reproduce with ≥2 clients (two browser tabs, incognito).
2. Inspect Firestore console: `games/{id}` and `players` subcollection — compare to UI.
3. Read the mutation path in `gameService.ts` — is it `writeBatch` or `runTransaction`?
4. Confirm reads happen **inside** the same transaction as dependent writes.
5. Check `docs/BACKLOG.md` for known issues (BUG-1 through BUG-5).

## Fix patterns

- Convert `writeBatch` → `runTransaction` when consistency matters
- Move `getDocs` inside transaction before writes
- Query `players` subcollection instead of `game.playerIds`
- Add/adjust unit test in `gameLogic.test.ts` for the rule, not just the Firestore path

## Verify

```bash
cd client && npm run verify
```
