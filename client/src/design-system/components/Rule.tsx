import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { SpaceToken, space } from '@/design-system/tokens/spacing';

export interface RuleProps extends ViewProps {
  marginVertical?: SpaceToken;
}

export function Rule({ marginVertical = 7, style, ...rest }: RuleProps) {
  const margin = space[marginVertical];
  return (
    <View
      style={[styles.rule, { marginVertical: margin }, style]}
      accessibilityRole="none"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  rule: {
    height: 1,
    backgroundColor: colors.border,
  },
});
