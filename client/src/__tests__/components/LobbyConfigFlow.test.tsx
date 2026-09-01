import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LobbyScreen from '../../../app/game/lobby';
import { strings } from '@/strings';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockCreateGame = jest.fn().mockResolvedValue('NEWGAME');

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useLocalSearchParams: () => ({ code: undefined, mode: 'start' }),
}));

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-1' }, loading: false, signIn: jest.fn() }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({ contentStyle: {}, isWide: false, isCompact: false, contentMinHeight: 800 }),
}));

jest.mock('@/utils/storage', () => ({
  storage: {
    get: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/features/game/gameService', () => ({
  createGame: (...args: unknown[]) => mockCreateGame(...args),
  joinGame: jest.fn(),
}));

// react-native-svg's real primitives cannot mount under this jsdom test
// project (no fabric/native bindings); stub every named export (avatar icons
// use a different subset of shapes each) so the avatar picker can render.
// Pre-existing environment gap, not specific to D4.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stub = (props: Record<string, unknown>) => React.createElement(View, props, props.children);
  return new Proxy(
    { __esModule: true, default: Stub },
    { get: (target, prop) => (prop in target ? (target as Record<string, unknown>)[prop as string] : Stub) },
  );
});

describe('LobbyScreen create-game flow (D4 — configure before Create Game)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    mockCreateGame.mockClear();
  });

  it('routes to configure — not straight into the game — after the Agent Key reveal', async () => {
    render(<LobbyScreen />);

    fireEvent.changeText(screen.getByDisplayValue(''), 'Ghost');
    fireEvent.press(screen.getByText(strings.LOBBY_CONTINUE));

    await waitFor(() => {
      expect(mockCreateGame).toHaveBeenCalled();
    });

    // The Agent Key reveal animation still plays (unchanged placement).
    await waitFor(() => {
      expect(screen.getByText(strings.REVEAL_BRAND_TITLE)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.LOBBY_CONTINUE));

    expect(mockReplace).toHaveBeenCalledWith('/game/configure?id=NEWGAME');
    expect(mockPush).not.toHaveBeenCalledWith('/game/NEWGAME');
  });
});
