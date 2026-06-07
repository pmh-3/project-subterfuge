/** Responsive layout tokens — single-column dossier, capped on wide viewports */
export const layout = {
  contentMaxWidth: 480,
  wideMinWidth: 600,
  compactMaxWidth: 360,
} as const;

export type LayoutToken = keyof typeof layout;
