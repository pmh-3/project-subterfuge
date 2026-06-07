import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Stack, Row, IconButton, Button, ScreenHeader, space } from '@/design-system';
import { strings, briefingParagraphs } from '@/strings';

interface BriefingViewProps {
  onClose?: () => void;
  showClose?: boolean;
  onLeave?: () => void;
  showPageHeader?: boolean;
}

export function BriefingView({
  onClose,
  showClose = false,
  onLeave,
  showPageHeader = false,
}: BriefingViewProps) {
  if (showPageHeader) {
    return (
      <Stack gap={7}>
        <ScreenHeader title={strings.INFO_TITLE} />

        <Text variant="title" style={styles.helpIcon}>
          ?
        </Text>

        <Stack gap={5}>
          <Text variant="label" muted>
            {strings.INFO_SECTION_HOW_IT_WORKS}
          </Text>
          {briefingParagraphs.map((paragraph, index) => (
            <Text key={index} variant="body" style={styles.body}>
              {paragraph}
            </Text>
          ))}
        </Stack>

        {onLeave ? (
          <Button title={strings.GAME_LEAVE} onPress={onLeave} variant="ghost" size="sm" fullWidth />
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack gap={6}>
      <Row justify="space-between" align="flex-start" gap={4}>
        <Text variant="title" style={styles.title}>
          {strings.INFO_SECTION_HOW_IT_WORKS}
        </Text>
        {showClose && onClose ? (
          <IconButton onPress={onClose} accessibilityLabel={strings.BRIEFING_CLOSE} size={32}>
            <Text variant="body" style={styles.closeIcon}>
              ×
            </Text>
          </IconButton>
        ) : null}
      </Row>

      <Stack gap={5}>
        {briefingParagraphs.map((paragraph, index) => (
          <Text key={index} variant="body" style={styles.body}>
            {paragraph}
          </Text>
        ))}
      </Stack>

      {onLeave ? (
        <Button title={strings.GAME_LEAVE} onPress={onLeave} variant="ghost" size="sm" fullWidth />
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
  },
  closeIcon: {
    lineHeight: 22,
    marginTop: -2,
  },
  helpIcon: {
    alignSelf: 'center',
    lineHeight: 32,
    marginTop: -4,
    marginBottom: space[2],
  },
  body: {
    lineHeight: 24,
  },
});
