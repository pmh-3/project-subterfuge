# ADR 0003: Design System Tokens (Midnight Wire)

## Context

The original app used a dark "Cold War Bureau" theme with scattered inline colors and a monolithic `theme.ts`. A visual rebrand to **Midnight Wire** (light dossier, ruled lines, olive accent) required consistent tokens and primitives before screen migration.

## Decision

Build a dedicated design system at `client/src/design-system/`:

- **Tokens:** `colors`, `space`, `radius`, `typography`, `motion`, `elevation` (always none)
- **Primitives:** `Button`, `Text`, `Card`, `HoldToConfirm`, `NavBar`, etc.
- **Import path:** `@/design-system` (alias → `client/src/`)
- **Spec:** `docs/plans/DESIGN_SYSTEM.md`

Delete `src/theme.ts` after migration. No shadows, no gradients, accent only for active states.

## Consequences

- **Positive:** Agents and humans share one visual vocabulary; gallery at `/_dev/gallery` documents primitives.
- **Negative:** Legacy PRD still describes dark/neon aesthetic — product copy in `PRD.md` is stale visually; `strings.ts` is canonical for shipped UI.
- **Lint tripwire:** `.cursor/rules/design-system.mdc` blocks inline hex in `app/` and `features/`.
