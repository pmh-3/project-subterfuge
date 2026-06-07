import { GameSchema, PlayerSchema } from '@/types/schemas';
import { parseGame, parsePlayer } from '@/types/firestoreParse';

const validGame = {
  id: 'ABCD',
  hostId: 'host-1',
  status: 'LOBBY',
  playerIds: ['host-1'],
  createdAt: Date.now(),
};

const validPlayer = {
  uid: 'host-1',
  callsign: 'Agent X',
  status: 'ALIVE',
  emergencyPin: '123',
};

describe('firestoreParse', () => {
  describe('parseGame', () => {
    it('accepts a valid game document', () => {
      expect(parseGame(validGame)).toEqual(validGame);
    });

    it('returns null for malformed game data', () => {
      expect(parseGame({ ...validGame, status: 'INVALID' })).toBeNull();
      expect(parseGame({ hostId: 'only-host' })).toBeNull();
    });
  });

  describe('parsePlayer', () => {
    it('accepts a valid player document', () => {
      expect(parsePlayer(validPlayer)).toEqual(validPlayer);
    });

    it('returns null for malformed player data', () => {
      expect(parsePlayer({ ...validPlayer, status: 'GHOST' })).toBeNull();
      expect(parsePlayer({ callsign: 'no uid' })).toBeNull();
    });
  });

  describe('schemas', () => {
    it('rejects unknown status values at the schema boundary', () => {
      const result = GameSchema.safeParse({ ...validGame, status: 'PAUSED' });
      expect(result.success).toBe(false);
    });

    it('allows null target fields after elimination', () => {
      const result = PlayerSchema.safeParse({
        ...validPlayer,
        status: 'WINNER',
        targetId: null,
        targetCallsign: null,
      });
      expect(result.success).toBe(true);
    });

    it('parses infinite game mode and config', () => {
      const result = GameSchema.safeParse({
        ...validGame,
        mode: 'INFINITE',
        infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: 5 } },
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid game mode', () => {
      const result = GameSchema.safeParse({ ...validGame, mode: 'CONTINUOUS' });
      expect(result.success).toBe(false);
    });

    it('rejects negative kill goal', () => {
      const result = GameSchema.safeParse({
        ...validGame,
        mode: 'INFINITE',
        infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: 0 } },
      });
      expect(result.success).toBe(false);
    });

    it('parses respawnCount on player', () => {
      const result = PlayerSchema.safeParse({ ...validPlayer, respawnCount: 2 });
      expect(result.success).toBe(true);
    });
  });
});
