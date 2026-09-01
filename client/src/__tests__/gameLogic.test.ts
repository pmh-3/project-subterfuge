import {
  shufflePlayers,
  buildTargetChain,
  detectWin,
  computeEliminationUpdates,
  buildPendingRows,
  hasCallerClaimOnTarget,
} from '@/features/game/gameLogic';
import { Player } from '@/types';

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

describe('buildPendingRows (D7 — Pending Confirmations panel)', () => {
  const mkPlayer = (overrides: Partial<Player> & Pick<Player, 'uid' | 'callsign'>): Player => ({
    status: 'ALIVE',
    ...overrides,
  });

  it('flattens every player queue into assassin -> target rows', () => {
    const players: Player[] = [
      mkPlayer({
        uid: 'target-1',
        callsign: 'Bravo',
        pendingEliminations: [
          { assassinId: 'a1', assassinCallsign: 'Alpha', taskDescription: 'Say hi', claimedAt: 200 },
        ],
      }),
      mkPlayer({ uid: 'target-2', callsign: 'Charlie' }),
    ];

    const rows = buildPendingRows(players);

    expect(rows).toEqual([
      {
        targetId: 'target-1',
        targetCallsign: 'Bravo',
        assassinId: 'a1',
        assassinCallsign: 'Alpha',
        taskDescription: 'Say hi',
        claimedAt: 200,
      },
    ]);
  });

  it('preserves every stacked claim on a shared target and sorts the global list by claimedAt', () => {
    const players: Player[] = [
      mkPlayer({
        uid: 'shared-target',
        callsign: 'Delta',
        pendingEliminations: [
          { assassinId: 'a2', assassinCallsign: 'Bravo', taskDescription: 'Second claim', claimedAt: 500 },
          { assassinId: 'a1', assassinCallsign: 'Alpha', taskDescription: 'First claim', claimedAt: 100 },
        ],
      }),
      mkPlayer({
        uid: 'other-target',
        callsign: 'Echo',
        pendingEliminations: [
          { assassinId: 'a3', assassinCallsign: 'Charlie', taskDescription: 'Third claim', claimedAt: 300 },
        ],
      }),
    ];

    const rows = buildPendingRows(players);

    expect(rows.map((r) => r.assassinId)).toEqual(['a1', 'a3', 'a2']);
    expect(rows).toHaveLength(3);
  });

  it('returns an empty list when no player has a pending claim', () => {
    const players: Player[] = [mkPlayer({ uid: 'p1', callsign: 'Alpha' })];
    expect(buildPendingRows(players)).toEqual([]);
  });
});

describe('hasCallerClaimOnTarget (Contract view scoping — shared-target co-hunters)', () => {
  it('is false when the target has no pending claims at all', () => {
    expect(hasCallerClaimOnTarget({ pendingEliminations: [] }, 'me')).toBe(false);
    expect(hasCallerClaimOnTarget({ pendingEliminations: undefined }, 'me')).toBe(false);
  });

  it('is true when the caller has an outstanding claim on the target', () => {
    const target = {
      pendingEliminations: [
        { assassinId: 'me', assassinCallsign: 'Me', taskDescription: 'x', claimedAt: 1 },
      ],
    };
    expect(hasCallerClaimOnTarget(target, 'me')).toBe(true);
  });

  it('is false for a co-hunter who has NOT claimed the shared target, even though someone else has', () => {
    // Shared-target scenario (D5): both 'me' and 'co-hunter' hunt the same agent, but only
    // 'me' has claimed. The co-hunter must not be frozen out of Catch/Swap by my claim.
    const target = {
      pendingEliminations: [
        { assassinId: 'me', assassinCallsign: 'Me', taskDescription: 'x', claimedAt: 1 },
      ],
    };
    expect(hasCallerClaimOnTarget(target, 'co-hunter')).toBe(false);
  });

  it('is true for each caller independently once both have claimed the shared target', () => {
    const target = {
      pendingEliminations: [
        { assassinId: 'me', assassinCallsign: 'Me', taskDescription: 'x', claimedAt: 1 },
        { assassinId: 'co-hunter', assassinCallsign: 'Co', taskDescription: 'y', claimedAt: 2 },
      ],
    };
    expect(hasCallerClaimOnTarget(target, 'me')).toBe(true);
    expect(hasCallerClaimOnTarget(target, 'co-hunter')).toBe(true);
  });

  it('is false when target is undefined or callerId is undefined', () => {
    expect(hasCallerClaimOnTarget(undefined, 'me')).toBe(false);
    expect(
      hasCallerClaimOnTarget(
        { pendingEliminations: [{ assassinId: 'me', assassinCallsign: 'Me', taskDescription: 'x', claimedAt: 1 }] },
        undefined,
      ),
    ).toBe(false);
  });

  it('classic mode: single-hunter queue behaves as a simple boolean for the one hunter', () => {
    // Classic only ever holds 0 or 1 entry (single hunter per target) — confirm the caller-scoped
    // check degenerates correctly and is unaffected by the shared-target change.
    const target = {
      pendingEliminations: [
        { assassinId: 'sole-hunter', assassinCallsign: 'Sole', taskDescription: 'x', claimedAt: 1 },
      ],
    };
    expect(hasCallerClaimOnTarget(target, 'sole-hunter')).toBe(true);
    expect(hasCallerClaimOnTarget(target, 'someone-else')).toBe(false);
  });
});
