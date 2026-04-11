import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { Button } from './Button';
import { strings } from '../strings';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

/**
 * Cross-platform Alert component that works consistently on Web and Mobile.
 * Replaces native Alert.alert with a themed modal.
 * 
 * Usage:
 * ```
 * const [alert, setAlert] = useState<AlertProps | null>(null);
 * 
 * // Show alert
 * setAlert({
 *   visible: true,
 *   title: 'Error',
 *   message: 'Something went wrong',
 *   buttons: [{ text: 'OK', onPress: () => setAlert(null) }]
 * });
 * 
 * // Render
 * {alert && <Alert {...alert} />}
 * ```
 */
export const Alert = ({ visible, title, message, buttons, onDismiss }: AlertProps) => {
  const defaultButtons: AlertButton[] = buttons || [
    { text: strings.ALERT_OK, onPress: onDismiss, style: 'default' }
  ];

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    } else if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onDismiss}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.alertBox}>
            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {defaultButtons.map((button, index) => (
                <Button
                  key={index}
                  title={button.text}
                  onPress={() => handleButtonPress(button)}
                  variant={button.style === 'destructive' ? 'danger' : 'primary'}
                  style={[
                    styles.button,
                    defaultButtons.length > 1 && styles.multiButton,
                    index > 0 && { marginLeft: theme.spacing.md }
                  ]}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  alertBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.xl,
    borderRadius: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.tight,
    fontFamily: theme.typography.fontFamily.serif,
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.md,
    fontFamily: theme.typography.fontFamily.sans,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  multiButton: {
    flex: 0,
    minWidth: 120,
  },
});
