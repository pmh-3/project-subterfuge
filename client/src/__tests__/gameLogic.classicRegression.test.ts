import {
  isClassicMode,
  isGameOver,
  computeEliminationUpdates,
} from '@/features/game/gameLogic';

describe('classic regression', () => {
  it('treats absent mode as classic', () => {
    expect(isClassicMode({})).toBe(true);
    expect(isClassicMode({ mode: 'CLASSIC' })).toBe(true);
  });

  it('isGameOver returns false for classic games', () => {
    const players = [
      { uid: 'a', callsign: 'A', status: 'ALIVE' as const, killCount: 99 },
    ];
    expect(isGameOver({}, players)).toEqual({ over: false });
    expect(isGameOver({ mode: 'CLASSIC' }, players)).toEqual({ over: false });
  });

  it('computeEliminationUpdates matches known non-win fixture', () => {
    const { targetUpdate, assassinUpdate, isWin } = computeEliminationUpdates(
      { targetId: 'next', targetCallsign: 'Next', taskDescription: 'Task' },
      'assassin',
      2,
      'assassin',
      true,
    );
    expect(isWin).toBe(false);
    expect(targetUpdate.status).toBe('ELIMINATED');
    expect(assassinUpdate.targetId).toBe('next');
    expect(assassinUpdate.killCount).toBe(3);
  });

  it('computeEliminationUpdates matches known win fixture', () => {
    const { assassinUpdate, isWin } = computeEliminationUpdates(
      { targetId: 'assassin', targetCallsign: 'Me', taskDescription: 'Task' },
      'assassin',
      4,
      'assassin',
      true,
    );
    expect(isWin).toBe(true);
    expect(assassinUpdate.status).toBe('WINNER');
    expect(assassinUpdate.killCount).toBe(5);
  });
});
