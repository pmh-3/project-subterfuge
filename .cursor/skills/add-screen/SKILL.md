---
name: add-screen
description: Recipe for adding a new Expo Router screen using Midnight Wire design-system primitives, with a smoke test. Use when creating a new route or screen in Project Subterfuge.
---

# Add Screen

## When to use

User asks to add a new screen, route, or full-page view in the Subterfuge client.

## Prerequisites

Read [`AGENTS.md`](../../AGENTS.md) and [`client/src/design-system/README.md`](../../../client/src/design-system/README.md).

## Steps

1. **Choose route path** under `client/app/` (Expo Router file-based routing).
   - Game flows: `client/app/game/`
   - Top-level: `client/app/my-screen.tsx` → `/my-screen`

2. **Scaffold the screen**
   - `SafeAreaView` + `colors.background` root
   - `useLayout()` → `contentStyle` on main content (max-width cap)
   - Import UI from `@/design-system` only — no inline hex
   - Copy from `@/strings` — no hardcoded user-facing text
   - `StyleSheet.create` at file bottom

3. **Wire navigation**
   - `useRouter()` from `expo-router` for `push` / `replace`
   - Pass params via `useLocalSearchParams<{ id?: string }>()`
   - Guard missing params — redirect instead of `id!` non-null assertion

4. **Data & mutations**
   - Subscribe: `useGame(gameId)` for game state
   - Mutate: functions from `@/features/game/gameService` — never Firestore in the screen

5. **Add a smoke test** in `client/src/__tests__/components/MyScreen.test.tsx`:
   - Mock `expo-router`, `@/features/auth/AuthContext`, `@/hooks/useLayout`
   - `render(<MyScreen />)` and assert one visible string from `strings`

6. **Verify**

```bash
cd client && npm run verify
```

## Checklist

- [ ] Uses `@/` imports throughout
- [ ] No `Alert.alert` — `useAlert()` if needed
- [ ] Screen registered in navigation (link from existing screen or tab)
- [ ] Smoke test passes under Jest `components` project
