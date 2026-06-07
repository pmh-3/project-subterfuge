/** No shadows in Midnight Wire — only legal elevation value */
export const elevation = {
  none: 0,
} as const;

export type ElevationToken = keyof typeof elevation;
