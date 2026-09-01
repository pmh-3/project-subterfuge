import React from 'react';
import { StyleSheet, View, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Text, Row, space } from '@/design-system';
import { TextVariant } from '@/design-system/tokens/typography';
import { strings } from '@/strings';
import { ProductMark, ProductMarkVariant } from '@/components/branding/ProductMark';

export const PRODUCT_MARK_SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
} as const;

export type ProductLogoLayout = 'stacked' | 'inline';

export interface ProductLogoProps {
  layout?: ProductLogoLayout;
  markSize?: number;
  markVariant?: ProductMarkVariant;
  title?: string;
  titleVariant?: TextVariant;
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

/** Composed Midnight Wire logo: network mark + wordmark. */
export function ProductLogo({
  layout = 'stacked',
  markSize = PRODUCT_MARK_SIZES.md,
  markVariant = 'full',
  title = strings.REVEAL_BRAND_TITLE,
  titleVariant = 'displayLarge',
  titleStyle,
  style,
}: ProductLogoProps) {
  const mark = <ProductMark size={markSize} variant={markVariant} />;
  const titleStyles = [
    layout === 'stacked' ? styles.stackedTitle : styles.inlineTitle,
    titleStyle,
  ];

  if (layout === 'inline') {
    return (
      <Row gap={6} align="center" style={style}>
        {mark}
        <Text variant={titleVariant} style={titleStyles}>
          {title}
        </Text>
      </Row>
    );
  }

  return (
    <View style={[styles.stacked, style]}>
      {mark}
      <Text variant={titleVariant} style={titleStyles}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: 'center',
    gap: space[10],
  },
  stackedTitle: {
    textAlign: 'center',
  },
  inlineTitle: {
    flexShrink: 1,
  },
});
