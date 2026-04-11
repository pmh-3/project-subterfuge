import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { HOLD_DURATION, HOLD_RESET_DURATION } from '../constants';

/**
 * Shared press-and-hold interaction pattern.
 * Returns animated progress (0→1) and pressIn/pressOut handlers.
 */
export function useHoldToConfirm(onComplete: () => void, duration = HOLD_DURATION) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setIsHolding(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: HOLD_RESET_DURATION,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const onPressIn = useCallback(() => {
    setIsHolding(true);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    timer.current = setTimeout(() => {
      onComplete();
      reset();
    }, duration);
  }, [duration, onComplete, progress, reset]);

  const onPressOut = useCallback(() => {
    reset();
  }, [reset]);

  const interpolatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return { isHolding, progress, interpolatedWidth, onPressIn, onPressOut, reset };
}
