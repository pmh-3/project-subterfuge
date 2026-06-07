import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { HoldToConfirm } from '@/design-system/components/HoldToConfirm';
import { HOLD_DURATION } from '@/constants';

describe('HoldToConfirm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires onConfirm after the hold threshold', () => {
    const onConfirm = jest.fn();
    render(<HoldToConfirm onConfirm={onConfirm} label="HOLD ME" />);

    const button = screen.getByText('HOLD ME');
    fireEvent(button, 'pressIn');

    act(() => {
      jest.advanceTimersByTime(HOLD_DURATION);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText('✓ TARGET NEUTRALIZED')).toBeTruthy();
  });
});
