import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, Text, Stack, Sheet } from '@/design-system';
import { DEFAULT_AVATAR_ID, VICTORY_TYPING_INTERVAL, VICTORY_SUBTEXT_DELAY, VICTORY_DISMISS_DELAY } from '@/constants';
import { strings } from '@/strings';

interface VictoryOverlayProps {
  visible: boolean;
  onComplete: () => void;
  avatarId?: string;
  variant?: 'classic' | 'infinite';
}

export const VictoryOverlay = ({
  visible,
  onComplete,
  avatarId,
  variant = 'classic',
}: VictoryOverlayProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showSubtext, setShowSubtext] = useState(false);
  const fullText = variant === 'infinite' ? strings.VICTORY_INFINITE_TITLE : strings.VICTORY_TITLE;
  const subtext = variant === 'infinite' ? strings.VICTORY_INFINITE_SUBTEXT : strings.VICTORY_SUBTEXT;

  useEffect(() => {
    if (!visible) {
      setDisplayedText('');
      setShowSubtext(false);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        const char = fullText[currentIndex];
        if (char !== undefined) {
          setDisplayedText((prev) => prev + char);
          currentIndex++;
        }
      } else {
        clearInterval(interval);
        setTimeout(() => setShowSubtext(true), VICTORY_SUBTEXT_DELAY);
        setTimeout(() => onComplete(), VICTORY_DISMISS_DELAY);
      }
    }, VICTORY_TYPING_INTERVAL);

    return () => clearInterval(interval);
  }, [visible, onComplete, fullText]);

  return (
    <Sheet open={visible} onClose={onComplete}>
      <Stack gap={8} align="center">
        <Avatar avatarId={avatarId || DEFAULT_AVATAR_ID} size={60} />
        <Text variant="display" accent style={styles.title}>
          {displayedText}
          <Text variant="display" accent>
            _
          </Text>
        </Text>
        {showSubtext ? (
          <Text variant="label" muted>
            {subtext}
          </Text>
        ) : null}
      </Stack>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    lineHeight: 48,
  },
});
