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
  ScreenHeader,
  Button,
  IconShuffle,
  colors,
  space,
  radius,
} from '@/design-system';
import { strings, dynamicStrings } from '@/strings';
import { DEFAULT_MAX_REROLLS } from '@/constants';

interface ContractViewProps {
  player: Player;
  targetAvatarId?: string;
  isPending: boolean;
  onLogKill: () => void;
  onSwap: () => void;
  onSwapTarget?: () => void;
  isInfinite?: boolean;
  /** Count of currently-alive agents; used to disable target swap when it can't change anything (<3). */
  aliveCount?: number;
  loading?: boolean;
  maxRerolls?: number;
}

export const ContractView = ({
  player,
  targetAvatarId,
  isPending,
  onLogKill,
  onSwap,
  onSwapTarget,
  isInfinite,
  aliveCount,
  loading,
  maxRerolls,
}: ContractViewProps) => {
  const effectiveMaxRerolls = maxRerolls ?? DEFAULT_MAX_REROLLS;
  const rerollsLeft = effectiveMaxRerolls - (player.rerollsUsed || 0);
  const budgetEnabled = effectiveMaxRerolls > 0;
  const canSwap = budgetEnabled && !isPending && rerollsLeft > 0 && !loading;
  const targetSwapPossible = aliveCount === undefined || aliveCount >= 3;
  const canSwapTarget = canSwap && !!isInfinite && !!onSwapTarget && targetSwapPossible;
  const swapIcon = <IconShuffle size={14} color={colors.inkPrimary} />;

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
            <Text variant="directive" style={styles.directive}>
              {player.taskDescription}
            </Text>
            {budgetEnabled ? (
              <Stack gap={3} style={styles.swapAction}>
                <Button
                  title={strings.CONTRACT_SWAP_MISSION}
                  onPress={onSwap}
                  variant="ghost"
                  fullWidth
                  leftIcon={swapIcon}
                  disabled={!canSwap}
                  loading={loading}
                />
                {isInfinite && onSwapTarget ? (
                  <Button
                    title={strings.CONTRACT_SWAP_TARGET}
                    onPress={onSwapTarget}
                    variant="ghost"
                    fullWidth
                    leftIcon={swapIcon}
                    disabled={!canSwapTarget}
                    loading={loading}
                  />
                ) : null}
                <Text variant="labelMicro" muted style={styles.swapHint}>
                  {rerollsLeft > 0
                    ? dynamicStrings.swapsLeftThisGame(rerollsLeft)
                    : strings.NO_MORE_SWAPS}
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
            <Button
              title={strings.CONTRACT_NEUTRALIZE_TARGET}
              onPress={onLogKill}
              variant="danger"
              fullWidth
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
