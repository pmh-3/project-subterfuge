import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';
import { Row } from '@/design-system/components/Row';

export interface PillSegmentOption {
  value: string;
  label: string;
}

export interface PillSegmentsProps {
  options: PillSegmentOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  mono?: boolean;
}

export function PillSegments({ options, value, onChange, style, mono }: PillSegmentsProps) {
  return (
    <Row gap={3} style={style}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text
              variant={mono ? 'codeSmall' : 'bodySmall'}
              color={selected ? colors.background : colors.inkMuted}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: space[5],
    paddingHorizontal: space[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: colors.inkPrimary,
    borderColor: colors.inkPrimary,
  },
});
