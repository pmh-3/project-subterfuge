import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export interface PlayerCountBadgeProps {
  count: number;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function PlayerCountBadge({ count, label, style }: PlayerCountBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text variant="codeMedium" color={colors.accent}>
        {count}
      </Text>
      <Text variant="labelMicro" muted>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
  },
});
