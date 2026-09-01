import { createGame, confirmElimination, denyElimination, scrambleTask, swapTarget } from '@/features/game/gameService';
import { isInfiniteMode } from '@/features/game/gameLogic';
import { DEFAULT_INFINITE_KILL_GOAL } from '@/constants';
import { Game, Player } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { serviceErrors } from '@/strings';

const mockSetDoc = jest.fn().mockResolvedValue(undefined);

// A minimal in-memory Firestore: `doc(...)` resolves to a stable string path
// (db, 'games', gameId, 'players', playerId) -> 'games/gameId/players/playerId',
// which getDoc / the fake transaction use as a Map key. Real enough to drive
// confirmElimination/denyElimination's actual transaction logic end-to-end
// (no re-implemented simulator), while staying isolated from real Firestore.
const store = new Map<string, unknown>();

const pathFor = (...args: unknown[]) => args.slice(1).join('/');

const mockRunTransaction = jest.fn(
  async (_db: unknown, updateFn: (t: unknown) => Promise<void>) => {
    const transaction = {
      get: async (ref: string) => ({
        exists: () => store.has(ref),
        data: () => store.get(ref),
      }),
      update: jest.fn((ref: string, data: Record<string, unknown>) => {
        const existing = (store.get(ref) as Record<string, unknown>) ?? {};
        store.set(ref, { ...existing, ...data });
      }),
      set: jest.fn((ref: string, data: Record<string, unknown>) => {
        store.set(ref, data);
      }),
    };
    await updateFn(transaction);
    return transaction;
  },
);

