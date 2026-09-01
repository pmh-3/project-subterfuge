# 02 — Terminology (implementation spec)

> Conforms to [`00-decisions.md`](00-decisions.md) **D3** (simplify the chrome, keep a light spy
> skin — one canonical word per concept) and the cross-cutting rule: **copy lives only in
> `client/src/strings.ts`**; code identifiers may keep their names.
>
> Companion docs: the living glossary is [`docs/GLOSSARY.md`](../../GLOSSARY.md); the decision
> record is [`adr-0006-terminology-canon.md`](adr-0006-terminology-canon.md).
>
> This file is the **implementation payload**: an exact old→new rename map keyed to real string
> keys in `client/src/strings.ts`. When this file and a component disagree, this file wins — but
> **only `strings.ts` is edited**; components already read the keys below.

---

## (a) Canonical table

One word per concept. The **Retire** column lists synonyms that must disappear from user-facing
copy (they may survive as code identifiers — see the GLOSSARY note).

| Concept | Canonical | Retire (from UI copy) |
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
| Win threshold | **Score to win** | "Mission Success" (collides with Victory title) |
| Watch-only | **Spectator** | — |

**Eliminate vs Catch split.** *Catch* is the moment-of-action field verb an agent taps on their
own screen ("I caught my target"). *Eliminate* is the resulting **status/count** language used on
the leaderboard, the host roster, and system messages. Keep them distinct: an agent **catches**;
the system then records an **elimination**.

---

## (b) Rename map (exact, keyed to `strings.ts`)

Format: `KEY: "old" → "new"`. Keys not listed here are already canonical (`APP_NAME`,
`GAME_CODE_LABEL`, `LOBBY_AGENT_KEY_LABEL`, `HOST_ELIMINATE`, `GAME_INVITE_AGENTS`,
`LOBBY_WATCH_SPECTATOR`, …) and must **not** change. Line numbers reference `strings.ts` as it
exists before the overhaul.

### Worst offenders (do these first — highest synonym density)

**The to-do → Mission** (retire Directive / Objective / Task / Contract-as-todo)
```
CONTRACT_HEADER_TITLE:      "CONTRACT"          → "MISSION"
CONTRACT_TAB:               "ACTIVE CONTRACT"   → "ACTIVE MISSION"
CONTRACT_DIRECTIVE:         "DIRECTIVE"         → "MISSION"
CONTRACT_MISSION_OBJECTIVE: "MISSION OBJECTIVE" → "MISSION"
GAME_TAB_CONTRACT:          "CONTRACT"          → "MISSION"
CONFIGURE_LOADING:          "LOADING TASK LIBRARY..." → "LOADING MISSIONS..."
CONFIGURE_TASK_PACKS_LABEL: "TASK PACKS"        → "MISSION PACKS"
CONFIGURE_NO_PACKS_TITLE:   "No Task Packs Selected"  → "No Mission Packs Selected"
CONFIGURE_NO_PACKS_MESSAGE: "Select at least one task pack so missions can be assigned."
                            → "Select at least one mission pack so missions can be assigned."
dynamicStrings.theirObjectiveWas: `THEIR CONTRACT: ${task}` → `THEIR MISSION: ${task}`
```

**Swap the to-do → Swap** (retire Reroll / Scramble / Shuffle / "objective change")
```
CONTRACT_SWAP_DIRECTIVE:    "SWAP DIRECTIVE"    → rename key to CONTRACT_SWAP_MISSION, value "SWAP MISSION"
GAME_ALERT_FAILED_REASSIGN: "Failed to reassign objective" → "Failed to swap mission"
serviceErrors.NO_MORE_OBJECTIVE_CHANGES: "No more objective changes allowed"
                            → rename key to NO_MORE_SWAPS, value "No swaps left."
```
(`CONFIGURE_OBJECTIVE_SWAPS_LABEL` = "MISSION SWAPS" is already canonical — keep. Its **hint** has
a separate bug, see §c.)

