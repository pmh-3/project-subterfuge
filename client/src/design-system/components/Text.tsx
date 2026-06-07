import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { getTextVariantStyle, TextVariant } from '@/design-system/tokens/typography';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
  accent?: boolean;
}

export function Text({
  variant = 'body',
  color,
  muted,
  accent,
  style,
  children,
  ...rest
}: TextProps) {
  const variantStyle = getTextVariantStyle(variant);
  const textColor =
    color ?? (accent ? colors.accentText : muted ? colors.inkMuted : colors.inkPrimary);

  return (
    <RNText style={[variantStyle, { color: textColor }, style]} {...rest}>
      {children}
    </RNText>
  );
}
