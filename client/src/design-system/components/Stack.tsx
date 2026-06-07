import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SpaceToken, space } from '@/design-system/tokens/spacing';

export interface StackProps extends ViewProps {
  gap?: SpaceToken;
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end';
}

export function Stack({ gap = 4, align = 'stretch', style, children, ...rest }: StackProps) {
  const gapValue = space[gap];
  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.stack, { alignItems: align }, style]} {...rest}>
      {childArray.map((child, index) => (
        <View key={index} style={index > 0 ? { marginTop: gapValue } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'column',
  },
});
