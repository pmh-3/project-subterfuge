import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export const Button = ({ title, onPress, loading, disabled, variant = 'primary', style }: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.dangerButton,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.primary : theme.colors.error} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.dangerText]}>
          {title.toUpperCase()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 0, // Sharp corners
    borderWidth: 1, // Thinner, precise border
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(181, 142, 61, 0.05)', // Faint brass
  },
  dangerButton: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(139, 0, 0, 0.05)', // Faint red
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fontFamily.sans,
  },
  primaryText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.error,
  },
});
