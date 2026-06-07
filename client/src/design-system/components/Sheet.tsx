import React from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';

export interface SheetProps extends Omit<RNModalProps, 'visible'> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Declarative modal/sheet — backdrop tap dismisses */
export function Sheet({ open, onClose, children, contentStyle, ...rest }: SheetProps) {
  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...rest}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.content, contentStyle]} onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,20,8,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[10],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    padding: space[10],
  },
});