**Remove a player → Eliminate (status) / Catch (verb)** (retire Neutralize / Compromise / Kill / Terminate / Extract)
```
CONTRACT_NEUTRALIZE_TARGET: "NEUTRALIZE TARGET" → "CATCH TARGET"      (field verb)
GAME_ALERT_COMPROMISED:     "YOU'VE BEEN COMPROMISED" → "YOU'VE BEEN CAUGHT"
GAME_CONFIRM_ELIMINATION:   "ADMIT DEFEAT"      → "CONFIRM: I WAS CAUGHT"
GAME_DENY_ELIMINATION:      "DISPUTE: STILL IN PLAY" → "NO — STILL IN PLAY"
INTEL_MISSION_TERMINATED:   "MISSION TERMINATED" → "GAME OVER"
```
(`HOST_ELIMINATE` "ELIMINATE", `GAME_MODAL_FORCE_ELIMINATE_BUTTON` "FORCE ELIMINATE",
`GAME_ALERT_FAILED_LOG` "Failed to log elimination", `NO_PENDING_ELIMINATION` — all already use the
canonical **Eliminate** family; keep.)

**Game session → Game** (retire Operation / Op / Protocol)
```
LOBBY_JOIN_OPERATION:       "JOIN OPERATION"    → "JOIN GAME"
LOBBY_START_OPERATION:      "START OPERATION"   → "START GAME"
GAME_OPERATION_COMPROMISED: "OPERATION COMPROMISED" → "CONNECTION LOST"
GAME_BEGIN_OPERATION:       "BEGIN OPERATION"   → "START GAME"
GAME_EXIT_OPERATION:        "← EXIT OPERATION"  → "← EXIT GAME"
GAME_ALERT_FAILED_END:      "Failed to end operation: " → "Failed to end game: "
HOST_END_OPERATION:         "END OPERATION"     → "END GAME"
INTEL_OPERATION_COMPLETE:   "OPERATION COMPLETE" → "GAME OVER"
INTEL_OPERATION_CONCLUDED:  "OPERATION CONCLUDED" → "GAME OVER"
GAME_JOINED_MID_OPERATION:  "Joined mid-operation. 0 eliminations. Hunt your target."
                            → "Joined mid-game. 0 eliminations. Hunt your target."
VICTORY_INFINITE_TITLE:     "OPERATION\nCONCLUDED" → "VICTORY"
ALERT_OPERATION_FAILED_TITLE:"Operation Failed"  → "Something Went Wrong"
ALERT_OPERATION_FAILED_INIT:"Could not establish operation. Try again."
                            → "Could not create the game. Try again."
ALERT_ACCESS_DENIED_JOIN:   "Could not join operation" → "Could not join game"
dynamicStrings.endOperationFailed:(m)=>`Failed to end operation: ${m}` → `Failed to end game: ${m}`
serviceErrors.OPERATION_NOT_FOUND:          "Operation not found" → "Game not found"
serviceErrors.OPERATION_ALREADY_IN_PROGRESS:"Operation already in progress" → "Game already in progress"
serviceErrors.OPERATION_FULL: "This operation is at capacity (40 agents max)" → "This game is full (40 agents max)"
serviceErrors.PLAYER_NOT_ALIVE:"You are not active in this operation" → "You are not active in this game"
useGameErrors.OPERATION_NOT_FOUND:          "Operation not found" → "Game not found"
```

**Room code → Game Code** (retire OP CODE / Operation Code)
```
LOBBY_OPERATION_CODE_LABEL: "OPERATION CODE"    → "GAME CODE"
IDENTITY_OP_CODE:           "OP CODE"           → "GAME CODE"
ALERT_INVALID_CODE_MESSAGE: "Operation Code must be 4 characters" → "Game Code must be 4 characters"
dynamicStrings.operationSubtitle:(id)=>`OP CODE: ${id}` → `GAME CODE: ${id}`
```
(`LOBBY_OPERATION_CODE_PLACEHOLDER` "XXXX" value is fine; rename the key to
`LOBBY_GAME_CODE_PLACEHOLDER` as optional tidy-up.)

