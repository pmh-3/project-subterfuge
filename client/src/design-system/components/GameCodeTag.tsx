import React from 'react';
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export interface GameCodeTagProps {
  code: string;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GameCodeTag({ code, label, onPress, style }: GameCodeTagProps) {
  const content = (
    <>
      <Text variant="labelMicro" muted maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
      <Text variant="codeMedium" color={colors.inkPrimary} maxFontSizeMultiplier={1.4}>
        {code}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.tag, pressed && styles.tagPressed, style]}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${code}`}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.tag, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  tag: {
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingVertical: space[3],
    paddingHorizontal: space[5],
    gap: space[1],
  },
  tagPressed: {
    backgroundColor: colors.surface,
  },
});
