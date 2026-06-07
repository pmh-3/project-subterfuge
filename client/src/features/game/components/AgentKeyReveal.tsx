import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Stack, Rule, colors, space } from '@/design-system';
import { ProductLogo, PRODUCT_MARK_SIZES } from '@/components/branding';
import { APP_URL } from '@/constants';
import { strings } from '@/strings';

interface AgentKeyRevealProps {
  agentKey: string;
  onComplete: () => void;
}

export const AgentKeyReveal = ({ agentKey, onComplete }: AgentKeyRevealProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const displayKey = agentKey.padStart(3, '0');
  const siteLabel = APP_URL.replace(/^https?:\/\//, '');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.hero}>
          <Stack gap={10} align="center" style={styles.card}>
            <ProductLogo layout="stacked" markSize={PRODUCT_MARK_SIZES.lg} />
            <Rule style={styles.rule} />

            <Text variant="codeHero">{displayKey}</Text>

            <Text variant="bodySmall" muted style={styles.blurb}>
              {strings.REVEAL_SCREENSHOT_BLURB}
            </Text>
            <Text variant="metaMicro" muted>
              {siteLabel}
            </Text>
          </Stack>
        </View>

        <View style={styles.footer}>
          <Button title={strings.LOBBY_CONTINUE} onPress={onComplete} fullWidth />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: space[10],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 320,
  },
  rule: {
    width: '100%',
    marginVertical: space[2],
  },
  blurb: {
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingBottom: space[14],
  },
});
