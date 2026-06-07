import { useWindowDimensions, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from '@/design-system/tokens/layout';

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= layout.wideMinWidth;
  const isCompact = width < layout.compactMaxWidth;

  const contentStyle: StyleProp<ViewStyle> = {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  };

  const contentMinHeight = height - insets.top - insets.bottom;

  return { isWide, isCompact, contentStyle, contentMinHeight };
}
