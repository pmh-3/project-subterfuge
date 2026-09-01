# Subterfuge

A social deduction party game. Eliminate your targets. Don't get caught.

> "The Bureau is watching."

## The Mission

You are an undercover agent at a social gathering. You have a **Target** and a **Mission**.
Your goal: Get your target to complete a specific action (e.g., "High-five you") without them realizing it's part of the game.
Once they slip up, you eliminate them and inherit *their* target.
The last agent standing wins.

## Quick Start

### 1. Access the Operation
Visit [subterfuge-536c2.web.app](https://subterfuge-536c2.web.app) on your mobile device.

### 2. Initialize Identity
- Choose a **Callsign** (your spy name).
- A 3-digit **Agent Key** is assigned (allows reconnection if your device drops).
- Select an **Avatar**.

### 3. Join or Host
- **Host:** Start a new operation, configure task packs and difficulty, then share the 4-letter **OP CODE**.
- **Agent:** Enter the OP CODE to join.

## Development

### Prerequisites
- Node.js (>= 20.x)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
```bash
cd client
npm install
```

### Run Locally
```bash
cd client
npx expo start --web
```
Opens at `http://localhost:8081`. Press `w` for web, or scan the QR code with Expo Go.

### Deployment
```bash
cd client && npx expo export --platform web
cd .. && firebase deploy
```

## Project Structure

```
project-subterfuge/
├── client/                     # Expo app
│   ├── app/                    # File-based routing (Expo Router)
│   │   ├── _layout.tsx         # Root layout, fonts, auth provider
│   │   ├── index.tsx           # Welcome screen
│   │   └── game/
│   │       ├── [id].tsx        # Game room (contract, situation room, admin)
│   │       ├── configure.tsx   # Host: task pack & difficulty config
│   │       └── lobby.tsx       # Join / host / identity flow
│   ├── src/
│   │   ├── components/         # Shared UI (Button, Input, Alert, Avatars)
│   │   ├── constants.ts        # App-wide constants (durations, URLs, defaults)
│   │   ├── data/               # Static data (avatars, fallback tasks, seed CSV)
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # AuthContext (anonymous auth)
│   │   │   ├── game/           # gameService, useGame, game components
│   │   │   └── tasks/          # taskService (Firestore pack/mission queries)
│   │   ├── hooks/              # Shared hooks (useAlert)
│   │   ├── services/firebase/  # Firebase SDK init & config
│   │   ├── theme.ts            # Design tokens (colors, spacing, typography)
│   │   ├── types/              # TypeScript interfaces (Game, Player, TaskPack)
│   │   └── utils/              # Platform utils (storage, gameUtils, avatarDisplay)
│   └── scripts/                # Firestore seed scripts
├── docs/                       # Design docs, roadmaps, proposals
├── firebase.json               # Firebase Hosting config
├── PRD.md                      # Product Requirements Document
└── TECHNICAL_ROADMAP.md        # Architecture & schema reference
```

## Architecture
- **Frontend:** React Native (Expo 54) + React Native Web
- **Backend:** Firebase Firestore (real-time via `onSnapshot`)
- **Auth:** Firebase Anonymous Auth
- **Routing:** Expo Router (file-based)
- **Style:** "Cold War Bureau" aesthetic (CSS-in-JS custom theme)

## Key Docs
- [PRD.md](PRD.md) -- Product vision and game mechanics
- [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md) -- Architecture, schema, algorithms
- [docs/BACKLOG.md](docs/BACKLOG.md) -- Bugs, tech debt, and remaining work
- [docs/PHASE_3_ROADMAP.md](docs/PHASE_3_ROADMAP.md) -- Feature roadmap
- [docs/DEVELOPMENT_PRINCIPLES.md](docs/DEVELOPMENT_PRINCIPLES.md) -- Coding conventions

## License
Classified.
