import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import ConfigureScreen from '../../../app/game/configure';
import { strings } from '@/strings';

const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDoc = jest.fn().mockResolvedValue({
  exists: () => true,
  data: () => ({
    id: 'TEST',
    hostId: 'host',
    status: 'CONFIGURING',
    playerIds: ['host'],
    createdAt: Date.now(),
    selectedPacks: ['basic_training'],
    difficultySetting: 'Mixed',
    maxRerolls: 5,
  }),
});

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  deleteField: jest.fn(() => 'DELETE_FIELD'),
}));

jest.mock('@/services/firebase', () => ({ db: {} }));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'TEST' }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({ contentStyle: {}, isWide: false, isCompact: false }),
}));

jest.mock('@/hooks/useAlert', () => ({
  useAlert: () => ({ showAlert: jest.fn(), AlertComponent: null }),
}));

jest.mock('@/features/tasks/taskService', () => ({
  fetchTaskPacks: jest.fn().mockResolvedValue([
    {
      id: 'basic_training',
      displayName: 'Basic Training',
      description: 'Starter pack',
      difficulty: 'Recruit',
      isPremium: false,
      tasks: [{ id: 't1', text: 'Say hello', difficultyScale: 1 }],
    },
  ]),
}));

describe('ConfigureScreen mode toggle', () => {
  beforeEach(() => {
    mockUpdateDoc.mockClear();
  });

  it('shows enabled infinite option with score-attack sublabel', async () => {
    render(<ConfigureScreen />);

    await waitFor(() => {
      expect(screen.getByText(strings.CONFIGURE_MODE_INFINITE)).toBeTruthy();
    });

    expect(screen.getByText(strings.CONFIGURE_MODE_INFINITE_SUB)).toBeTruthy();
    expect(screen.queryByText('Coming soon')).toBeNull();
  });

  it('reveals mission success pills when infinite is selected', async () => {
    render(<ConfigureScreen />);

    await waitFor(() => {
      expect(screen.getByText(strings.CONFIGURE_MODE_INFINITE)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.CONFIGURE_MODE_INFINITE));

    await waitFor(() => {
      expect(screen.getByText(strings.CONFIGURE_MISSION_SUCCESS_LABEL)).toBeTruthy();
    });
  });

  it('persists INFINITE mode on authorize', async () => {
    render(<ConfigureScreen />);

    await waitFor(() => {
      expect(screen.getByText(strings.CONFIGURE_MODE_INFINITE)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.CONFIGURE_MODE_INFINITE));
    fireEvent.press(screen.getByText(strings.CONFIGURE_AUTHORIZE_BUTTON));

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    const payload = mockUpdateDoc.mock.calls[0]?.[1];
    expect(payload.mode).toBe('INFINITE');
    expect(payload.infiniteConfig).toEqual({
      endCondition: { type: 'KILL_GOAL', value: 5 },
    });
  });
});
