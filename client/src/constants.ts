/**
 * App-wide constants: animation timings, defaults, and configuration.
 * Centralized here to avoid magic numbers scattered across components.
 */

export const APP_URL = 'https://midnightwire.app';

export const DEFAULT_AVATAR_ID = 'icon-binoculars';
export const DEFAULT_MAX_REROLLS = 5;
export const MIN_PLAYERS_TO_START = 2;
export const MAX_PLAYERS = 40;

export const DEFAULT_INFINITE_KILL_GOAL = 5;
export const INFINITE_KILL_GOAL_OPTIONS = [3, 5, 10, 20] as const;
export const INFINITE_KILL_GOAL_MIN = 1;
export const INFINITE_KILL_GOAL_MAX = 99;

// Animation / interaction durations (ms)
export const PULSE_DURATION = 800;
export const SPECTATOR_CHECK_DELAY = 600;
export const VICTORY_TYPING_INTERVAL = 150;
export const VICTORY_SUBTEXT_DELAY = 500;
export const VICTORY_DISMISS_DELAY = 4500;
export const TAGLINE_ROTATE_INTERVAL = 4000;
export const HELP_BUTTON_PULSE_DURATION = 2200;
