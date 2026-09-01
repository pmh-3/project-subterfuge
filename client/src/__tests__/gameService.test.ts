import { createGame } from '@/features/game/gameService';
import { isInfiniteMode } from '@/features/game/gameLogic';
import { DEFAULT_INFINITE_KILL_GOAL } from '@/constants';

const mockSetDoc = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args: unknown[]) => args.join('/')),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  collection: jest.fn(),
  writeBatch: jest.fn(),
  getDocs: jest.fn(),
  runTransaction: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('@/services/firebase', () => ({ db: {} }));

jest.mock('@/utils/gameUtils', () => ({
  generateGameCode: () => 'TEST',
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
