import React, { useState } from 'react';
import { Pressable, View, Animated, StyleSheet } from 'react-native';
import { useHoldToConfirm } from '@/hooks/useHoldToConfirm';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';
import { Stack } from '@/design-system/components/Stack';

export type HoldToConfirmVariant = 'danger' | 'primary';

export interface HoldToConfirmProps {
  onConfirm: () => void;
  label?: string;
  helperText?: string;
  successLabel?: string;
  holdingLabel?: string;
  loadingLabel?: string;
  variant?: HoldToConfirmVariant;
  compact?: boolean;
  showSuccessState?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export function HoldToConfirm({
  onConfirm,
  label = 'NEUTRALIZE TARGET',
  helperText = 'HOLD TO CONFIRM',
  successLabel = '✓ TARGET NEUTRALIZED',
  holdingLabel = 'CONFIRMING…',
  loadingLabel = '…',
  variant = 'danger',
  compact = false,
  showSuccessState = true,
  disabled,
  loading,
  style,
}: HoldToConfirmProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { isHolding, interpolatedWidth, onPressIn, onPressOut } = useHoldToConfirm(() => {
    if (showSuccessState) {
      setConfirmed(true);
    }
    onConfirm();
  });

  const isPrimary = variant === 'primary';

  if (confirmed && showSuccessState) {
    return (
      <View style={[styles.successPanel, style]}>
        <Text variant="metaMicro" color={colors.success}>
          {successLabel}
        </Text>
      </View>
    );
  }

  return (
    <Stack gap={compact ? 0 : 3} align="center" style={style}>
      <Pressable
        onPressIn={loading || disabled ? undefined : onPressIn}
        onPressOut={loading || disabled ? undefined : onPressOut}
        disabled={loading || disabled}
        style={[
          styles.container,
          compact ? styles.compact : null,
          isPrimary ? styles.primary : styles.danger,
          (loading || disabled) && styles.disabled,
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            isPrimary ? styles.primaryFill : styles.dangerFill,
            { width: interpolatedWidth },
          ]}
        />
        <Text variant={compact ? 'buttonSmall' : 'metaMicro'} color={colors.inkOnDark} style={styles.label}>
          {loading ? loadingLabel : isHolding ? holdingLabel : label}
        </Text>
      </Pressable>
      {!compact && helperText ? (
        <Text variant="labelMicro" muted>
          {helperText}
        </Text>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: space[8],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compact: {
    paddingVertical: 13,
    paddingHorizontal: space[6],
  },
  danger: {
    backgroundColor: colors.danger,
  },
  primary: {
    backgroundColor: colors.inkPrimary,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  dangerFill: {
    backgroundColor: colors.dangerHover,
  },
  primaryFill: {
    backgroundColor: colors.inkSecondary,
  },
  label: {
    zIndex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  successPanel: {
    alignSelf: 'stretch',
    backgroundColor: colors.successSurface,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: radius.sm,
    paddingVertical: space[6],
    paddingHorizontal: space[8],
    alignItems: 'center',
  },
});
