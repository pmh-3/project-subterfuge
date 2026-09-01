import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ContractView } from '@/features/game/components/ContractView';
import { strings } from '@/strings';
import { Player } from '@/types';

// react-test-renderer test instances expose `.type` / `.parent`; walk up to find
// the host `Pressable` ancestor so we can assert its `disabled` prop directly.
// (fireEvent.press bypasses the mocked Pressable's `disabled` wiring, so it can't
// be used to prove a handler is unreachable — see __mocks__/react-native.js.)
interface TestInstanceLike {
  type: unknown;
  parent: TestInstanceLike | null;
  props: { disabled?: boolean };
}

function findAncestorPressable(node: ReturnType<typeof screen.getByText>): TestInstanceLike | null {
  let current: TestInstanceLike | null = node as unknown as TestInstanceLike;
  while (current) {
    if (current.type === 'Pressable') return current;
    current = current.parent;
  }
  return null;
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    uid: 'me',
    callsign: 'Agent Me',
    status: 'ALIVE',
    targetId: 'target',
    targetCallsign: 'Target Agent',
    taskDescription: 'Get them to say "pineapple".',
    killCount: 0,
    respawnCount: 0,
    rerollsUsed: 0,
    ...overrides,
  };
}

describe('ContractView swap controls', () => {
  it('infinite mode: renders both Swap Mission and Swap Target, enabled with budget remaining', () => {
    const onSwap = jest.fn();
    const onSwapTarget = jest.fn();
    render(
      <ContractView
        player={makePlayer()}
        isPending={false}
        onLogKill={jest.fn()}
        onSwap={onSwap}
        onSwapTarget={onSwapTarget}
        isInfinite
        aliveCount={4}
        maxRerolls={5}
      />,
    );

    const swapMission = screen.getByText(strings.CONTRACT_SWAP_MISSION);
    const swapTarget = screen.getByText(strings.CONTRACT_SWAP_TARGET);
    expect(swapMission).toBeTruthy();
    expect(swapTarget).toBeTruthy();

    fireEvent.press(swapMission);
    expect(onSwap).toHaveBeenCalledTimes(1);

    fireEvent.press(swapTarget);
    expect(onSwapTarget).toHaveBeenCalledTimes(1);
  });

  it('classic mode: renders Swap Mission only, Swap Target absent', () => {
    render(
      <ContractView
        player={makePlayer()}
        isPending={false}
        onLogKill={jest.fn()}
        onSwap={jest.fn()}
        onSwapTarget={jest.fn()}
        isInfinite={false}
        maxRerolls={5}
      />,
    );

    expect(screen.getByText(strings.CONTRACT_SWAP_MISSION)).toBeTruthy();
    expect(screen.queryByText(strings.CONTRACT_SWAP_TARGET)).toBeNull();
  });

  it('shows the exhausted-budget copy and disables both swap controls when rerollsUsed hits the budget', () => {
    render(
      <ContractView
        player={makePlayer({ rerollsUsed: 5 })}
        isPending={false}
        onLogKill={jest.fn()}
        onSwap={jest.fn()}
        onSwapTarget={jest.fn()}
        isInfinite
        aliveCount={4}
        maxRerolls={5}
      />,
    );

    expect(screen.getByText(strings.NO_MORE_SWAPS)).toBeTruthy();
    expect(findAncestorPressable(screen.getByText(strings.CONTRACT_SWAP_MISSION))?.props.disabled).toBe(
      true,
    );
    expect(findAncestorPressable(screen.getByText(strings.CONTRACT_SWAP_TARGET))?.props.disabled).toBe(
      true,
    );
  });

  it('disables Swap Target when fewer than 3 agents are alive (it could not change anything)', () => {
    render(
      <ContractView
        player={makePlayer()}
        isPending={false}
        onLogKill={jest.fn()}
        onSwap={jest.fn()}
        onSwapTarget={jest.fn()}
        isInfinite
        aliveCount={2}
        maxRerolls={5}
      />,
    );

    expect(findAncestorPressable(screen.getByText(strings.CONTRACT_SWAP_TARGET))?.props.disabled).toBe(
      true,
    );
    // Swap Mission is unaffected by the player-count gate — only target-swap needs 3+.
    expect(findAncestorPressable(screen.getByText(strings.CONTRACT_SWAP_MISSION))?.props.disabled).toBe(
      false,
    );
  });
});