**Agent Key vs Recovery PIN** (retire Recovery PIN / Encryption Key / Death Code)
```
serviceErrors.INVALID_RECOVERY_PIN: "Invalid Recovery PIN or Game ID"
                            → "Invalid Agent Key or Game Code"
```
This is the only place "Recovery PIN" leaks into copy. The key name `INVALID_RECOVERY_PIN` and the
field `emergencyPin` may keep their identifiers (non-blocking); the **string** must say Agent Key.
Everywhere else already uses Agent Key: `LOBBY_AGENT_KEY_LABEL`, `ALERT_INVALID_KEY_MESSAGE`
("Agent Key must be 3 digits"), `ALERT_ACCESS_DENIED_INVALID_KEY` ("Invalid Agent Key"),
`AGENT_KEY_BADGE_LABEL`, `dynamicStrings.agentKeySubtitle` — keep.

### Remaining renames

**Spy name → Callsign** (retire name / cover / identity)
```
LOBBY_YOUR_NAME_LABEL:      "Enter your name."  → "Enter your callsign."
LOBBY_CHOOSE_COVER:         "Your identity"     → "Your callsign"
LOBBY_IDENTITY_CONFLICT_TITLE:"IDENTITY CONFLICT" → "CALLSIGN TAKEN"
LOBBY_VERIFY_IDENTITY:      "VERIFY IDENTITY"   → "RECLAIM CALLSIGN"
LOBBY_USE_DIFFERENT_NAME:   "← USE A DIFFERENT NAME" → "← USE A DIFFERENT CALLSIGN"
LOBBY_NAME_REQUIRED:        "Enter your name to continue." → "Enter your callsign to continue."
ALERT_INVALID_NAME_TITLE:   "Name Required"     → "Callsign Required"
ALERT_INVALID_NAME_MESSAGE: "Please enter your name so other players know who you are."
                            → "Please enter your callsign so other agents know who you are."
IDENTITY_LABEL:             "YOUR NAME"         → "YOUR CALLSIGN"
serviceErrors.IDENTITY_ACTIVE_INVALID_CREDENTIALS:
   "That name is already in use. Enter the correct Agent Key or choose a different name."
   → "That callsign is already in use. Enter the correct Agent Key or choose a different callsign."
```

**A player → Agent** (retire player / operative / asset / assassin)
```
CONFIGURE_MODE_ELIMINATION_SUB: "Last player standing wins" → "Last agent standing wins"
serviceErrors.NEED_AT_LEAST_2_PLAYERS: "Need at least 2 players to start" → "Need at least 2 agents to start"
serviceErrors.ASSASSIN_NOT_FOUND: "Assassin not found" → "Agent not found"
serviceErrors.PLAYER_NOT_FOUND:   "Player not found"   → "Agent not found"
briefingParagraphs[1]: "Each player gets a secret mission and a target..."
                            → "Each agent gets a secret mission and a target..."
briefingParagraphs[2]: "When a mission succeeds, that player is out. ... Last person standing wins."
                            → "When a mission succeeds, that agent is out. ... Last agent standing wins."
```
(`GAME_LOBBY_NEED_PLAYERS` already says "Need at least 2 agents to begin." — keep.)

**Setup screen → Game Settings** (retire Mission Control / Customize / Configure)
```
CONFIGURE_HEADER_TITLE:     "MISSION CONTROL"   → "GAME SETTINGS"
GAME_CUSTOMIZE:             "CUSTOMIZE"         → "SETTINGS"
GAME_CUSTOMIZE_GAME:        "CUSTOMIZE GAME"    → "GAME SETTINGS"
```

**How-to screen → How to play** (retire Briefing / Info / "How it works")
```
GAME_TAB_INFO:              "INFO"              → "HOW TO PLAY"
INFO_TITLE:                 "INFO"              → "HOW TO PLAY"
INFO_SECTION_HOW_IT_WORKS:  "How it works"      → "How to play"
LOBBY_BRIEFING_TAB:         "BRIEFING"          → "HOW TO PLAY"
```
(`HOME_HELP_LABEL` already "How to play" — keep. `BRIEFING_CLOSE` "Close" — keep.)

