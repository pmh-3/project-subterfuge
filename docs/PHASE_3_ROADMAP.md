# Phase 3: Usability & Gameplay Enhancements (Revised)

## Priority 0: Core Loop Enhancements (Completed)
- [x] **Command Center (Scoreboard & Feed):** Centralized dashboard for all players.
- [x] **Task Scramble (Reroll):** One-time ability to change tasks.
- [x] **Host Control Panel:** Force Eliminate players to fix stuck games.
- [x] **UI Overhaul:** "Cold War" Aesthetic (Manila/Brass/Typewriter).
- [x] **Player Identity:** Persistent header with name/avatar.

## Priority 1: Resilience & Polish (Completed)

1.  **Agent Key (Reconnection)** ✓ COMPLETE
    *   Matching callsign + 3-digit Agent Key = identity takeover to new device.

2.  **Agent Avatars (Icons)** ✓ COMPLETE
    *   6 customizable icons (Bomb, Martini, Glasses, Key, Fedora, Pipe).

3.  **Win Screen Polish** ✓ COMPLETE
    *   Typewriter takeover effect.

4.  **Basic Training Pack** ✓ COMPLETE
    *   101 vetted, weighted tasks.

5.  **Pre-Launch Polish** ✓ COMPLETE
    *   Briefing / Instructions modal.
    *   Share Link support (Deep Links).
    *   Copy OP CODE to clipboard.
    *   Deep link auto-join flow.

## Priority 2: Notifications
*   **Elimination alerts:** In-app banner when a player is eliminated.
*   **Web:** Use the Notification API / service worker for background push.
*   **iOS:** Requires expo-notifications + APNs setup + a server component (Firebase Cloud Functions or similar) to trigger pushes on Firestore writes.
*   **Note:** Web push is simpler (no app store); iOS push requires Apple Developer Program + FCM integration.

## Priority 3: Mugshot Upload
*   Allow players to take or upload a photo as their profile image.
*   Adds a visual identifier for groups where players don't know each other.
*   **Requires:** expo-image-picker, Firebase Storage for hosting images, display in ContractView photo box and Command Center.

## Priority 4: Continuous / Multi-Contract Game Mode
*   The major gameplay shift: players are never truly eliminated.
*   **Options to explore:**
    *   **Respawn Mode:** Eliminated players re-enter the chain after a cooldown, receiving a new target and mission. Game ends on a timer or kill-count threshold.
    *   **Multi-Contract Mode:** Each player holds multiple active contracts simultaneously. Eliminations reduce your contract count; you're only out when all contracts are spent.
    *   **Continuous Loop:** No elimination at all — completing a contract just scores a point and you get a new one. Pure point race on a timer.
