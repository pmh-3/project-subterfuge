import React, { useState } from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  disabled,
  style,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = loading || disabled;

  const textVariant =
    variant === 'ghost'
      ? 'buttonGhost'
      : variant === 'danger'
        ? 'metaMicro'
        : size === 'sm'
          ? 'buttonSmall'
          : 'buttonLarge';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        variant === 'primary' && [
          styles.primary,
          (hovered || pressed) && styles.primaryHover,
        ],
        variant === 'ghost' && [
          styles.ghost,
          (hovered || pressed) && styles.ghostHover,
        ],
        variant === 'danger' && styles.danger,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.inkPrimary : colors.inkOnDark}
        />
      ) : (
        <Text
          variant={textVariant}
          color={variant === 'ghost' ? colors.inkPrimary : colors.inkOnDark}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: space[10],
  },
  sm: {
    paddingVertical: 9,
    paddingHorizontal: space[8],
  },
  primary: {
    backgroundColor: colors.inkPrimary,
  },
  primaryHover: {
    backgroundColor: colors.inkSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  ghostHover: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.danger,
    paddingVertical: 13,
    paddingHorizontal: 13,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
});
