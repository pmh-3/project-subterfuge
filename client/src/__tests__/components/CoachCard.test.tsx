import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CoachCard } from '@/features/game/components/CoachCard';
import { strings } from '@/strings';

describe('CoachCard', () => {
  it('renders the condensed loop copy and dismiss button', () => {
    render(<CoachCard onDismiss={jest.fn()} />);

    expect(screen.getByText(strings.COACH_CONTRACT_TITLE)).toBeTruthy();
    expect(screen.getByText(strings.COACH_CONTRACT_BODY)).toBeTruthy();
    expect(screen.getByText(strings.COACH_DISMISS)).toBeTruthy();
  });

  it('calls onDismiss when GOT IT is pressed', () => {
    const onDismiss = jest.fn();
    render(<CoachCard onDismiss={onDismiss} />);

    fireEvent.press(screen.getByText(strings.COACH_DISMISS));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