**Host / house → Host** (retire Bureau / Admin)
```
HOST_ADMIN_TITLE:           "ADMIN CONTROL"     → "HOST CONTROLS"
GAME_TAB_ADMIN:             "ADMIN"             → "HOST"
INTEL_KILLER_HOST:          "BUREAU ORDER"      → "HOST"
```

**Win threshold → Score to win** (retire "Mission Success"; also fixes the Victory-title collision)
```
CONFIGURE_MISSION_SUCCESS_LABEL: "MISSION SUCCESS" → "SCORE TO WIN"
HOST_MISSION_SUCCESS_LABEL:      "MISSION SUCCESS" → "SCORE TO WIN"
CONFIGURE_MISSION_SUCCESS_HINT:  "Number of confirmed eliminations needed to win the operation."
                                 → "Number of confirmed eliminations needed to win the game."
CONFIGURE_MODE_INFINITE_SUB:     "Score attack. First to reach mission success wins."
                                 → "First to reach the score to win."
VICTORY_TITLE:                   "MISSION\nSUCCESS" → "VICTORY"
```
Note the chain: `VICTORY_TITLE` was "MISSION SUCCESS", **and** two settings labels were also
"MISSION SUCCESS". Retiring the phrase resolves the collision D3 calls out — the win threshold is
now **Score to win**, and the victory banner is **VICTORY**.

**Classic mode name** (retire Elimination as the mode label)
```
CONFIGURE_MODE_ELIMINATION: "Elimination"       → "Classic"
```
(Rationale: `00-decisions.md` legend defines the two modes as **Classic** and **Infinite**.
`CONFIGURE_MODE_INFINITE` "Infinite ∞" is already canonical — keep.)

---

## (c) The two copy bugs

### Bug #2 — "swaps are per game, not per target" (D1)
The swap budget is a **fixed per-game budget** (`maxRerolls`); it is not per-target and does not
reset per mission. The hint currently reads ambiguously:

```
CONFIGURE_OBJECTIVE_SWAPS_HINT: "How many times each player can trade their mission for a new random one."
```
→
```
CONFIGURE_OBJECTIVE_SWAPS_HINT: "How many times each agent can swap their mission over the whole game — a fixed budget, not per target."
```

The per-agent counter string (`strings.ts:232`) is fine wording-wise but should read as a fixed
remaining budget:
```
dynamicStrings.objectiveSwapsLeft:(n)=>`${n} swap${n===1?'':'s'} left`   // keep value; see identifier note in (f)
```
The rest of Bug #2 is UX (a refresh icon on the Swap control) and is owned by `03-ui-ux.md`.

### Bug #5 / D8 — leaderboard: eliminations made vs times eliminated
The leaderboard must show two clearly-labeled numbers per agent. **The numbers and layout are owned
by `03-ui-ux.md`; this doc owns the exact strings and new keys.** Add:

```
INTEL_ELIMINATIONS_MADE: "Eliminations made"    // paired with killCount
INTEL_TIMES_ELIMINATED:  "Times eliminated"      // infinite: respawnCount; classic: ELIMINATED ? 1 : 0
dynamicStrings.deathCount:(n)=>`${n} time${n===1?'':'s'}`   // value only; label supplied by INTEL_TIMES_ELIMINATED / icon
```
Keep the existing `INTEL_ELIMINATIONS` / `INTEL_ELIMINATION` and
`dynamicStrings.eliminationCount` for the kill metric; `deathCount` is its counterpart for the
second number. D9/`03` may render either label as an icon + number to reduce wordiness — the
strings above are the accessible/long forms.

---

## (d) New keys other specs reference — finalized wording

These keys are referenced by `05-infinite-mode-independent-targets.md` and `03-ui-ux.md`; their
wording is finalized here so all specs pull the same values.

```
// swaps
serviceErrors.NO_MORE_SWAPS: "No swaps left."                       // replaces NO_MORE_OBJECTIVE_CHANGES
CONTRACT_SWAP_TARGET:  "SWAP TARGET"                                 // infinite only (D2); classic hides it
CONTRACT_SWAP_MISSION: "SWAP MISSION"                                // replaces CONTRACT_SWAP_DIRECTIVE

// shared-target / stacked confirmations (D5)
dynamicStrings.multiClaimVictim:(n)=>`${n} agents are claiming you — confirm each.`
TARGET_LEFT_REASSIGNED: "Your target left the game. New target assigned."   // the "target left" banner
```

