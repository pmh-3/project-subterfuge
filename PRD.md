This document serves as the **Product Requirements Document (PRD)** and **Technical Specification** for "Project Subterfuge." It is designed to be ingested by coding agents (like Cursor) to scaffold the initial application.

---

# Project Specification: Subterfuge

## 1. Product Overview & Vision

**Subterfuge** is a social "assassin" game focused on **task-based elimination** through social engineering and manipulation. Unlike traditional "water gun" assassin games, this version is non-violent and relies on creative "ruses" to eliminate targets.

### Core Mechanics

* **Target Loops:** Players are arranged in a circular chain. Player A targets Player B, B targets C, and the last player targets A.
* **The Contract:** Instead of "tagging" a target, an assassin must trick their target into completing a specific social task (e.g., "Get the target to whisper a secret to a houseplant").
* **Consensual Elimination (The Death Code):** Every player has a unique, secret **"Death Code"** (Encryption Key). When they are successfully tricked, they must verbally give their code to their assassin. The assassin enters this code to confirm the "kill."
* **Instant Re-assignment:** Upon a successful kill, the assassin immediately inherits the eliminated player’s target and a new task.

### Branding & Aesthetic

* **Theme:** Sleek, high-stakes modern espionage/cyber-spy.
* **Visual Style:** Dark mode, minimalist, neon accents, high-tech "Dossier" UI.
* **Terminology:** * "Kill"  **Neutralize / Compromise**
* "Eliminated"  **Exposed / Extracted**
* "Task"  **Contract / Objective**
* "Death Code"  **Encryption Key**


* **Proposed Names:** *Subterfuge* (Codename), *Protocol*, *Handled*, *Undercover*.

---

## 2. Tech Stack & Core Features

### Tech Stack

* **Framework:** React Native with **Expo** (Cross-platform iOS/Android).
* **Backend/Database:** **Firebase** (Firestore for real-time game state, Firebase Auth for users).
* **State Management:** React Context or Redux Toolkit for real-time target tracking.
* **Push Notifications:** Expo Notifications (Crucial for "Target Neutralized" alerts).

### Core Features to Implement

1. **Circular Shuffle Logic:** An algorithm that takes  players and creates a randomized, closed-loop linked list of targets.
2. **Encryption Key System:** Generates a 4-6 character alphanumeric code for each user upon game entry.
3. **The Dossier (Main UI):** Displays the current Target's callsign, the current Contract (task), and a "Log Success" button.
4. **Verification Input:** A keypad UI to enter the target's code. If code matches target's secret key, trigger the "re-link" logic.
5. **Re-Linking Engine:** When Player B is eliminated by Player A:
* Set Player B status to `Extracted`.
* Fetch Player B's target (Player C).
* Update Player A's target to Player C.
* Generate/Assign a new random task to Player A.


6. **Ghost Mode (The Panic Button):** A gesture-based UI swap (e.g., 3-finger tap) that replaces the game screen with a fake productivity app (Calendar/Weather) to prevent targets from seeing the screen.
7. **AI Task Library:** Integration with an LLM API (like Gemini) to generate contextual tasks based on the game environment (e.g., "House Party," "Office," "Campus").

---

## 3. User Flow

### Phase 1: Initiation (Onboarding)

1. **Welcome:** Splash screen with "Biometric Scan" (aesthetic haptic feedback).
2. **Identity:** User enters a **Callsign** (Username).
3. **Key Generation:** App displays the user's **Encryption Key**. *Constraint: User must confirm they have memorized or noted this key.*
4. **Join/Host:** User enters a Game Room Code.

### Phase 2: The Briefing (Lobby)

1. **Live Roster:** Users see callsigns of other agents in the network.
2. **Deployment:** Once the Host hits "Initiate Protocol," a 5-second synchronized countdown appears on all devices.

### Phase 3: Active Operations (Gameplay)

1. **Receive Contract:** Screen "decrypts" to reveal Target Callsign and the specific Task.
2. **Field Work:** Player attempts to trick the target in real life.
3. **Neutralization:** * Target is tricked  Target gives Code to Assassin.
* Assassin hits **"Log Success"**  Enters Code.
* App validates  Target's phone vibrates/notifies: *"You have been compromised."*
* Assassin's phone updates immediately with the next target in the loop.



### Phase 4: After-Action Report (AAR)

1. **Feed:** A live "Intel Feed" showing a timeline of eliminations (e.g., *"Agent Viper compromised Agent Ghost at 10:45 PM"*).
2. **Victory:** When only two players remain and one is neutralized, the winner is declared.

---

## 4. Development Instructions for Coding Agents

* **Database Schema:** Focus on a `games` collection containing `players` sub-collections. Each player document should store `targetID`, `taskID`, `isAlive`, and `secretKey`.
* **Security:** Ensure players cannot view the `secretKey` of anyone other than themselves via Firestore Security Rules.
* **Real-time Listeners:** Use `onSnapshot` in Firebase to ensure that when an assassin eliminates a target, the "victim" and the "assassin" see the UI update instantly without a refresh.

**Next Step for AI:** *Scaffold the React Native Expo project and initialize a Firebase connection with a basic "Join Game" and "Target Assignment" logic.*