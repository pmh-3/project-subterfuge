# Phase 5 — Agent-Friendly Codebase

**Owner:** Repo-hygiene agent
**Depends on:** Phase 4 (so docs reflect the new mode)

## Goal

Make this repo a place where coding agents (Cursor agents, Claude Code, future tools) can land cold and ship correct work on the first try. That means: a single canonical entry-point doc, accurate rules, ergonomic skills, and one-step verification commands.

## Work Items

### AGENT-1 — `AGENTS.md` at repo root
A single short doc (~150 lines max) that an agent reads first. Sections:
1. **What this is** — one paragraph product description.
2. **Where to start** — pointer to `PRD.md`, `docs/plans/`, `.cursor/rules/`.
3. **Common tasks → entry points** — table mapping ("fix a bug" → `docs/BACKLOG.md`; "add a screen" → `client/src/design-system/README.md`; "change game logic" → `client/src/features/game/gameLogic.ts`).
4. **Run / test / lint commands** — copy-pasteable.
5. **Conventions in one screen** — pulled from the cursor rules, deduplicated.
6. **What NOT to do** — short list of common agent mistakes (e.g. don't use `Alert.alert`, don't add inline hex, don't bypass `gameService.ts`).
7. **Where the source of truth lives** — Firestore is canonical for game state, `design-system/tokens` for visuals, `gameLogic.ts` for game rules.

### AGENT-2 — Audit and update existing Cursor rules
Existing rules in `.cursor/rules/`:
- `project-architecture.mdc`
- `component-patterns.mdc`
- `styling-and-theme.mdc` — **currently describes the dead "Cold War Bureau" aesthetic with retired tokens (`paperWarm`, `surfaceFaint`, `holdOverlay`, etc.). Must be rewritten to match the new design system.** This is the most important item in this phase — agents reading this stale rule mid-work will cause regressions.
- `error-handling.mdc`
- `firestore-patterns.mdc`
- `known-issues.mdc`
- `testing-conventions.mdc`

For each: re-read, confirm it matches reality post-Phase-4, fix drift, add cross-references to `AGENTS.md` and the design-system README. Add new rules:
- `design-system.mdc` (created in Phase 1 — confirm it's still accurate).
- `game-modes.mdc` — when working on game logic, check `game.mode` and branch correctly; classic-mode regression must hold.

Remove anything aspirational that the code doesn't actually do.

### AGENT-3 — Path aliases (codemod sweep)
Path alias `@/` was landed in Phase 1 for new design-system imports. This task **codemods the rest of the repo** so every `../../src/...` import becomes `@/...`. Verify the alias is picked up by:
- `tsconfig.json` (compiler resolution)
- `babel.config.js` `module-resolver` plugin (Metro/Expo runtime)
- `jest.config.js` `moduleNameMapper` (test resolution)
- `eslint.config.js` `import/resolver` if applicable
Document the alias in `AGENTS.md` and `component-patterns.mdc`.

### AGENT-4 — Runtime validation
Implement DEBT-3:
- Add `zod`.
- Define `GameSchema` / `PlayerSchema` / `TaskPackSchema` in `client/src/types/`.
- Replace `as Game` / `as Player` in `useGame` snapshot handlers with `.parse()` (or `.safeParse()` with logged failure for resilience).
- Add a test that intentionally feeds malformed data and asserts the boundary catches it.

### AGENT-5 — CI pipeline
Implement DEBT-4:
- `.github/workflows/ci.yml` running on PR + main pushes.
- Jobs: `npm ci`, `npm test`, `npm run lint`, `tsc --noEmit`, build the web bundle.
- Cache `node_modules` and the Expo build output.
- Status check required before merge (note in `AGENTS.md`).

### AGENT-6 — Component test scaffolding
Implement DEBT-5. **Current Jest config is incompatible with component tests** (`testEnvironment: 'node'`, `testMatch: '**/__tests__/**/*.test.ts'` excludes `.tsx`, `react-native` mocked to a stub). Reconfigure:
- Switch `testEnvironment` to `jsdom` (or `jest-environment-jsdom`) for component tests; consider a project split (node project for `gameLogic` etc., jsdom project for components).
- Extend `testMatch` to include `.test.tsx`.
- Add `@testing-library/react-native` + `@testing-library/jest-native` matchers.
- Replace the bare `react-native` mock with `jest-expo` preset for component projects (or document why we're not using it).
- Add a `setupFilesAfterEach` for jest-native matchers.

Once reconfigured, write smoke tests: Home renders, lobby join flow happy path, hold-to-confirm fires after threshold, elimination confirmation accepts key, Mission Control mode toggle. Scaffolding only — establish the pattern so agents extend it.

### AGENT-7 — ADRs
Create `docs/adr/` and write decision records for the choices that have already been made:
- `0001-firestore-as-source-of-truth.md`
- `0002-pure-logic-extraction.md`
- `0003-design-system-tokens.md` (Phase 2)
- `0004-continuous-game-mode-shape.md` (Phase 4 — captures which Option was chosen and why)
- `0005-agent-key-flow.md` (Phase 3 — captures the decision to drop the reveal for non-hosts)

ADR template: short. Context → Decision → Consequences. One screen each.

### AGENT-8 — Skills (Cursor agent skills) — **low priority**
Create skills **in-repo** under `.cursor/skills/`. Decision locked: in-repo so the team shares them. Treat this as the lowest-priority item in Phase 5 — ship if there's time; defer to a follow-up otherwise. Candidates (in priority order if cut for time):
1. `add-screen` — recipe for creating a new screen using design-system primitives, wired to a route, with a test.
2. `add-game-rule` — recipe for adding gameplay logic: write pure function in `gameLogic.ts`, test it, expose via `gameService.ts`, branch on `game.mode`.
3. `triage-firestore-bug` — checklist for diagnosing real-time-sync issues.
4. `prepare-release` — bump version, run full verification suite, deploy to Firebase Hosting.

Each skill follows the format under `~/.cursor/skills-cursor/create-skill/SKILL.md`. Even shipping just #1 is a win.

### AGENT-9 — `docs/BACKLOG.md` restoration & grooming
The file is staged-deleted in the working tree. Restore it, then:
- Check off every item delivered across Phases 1–4.
- Re-prioritize what's left.
- Add new items surfaced during execution (each phase's handoff note should be the source).

### AGENT-10 — Verification one-liner
`npm run verify` was added in Phase 0. Verify it still runs the right set (`lint && typecheck && test`) and is documented in `AGENTS.md` as the single command agents run before declaring work done.

## Deliverables

- `AGENTS.md` at repo root.
- All existing rules audited; new rules added.
- Path aliases live; imports codemodded.
- Zod validation at all Firestore read boundaries.
- CI green on a sample PR.
- Component-test scaffolding with ~5 smoke tests.
- 5 ADRs.
- 4 skills.
- `BACKLOG.md` restored and groomed.
- `npm run verify` works.
- Handoff note appended.

## Success Criteria

- A new agent dropped into the repo can read **only** `AGENTS.md` and complete a "fix a typo in the lobby" task without further exploration.
- A new agent can read `AGENTS.md` + one design-system / game-modes rule and complete a "add a new screen" task end-to-end with passing tests.
- `npm run verify` is green on `main`.
- Every prior `as Game` / `as Player` cast has been replaced by validated parse.
- CI blocks merges on test/lint/type failure.

## Open Questions

- Cloud Functions migration (DEBT-1 / FEAT-4) — Phase 5 or defer to Phase 6? Recommend: defer. Meaningful infra shift, doesn't directly serve agent-friendliness.

## Locked

- **Path alias** `@/` (already landed in Phase 1).
- **Skills location**: in-repo at `.cursor/skills/`. Low priority within Phase 5.
