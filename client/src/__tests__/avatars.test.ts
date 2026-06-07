import { AVATARS, getAvatarById, getDefaultAvatar } from '../data/avatars';

describe('avatars', () => {
  it('has at least one avatar', () => {
    expect(AVATARS.length).toBeGreaterThan(0);
  });

  it('every avatar has a unique id and a color', () => {
    const ids = new Set<string>();
    for (const avatar of AVATARS) {
      expect(avatar.id).toBeTruthy();
      expect(avatar.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ids.has(avatar.id)).toBe(false);
      ids.add(avatar.id);
    }
  });

  describe('getAvatarById', () => {
    it('returns matching avatar', () => {
      const first = AVATARS[0];
      expect(getAvatarById(first.id)).toEqual(first);
    });

    it('returns undefined for unknown id', () => {
      expect(getAvatarById('nonexistent')).toBeUndefined();
    });
  });

  describe('getDefaultAvatar', () => {
    it('returns the first avatar', () => {
      expect(getDefaultAvatar()).toEqual(AVATARS[0]);
    });
  });
});
