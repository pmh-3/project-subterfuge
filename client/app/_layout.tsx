import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/features/auth/AuthContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { theme } from '../src/theme';
import { strings } from '../src/strings';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View, Platform } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    SpecialElite_400Regular,
    Inter_600SemiBold,
  });

  // On web, fonts are loaded via CSS in index.html - don't block rendering
  const isWeb = Platform.OS === 'web';
  const ready = isWeb || fontsLoaded;

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
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
              contentStyle: { backgroundColor: theme.colors.background },
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
    html, body, #root {
      background-color: ${theme.colors.background};
      overscroll-behavior: none;
    }
  `;
  document.head.appendChild(style);
}