// Real enough to observe: updateDoc merges into the same in-memory store, so a
// direct updateDoc(doc(db, 'games', id), { selectedPacks }) call — exactly what
// the Host tab's handleUpdatePacks/handleUpdateDifficulty do in [id].tsx — is
// visible to a subsequent scrambleTask() read (D6 "future-only" proof).
const mockUpdateDoc = jest.fn((ref: string, data: Record<string, unknown>) => {
  const existing = (store.get(ref) as Record<string, unknown>) ?? {};
  store.set(ref, { ...existing, ...data });
  return Promise.resolve();
});

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => pathFor(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: jest.fn(async (ref: string) => ({
    exists: () => store.has(ref),
    data: () => store.get(ref),
  })),
  updateDoc: (...args: Parameters<typeof mockUpdateDoc>) => mockUpdateDoc(...args),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  collection: jest.fn(),
  writeBatch: jest.fn(),
  getDocs: jest.fn(),
  runTransaction: (...args: Parameters<typeof mockRunTransaction>) => mockRunTransaction(...args),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('@/services/firebase', () => ({ db: {} }));

jest.mock('@/utils/gameUtils', () => ({
  generateGameCode: () => 'TEST',
}));

// resolveAvailableTasks falls back to the local TASKS pool whenever
// getTasksFromPacks yields nothing. Exposed as a controllable mock so the
// D6 "future-only" test can prove a pack change changes what the *next*
// draw pulls from.
const mockGetTasksFromPacks = jest.fn().mockResolvedValue([]);
jest.mock('@/features/tasks/taskService', () => ({
  getTasksFromPacks: (...args: unknown[]) => mockGetTasksFromPacks(...args),
}));

describe('createGame (D4 — configure before Create Game)', () => {
  beforeEach(() => {
    mockSetDoc.mockClear();
  });

  it('defaults to Infinite mode with a kill-goal config so a bypass never yields silent Classic', async () => {
    await createGame('host-1', 'Ghost', '123', 'icon-a');

    const [, gameDoc] = mockSetDoc.mock.calls[0];
    expect(gameDoc.mode).toBe('INFINITE');
    expect(gameDoc.infiniteConfig).toEqual({
      endCondition: { type: 'KILL_GOAL', value: DEFAULT_INFINITE_KILL_GOAL },
    });
    expect(isInfiniteMode(gameDoc)).toBe(true);
  });

  it('defaults difficulty to Easy (D4) and status to LOBBY', async () => {
    await createGame('host-1', 'Ghost', '123', 'icon-a');

    const [, gameDoc] = mockSetDoc.mock.calls[0];
    expect(gameDoc.difficultySetting).toBe('Easy');
    expect(gameDoc.status).toBe('LOBBY');
  });

  it('writes the host as a player doc in the second setDoc call', async () => {
    await createGame('host-1', 'Ghost', '123', 'icon-a');

    const [, playerDoc] = mockSetDoc.mock.calls[1];
    expect(playerDoc.uid).toBe('host-1');
    expect(playerDoc.callsign).toBe('Ghost');
    expect(playerDoc.status).toBe('ALIVE');
  });
});

describe('confirmElimination / denyElimination — shared-target queue (D5/D7)', () => {
  const GAME_ID = 'G1';

  // Two assassins ('a1', 'a2') both caught the same shared target ('target1') —
  // the D5 stacking case a Pending Confirmations panel exists to resolve.
  const seedGame = (): void => {
    store.clear();

    const game: Game = {
      id: GAME_ID,
      hostId: 'host',
      status: 'ACTIVE',
      playerIds: ['target1', 'a1', 'a2'],
      createdAt: Date.now(),
      mode: 'INFINITE',
      infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: 99 } },
      selectedPacks: ['basic_training'],
      difficultySetting: 'Mixed',
      maxRerolls: 5,
    };
    store.set(`games/${GAME_ID}`, game);

    const target: Player = {
      uid: 'target1',
      callsign: 'Target',
      status: 'ALIVE',
      targetId: 'a1',
      targetCallsign: 'Alpha',
      taskDescription: 'Existing directive',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
      pendingEliminations: [
        { assassinId: 'a1', assassinCallsign: 'Alpha', taskDescription: 'task-a1', claimedAt: 100 },
        { assassinId: 'a2', assassinCallsign: 'Bravo', taskDescription: 'task-a2', claimedAt: 200 },
      ],
    };
    store.set(`games/${GAME_ID}/players/target1`, target);

    const a1: Player = {
      uid: 'a1',
      callsign: 'Alpha',
      status: 'ALIVE',
      targetId: 'target1',
      targetCallsign: 'Target',
      taskDescription: 'task-a1',
      killCount: 2,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/a1`, a1);

    const a2: Player = {
      uid: 'a2',
      callsign: 'Bravo',
      status: 'ALIVE',
      targetId: 'target1',
      targetCallsign: 'Target',
      taskDescription: 'task-a2',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/a2`, a2);
  };

  beforeEach(() => {
    seedGame();
  });

  it('confirmElimination(gameId, targetId, assassinId) resolves that specific entry, credits that assassin, and leaves the other queued claim intact', async () => {
    await confirmElimination(GAME_ID, 'target1', 'a1');

    const target = store.get(`games/${GAME_ID}/players/target1`) as Player;
    const a1 = store.get(`games/${GAME_ID}/players/a1`) as Player;
    const a2 = store.get(`games/${GAME_ID}/players/a2`) as Player;

    // a1's claim resolved and removed; a2's stacked claim is untouched.
    expect(target.pendingEliminations).toEqual([
      { assassinId: 'a2', assassinCallsign: 'Bravo', taskDescription: 'task-a2', claimedAt: 200 },
    ]);
    // Victim respawns instantly (D5): still ALIVE, respawn count incremented.
    expect(target.status).toBe('ALIVE');
    expect(target.respawnCount).toBe(1);

    // a1 is credited with the kill; a2's own doc is untouched by this call.
    expect(a1.killCount).toBe(3);
    expect(a2.killCount).toBe(0);
    expect(a2.taskDescription).toBe('task-a2');
  });

  it('confirmElimination resolves the FIFO head when assassinId is omitted', async () => {
    await confirmElimination(GAME_ID, 'target1');

    const target = store.get(`games/${GAME_ID}/players/target1`) as Player;
    const a1 = store.get(`games/${GAME_ID}/players/a1`) as Player;

    // a1 claimed first (claimedAt: 100) — the head of the queue.
    expect(target.pendingEliminations).toEqual([
      { assassinId: 'a2', assassinCallsign: 'Bravo', taskDescription: 'task-a2', claimedAt: 200 },
    ]);
    expect(a1.killCount).toBe(3);
  });

  it('denyElimination(gameId, targetId, assassinId) drops only that entry and credits no one', async () => {
    await denyElimination(GAME_ID, 'target1', 'a2');

    const target = store.get(`games/${GAME_ID}/players/target1`) as Player;
    const a1 = store.get(`games/${GAME_ID}/players/a1`) as Player;
    const a2 = store.get(`games/${GAME_ID}/players/a2`) as Player;

    // a2's claim dropped; a1's stacked claim remains queued.
    expect(target.pendingEliminations).toEqual([
      { assassinId: 'a1', assassinCallsign: 'Alpha', taskDescription: 'task-a1', claimedAt: 100 },
    ]);
    // Deny is not a kill: no respawn, no credit to anyone.
    expect(target.status).toBe('ALIVE');
    expect(target.respawnCount).toBe(0);
    expect(a1.killCount).toBe(2);
    expect(a2.killCount).toBe(0);
  });

  it('denyElimination resolves the FIFO head when assassinId is omitted', async () => {
    await denyElimination(GAME_ID, 'target1');

    const target = store.get(`games/${GAME_ID}/players/target1`) as Player;
    expect(target.pendingEliminations).toEqual([
      { assassinId: 'a2', assassinCallsign: 'Bravo', taskDescription: 'task-a2', claimedAt: 200 },
    ]);
  });
});

