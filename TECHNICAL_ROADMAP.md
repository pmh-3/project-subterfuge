# Technical Roadmap & Architecture: Project Subterfuge (MVP / PoC)

> **Role:** Senior Full-Stack Mobile Architect
> **Date:** January 24, 2026
> **Version:** 3.1.0 (Justification Update)
> **Status:** Approved for Implementation

## 1. System Architecture & Tech Stack Justification

### **The Stack**
*   **Frontend:** React Native (Expo)
*   **Backend:** Firebase Firestore (NoSQL)
*   **Auth:** Firebase Auth (Anonymous)

### **Why this Stack? (The Justification)**
For "Project Subterfuge," we need three things above all else:
1.  **Real-Time Sync:** When I kill you, your phone must buzz *immediately*.
2.  **Cross-Platform:** The game breaks if the "Android friend" can't play.
3.  **Zero-Friction Onboarding:** No one wants to "Sign Up" for a party game.

| Choice | Why it wins | The Alternatives |
| :--- | :--- | :--- |
| **Expo (React Native)** | **Write Once, Run Everywhere.** Native performance without learning Swift/Kotlin. The "Expo Go" app allows instant testing on physical devices without compiling. | **Flutter:** Good, but Dart is a niche language compared to TypeScript.<br>**Swift/Kotlin:** Too expensive to maintain two codebases for a side project. |
| **Firestore** | **Real-Time is Free.** The `onSnapshot` feature is magic. It pushes updates to clients automatically. No WebSockets code to write. | **Supabase:** Great, but its real-time (Postgres Broadcast) is slightly more complex to setup for this specific "document-watch" pattern.<br>**AWS Amplify:** Overkill complexity. |
| **Anonymous Auth** | **Frictionless.** User opens app -> assigned ID -> Ready. | **Email/Social:** Too much friction. "Verify your email" kills the vibe of a party game. |

### **What is Overkill? (And what we cut)**
*   **Redux/MobX:** **Overkill.** The app state is almost entirely remote. React Context + Firestore is plenty.
*   **Cloud Functions:** **Overkill (for MVP).** We moved logic to the client. We don't need a secure server environment for a friendly game.
*   **SQL (Postgres):** **Overkill.** We don't have complex relationships. We have a simple list of JSON objects.

---

## 2. Simplified Architecture (Client-Side Logic)

To streamline development and remove the need for a separate Node.js backend environment (Cloud Functions), we will move the **Game Logic** to the **Client** for the MVP.

*   **Host Authority:** The player who starts the game acts as the "Server" for the initial setup (Shuffle & Assignment).
*   **Client Transactions:** Critical actions (like "Logging a Kill") will use **Firestore Client-Side Transactions**. This ensures data integrity (preventing race conditions) without needing server-side code.

### **Tech Stack**
*   **Frontend:** React Native (Expo)
*   **Backend:** Firebase Firestore (Direct SDK usage) + Firebase Auth (Anonymous)
*   **State:** React Context + Firestore `onSnapshot` (Real-time)

---

## 3. Database Schema (Updated for Handshake)

We will keep the robust schema design. This ensures that when we eventually move to a secure backend, we don't have to migrate data.

### **Collection: `games`**
```json
{
  "id": "ABCD",
  "hostId": "user123",
  "status": "LOBBY",           // "LOBBY", "ACTIVE", "COMPLETED"
  "playerIds": ["user1", "user2", "user3"],
  "createdAt": 1706000000000,
  "selectedPacks": ["basic_training"],
  "difficultySetting": "Mixed", // "Mixed", "Easy", "Medium", "Hard"
  "maxRerolls": 5,
  "winnerId": "user1"           // set on COMPLETED
}
```

### **Sub-Collection: `games/{gameId}/players`**
```json
{
  "uid": "user123",
  "callsign": "Agent Viper",
  "avatarId": "icon-binoculars",
  "emergencyPin": "042",        // 3-digit Agent Key for identity recovery
  "status": "ALIVE",            // "ALIVE", "PENDING_ELIMINATION", "ELIMINATED", "WINNER"
  "pendingEliminationBy": null,  // UID of the assassin claiming the kill
  "pendingTaskDescription": null,
  "targetId": "user456",
  "targetCallsign": "Agent Ghost",
  "taskDescription": "Make the target high-five a stranger.",
  "rerollsUsed": 0,
  "killCount": 0,
  "eliminatedBy": null,
  "eliminatedAt": null
}
```

