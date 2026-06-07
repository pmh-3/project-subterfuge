import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/features/auth/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { theme } from '../src/theme';
import { strings } from '../src/strings';

export default function WelcomeScreen() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Auto-initialize if not authenticated
    if (!user && !loading) {
      signIn();
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        router.replace('/game/lobby');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.APP_NAME}</Text>
      
      <View style={styles.spacer} />

      <Text style={styles.status}>
        {loading ? strings.WELCOME_STATUS_LOADING : user ? strings.WELCOME_STATUS_AUTHENTICATED : strings.WELCOME_STATUS_INIT}
      </Text>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fontFamily.serif,
  },
  spacer: {
    height: theme.spacing.xxl,
  },
  status: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.normal,
    fontFamily: theme.typography.fontFamily.mono,
  },
});
