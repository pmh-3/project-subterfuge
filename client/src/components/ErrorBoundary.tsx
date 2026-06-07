import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, colors, space } from '@/design-system';
import { strings } from '@/strings';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="title" color={colors.danger}>
            {strings.ERROR_BOUNDARY_TITLE}
          </Text>
          <Text variant="body" style={styles.message}>
            {this.props.fallbackMessage ?? strings.ERROR_UNEXPECTED}
          </Text>
          {__DEV__ && this.state.error ? (
            <Text variant="bodySmall" muted style={styles.detail}>
              {this.state.error.message}
            </Text>
          ) : null}
          <Button title={strings.ERROR_BOUNDARY_RETRY} onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[16],
  },
  message: {
    textAlign: 'center',
    marginTop: space[8],
    marginBottom: space[6],
  },
  detail: {
    textAlign: 'center',
    marginBottom: space[12],
    paddingHorizontal: space[8],
  },
});
