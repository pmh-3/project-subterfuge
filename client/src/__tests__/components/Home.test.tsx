import React from 'react';
import { render, screen } from '@testing-library/react-native';
import WelcomeScreen from '../../../app/index';
import { strings } from '@/strings';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-1' }, loading: false, signIn: jest.fn() }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({ contentStyle: {}, isWide: false, isCompact: false }),
}));

jest.mock('@/features/game/components/BriefingView', () => ({
  BriefingView: () => null,
}));

jest.mock('@/components/WelcomeTagline', () => ({
  WelcomeTagline: () => null,
}));

describe('WelcomeScreen', () => {
  it('renders the home title and primary actions', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText(strings.REVEAL_BRAND_TITLE)).toBeTruthy();
    expect(screen.getByText(strings.LOBBY_JOIN_OPERATION)).toBeTruthy();
    expect(screen.getByText(strings.LOBBY_START_OPERATION)).toBeTruthy();
  });
});
