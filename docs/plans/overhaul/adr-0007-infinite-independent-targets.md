# ADR 0007 — Infinite mode uses independent, lockable targets

- Status: **Accepted** (pending implementation)
- Date: 2026-08-31
- Supersedes/annexes: ADR 0004 (continuous game mode shape)
- On implementation, move this file to `docs/adr/0007-infinite-independent-targets.md`.

## Context
Infinite (score-attack) mode originally reused classic mode's **single directed cycle** (Hamiltonian ring). Every
elimination re-linked the ring, which:
1. Silently reassigned one innocent bystander's target on every kill ("target swapped without warning").
2. Made assassins inherit the victim's target **and** directive, leaking assignments — fatal in 2-player mode.
3. Created a "someone keeps getting targeted" feel (real bias at N=2; perceived at N≥4), amplified by instant respawn.

A respawn cooldown + in-place reinsert was considered but rejected: it either makes assassins re-hunt the same
person forever (boring) or reintroduces the bystander swap.

## Decision
Infinite mode abandons the cycle invariant and uses **independent target assignments**:
- Each ALIVE agent has one target; **multiple agents may share a target** (in-degree unconstrained).
- A target changes only when the owner swaps it, scores a kill, or the target leaves the game — **never silently**.
- On a kill the assassin gets a **fresh** target + **fresh** directive (no inheritance).
- **Instant respawn, no cooldown, no `RESPAWNING` status.**
- Shared-target claims **stack** in a FIFO queue (`pendingEliminations[]`); each is confirmed independently and
  credited to its assassin; none is lost.
- **Classic mode is unchanged** (keeps the cycle). The two modes now use two explicit target models.

## Consequences
- Fixes the bystander-swap bug by construction; removes the inheritance leak; neutralizes the targeting bias.
- Makes target-swap (D2) and mid-game join (D6) trivial and side-effect-free.
- Simplifies infinite elimination (no anchor/reinsert math); deletes ~5 helper functions from the infinite path.
- Cost: a data-model migration (`pendingEliminationBy`/`pendingTaskDescription` → `pendingEliminations[]`) that
  also touches classic (which will hold ≤1 entry), and a rebuilt infinite simulation test suite.
- New minor considerations: coverage isn't guaranteed (a joiner may be briefly un-hunted — accepted for v1); a
  duplicate-challenge guard is required. Details in `05-infinite-mode-independent-targets.md`.
- Win condition (`isGameOver`, kill goal) is unchanged.
