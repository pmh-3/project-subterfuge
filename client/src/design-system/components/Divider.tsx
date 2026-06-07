import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/design-system/tokens/colors';

/** Vertical divider — use Rule for horizontal section breaks */
export function Divider({ style, ...rest }: ViewProps) {
  return <View style={[styles.divider, style]} accessibilityRole="none" {...rest} />;
}

const styles = StyleSheet.create({
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
});
