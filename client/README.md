# Subterfuge - Client App

React Native (Expo) mobile application for Project Subterfuge.

## Setup Status

✅ **Phase 1: Foundation** - Complete

### What's Configured

- **Expo** (TypeScript template)
- **Firebase SDK** (Firestore + Auth)
- **Expo Router** (File-based navigation)
- **Directory Structure**:
  ```
  client/
  ├── app/              # Routes (File-based routing)
  │   ├── _layout.tsx   # Root layout
  │   └── index.tsx     # Welcome screen
  └── src/
      ├── components/   # Reusable UI components
      ├── features/     # Feature-specific logic
      ├── services/     # External APIs
      │   └── firebase/ # Firebase config & init
      └── types/        # TypeScript definitions
  ```

## Next Steps

1. **Configure Firebase:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable **Anonymous Authentication**
   - Create a **Firestore Database** (Start in test mode)
   - Copy your Web App credentials to: `src/services/firebase/config.ts`

2. **Run the App:**
   ```bash
   npm start
   # Then press 'i' for iOS simulator or 'a' for Android emulator
   ```

3. **Begin Phase 2:**
   - Implement Auth flow (Callsign entry)
   - Build Lobby UI (Create/Join game)
   - Set up Firestore listeners

## Scripts

- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser

## Tech Stack

- **React Native** 0.81.5
- **Expo** ~54.0
- **Firebase** 12.8.0
- **Expo Router** 6.0.22
- **TypeScript** 5.9.2
