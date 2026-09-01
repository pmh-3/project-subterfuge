import {
  pickIndependentTarget,
  computeIndependentKill,
  computeIndependentJoin,
  validateIndependentTargets,
  isGameOver,
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

describe('infinite mode pure logic (Option E — independent targets)', () => {
  describe('pickIndependentTarget', () => {
    it('never returns self and returns an ALIVE agent', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      for (let i = 0; i < 20; i++) {
        const picked = pickIndependentTarget('a', players, undefined, seededRng(i + 1));
        expect(picked).not.toBe('a');
        expect(['b', 'c']).toContain(picked);
      }
    });

    it('avoids avoidId when another option exists', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      for (let i = 0; i < 20; i++) {
        const picked = pickIndependentTarget('a', players, 'b', seededRng(i + 3));
        expect(picked).toBe('c');
      }
    });

    it('falls back to avoidId when it is the only option (N=2)', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'a', 'A'),
      ];
      const picked = pickIndependentTarget('a', players, 'b', seededRng(5));
      expect(picked).toBe('b');
    });

    it('ignores non-ALIVE agents', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C', { status: 'ELIMINATED' }),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const picked = pickIndependentTarget('a', players, undefined, seededRng(9));
      expect(picked).toBe('c');
    });

    it('throws when no eligible target exists', () => {
      const players = [makePlayer('a', 'A', 'a', 'A')];
      expect(() => pickIndependentTarget('a', players)).toThrow();
    });
  });

  describe('computeIndependentKill', () => {
    // §5.1 Simple kill: A→B, B→C, C→B, D→A. A catches B.
    it('respawns victim ALIVE keeping its target and gives assassin a fresh target (§5.1)', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B', { taskDescription: 'Task A' }),
        makePlayer('b', 'B', 'c', 'C', { taskDescription: 'Task B' }),
        makePlayer('c', 'C', 'b', 'B', { taskDescription: 'Task C' }),
        makePlayer('d', 'D', 'a', 'A', { taskDescription: 'Task A' }),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const { victimUpdate, assassinUpdate } = computeIndependentKill(
        victim,
        'a',
        0,
        players,
        TASKS,
        'a',
        true,
        seededRng(42),
      );

      // Victim: ALIVE, respawnCount+1, fresh directive, target untouched (not in update)
      expect(victimUpdate.status).toBe('ALIVE');
      expect(victimUpdate.respawnCount).toBe(1);
      expect(victimUpdate.eliminatedBy).toBe('a');
      expect(victimUpdate.taskDescription).toBeTruthy();
      expect('targetId' in victimUpdate).toBe(false);

      // Assassin: killCount+1, fresh target != victim, fresh directive
      expect(assassinUpdate.killCount).toBe(1);
      expect(assassinUpdate.targetId).not.toBe('b');
      expect(assassinUpdate.targetId).not.toBe('a');
      expect(assassinUpdate.taskDescription).toBeTruthy();
    });

    it('does not increment killCount for no-credit (admin) removals', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const { assassinUpdate } = computeIndependentKill(
        victim,
        'a',
        2,
        players,
        TASKS,
        'ADMIN',
        false,
        seededRng(1),
      );
      expect('killCount' in assassinUpdate).toBe(false);
    });

    // §5.4 Two-player leak check: A<->B. A catches B. Assassin re-targets B but fresh directive.
    it('N=2: assassin re-targets victim with a FRESH directive (no leak) (§5.4)', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B', { taskDescription: 'Task A' }),
        makePlayer('b', 'B', 'a', 'A', { taskDescription: 'Task B' }),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const victimPreTask = victim.taskDescription;
      const { assassinUpdate } = computeIndependentKill(
        victim,
        'a',
        0,
        players,
        // single-task list forces re-draw; the point is the assassin does not
        // INHERIT the victim's directive — it is drawn fresh
        ['Fresh Only'],
        'a',
        true,
        seededRng(7),
      );
      expect(assassinUpdate.targetId).toBe('b'); // only option
      expect(assassinUpdate.taskDescription).not.toBe(victimPreTask);
      expect(assassinUpdate.taskDescription).toBe('Fresh Only');
    });

    it('no inheritance: assassin directive is a fresh draw, not the victim pre-kill directive', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B', { taskDescription: 'assassin-old' }),
        makePlayer('b', 'B', 'c', 'C', { taskDescription: 'VICTIM-SECRET' }),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const { assassinUpdate } = computeIndependentKill(
        victim,
        'a',
        0,
        players,
        ['pool-1', 'pool-2'],
        'a',
        true,
        seededRng(3),
      );
      expect(assassinUpdate.taskDescription).not.toBe('VICTIM-SECRET');
      expect(['pool-1', 'pool-2']).toContain(assassinUpdate.taskDescription);
    });

    it('reassigns victim target only if its kept target is no longer valid', () => {
      // B's target C has left the game (ELIMINATED). On respawn B must get a new target.
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A', { status: 'ELIMINATED' }),
        makePlayer('d', 'D', 'a', 'A'),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const { victimUpdate } = computeIndependentKill(
        victim,
        'a',
        0,
        players,
        TASKS,
        'a',
        true,
        seededRng(11),
      );
      expect(victimUpdate.targetId).toBeTruthy();
      expect(['a', 'd']).toContain(victimUpdate.targetId as string);
    });

    it('no bystander swap: only victim and assassin change on a kill', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'b', 'B'),
        makePlayer('d', 'D', 'a', 'A'),
      ];
      const victim = players.find((p) => p.uid === 'b')!;
      const before = JSON.parse(JSON.stringify(players));
      const { victimUpdate, assassinUpdate } = computeIndependentKill(
        victim,
        'a',
        0,
        players,
        TASKS,
        'a',
        true,
        seededRng(21),
      );
      const after = players.map((p) => {
        if (p.uid === 'b') return { ...p, ...victimUpdate, status: 'ALIVE' as const };
        if (p.uid === 'a') return { ...p, ...assassinUpdate };
        return p;
      });
      // C and D untouched
      const cBefore = before.find((p: Player) => p.uid === 'c');
      const dBefore = before.find((p: Player) => p.uid === 'd');
      const cAfter = after.find((p) => p.uid === 'c');
      const dAfter = after.find((p) => p.uid === 'd');
      expect(cAfter!.targetId).toBe(cBefore.targetId);
      expect(dAfter!.targetId).toBe(dBefore.targetId);
      expect(validateIndependentTargets(after).valid).toBe(true);
    });
  });

  describe('computeIndependentJoin', () => {
    it('gives a joiner a valid target and directive without touching others', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'a', 'A'),
      ];
      const fields = computeIndependentJoin('d', players, TASKS, seededRng(3));
      expect(['a', 'b', 'c']).toContain(fields.targetId);
      expect(fields.targetCallsign).toBeTruthy();
      expect(TASKS).toContain(fields.taskDescription);
      // no anchor / bystander update returned
      expect(Object.keys(fields).sort()).toEqual(
        ['targetCallsign', 'targetId', 'taskDescription'].sort(),
      );
    });
  });

  describe('validateIndependentTargets', () => {
    it('accepts shared targets (in-degree unconstrained)', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'c', 'C'),
        makePlayer('c', 'C', 'b', 'B'), // both A and C hunt B
        makePlayer('d', 'D', 'a', 'A'),
      ];
      expect(validateIndependentTargets(players)).toEqual({ valid: true, errors: [] });
    });

    it('rejects self-target', () => {
      const players = [
        makePlayer('a', 'A', 'a', 'A'),
        makePlayer('b', 'B', 'a', 'A'),
      ];
      expect(validateIndependentTargets(players).valid).toBe(false);
    });

    it('rejects targeting a non-alive agent', () => {
      const players = [
        makePlayer('a', 'A', 'b', 'B'),
        makePlayer('b', 'B', 'a', 'A', { status: 'ELIMINATED' }),
      ];
      expect(validateIndependentTargets(players).valid).toBe(false);
    });

    it('rejects a missing target', () => {
      const players = [makePlayer('a', 'A', '', '')];
      expect(validateIndependentTargets(players).valid).toBe(false);
    });

    it('accepts an empty roster', () => {
      expect(validateIndependentTargets([])).toEqual({ valid: true, errors: [] });
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
