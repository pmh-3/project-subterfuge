import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HostSettingsView } from '@/features/game/components/HostSettingsView';
import { Player } from '@/types';
import { strings, dynamicStrings } from '@/strings';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// react-native-svg's real primitives cannot mount under this jsdom test
// project (no fabric/native bindings); the roster chips use Icon* components
// built on Path/Circle. Pre-existing environment gap, not specific to D7.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stub = (props: Record<string, unknown>) => React.createElement(View, props, props.children);
  return new Proxy(
    { __esModule: true, default: Stub },
    { get: (target, prop) => (prop in target ? (target as Record<string, unknown>)[prop as string] : Stub) },
  );
});

const mkPlayer = (overrides: Partial<Player> & Pick<Player, 'uid' | 'callsign'>): Player => ({
  status: 'ALIVE',
  ...overrides,
});

describe('HostSettingsView — Pending Confirmations panel (D7)', () => {
  const players: Player[] = [
    mkPlayer({
      uid: 'target-1',
      callsign: 'Bravo',
      pendingEliminations: [
        { assassinId: 'a1', assassinCallsign: 'Alpha', taskDescription: 'Say the password', claimedAt: 100 },
      ],
    }),
    mkPlayer({ uid: 'a1', callsign: 'Alpha' }),
  ];

  const pendingRows = [
    {
      targetId: 'target-1',
      targetCallsign: 'Bravo',
      assassinId: 'a1',
      assassinCallsign: 'Alpha',
      taskDescription: 'Say the password',
      claimedAt: 100,
    },
  ];

  it('renders a row per queued claim and hides the section when the queue is empty', () => {
    const { rerender } = render(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        pendingRows={pendingRows}
      />,
    );

    expect(
      screen.getByText(dynamicStrings.pendingRowSummary('Alpha', 'Bravo')),
    ).toBeTruthy();
    expect(screen.getByText('Say the password')).toBeTruthy();
    expect(screen.getByText(strings.HOST_PENDING_CONFIRM_BUTTON)).toBeTruthy();
    expect(screen.getByText(strings.HOST_PENDING_DENY_BUTTON)).toBeTruthy();

    rerender(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        pendingRows={[]}
      />,
    );

    expect(screen.queryByText(strings.HOST_PENDING_CONFIRM_BUTTON)).toBeNull();
  });

  it('Confirm calls onConfirmPending with (targetId, assassinId)', () => {
    const onConfirmPending = jest.fn();
    render(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        pendingRows={pendingRows}
        onConfirmPending={onConfirmPending}
        onDenyPending={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText(strings.HOST_PENDING_CONFIRM_BUTTON));
    expect(onConfirmPending).toHaveBeenCalledWith('target-1', 'a1');
  });

  it('Deny calls onDenyPending with (targetId, assassinId)', () => {
    const onDenyPending = jest.fn();
    render(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        pendingRows={pendingRows}
        onConfirmPending={jest.fn()}
        onDenyPending={onDenyPending}
      />,
    );

    fireEvent.press(screen.getByText(strings.HOST_PENDING_DENY_BUTTON));
    expect(onDenyPending).toHaveBeenCalledWith('target-1', 'a1');
  });
});

describe('HostSettingsView — mid-game editable settings (D6)', () => {
  const players: Player[] = [mkPlayer({ uid: 'host-1', callsign: 'Host' })];

  it('exposes the swaps budget control in infinite ACTIVE and calls onUpdateMaxRerolls', () => {
    const onUpdateMaxRerolls = jest.fn();
    render(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        isInfinite
        maxRerolls={5}
        onUpdateMaxRerolls={onUpdateMaxRerolls}
      />,
    );

    expect(screen.getByText(strings.HOST_SWAPS_BUDGET_LABEL)).toBeTruthy();
    expect(screen.getByText(strings.HOST_FUTURE_MISSIONS_ONLY_HINT)).toBeTruthy();

    fireEvent.press(screen.getByText('10'));
    expect(onUpdateMaxRerolls).toHaveBeenCalledWith(10);
  });

  it('does not expose mission settings or a mode control for classic ACTIVE games', () => {
    render(
      <HostSettingsView
        players={players}
        hostId="host-1"
        onForceEliminate={jest.fn()}
        isGameActive
        isInfinite={false}
      />,
    );

    expect(screen.queryByText(strings.HOST_SWAPS_BUDGET_LABEL)).toBeNull();
    expect(screen.queryByText(strings.HOST_MISSION_SETTINGS_SECTION)).toBeNull();
  });
});
