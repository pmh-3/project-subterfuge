import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Stack, Text, Button, space } from '@/design-system';
import { strings } from '@/strings';

interface CoachCardProps {
  onDismiss: () => void;
}

/**
 * One-time, dismissible summary of the core loop shown the first time a
 * player lands on the Contract tab (D9, #9). Presentational only — the
 * "seen" flag lives in `@/utils/storage` and is owned by the caller
 * (`app/game/[id].tsx`), which decides whether to render this at all.
 */
export function CoachCard({ onDismiss }: CoachCardProps) {
  return (
    <Card style={styles.card}>
      <Stack gap={4}>
        <Text variant="label" muted>
          {strings.COACH_CONTRACT_TITLE}
        </Text>
        <Text variant="body" style={styles.body}>
          {strings.COACH_CONTRACT_BODY}
        </Text>
        <Button title={strings.COACH_DISMISS} onPress={onDismiss} variant="ghost" size="sm" fullWidth />
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space[7],
  },
  body: {
    lineHeight: 22,
  },
});
