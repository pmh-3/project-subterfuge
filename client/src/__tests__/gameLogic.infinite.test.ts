import {
  computeInstantInfiniteElimination,
  computeChainInsertionUpdates,
  computeMidGameJoinUpdates,
  resolveAssassinTargetAfterKill,
  pickChainInsertionAnchor,
  isGameOver,
  validateAliveTargetChain,
  sortPlayersByLeaderboard,
  buildTargetChain,
  shufflePlayers,
} from '@/features/game/gameLogic';
import { Player } from '@/types';

const TASKS = ['Task A', 'Task B', 'Task C'];
const seededRng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

function makePlayer(
  uid: string,
  callsign: string,
  targetId: string,
  targetCallsign: string,
  overrides: Partial<Player> = {},
): Player {
  return {
    uid,
    callsign,
    status: 'ALIVE',
    targetId,
    targetCallsign,
    taskDescription: TASKS[0],
    killCount: 0,
    respawnCount: 0,
    ...overrides,
  };
}

describe('infinite mode pure logic', () => {
  describe('computeChainInsertionUpdates', () => {
    it('splices inserted player between anchor and anchor target', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const { insertedUpdate, anchorUpdate } = computeChainInsertionUpdates(
        { uid: 'x', callsign: 'X' },
        'b',
        players,
        TASKS,
        seededRng(1),
      );
      expect(anchorUpdate).toEqual({ targetId: 'x', targetCallsign: 'X' });
      expect(insertedUpdate.targetId).toBe('c');
      expect(insertedUpdate.targetCallsign).toBe('C');
    });
  });

  describe('resolveAssassinTargetAfterKill', () => {
    it('inherits victim target when not self', () => {
      const alive = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const result = resolveAssassinTargetAfterKill('c', 'a', alive);
      expect(result).toEqual({ targetId: 'c', targetCallsign: 'C' });
    });

    it('never self-targets at N=2', () => {
      const alive = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'a', 'A'),
      ];
      const result = resolveAssassinTargetAfterKill('a', 'a', alive, seededRng(2));
      expect(result.targetId).not.toBe('a');
    });
  });

  describe('computeInstantInfiniteElimination', () => {
    it('keeps victim ALIVE and increments kill count', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const victim = players[1]!;
      const { victimUpdate, assassinUpdate } = computeInstantInfiniteElimination(
        victim,
        'a',
        0,
        players,
        TASKS,
        'a',
        true,
        seededRng(42),
      );
      expect(victimUpdate.status).toBe('ALIVE');
      expect(victimUpdate.respawnCount).toBe(1);
      expect(assassinUpdate.killCount).toBe(1);
    });

    it('restores N=2 cycle after kill', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'a', 'A'),
      ];
      const { victimUpdate, assassinUpdate, anchorUpdate, anchorId } =
        computeInstantInfiniteElimination(
          players[1]!,
          'a',
          0,
          players,
          TASKS,
          'a',
          true,
          seededRng(7),
        );
      const after = players.map((p) => {
        if (p.uid === 'b') return { ...p, ...victimUpdate, status: 'ALIVE' as const };
        if (p.uid === 'a') return { ...p, ...assassinUpdate, status: 'ALIVE' as const };
        if (p.uid === anchorId) return { ...p, ...anchorUpdate };
        return p;
      });
      const { valid } = validateAliveTargetChain(after);
      expect(valid).toBe(true);
      expect(victimUpdate.status).toBe('ALIVE');
    });
  });

  describe('computeMidGameJoinUpdates', () => {
    it('gives joiner a target at 0 kills context', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const { newPlayerFields, anchorUpdate } = computeMidGameJoinUpdates(
        { uid: 'd', callsign: 'D' },
        players,
        TASKS,
        seededRng(3),
      );
      expect(newPlayerFields.targetId).toBeTruthy();
      expect(anchorUpdate.targetId).toBe('d');
    });
  });

  describe('isGameOver', () => {
    const infiniteGame = {
      mode: 'INFINITE' as const,
      infiniteConfig: { endCondition: { type: 'KILL_GOAL' as const, value: 3 } },
    };

    it('detects kill goal winner', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B', { killCount: 3 }),
        makePlayer('b', 'B', 'a', 'A', { killCount: 1 }),
      ];
      expect(isGameOver(infiniteGame, players)).toEqual({
        over: true,
        winnerId: 'a',
        reason: 'KILL_GOAL',
      });
    });

    it('returns tie without winnerId', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B', { killCount: 3 }),
        makePlayer('b', 'B', 'a', 'A', { killCount: 3 }),
      ];
      const result = isGameOver(infiniteGame, players);
      expect(result.over).toBe(true);
      expect(result.winnerId).toBeUndefined();
    });

    it('returns false below goal', () => {
      const players = [makePlayer('a', 'A', 'b', 'B', { killCount: 2 })];
      expect(isGameOver(infiniteGame, players)).toEqual({ over: false });
    });
  });

  describe('validateAliveTargetChain', () => {
    it('accepts valid cycle at N=4', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'd', 'D'),
        makePlayer('d', 'D', 'a', 'A'),
      ];
      expect(validateAliveTargetChain(players).valid).toBe(true);
    });

    it('rejects self-target', () => {
      const players = [makePlayer('a', 'A', 'a', 'A')];
      expect(validateAliveTargetChain(players).valid).toBe(false);
    });
  });

  describe('sortPlayersByLeaderboard', () => {
    it('sorts by kill count desc then callsign asc', () => {
      const sorted = sortPlayersByLeaderboard([
        makePlayer('b', 'Bravo', 'a', 'A', { killCount: 2 }),
        makePlayer('a', 'Alpha', 'b', 'B', { killCount: 2 }),
        makePlayer('c', 'Charlie', 'a', 'A', { killCount: 5 }),
      ]);
      expect(sorted.map((p) => p.uid)).toEqual(['c', 'a', 'b']);
    });
  });

  describe('pickChainInsertionAnchor', () => {
    it('picks from eligible players with seeded rng', () => {
      const players = [{ uid: 'a' }, { uid: 'b' }];
      const anchor = pickChainInsertionAnchor(players, undefined, seededRng(100));
      expect(['a', 'b']).toContain(anchor);
    });
  });

  describe('buildTargetChain at N=4', () => {
    it('avoids immediate 2-cycles over many shuffles', () => {
      const base = [
        { uid: 'a', callsign: 'A' },
        { uid: 'b', callsign: 'B' },
        { uid: 'c', callsign: 'C' },
        { uid: 'd', callsign: 'D' },
      ];
      let twoCycles = 0;
      for (let i = 0; i < 50; i++) {
        const shuffled = shufflePlayers([...base]);
        const chain = buildTargetChain(shuffled, TASKS);
        const hasTwoCycle = chain.some(
          (a, idx) => chain[(idx + 1) % chain.length]?.targetId === a.uid,
        );
        if (hasTwoCycle) twoCycles++;
      }
      expect(twoCycles).toBeLessThan(50);
    });
  });
});
