export const motion = {
  instant: 50,
  base: 150,
  slow: 250,
} as const;

export type MotionToken = keyof typeof motion;
