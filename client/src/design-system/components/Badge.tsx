import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export type BadgeVariant = 'default' | 'host' | 'accent' | 'success' | 'danger';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const variantColors: Record<BadgeVariant, string> = {
  default: colors.inkMuted,
  host: colors.inkMuted,
  accent: colors.accentText,
  success: colors.success,
  danger: colors.danger,
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text variant="labelMicro" color={variantColors[variant]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginLeft: space[4],
  },
});
