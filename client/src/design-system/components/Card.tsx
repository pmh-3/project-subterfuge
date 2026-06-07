import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export interface CardProps extends ViewProps {
  active?: boolean;
  folderTab?: string;
  dossier?: boolean;
  dossierStamp?: string;
}

export function Card({
  active,
  folderTab,
  dossier,
  dossierStamp,
  style,
  children,
  ...rest
}: CardProps) {
  if (folderTab) {
    return (
      <View style={styles.folderWrapper}>
        <View style={[styles.folderTab, dossier && styles.dossierTab]}>
          <Text variant="labelMicro" muted>
            {folderTab}
          </Text>
        </View>
        <View
          style={[
            styles.card,
            styles.folderCard,
            dossier && styles.dossierCard,
            active && styles.active,
            style,
          ]}
          {...rest}
        >
          {dossierStamp ? (
            <Text variant="labelMicro" muted style={styles.dossierStamp}>
              {dossierStamp}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, active && styles.active, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  folderWrapper: {
    alignSelf: 'stretch',
  },
  folderTab: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingVertical: space[2],
    paddingHorizontal: space[7],
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingTop: space[9],
    paddingHorizontal: space[8],
    paddingBottom: space[8],
  },
  folderCard: {
    borderTopLeftRadius: 0,
  },
  dossierTab: {
    borderColor: colors.borderStrong,
    paddingHorizontal: space[8],
  },
  dossierCard: {
    borderColor: colors.borderStrong,
    paddingTop: space[10],
  },
  dossierStamp: {
    position: 'absolute',
    top: space[6],
    right: space[7],
    opacity: 0.55,
  },
  active: {
    borderColor: colors.borderStrong,
  },
});
