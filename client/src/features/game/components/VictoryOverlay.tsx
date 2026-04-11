import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { theme } from '../../../theme';
import { getAvatarComponent } from '../../../components/avatars';
import { DEFAULT_AVATAR_ID, VICTORY_TYPING_INTERVAL, VICTORY_SUBTEXT_DELAY, VICTORY_DISMISS_DELAY } from '../../../constants';
import { strings } from '../../../strings';

interface VictoryOverlayProps {
  visible: boolean;
  onComplete: () => void;
  avatarId?: string;
}

export const VictoryOverlay = ({ visible, onComplete, avatarId }: VictoryOverlayProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showSubtext, setShowSubtext] = useState(false);
  const fullText = strings.VICTORY_TITLE;
  
  const AvatarComponent = getAvatarComponent(avatarId || DEFAULT_AVATAR_ID);

  useEffect(() => {
    if (!visible) {
      setDisplayedText('');
      setShowSubtext(false);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      // Check length before access
      if (currentIndex < fullText.length) {
        const char = fullText[currentIndex];
        if (char !== undefined) {
          setDisplayedText(prev => prev + char);
          currentIndex++;
        }
      } else {
        clearInterval(interval);
        setTimeout(() => setShowSubtext(true), VICTORY_SUBTEXT_DELAY);
        setTimeout(() => {
          onComplete();
        }, VICTORY_DISMISS_DELAY);
      }
    }, VICTORY_TYPING_INTERVAL);

    return () => clearInterval(interval);
  }, [visible, onComplete]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <AvatarComponent size={60} color={theme.colors.success} />
          <View style={styles.spacer} />
          <Text style={styles.text}>
            {displayedText}
            <Text style={styles.cursor}>_</Text>
          </Text>
          {showSubtext && (
            <Text style={styles.subtext}>{strings.VICTORY_SUBTEXT}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: theme.colors.success,
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 6,
    textAlign: 'center',
    lineHeight: 48,
  },
  cursor: {
    color: theme.colors.success,
    opacity: 0.8,
  },
  subtext: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 8,
    marginTop: 30,
  },
  spacer: {
    height: 30,
  }
});
