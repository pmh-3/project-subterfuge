import React, { useState } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
export interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

export function IconButton({
  onPress,
  children,
  size = 38,
  disabled,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
        },
        hovered && styles.hovered,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  hovered: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  disabled: {
    opacity: 0.5,
  },
});
