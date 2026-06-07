import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { strings } from '../strings';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in child tree and shows a recovery UI.
 * Wrap around route segments or high-risk subtrees.
 */
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
          <Text style={styles.title}>{strings.ERROR_BOUNDARY_TITLE}</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ?? strings.ERROR_UNEXPECTED}
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.detail}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>{strings.ERROR_BOUNDARY_RETRY}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    color: theme.colors.error,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: theme.typography.fontFamily.serif,
    marginBottom: 16,
    letterSpacing: 2,
  },
  message: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  detail: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 2,
  },
});
