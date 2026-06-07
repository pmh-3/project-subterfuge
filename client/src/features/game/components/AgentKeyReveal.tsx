import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { strings } from '../../../strings';

interface AgentKeyRevealProps {
  agentKey: string; // 3-digit string
  isNewKey?: boolean; // True if this key was just generated
  onComplete: () => void;
}

export const AgentKeyReveal = ({ agentKey, isNewKey = false, onComplete }: AgentKeyRevealProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const displayKey = agentKey.padStart(3, '0');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>
        {isNewKey ? strings.REVEAL_CREDENTIALS_ASSIGNED : strings.REVEAL_IDENTITY_VERIFIED}
      </Text>

      <View style={styles.keyBox}>
        <Text style={styles.keyDigits}>{displayKey}</Text>
        <Text style={styles.keyLabel}>{strings.REVEAL_AGENT_KEY_LABEL}</Text>
      </View>

      <Text style={styles.blurb}>
        {strings.REVEAL_RECOVERY_BLURB}
      </Text>

      <TouchableOpacity
        onPress={onComplete}
        style={styles.continueButton}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>{strings.REVEAL_PROCEED}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 4,
    marginBottom: 40,
    textAlign: 'center',
  },
  keyBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  keyDigits: {
    color: theme.colors.primary,
    fontSize: 48,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  keyLabel: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 4,
    marginTop: 8,
  },
  blurb: {
    color: theme.colors.surfaceLight,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  continueButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 4,
  },
  continueText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});
