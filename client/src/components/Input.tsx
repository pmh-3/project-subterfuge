import React from 'react';
import { TextInput, StyleSheet, View, Text, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { theme } from '../theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}

export const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  style, 
  maxLength, 
  autoCapitalize = 'characters',
  keyboardType,
  secureTextEntry 
}: InputProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(136, 126, 109, 0.25)"
        selectionColor={theme.colors.primary}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fontFamily.sans,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.mono,
    borderRadius: 0,
    letterSpacing: 2,
  },
});
