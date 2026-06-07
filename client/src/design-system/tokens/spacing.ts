/** 2px-scale spacing tokens per DESIGN_SYSTEM.md §4 */
export const space = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 18,
  10: 20,
  12: 24,
  14: 28,
  16: 32,
  18: 36,
  20: 40,
} as const;

export type SpaceToken = keyof typeof space;
