import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SpaceToken, space } from '@/design-system/tokens/spacing';

export interface RowProps extends ViewProps {
  gap?: SpaceToken;
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}

export function Row({
  gap = 4,
  align = 'center',
  justify = 'flex-start',
  style,
  children,
  ...rest
}: RowProps) {
  const gapValue = space[gap];
  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.row, { alignItems: align, justifyContent: justify }, style]} {...rest}>
      {childArray.map((child, index) => (
        <View key={index} style={index > 0 ? { marginLeft: gapValue } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
