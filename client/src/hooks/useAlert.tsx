import { useState } from 'react';
import { Alert, type AlertButton } from '@/design-system';

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertState extends AlertConfig {
  visible: boolean;
}

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

  const AlertComponent = alertState ? (
    <Alert
      open={alertState.visible}
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
