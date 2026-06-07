import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LobbyScreen from '../../../app/game/lobby';
import { strings } from '@/strings';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ code: undefined, mode: 'join-code' }),
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

describe('LobbyScreen join-code flow', () => {
  it('shows the operation code entry step', async () => {
    render(<LobbyScreen />);

    expect(screen.getByText(strings.LOBBY_ENTER_CODE_TITLE)).toBeTruthy();
    expect(screen.getByText(strings.LOBBY_OPERATION_CODE_LABEL)).toBeTruthy();
    expect(screen.getByText(strings.LOBBY_CONTINUE)).toBeTruthy();
  });
});
