import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/design-system';
import { strings } from '@/strings';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { ActivityIndicator, View, Platform } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Legacy — removed in Phase 2 screen migration
    PlayfairDisplay_700Bold,
    Inter_600SemiBold,
    // Midnight Wire design system
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    SpecialElite_400Regular,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  // On web, fonts are loaded via CSS in index.html - don't block rendering
  const isWeb = Platform.OS === 'web';
  const ready = isWeb || fontsLoaded;

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.inkPrimary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary fallbackMessage={strings.ERROR_BOUNDARY_MESSAGE}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

// Add global web styles to prevent overscroll showing white background
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&family=Special+Elite&display=swap');
    html, body, #root {
      background-color: ${colors.background};
      overscroll-behavior: none;
    }
  `;
  document.head.appendChild(style);
}
