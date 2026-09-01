# Midnight Wire Design System

Source spec: `docs/plans/DESIGN_SYSTEM.md`. Import primitives from `@/design-system`.

## Quick start

```tsx
import { Button, Text, colors, space } from '@/design-system';
```

Dev gallery (web / sim): navigate to `/_dev/gallery` while `__DEV__` is true.

## Token cheat sheet

| Category | Import | Notes |
|---|---|---|
| Colors | `colors.inkPrimary`, `colors.accent`, … | No inline hex outside `tokens/colors.ts` |
| Spacing | `space[8]` (16px) | 2px scale, `space.0`–`space.20` |
| Radius | `radius.sm` (2px default) | `radius.md` (3px) for folder tabs only |
| Type | `<Text variant="title" />` | Typewriter variants auto-uppercase + track |
| Motion | `motion.base` (150ms) | No shadows — `elevation.none` only |

### Color roles

- **Page:** `background` → `surface` for cards
- **Text:** `inkPrimary` / `inkSecondary` / `inkMuted` / `inkOnDark` on dark fills
- **Active only:** `accent`, `accentTint`, `accentText` — never decorative
- **Actions:** `danger` for destructive taps (neutralize, end operation); `success*` for confirmation panels

### Typography jobs

| Family | Token | Use |
|---|---|---|
| Cormorant Garamond | `serif` | Display titles, target names |
| Outfit | `sans` | Body, buttons, inputs |
| Special Elite | `typewriter` | Labels, metadata (`label*`, `metaMicro`) |
| JetBrains Mono | `mono` | Codes, keys, scores (`code*`) |

`letterSpacing` in RN is **pixels**. Tokens use `tracking(fontSize, em)` at definition time.

Android: typewriter sizes &lt; 9px bump to 9 via `typewriterSize()`.

### Web fonts

`_layout.tsx` injects Google Fonts `@import` on web. Native loads via `useFonts` in the same file.

## When to use what

| Need | Primitive |
|---|---|
| Screen title block | `ScreenHeader` + `Rule` |
| Bottom in-game nav | `NavBar` |
| Primary CTA (one per screen) | `Button variant="primary"` |
| Secondary action | `Button variant="ghost"` |
| Neutralize target | `Button` (`danger`) |
| Theme / mode picker rows | `SegmentChips` |
| Difficulty / count toggles | `PillSegments` |
| Dossier panel | `Card` or `Card folderTab="…"` |
| Player list row | `AgentRow` |
| Avatar circle | `Avatar` |
| Dialog | `Alert` or `Sheet` |
| Vertical / horizontal gap | `Stack` / `Row` |
| Section break | `Rule` (horizontal), `Divider` (vertical) |

## Add a primitive

1. Create `components/MyPrimitive.tsx` using existing tokens — no inline hex/rgba.
2. Export from `index.ts`.
3. Add all variants to `examples/Gallery.tsx`.
4. Document in the table above if it's a new pattern.

## Migration complete

`src/theme.ts` was removed in Phase 2. All screens import from `@/design-system`.
