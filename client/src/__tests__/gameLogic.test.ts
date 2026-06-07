import {
  shufflePlayers,
  buildTargetChain,
  detectWin,
  computeEliminationUpdates,
} from '@/features/game/gameLogic';

describe('shufflePlayers', () => {
  it('returns the same array reference', () => {
    const arr = [1, 2, 3];
    expect(shufflePlayers(arr)).toBe(arr);
  });

  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    shufflePlayers(arr);
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('produces different orderings over many runs (probabilistic)', () => {
    const orderings = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const arr = [1, 2, 3, 4, 5];
      shufflePlayers(arr);
      orderings.add(arr.join(','));
    }
    expect(orderings.size).toBeGreaterThan(1);
  });
});

describe('buildTargetChain', () => {
  const players = [
    { uid: 'a', callsign: 'Alpha' },
    { uid: 'b', callsign: 'Bravo' },
    { uid: 'c', callsign: 'Charlie' },
  ];
  const tasks = ['Task 1', 'Task 2'];

  it('creates a circular chain where each player targets the next', () => {
    const chain = buildTargetChain(players, tasks);
    expect(chain).toHaveLength(3);
    expect(chain[0].uid).toBe('a');
    expect(chain[0].targetId).toBe('b');
    expect(chain[1].targetId).toBe('c');
    expect(chain[2].targetId).toBe('a');
  });

  it('assigns tasks from the provided list', () => {
    const chain = buildTargetChain(players, tasks);
    for (const assignment of chain) {
      expect(tasks).toContain(assignment.taskDescription);
    }
  });

  it('handles a two-player chain', () => {
    const pair = players.slice(0, 2);
    const chain = buildTargetChain(pair, tasks);
    expect(chain[0].targetId).toBe('b');
    expect(chain[1].targetId).toBe('a');
  });
});

describe('detectWin', () => {
  it('returns true when target points back to assassin', () => {
    expect(detectWin({ targetId: 'assassin' }, 'assassin')).toBe(true);
  });

  it('returns false when chain continues', () => {
    expect(detectWin({ targetId: 'someone-else' }, 'assassin')).toBe(false);
  });
});

describe('computeEliminationUpdates', () => {
  const targetData = {
    targetId: 'next-target',
    targetCallsign: 'NextGuy',
    taskDescription: 'Do something',
  };

  it('marks target as ELIMINATED', () => {
    const { targetUpdate } = computeEliminationUpdates(
      targetData, 'assassin', 0, 'assassin', true,
    );
    expect(targetUpdate.status).toBe('ELIMINATED');
    expect(targetUpdate.eliminatedBy).toBe('assassin');
    expect(targetUpdate.eliminatedAt).toBeGreaterThan(0);
  });

  it('re-links assassin to next target when no win', () => {
    const { assassinUpdate, isWin } = computeEliminationUpdates(
      targetData, 'assassin', 2, 'assassin', true,
    );
    expect(isWin).toBe(false);
    expect(assassinUpdate.targetId).toBe('next-target');
    expect(assassinUpdate.targetCallsign).toBe('NextGuy');
    expect(assassinUpdate.killCount).toBe(3);
  });

  it('declares victory when target points to assassin', () => {
    const winData = { ...targetData, targetId: 'assassin' };
    const { assassinUpdate, isWin } = computeEliminationUpdates(
      winData, 'assassin', 4, 'assassin', true,
    );
    expect(isWin).toBe(true);
    expect(assassinUpdate.status).toBe('WINNER');
    expect(assassinUpdate.killCount).toBe(5);
  });

  it('skips killCount increment when incrementKillCount is false', () => {
    const { assassinUpdate } = computeEliminationUpdates(
      targetData, 'assassin', 2, 'ADMIN', false,
    );
    expect(assassinUpdate.killCount).toBeUndefined();
  });
});
