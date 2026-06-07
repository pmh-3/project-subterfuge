import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { strings } from '../strings';

interface AgentKeyBadgeProps {
  agentKey: string;
  size?: 'sm' | 'md';
}

export const AgentKeyBadge = ({ agentKey, size = 'md' }: AgentKeyBadgeProps) => {
  const [visible, setVisible] = useState(false);

  const isSm = size === 'sm';
  
  return (
    <TouchableOpacity 
      onPress={() => setVisible(!visible)}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isSm && styles.labelSm]}>{strings.AGENT_KEY_BADGE_LABEL}</Text>
      <Text style={[styles.value, isSm && styles.valueSm]}>
        {visible ? agentKey : strings.AGENT_KEY_BADGE_MASKED}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.mono,
    marginRight: 4,
  },
  labelSm: {
    fontSize: 8,
  },
  value: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  valueSm: {
    fontSize: 10,
    letterSpacing: 1,
  },
});
