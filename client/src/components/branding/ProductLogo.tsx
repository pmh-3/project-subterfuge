import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Text, Row, space } from '@/design-system';
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
  style?: StyleProp<ViewStyle>;
}

/** Composed Midnight Wire logo: network mark + wordmark. */
export function ProductLogo({
  layout = 'stacked',
  markSize = PRODUCT_MARK_SIZES.md,
  markVariant = 'full',
  title = strings.REVEAL_BRAND_TITLE,
  style,
}: ProductLogoProps) {
  const mark = <ProductMark size={markSize} variant={markVariant} />;

  if (layout === 'inline') {
    return (
      <Row gap={6} align="center" style={style}>
        {mark}
        <Text variant="displayLarge" style={styles.inlineTitle}>
          {title}
        </Text>
      </Row>
    );
  }

  return (
    <View style={[styles.stacked, style]}>
      {mark}
      <Text variant="displayLarge" style={styles.stackedTitle}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: 'center',
    gap: space[6],
  },
  stackedTitle: {
    textAlign: 'center',
  },
  inlineTitle: {
    flexShrink: 1,
  },
});
