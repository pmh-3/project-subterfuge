import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AgentKeyReveal } from '@/features/game/components/AgentKeyReveal';
import { strings } from '@/strings';

describe('AgentKeyReveal', () => {
  it('displays branded key reveal content and proceeds on confirmation', () => {
    const onComplete = jest.fn();
    render(<AgentKeyReveal agentKey="42" onComplete={onComplete} />);

    expect(screen.getByText('042')).toBeTruthy();
    expect(screen.getByText(strings.REVEAL_BRAND_TITLE)).toBeTruthy();
    expect(screen.getByText(strings.REVEAL_SCREENSHOT_BLURB)).toBeTruthy();
    expect(screen.getByText('midnightwire.app')).toBeTruthy();

    fireEvent.press(screen.getByText(strings.LOBBY_CONTINUE));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
