import React from 'react';
import { StyleSheet } from 'react-native';
import { space } from '@/design-system/tokens/spacing';
import { Sheet } from '@/design-system/components/Sheet';
import { Text } from '@/design-system/components/Text';
import { Button } from '@/design-system/components/Button';
import { Row } from '@/design-system/components/Row';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertProps {
  open: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function Alert({ open, title, message, buttons, onDismiss }: AlertProps) {
  const resolvedButtons: AlertButton[] =
    buttons ?? [{ text: 'OK', onPress: onDismiss, style: 'default' }];

  const handlePress = (button: AlertButton) => {
    button.onPress?.();
    if (!button.onPress) {
      onDismiss?.();
    }
  };

  return (
    <Sheet open={open} onClose={() => onDismiss?.()}>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
      ) : null}
      <Row gap={4} justify={resolvedButtons.length > 1 ? 'center' : 'center'} style={styles.actions}>
        {resolvedButtons.map((button, index) => (
          <Button
            key={index}
            title={button.text}
            onPress={() => handlePress(button)}
            variant={button.style === 'destructive' ? 'danger' : button.style === 'cancel' ? 'ghost' : 'primary'}
            size="sm"
            style={resolvedButtons.length > 1 ? styles.multiButton : styles.singleButton}
          />
        ))}
      </Row>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginBottom: space[4],
  },
  message: {
    textAlign: 'center',
    marginBottom: space[10],
  },
  actions: {
    justifyContent: 'center',
  },
  singleButton: {
    alignSelf: 'stretch',
  },
  multiButton: {
    minWidth: 100,
  },
});
