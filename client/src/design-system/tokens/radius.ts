export const radius = {
  none: 0,
  sm: 2,
  md: 3,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