describe('mid-game difficulty/packs change is future-only (D6)', () => {
  const GAME_ID = 'G2';

  beforeEach(() => {
    store.clear();
    mockUpdateDoc.mockClear();
    mockGetTasksFromPacks.mockReset();

    const game: Game = {
      id: GAME_ID,
      hostId: 'host',
      status: 'ACTIVE',
      playerIds: ['p1', 'p2'],
      createdAt: Date.now(),
      mode: 'INFINITE',
      infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: 99 } },
      selectedPacks: ['pack-easy'],
      difficultySetting: 'Easy',
      maxRerolls: 5,
    };
    store.set(`games/${GAME_ID}`, game);

    const p1: Player = {
      uid: 'p1',
      callsign: 'One',
      status: 'ALIVE',
      targetId: 'p2',
      targetCallsign: 'Two',
      taskDescription: 'Original easy-pool directive',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/p1`, p1);

    const p2: Player = {
      uid: 'p2',
      callsign: 'Two',
      status: 'ALIVE',
      targetId: 'p1',
      targetCallsign: 'One',
      taskDescription: 'Another original directive',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/p2`, p2);

    // getTasksFromPacks returns a pool that reflects whichever packs/difficulty
    // resolveAvailableTasks was actually called with — this is what proves the
    // *next* draw picks up the new pool.
    mockGetTasksFromPacks.mockImplementation(async (packIds: string[]) =>
      packIds.includes('pack-hard')
        ? [{ id: 't-hard', text: 'HARD-POOL DIRECTIVE', difficultyScale: 3 }]
        : [{ id: 't-easy', text: 'EASY-POOL DIRECTIVE', difficultyScale: 1 }],
    );
  });

  it('changing selectedPacks mid-game (the Host tab handler) does not touch any existing player doc', async () => {
    // Exactly what [id].tsx's handleUpdatePacks does: a single-field updateDoc
    // on the game doc only.
    await updateDoc(doc(db, 'games', GAME_ID), { selectedPacks: ['pack-hard'] });

    const p1 = store.get(`games/${GAME_ID}/players/p1`) as Player;
    const p2 = store.get(`games/${GAME_ID}/players/p2`) as Player;
    expect(p1.taskDescription).toBe('Original easy-pool directive');
    expect(p2.taskDescription).toBe('Another original directive');
    expect(p1.rerollsUsed).toBe(0);
    expect(p2.rerollsUsed).toBe(0);
  });

  it('the next draw (scrambleTask) reflects the new pool for the player who swaps, and leaves the other player untouched', async () => {
    await updateDoc(doc(db, 'games', GAME_ID), { selectedPacks: ['pack-hard'] });

    await scrambleTask(GAME_ID, 'p1');

    const p1 = store.get(`games/${GAME_ID}/players/p1`) as Player;
    const p2 = store.get(`games/${GAME_ID}/players/p2`) as Player;

    // p1 explicitly swapped after the pack change — draws from the new pool.
    expect(p1.taskDescription).toBe('HARD-POOL DIRECTIVE');
    expect(p1.rerollsUsed).toBe(1);
    expect(mockGetTasksFromPacks).toHaveBeenCalledWith(['pack-hard'], 'Easy');

    // p2 never swapped — their existing assignment from before the change is
    // provably untouched.
    expect(p2.taskDescription).toBe('Another original directive');
    expect(p2.rerollsUsed).toBe(0);
  });
});

