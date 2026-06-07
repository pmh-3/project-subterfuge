import { AVATARS, getAvatarById, getDefaultAvatar, getRandomAvatar } from '@/data/avatars';

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

  describe('getRandomAvatar', () => {
    it('returns an avatar from the list', () => {
      const avatar = getRandomAvatar(() => 0.5);
      expect(AVATARS).toContainEqual(avatar);
    });

    it('respects the injected random source', () => {
      expect(getRandomAvatar(() => 0)).toEqual(AVATARS[0]);
      expect(getRandomAvatar(() => 0.99)).toEqual(AVATARS[AVATARS.length - 1]);
    });
  });
});
