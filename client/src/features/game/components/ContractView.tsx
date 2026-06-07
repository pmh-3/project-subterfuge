import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Player } from '@/types';
import {
  Text,
  Card,
  Rule,
  Stack,
  Row,
  Avatar,
  HoldToConfirm,
  ScreenHeader,
  Button,
  colors,
  space,
  radius,
} from '@/design-system';
import { strings, dynamicStrings } from '@/strings';
import { DEFAULT_MAX_REROLLS } from '@/constants';
import { fontFamily } from '@/design-system/tokens/typography';

interface ContractViewProps {
  player: Player;
  targetAvatarId?: string;
  isPending: boolean;
  onLogKill: () => void;
  onScramble: () => void;
  loading?: boolean;
  maxRerolls?: number;
}

export const ContractView = ({
  player,
  targetAvatarId,
  isPending,
  onLogKill,
  onScramble,
  loading,
  maxRerolls,
}: ContractViewProps) => {
  const effectiveMaxRerolls = maxRerolls ?? DEFAULT_MAX_REROLLS;
  const rerollsLeft = effectiveMaxRerolls - (player.rerollsUsed || 0);
  const showSwap = effectiveMaxRerolls > 0;
  const canShuffle = showSwap && !isPending && rerollsLeft > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title={strings.CONTRACT_HEADER_TITLE} />

      <Card folderTab={strings.CONTRACT_TAB} dossier>
        <Stack gap={7}>
          <View>
            <Text variant="label" muted>
              {strings.CONTRACT_TARGET_IDENTITY}
            </Text>
            <Row gap={5} align="center" style={styles.targetRow}>
              <Avatar avatarId={targetAvatarId} callsign={player.targetCallsign} size={40} />
              <Text variant="displayLarge">
                {player.targetCallsign || strings.CONTRACT_TARGET_UNKNOWN}
              </Text>
            </Row>
          </View>

          <Rule />

          <View>
            <Text variant="label" muted>
              {strings.CONTRACT_DIRECTIVE}
            </Text>
            <Text variant="bodyInput" style={styles.directive}>
              {player.taskDescription}
            </Text>
            {showSwap ? (
              <Stack gap={3} style={styles.swapAction}>
                <Button
                  title={strings.CONTRACT_SWAP_DIRECTIVE}
                  onPress={onScramble}
                  variant="ghost"
                  fullWidth
                  disabled={!canShuffle || loading}
                  loading={loading}
                />
                <Text variant="labelMicro" muted style={styles.swapHint}>
                  {dynamicStrings.objectiveSwapsLeft(rerollsLeft)}
                </Text>
              </Stack>
            ) : null}
          </View>

          <Rule />

          {isPending ? (
            <View style={styles.pendingPanel}>
              <Text variant="metaMicro" muted>
                {strings.CONTRACT_PENDING_CONFIRMATION}
              </Text>
            </View>
          ) : (
            <HoldToConfirm
              onConfirm={onLogKill}
              label={strings.CONTRACT_HOLD_TO_NEUTRALIZE}
              helperText=""
              loading={loading}
              disabled={loading}
            />
          )}
        </Stack>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  targetRow: {
    marginTop: space[3],
  },
  directive: {
    marginTop: space[4],
    fontFamily: fontFamily.sansSemibold,
    fontWeight: '600',
    lineHeight: 28,
  },
  swapAction: {
    marginTop: space[6],
  },
  swapHint: {
    textAlign: 'center',
  },
  pendingPanel: {
    alignItems: 'center',
    paddingVertical: space[8],
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
  },
});
