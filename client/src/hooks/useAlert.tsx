import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertState extends AlertConfig {
  visible: boolean;
}

/**
 * Hook for managing cross-platform alerts.
 * Drop-in replacement for Alert.alert that works on Web + Mobile.
 * 
 * Usage:
 * ```
 * const { showAlert, AlertComponent } = useAlert();
 * 
 * // Show alert
 * showAlert({
 *   title: 'Error',
 *   message: 'Something went wrong',
 *   buttons: [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Delete', onPress: handleDelete, style: 'destructive' }
 *   ]
 * });
 * 
 * // Render in component
 * return (
 *   <View>
 *     {/* Your content *\/}
 *     {AlertComponent}
 *   </View>
 * );
 * ```
 */
export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlertState({
      ...config,
      visible: true,
    });
  };

  const hideAlert = () => {
    setAlertState(null);
  };

  // Import Alert dynamically to avoid circular deps
  const Alert = require('../components/Alert').Alert;

  const AlertComponent = alertState ? (
    <Alert
      visible={alertState.visible}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      onDismiss={hideAlert}
    />
  ) : null;

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
