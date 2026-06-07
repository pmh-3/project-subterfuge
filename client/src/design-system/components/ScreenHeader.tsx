import React from 'react';
import { StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';
import { Rule } from '@/design-system/components/Rule';
import { Stack } from '@/design-system/components/Stack';
import { Row } from '@/design-system/components/Row';

export interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ eyebrow, title, trailing, style }: ScreenHeaderProps) {
  return (
    <Stack gap={4} style={[{ marginBottom: space[7] }, style]}>
      {eyebrow ? (
        <Text variant="label" muted>
          {eyebrow}
        </Text>
      ) : null}
      <Row justify="space-between" align="flex-start" gap={6}>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        {trailing}
      </Row>
      <Rule marginVertical={0} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
  },
});
