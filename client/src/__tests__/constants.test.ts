import {
  APP_URL,
  DEFAULT_AVATAR_ID,
  DEFAULT_MAX_REROLLS,
  MIN_PLAYERS_TO_START,
  HOLD_DURATION,
  HOLD_RESET_DURATION,
  PULSE_DURATION,
  SPECTATOR_CHECK_DELAY,
  VICTORY_TYPING_INTERVAL,
  VICTORY_SUBTEXT_DELAY,
  VICTORY_DISMISS_DELAY,
} from '../constants';

describe('constants', () => {
  it('APP_URL is a valid https URL', () => {
    expect(APP_URL).toMatch(/^https:\/\//);
  });

  it('DEFAULT_AVATAR_ID matches an avatar prefix', () => {
    expect(DEFAULT_AVATAR_ID).toMatch(/^icon-/);
  });

  it('gameplay defaults are sensible', () => {
    expect(DEFAULT_MAX_REROLLS).toBeGreaterThan(0);
    expect(MIN_PLAYERS_TO_START).toBeGreaterThanOrEqual(2);
  });

  it('animation durations are positive numbers', () => {
    const durations = [
      HOLD_DURATION,
      HOLD_RESET_DURATION,
      PULSE_DURATION,
      SPECTATOR_CHECK_DELAY,
      VICTORY_TYPING_INTERVAL,
      VICTORY_SUBTEXT_DELAY,
      VICTORY_DISMISS_DELAY,
    ];
    for (const d of durations) {
      expect(d).toBeGreaterThan(0);
    }
  });
});
