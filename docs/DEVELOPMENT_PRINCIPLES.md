# Development Principles & Best Practices

> **Project:** Subterfuge
> **Philosophy:** Write Once, Run Everywhere (with style).

This document serves as the guide for all architectural and design decisions.

---

## 1. Cross-Platform Strategy (Web First)

We prioritize a unified codebase that runs seamlessly on both **Mobile (iOS/Android)** and **Web (Browser)**.

### Abstraction Over Platform Detection

*   **Never Use Native APIs Directly:** Platform-specific APIs (Storage, Haptics, Alerts, Notifications) MUST be abstracted.
*   **Abstraction Layers:** Create unified interfaces in `client/src/utils/`, `client/src/hooks/`, or `client/src/components/`.
    *   *Bad:* `if (Platform.OS === 'web') localStorage... else SecureStore...` inside a screen.
    *   *Good:* `await storage.save(key, val)` (The utility handles the platform switch internally).

### Required Abstractions

| Native API | Our Abstraction | Location |
|------------|-----------------|----------|
| `Alert.alert` | `useAlert()` hook + `<Alert>` component | `client/src/hooks/useAlert.tsx` |
| `SecureStore` / `localStorage` | `storage.save()` / `storage.get()` | `client/src/utils/storage.ts` |

### Guidelines

*   **Web Compatibility First:** Always verify that new libraries support React Native Web. If they don't, create a no-op fallback or find an alternative.
*   **Test on Both Platforms:** Every feature must be verified on web (browser) and mobile (Expo Go or simulator) before merging.
*   **Document New Abstractions:** If you create a new platform abstraction, add it to the table above and document usage in code comments.

## 2. UI/UX Philosophy

### Custom Components Over Native APIs

*   **Never Use Native Dialogs:** Do NOT use `Alert.alert`, `ToastAndroid`, or `prompt()`.
    *   *Why?* Native dialogs look different on every platform, don't work reliably on web, and break the immersive "Spy Theme".
    *   *Instead:* Use our custom `<Alert>` component (via `useAlert()` hook) for all user messaging.
*   **Consistent Branding:** Every UI element should reinforce the "Cold War Bureau" aesthetic.
    *   Manila folders, brass borders, typewriter fonts, rubber stamp effects.

### Design Principles

*   **Thematic Consistency:** The app should feel like classified spy hardware from the 1960s.
    *   *Style:* Brutalist, High Contrast, Dark Mode, Serif + Monospace Fonts.
    *   *Feedback:* Actions should feel "heavy" and deliberate (haptics, snap animations, visual stamps).
*   **Frictionless Onboarding:** Minimal steps to start playing. No email signups. Anonymous Auth only.
*   **Accessibility:**
    *   **Min Font Size:** 12px for body text, 20px+ for essential actions/status.
    *   **Contrast:** Ensure sufficient contrast (especially light text on dark backgrounds).
    *   **Visibility:** Essential elements must never be hidden "below the fold".
*   **No Emojis:** Never use emojis in the UI. They are tacky and break the professional spy aesthetic. Use text, symbols, or icons instead.

## 3. Code Architecture

*   **Feature-Based Structure:** Group code by Feature, not Type.
    *   `src/features/game/` -> Contains Service, Hooks, Components for Game logic.
    *   `src/features/auth/` -> Auth logic.
    *   *Avoid:* Giant `src/components` folders mixing Auth buttons with Game cards.
*   **Separation of Concerns:**
    *   **UI Components:** purely presentational (receive props).
    *   **Screens (app/):** Handle routing and layout.
    *   **Hooks (useGame):** Handle state and data fetching.
    *   **Services (gameService):** Handle Database/API interactions.

## 4. State Management

*   **Remote State (Firestore):** Is the "Source of Truth".
*   **Local State (React State):** Only for UI ephemera (loading spinners, input values).
*   **Persistence:** Use `AsyncStorage` (via our wrapper) for non-sensitive local data (Callsign, Game ID history).

### Firestore Transactions

When using `runTransaction()`, follow these strict rules:

*   **ALL reads must come BEFORE any writes** - Firestore will reject transactions that interleave reads and writes.
*   **Pattern:**
    ```typescript
    await runTransaction(db, async (transaction) => {
      // 1. DO ALL READS FIRST
      const doc1 = await transaction.get(ref1);
      const doc2 = await transaction.get(ref2);
      
      // 2. THEN DO ALL WRITES
      transaction.update(ref1, { ... });
      transaction.delete(ref2);
    });
    ```
*   **Why?** Firestore needs to lock documents before writing. Reading after writing breaks this lock mechanism.

## 5. Security & integrity

*   **Client-Side Verification:** For the MVP, we trust the client logic (Host Authority).
*   **Future Proofing:** Keep game logic in `services` so it can be moved to Cloud Functions later if cheating becomes an issue.
