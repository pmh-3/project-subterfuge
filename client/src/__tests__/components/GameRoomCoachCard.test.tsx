import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GameRoomScreen from '../../../app/game/[id]';
import { strings } from '@/strings';
import { Game, Player } from '@/types';

// D9/#9 smoke test: the first-run coach card on the Contract tab is gated on
// `@/utils/storage` (key `coach_contract_seen`), mirroring the existing
// mid-join-banner pattern in `app/game/[id].tsx`. This verifies the full
// wiring end to end: shows once, persists on dismiss, and stays hidden once
// the flag is set — not just the presentational `ContractView` prop-passing
// (covered separately in `ContractView.test.tsx`).

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'GAME1' }),
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

// ESM-only package; not needed for these assertions (the invite sheet with the
// QR code is never opened in this test) so a trivial stub avoids the parse error.
jest.mock('react-native-qrcode-svg', () => {
  const React = require('react');
  return { __esModule: true, default: () => React.createElement('QRCode') };
});

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'host-1' }, loading: false, signIn: jest.fn() }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({ contentStyle: {}, isWide: false, isCompact: false, contentMinHeight: 800 }),
}));

jest.mock('@/features/game/gameService', () => ({
  startGame: jest.fn(),
  challengeTarget: jest.fn(),
  confirmElimination: jest.fn(),
  denyElimination: jest.fn(),
  scrambleTask: jest.fn(),
  swapTarget: jest.fn(),
  adminForceEliminate: jest.fn(),
  endGame: jest.fn(),
}));

jest.mock('@/features/tasks/taskService', () => ({
  fetchTaskPacks: jest.fn().mockResolvedValue([]),
}));

const storageGet = jest.fn();
const storageSave = jest.fn().mockResolvedValue(undefined);

jest.mock('@/utils/storage', () => ({
  storage: {
    get: (...args: unknown[]) => storageGet(...args),
    save: (...args: unknown[]) => storageSave(...args),
  },
}));

const mockGame: Game = {
  id: 'GAME1',
  hostId: 'host-1',
  status: 'ACTIVE',
  playerIds: ['host-1', 'p2'],
  createdAt: Date.now(),
  mode: 'CLASSIC',
};

const mockMe: Player = {
  uid: 'host-1',
  callsign: 'Agent Host',
  status: 'ALIVE',
  targetId: 'p2',
  targetCallsign: 'Agent Two',
  taskDescription: 'Get them to say "pineapple".',
  killCount: 0,
  respawnCount: 0,
  rerollsUsed: 0,
};

const mockOther: Player = {
  uid: 'p2',
  callsign: 'Agent Two',
  status: 'ALIVE',
  killCount: 0,
  respawnCount: 0,
  rerollsUsed: 0,
};

jest.mock('@/features/game/useGame', () => ({
  useGame: () => ({
    game: mockGame,
    players: [mockMe, mockOther],
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

// Batch-2 #1: a refresh into an already-ACTIVE game now lands an alive
// participant directly on the Contract (MISSION) tab, so no manual tab press is
// needed to reach the Contract view any more.

describe('Coach card storage gating on the Contract tab (D9, #9)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storageSave.mockResolvedValue(undefined);
  });

  it('shows the coach card the first time (flag unset) and persists dismissal', async () => {
    storageGet.mockResolvedValue(null);

    render(<GameRoomScreen />);

    await waitFor(() => expect(storageGet).toHaveBeenCalledWith('coach_contract_seen'));

    // The screen auto-lands on the Contract tab (batch-2 #1), so the coach card
    // appears without navigating.
    expect(await screen.findByText(strings.COACH_CONTRACT_TITLE)).toBeTruthy();

    fireEvent.press(screen.getByText(strings.COACH_DISMISS));

    expect(storageSave).toHaveBeenCalledWith('coach_contract_seen', '1');
    expect(screen.queryByText(strings.COACH_CONTRACT_TITLE)).toBeNull();
  });

  it('does not show the coach card once the flag is already set', async () => {
    storageGet.mockResolvedValue('1');

    render(<GameRoomScreen />);

    await waitFor(() => expect(storageGet).toHaveBeenCalledWith('coach_contract_seen'));

    expect(await screen.findByText(strings.CONTRACT_NEUTRALIZE_TARGET)).toBeTruthy();
    expect(screen.queryByText(strings.COACH_CONTRACT_TITLE)).toBeNull();
  });
});
