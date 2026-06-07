import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, space } from '@/design-system';

export interface InviteQrCodeProps {
  value: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}

export function InviteQrCode({ value, size, style }: InviteQrCodeProps) {
  return (
    <View style={[styles.wrap, style]}>
      <QRCode
        value={value}
        size={size}
        color={colors.inkPrimary}
        backgroundColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: space[5],
    backgroundColor: colors.surface,
  },
});
