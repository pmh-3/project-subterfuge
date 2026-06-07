import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { space } from '@/design-system/tokens/spacing';
import { Avatar } from '@/design-system/components/Avatar';
import { Badge } from '@/design-system/components/Badge';
import { Text } from '@/design-system/components/Text';
import { Row } from '@/design-system/components/Row';

export interface AgentRowProps {
  callsign: string;
  avatarId?: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  isYou?: boolean;
  isHost?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AgentRow({
  callsign,
  avatarId,
  subtitle,
  trailing,
  isYou,
  isHost,
  style,
}: AgentRowProps) {
  return (
    <View style={[styles.row, isYou && styles.rowYou, style]}>
      <Row gap={5} style={styles.left}>
        <Avatar avatarId={avatarId} callsign={callsign} size={28} selected={isYou} />
        <View style={styles.nameBlock}>
          <Row gap={0} align="center">
            <Text variant="body" color={colors.inkPrimary}>
              {callsign}
            </Text>
            {isHost ? <Badge label="HOST" variant="host" /> : null}
          </Row>
          {subtitle ? (
            <Text variant="labelMicro" muted>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Row>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[5],
    paddingHorizontal: space[6],
    gap: space[5],
  },
  rowYou: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.sm,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  left: {
    flex: 1,
  },
  nameBlock: {
    flex: 1,
  },
  trailing: {
    alignItems: 'flex-end',
  },
});
