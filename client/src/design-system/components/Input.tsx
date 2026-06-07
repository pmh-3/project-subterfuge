import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { space } from '@/design-system/tokens/spacing';
import { fontFamily, tracking } from '@/design-system/tokens/typography';
import { Text } from '@/design-system/components/Text';

export interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ label, containerStyle, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" muted style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, focused && styles.inputFocused, style]}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.accent}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: space[4],
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    paddingBottom: space[4],
    color: colors.inkPrimary,
    fontFamily: fontFamily.sansLight,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: tracking(18, 0.02),
  },
  inputFocused: {
    borderBottomColor: colors.inkPrimary,
  },
});
