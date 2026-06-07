---
name: prepare-release
description: Bump version, run full verification, and deploy web build to Firebase Hosting for Midnight Wire.
---

# Prepare Release

## Steps

1. **Version bump** in `client/package.json` (`version` field) and any app config if applicable.

2. **Full verification**

```bash
cd client && npm ci --legacy-peer-deps && npm run verify
```

3. **Web export**

```bash
cd client && npx expo export --platform web
```

4. **Deploy** (if Firebase Hosting configured)

```bash
firebase deploy --only hosting
```

5. **Manual smoke** on `https://midnightwire.app` (or staging):
   - Home → join flow → lobby → start game (2 tabs)
   - Hold-to-confirm on Contract tab
   - Elimination confirm/deny flow

## Pre-merge gate

CI (`.github/workflows/ci.yml`) must be green: lint, typecheck, contrast, tests, web export.
