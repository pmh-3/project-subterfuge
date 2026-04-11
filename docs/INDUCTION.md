> **Status: PROPOSAL** -- This redesign has not been implemented yet. The current lobby flow is simpler.

This is the definitive blueprint for **Project: The Induction**. Since you flagged the initial flow as confusing, we have re-engineered the process to be a linear, thematic "induction" rather than a standard app login.

Below is the structured, incremental plan to be saved as `Login_improvement_plan.md`.

---

# 📑 Login_improvement_plan.md

## 1. Directive Overview

Transform the "Command Center" into "The Situation Room" and the login flow into a "Bureau Induction." The goal is to maximize thematic immersion while minimizing user friction using a "Progressive Disclosure" design.

### **Core Terminology**

* **Operation Code:** 4-letter alpha string (e.g., `XFSC`) used to identify a specific game.
* **Agent Key:** 3-digit numeric string (e.g., `742`) assigned to a player for identity verification.
* **Callsign:** The player's display name.
* **Asset Mark:** The SVG icon/mugshot representing the player.

---

## 2. Incremental Implementation Steps

### **Phase 1: Foundational Refactor & Logic**

* **Direct Lookups:** Refactor Firestore queries. Do not "search" for games. Use the **Operation Code** as the Document ID for direct `doc()` lookups. This eliminates entry lag.
* **Case Normalization:** Force all **Operation Code** inputs to `.toUpperCase()` automatically.
* **Deep Linking:** Update the "Invite" share link to be a raw URL with a parameter: `?code=XXXX`. On load, the app must parse this and auto-fill the Operation Code field.

### **Phase 2: The Unified Terminal (Landing Page)**

* **State-Driven UI:** Create a single `LandingTerminal` component.
* **Initial State:** Two primary buttons: `[ INITIALIZE OPERATION ]` (Host) and `[ JOIN OPERATION ]` (Joiner).
* **Join State:** Display two grouped inputs: `Operation Code` and `Callsign`.
* **Layout Fix:** Tighten vertical margins by 40%. Group inputs onto a "Manila Paper" background container. Ensure the "Join" button stays above the fold when the keyboard is active.

### **Phase 3: Identity & The Agent Key**

* **Asset Identification:** * Add a prominent placeholder icon labeled **"ASSIGN FIELD IDENTIFIER"**.
* Tapping opens a modal grid of 12 spy-themed SVGs (Fedora, Briefcase, etc.).
* Once selected, the icon appears in the placeholder with a "Bureau Stamp" overlay.


* **Key Assignment:** * Upon clicking "Join," generate a random 3-digit **Agent Key**.
* Display the **Mechanical Barrel Lock** animation. Three cylinders spin and land on the assigned 3 digits.
* Show a clear message: `"IDENTITY AUTHENTICATED. AGENT KEY: [742]. PROVIDE THIS TO HANDLER IF CONNECTION IS SEVERED."`



### **Phase 4: Session Persistence & Re-entry**

* **Silent Re-entry:** On app mount, check `localStorage`. If `opCode`, `callsign`, and `agentKey` exist and the operation is still active in Firestore, bypass all login screens and route directly to the **Situation Room**.
* **Identity Theft Prevention:** If a user tries to join an active game with a `callsign` already in use, trigger a **"Verification Required"** state.
* **Skeuomorphic Keypad:** Display a 3-digit numeric keypad for the user to enter their **Agent Key**. If it matches the database, allow re-entry.

### **Phase 5: The Situation Room & Host Ledger**

* **The Ledger:** In the Host’s view of the player roster, add a **Key Icon** next to each name. Tapping this reveals that specific agent's 3-digit **Agent Key**.
* **Mission Orientation:** * Add a pulsating manila folder in the lobby labeled **"MISSION ORIENTATION"**.
* On click, open a 3-slide tutorial explaining:
1. **Neutralization:** Complete the task on your Dossier.
2. **The Handshake:** Target provides their **Agent Key** to confirm the "kill."
3. **The Loop:** You inherit the target of the person you just eliminated.





---

## 3. Style & Technical Constraints

* **Font:** Use `Special Elite` for all headers and codes.
* **Background:** Maintain `#1A1612` (Espresso) for the terminal and manila textures for dossiers.
* **Interactions:** Use `KeyboardAvoidingView` for all form states. All buttons should have a "weighted" feel (slight haptic or visual depress).

---

## 🔍 Areas for Agent Consideration

* **Collision Check:** When creating an Operation, the agent must check if a document with that `operationCode` already exists. If so, it must generate a new one.
* **Mugshot Hook:** The `player` object schema should include an optional `mugshotUrl` field, defaulting to the selected SVG icon if null.

---

### **Clarity Check**

Does the "Verification Required" logic make sense for your players? It essentially turns the **Agent Key** into a password that is only used if someone tries to "log in" as you from a new device. This keeps the initial entry fast but the game loop secure.

**Would you like me to generate the first batch of 12 "Asset Mark" SVG descriptions so the agent knows exactly what icons to include?**