Notes:
- `multiClaimVictim` renders above the stacked `CONFIRM: I WAS CAUGHT` / `NO — STILL IN PLAY`
  buttons when the FIFO queue has more than one pending claim (D5). Singular case (n = 1) uses the
  existing single-confirmation copy; only show this line when n ≥ 2.
- `TARGET_LEFT_REASSIGNED` is the transient banner shown when a target leaves legitimately
  (host-remove / quit) and a fresh target is assigned — the only silent-reassign case D5 permits.
  Reuses the existing `showTransientBanner` path (see `[id].tsx`, where `GAME_JOINED_MID_OPERATION`
  already uses it).

---

## (e) Awkward-string cleanups (plain replacements)

The worst offenders read like a spy movie and hide the actual action. Recommended plain values
(already folded into the map above; collected here as the rationale):

| Key | Old (awkward) | New (plain) | Why |
|---|---|---|---|
| `CONTRACT_NEUTRALIZE_TARGET` | "NEUTRALIZE TARGET" | "CATCH TARGET" | "Neutralize" is retired; this is the field verb — **Catch** |
| `GAME_CONFIRM_ELIMINATION` | "ADMIT DEFEAT" | "CONFIRM: I WAS CAUGHT" | Says what the tap does; no melodrama |
| `GAME_DENY_ELIMINATION` | "DISPUTE: STILL IN PLAY" | "NO — STILL IN PLAY" | Reads as the answer to a claim |
| `GAME_ALERT_COMPROMISED` | "YOU'VE BEEN COMPROMISED" | "YOU'VE BEEN CAUGHT" | "Compromised" retired → **Caught** |
| `GAME_OPERATION_COMPROMISED` | "OPERATION COMPROMISED" | "CONNECTION LOST" | It is a connection-error title, not a plot beat |

`CONTRACT_TOP_SECRET` ("TOP SECRET"), `GAME_RETURN_TO_BASE` ("RETURN TO BASE"), and the
`WELCOME_STATUS_*` strings are **flavor, not concept terms** — they carry the light spy skin D3 asks
us to keep and are left as-is.

Minor flavor to watch (optional, low priority): `taskPackStrings.ice_breaker_description`
("...potential assets...") and `taskPackStrings.fallback_difficulty` ("Operative") brush the retired
words *asset* / *operative*. They read as pack/difficulty flavor rather than player-role labels, so
they are non-blocking; soften only if a copy pass revisits the packs.

---

## (f) Optional identifier renames (non-blocking cleanup)

Code identifiers may keep their names (D3). The following are **nice-to-have** renames that would
align identifiers with the canon; do them only in a dedicated cleanup PR, never mixed with logic:

- `ContractView` prop `onScramble` → `onSwap`; local `canShuffle` → `canSwap`; `[id].tsx`
  `executeScramble` → `executeSwap`.
- `strings.ts` keys still named for retired words: `CONTRACT_SWAP_DIRECTIVE` →
  `CONTRACT_SWAP_MISSION`, `NO_MORE_OBJECTIVE_CHANGES` → `NO_MORE_SWAPS`,
  `INTEL_*` (Intel → Leaderboard), `LOBBY_OPERATION_CODE_*`, `IDENTITY_OP_CODE`,
  `serviceErrors.OPERATION_*`, `HOST_ADMIN_TITLE`, `HOST_MISSION_SUCCESS_LABEL`,
  `GAME_*_OPERATION`, `dynamicStrings.operationSubtitle` / `theirObjectiveWas` /
  `endOperationFailed` / `objectiveSwapsLeft`.
- Service/data field names (`killCount`, `rerollsUsed`, `callsign`, `taskDescription`,
  `emergencyPin`, `scrambleTask`, `eliminatedBy`) are explicitly allowed to keep their names — see
  `GLOSSARY.md`. Do **not** churn Firestore field names for cosmetics.
