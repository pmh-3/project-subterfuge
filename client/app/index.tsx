import { View, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Stack,
  IconButton,
  colors,
  space,
  Sheet,
} from '@/design-system';
import { useLayout } from '@/hooks/useLayout';
import { strings } from '@/strings';
import { BriefingView } from '@/features/game/components/BriefingView';
import { WelcomeTagline } from '@/components/WelcomeTagline';
import { ProductLogo, PRODUCT_MARK_SIZES } from '@/components/branding';
import { HELP_BUTTON_PULSE_DURATION } from '@/constants';

export default function WelcomeScreen() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const { contentStyle } = useLayout();
  const [showBriefing, setShowBriefing] = useState(false);
  const helpPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user && !loading) {
      signIn();
    }
  }, [user, loading]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(helpPulse, {
          toValue: 1,
          duration: HELP_BUTTON_PULSE_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(helpPulse, {
          toValue: 0,
          duration: HELP_BUTTON_PULSE_DURATION,
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [helpPulse]);

  const helpOpacity = helpPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const helpScale = helpPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.topBar, contentStyle]}>
        <Animated.View style={{ opacity: helpOpacity, transform: [{ scale: helpScale }] }}>
          <IconButton
            onPress={() => setShowBriefing(true)}
            accessibilityLabel={strings.HOME_HELP_LABEL}
            style={styles.helpButton}
          >
            <Text variant="title" style={styles.helpIcon}>
              ?
            </Text>
          </IconButton>
        </Animated.View>
      </View>

      <View style={[styles.hero, contentStyle]}>
        <ProductLogo
          layout="stacked"
          markSize={PRODUCT_MARK_SIZES.lg}
          titleVariant="displayHero"
          titleStyle={styles.logoTitle}
          style={styles.logo}
        />
        <WelcomeTagline />
      </View>

      <Stack gap={5} style={[styles.actions, contentStyle]}>
        <Button
          title={strings.LOBBY_JOIN_OPERATION}
          onPress={() => router.push('/game/lobby?mode=join-code')}
          fullWidth
        />
        <Button
          title={strings.LOBBY_START_OPERATION}
          onPress={() => router.push('/game/lobby?mode=start')}
          variant="ghost"
          fullWidth
        />
      </Stack>

      <Sheet open={showBriefing} onClose={() => setShowBriefing(false)}>
        <BriefingView onClose={() => setShowBriefing(false)} showClose />
      </Sheet>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: space[10],
    paddingBottom: space[14],
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: space[2],
  },
  helpButton: {
    borderColor: colors.borderStrong,
  },
  helpIcon: {
    lineHeight: 28,
    marginTop: -2,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: space[10],
    gap: space[10],
  },
  logo: {
    width: '100%',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 52,
    lineHeight: 52 * 0.95,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
});
