import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';
import { Row } from '@/design-system/components/Row';

export interface SegmentChipOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SegmentChipsProps {
  options: SegmentChipOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  accentLeft?: boolean;
}

export function SegmentChips({
  options,
  value,
  onChange,
  style,
  accentLeft,
}: SegmentChipsProps) {
  return (
    <Row gap={3} style={style}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            style={[
              styles.chip,
              selected && styles.chipSelected,
              accentLeft && selected && styles.chipAccentLeft,
              option.disabled && styles.chipDisabled,
            ]}
          >
            <Text
              variant="bodySmall"
              color={selected ? colors.inkPrimary : colors.inkSecondary}
              style={styles.chipLabel}
            >
              {option.label}
            </Text>
            {option.sublabel ? (
              <Text variant="bodySmall" muted style={styles.chipSublabel}>
                {option.sublabel}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: space[5],
    paddingHorizontal: space[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  chipAccentLeft: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipLabel: {
    marginBottom: space[1],
    textAlign: 'center',
  },
  chipSublabel: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