### **Collection: `packs`**
```json
{
  "display_name": "Basic Training",
  "is_premium": false
}
```

### **Collection: `missions`**
```json
{
  "pack_id": "basic_training",
  "mission_name": "The Orthographist",
  "difficulty": 1,              // 1=Easy, 2=Medium, 3=Hard
  "directive": "Get the target to spell a word out loud."
}
```

---

## 4. Core Logic Algorithms (Client-Side Implementation)

### **A. The Circular Shuffle (Host Client)**
*Run by the Host's device when clicking "Start Game".*
1.  Read all player documents in the lobby.
2.  Perform **Fisher-Yates Shuffle** in local JavaScript.
3.  Assign `targetId` and `targetCallsign` to each player in the linked list.
4.  Assign a random task from a local JSON file to each player.
5.  **Batch Write** all updates to Firestore at once.

### **B. Mutual Confirmation Handshake (The "Kill")**

**Step 1: The Challenge (Assassin)**
*Assassin clicks "Target Neutralized"*
*   Update Target's doc: `status = "PENDING_ELIMINATION"`, `pendingEliminationBy = AssassinID`.

**Step 2: The Handshake (Target)**
*Target sees full-screen "YOU HAVE BEEN COMPROMISED" prompt*
*   **Option A: CONFIRM** -> Triggers Re-linking Logic.
*   **Option B: DENY** -> Clears the `pendingElimination` flag (Dispute).

**Step 3: Re-linking (Target's Device runs this Transaction)**
*   **Read:** Assassin's Doc and Target's Doc.
*   **Write:**
    *   Mark Target as `ELIMINATED`.
    *   Update Assassin's `targetId` to Target's `targetId` (Skipping the dead player).
    *   Update Assassin's `targetCallsign`.
    *   Assign new Task from local library.

---

## 5. MVP Phased Roadmap

We have condensed the timeline to 3 phases, removing "Stealth Mode", "Haptics", and "Notifications" to focus purely on the Game Loop.

### **Phase 1: Foundation & Lobby**
*   **Goal:** Connect players together.
*   **Tasks:**
    1.  **Setup:** Init Expo & Firebase.
    2.  **Auth:** Anonymous Login + "Enter Callsign" screen.
    3.  **Lobby:**
        *   "Create Game" (Generates 4-letter code).
        *   "Join Game" (Adds player to sub-collection).
        *   Real-time list of players in the room.

### **Phase 2: The Engine (Handshake & Dashboard)**
*   **Goal:** The playable loop with Mutual Confirmation.
*   **Tasks:**
    1.  **Start Game:** Host triggers the Shuffle Algorithm (Batch Write).
    2.  **Dashboard UI:**
        *   **Assassin View:** "Target: [Name]", "Mission: [Task]", "Status: HUNTING / PENDING CONFIRMATION".
        *   **Target View:** "Status: ALIVE", *Modal Overlay:* "Confirm Elimination?".
        *   **Host View:** List of all players with "Force Eliminate" button.
    3.  **Handshake Logic:**
        *   Implement "Challenge" (Assassin Write).
        *   Implement "Confirm" (Target Transaction).
    4.  **Host Override:** Admin function to manually run the "Confirm" transaction on behalf of an unresponsive player.

### **Phase 3: Polish & Stability**
*   **Goal:** A smooth experience.
*   **Tasks:**
    1.  **Task Library:** Create a `tasks.json` file with 50+ fun social engineering tasks.
    2.  **Edge Cases:** Handle what happens if the App closes (Persistence).
    3.  **Basic Styling:** Clean, dark-mode UI (Tailwind/NativeWind).

---

## 6. Development Strategy (Next Steps)

1.  **Scaffold:** `npx create-expo-app` with TypeScript.
2.  **Config:** Setup Firebase Console & get API Keys.
3.  **Code:** Build Phase 1 (Screens + Firebase Hook).
