# Glossary — Midnight Wire

Single source of truth for user-facing terminology. Every string in
[`client/src/strings.ts`](../client/src/strings.ts) must use the canonical term for its concept.
Decision: [`docs/plans/overhaul/adr-0006-terminology-canon.md`](plans/overhaul/adr-0006-terminology-canon.md).
Implementation map: [`docs/plans/overhaul/02-terminology.md`](plans/overhaul/02-terminology.md).

## Voice guardrail

- **Plain word first, spy flavor second.** Say what the tap/screen actually does; let the spy skin
  live in atmosphere ("TOP SECRET", status crawls), never in the load-bearing label.
- **One canonical word per concept.** No synonym parade — if the table below names it, that is the
  only word players see.

## Canonical terms

| Concept | Canonical | Retired synonyms (banned in UI copy) |
|---|---|---|
| A player | **Agent** | player, operative, asset, assassin |
| Spy name | **Callsign** | name, cover, identity |
| Game session | **Game** | Operation, Op, Protocol |
| Room code | **Game Code** | OP CODE, Operation Code |
| The to-do you engineer | **Mission** | Directive, Objective, Task, Contract (as the to-do), "Mission Objective" |
| Trade the to-do | **Swap** ("Swap mission") | Reroll, Scramble, Shuffle, "objective change" |
| Remove a player | **Eliminate** (status/count) + **Catch** (field verb) | Neutralize, Compromise, Kill, Terminate, Extract |
| Reconnect code | **Agent Key** | Recovery PIN, Encryption Key, Death Code |
| Host / house | **Host** | Bureau, Admin (as labels) |
| Results screen | **Leaderboard** | Situation Room, Command Center, Intel |
| How-to screen | **How to play** | Briefing, Info, "How it works" |
| Setup screen | **Game Settings** | Mission Control, Customize, Configure |
| Score mode | **Infinite** | Score attack, Continuous |
| Classic mode | **Classic** | Elimination (as the mode name) |
| Win threshold | **Score to win** | "Mission Success" (collides with the Victory title) |
| Watch-only | **Spectator** | — |

**Eliminate vs Catch:** an agent **catches** a target (the field verb they tap); the system records
an **elimination** (the leaderboard/host status + count). Keep them distinct.

## Banned synonyms — grep list

Before merging any copy change, grep `client/src/strings.ts` for these. A hit in a **string value**
is a blocker; a hit in a **key name or code identifier** is allowed (see below).

```
operation | op code | protocol            # → Game / Game Code
directive | objective | task (as todo)    # → Mission
reroll | scramble | shuffle               # → Swap
neutralize | compromise | terminate | assassin   # → Catch / Eliminate / Agent
recovery pin | encryption key | death code       # → Agent Key
bureau | admin (as a label)               # → Host
situation room | command center | intel   # → Leaderboard
briefing | "how it works"                 # → How to play
mission control | customize | configure   # → Game Settings
cover | identity | "your name"            # → Callsign
operative | asset | player                # → Agent
mission success                           # → Score to win / VICTORY
score attack | continuous                 # → Infinite
```

Suggested check: `grep -inE 'operation|op code|directive|objective|reroll|scramble|neutralize|compromise|recovery pin|bureau|situation room|command center|briefing|mission control|customize|operative|assassin|mission success' client/src/strings.ts` — every remaining hit should be a key name or an intentional flavor string, never a user-facing label.

## Code identifiers may keep their names

The canon governs **user-facing strings only**. Existing code field and identifier names are
explicitly allowed to keep their spelling to avoid churny data migrations:

- `killCount`, `rerollsUsed`, `respawnCount`, `callsign`, `taskDescription`,
  `pendingTaskDescription`, `emergencyPin`, `eliminatedBy`, `scrambleTask`, `status: 'ELIMINATED' | 'PENDING_ELIMINATION'`.
- `strings.ts` keys named for retired words (`INTEL_*`, `CONTRACT_*`, `serviceErrors.OPERATION_*`,
  `INVALID_RECOVERY_PIN`, etc.) may keep their key names; only their **values** must be canonical.
  Optional key/identifier renames are tracked as non-blocking cleanup in `02-terminology.md` §f.

## Note for design docs

Inside internal design docs and ADRs the words **directive**, **task**, and **mission** all denote
the same concept — the to-do an agent engineers for their target — whose canonical **user-facing**
term is **Mission**. Prose in the plans may use the older words interchangeably; shipped copy may
not.