describe('swapTarget — no-op guard at 2 alive agents (defense in depth)', () => {
  const GAME_ID = 'G3';

  const seedTwoPlayerGame = (): void => {
    store.clear();

    const game: Game = {
      id: GAME_ID,
      hostId: 'host',
      status: 'ACTIVE',
      playerIds: ['p1', 'p2'],
      createdAt: Date.now(),
      mode: 'INFINITE',
      infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: 99 } },
      selectedPacks: ['basic_training'],
      difficultySetting: 'Mixed',
      maxRerolls: 5,
    };
    store.set(`games/${GAME_ID}`, game);

    const p1: Player = {
      uid: 'p1',
      callsign: 'One',
      status: 'ALIVE',
      targetId: 'p2',
      targetCallsign: 'Two',
      taskDescription: 'Directive one',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/p1`, p1);

    const p2: Player = {
      uid: 'p2',
      callsign: 'Two',
      status: 'ALIVE',
      targetId: 'p1',
      targetCallsign: 'One',
      taskDescription: 'Directive two',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/p2`, p2);
  };

  beforeEach(() => {
    seedTwoPlayerGame();
  });

  it('throws NO_ELIGIBLE_SWAP_TARGET at 2 alive agents instead of silently returning the same target', async () => {
    // Only 'p2' is alive besides the caller, and it is already p1's target — there is no
    // DIFFERENT eligible target to swap to. The UI already disables this control below 3
    // alive agents; this proves the service enforces it too.
    await expect(swapTarget(GAME_ID, 'p1')).rejects.toThrow(serviceErrors.NO_ELIGIBLE_SWAP_TARGET);

    const p1 = store.get(`games/${GAME_ID}/players/p1`) as Player;
    // Not charged: target and rerollsUsed both untouched.
    expect(p1.targetId).toBe('p2');
    expect(p1.rerollsUsed).toBe(0);
  });

  it('succeeds and charges exactly one reroll when a third alive agent makes a different target available', async () => {
    const p3: Player = {
      uid: 'p3',
      callsign: 'Three',
      status: 'ALIVE',
      targetId: 'p1',
      targetCallsign: 'One',
      taskDescription: 'Directive three',
      killCount: 0,
      respawnCount: 0,
      rerollsUsed: 0,
    };
    store.set(`games/${GAME_ID}/players/p3`, p3);
    const game = store.get(`games/${GAME_ID}`) as Game;
    store.set(`games/${GAME_ID}`, { ...game, playerIds: ['p1', 'p2', 'p3'] });

    await swapTarget(GAME_ID, 'p1');

    const p1 = store.get(`games/${GAME_ID}/players/p1`) as Player;
    expect(p1.targetId).toBe('p3');
    expect(p1.rerollsUsed).toBe(1);
  });
});
