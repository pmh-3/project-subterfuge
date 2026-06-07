import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export interface BannerProps {
  message: string;
  variant?: 'info' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Banner({
  message,
  variant = 'info',
  actionLabel,
  onAction,
  onDismiss,
  style,
}: BannerProps) {
  const isError = variant === 'error';

  return (
    <Pressable
      onPress={onDismiss}
      style={[
        styles.banner,
        isError ? styles.error : styles.info,
        style,
      ]}
    >
      <Text variant="bodySmall" color={isError ? colors.danger : colors.inkSecondary} style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text variant="labelMicro" accent>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    paddingVertical: space[4],
    paddingHorizontal: space[6],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  info: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  error: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
  },
  message: {
    flex: 1,
  },
});
