import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, Stack } from '@/design-system';
import { TAGLINE_ROTATE_INTERVAL } from '@/constants';
import { strings } from '@/strings';

const ROTATING_LINES = [
  strings.HOME_TAGLINE_ROTATE_1,
  strings.HOME_TAGLINE_ROTATE_2,
  strings.HOME_TAGLINE_ROTATE_3,
  strings.HOME_TAGLINE_ROTATE_4,
  strings.HOME_TAGLINE_ROTATE_5,
] as const;

export function WelcomeTagline() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setIndex((i) => (i + 1) % ROTATING_LINES.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, TAGLINE_ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [opacity]);

  return (
    <Stack gap={4} style={styles.container}>
      <Text variant="body" style={styles.tagline}>
        {strings.HOME_TAGLINE}
      </Text>
      <Animated.View style={{ opacity }}>
        <Text variant="body" muted style={styles.rotate}>
          {ROTATING_LINES[index]}
        </Text>
      </Animated.View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  tagline: {
    lineHeight: 26,
    textAlign: 'center',
  },
  rotate: {
    lineHeight: 26,
    minHeight: 26,
    textAlign: 'center',
  },
});
