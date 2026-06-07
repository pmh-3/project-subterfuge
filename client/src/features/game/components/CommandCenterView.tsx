import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Player } from '@/types';
import { sortPlayersByLeaderboard } from '@/features/game/gameLogic';
import {
  Text,
  Stack,
  ScreenHeader,
  AgentRow,
  Card,
  GameCodeTag,
  Button,
  colors,
  space,
} from '@/design-system';
import { strings, dynamicStrings } from '@/strings';

interface CommandCenterViewProps {
  activePlayers: Player[];
  eliminatedPlayers: Player[];
  currentUserId?: string;
  hostId: string;
  winnerId?: string;
  isInfinite?: boolean;
  gameId?: string;
  onCopyGameCode?: () => void;
  onOpenInvite?: () => void;
}

export const CommandCenterView = ({
  activePlayers,
  eliminatedPlayers,
  currentUserId,
  hostId,
  winnerId,
  isInfinite = false,
  gameId,
  onCopyGameCode,
  onOpenInvite,
}: CommandCenterViewProps) => {
  const sortedActive = isInfinite ? sortPlayersByLeaderboard(activePlayers) : activePlayers;
  const rosterTitle =
    isInfinite && winnerId
      ? strings.INTEL_INFINITE_WINNER_SUB
      : isInfinite
        ? strings.INTEL_LEADERBOARD
        : strings.INTEL_ACTIVE_AGENTS;

  const winner =
    activePlayers.find((p) => p.uid === winnerId) ||
    eliminatedPlayers.find((p) => p.uid === winnerId);
  const allPlayers = [...activePlayers, ...eliminatedPlayers];
  const playerMap = new Map(allPlayers.map((p) => [p.uid, p]));
  const isCurrentUserWinner = currentUserId === winnerId;

  const getKillerName = (killerId: string) => {
    if (killerId === 'ADMIN') return strings.INTEL_KILLER_HOST;
    return playerMap.get(killerId)?.callsign || strings.INTEL_KILLER_UNKNOWN;
  };

  const renderKillMetric = (killCount: number) => (
    <Text variant="bodySmall" muted style={styles.metric}>
      {dynamicStrings.eliminationCount(killCount || 0)}
    </Text>
  );

  const renderRoster = (list: Player[], title: string, showEliminatedBy = false) => (
    <Stack gap={4}>
      <Text variant="label" muted style={styles.sectionTitle}>
        {dynamicStrings.rosterSectionTitle(title, list.length)}
      </Text>
      <Stack gap={3}>
        {list.map((player) => (
          <View key={player.uid} style={styles.playerBlock}>
            <AgentRow
              callsign={player.callsign}
              avatarId={player.avatarId}
              isYou={player.uid === currentUserId}
              isHost={player.uid === hostId}
              trailing={renderKillMetric(player.killCount || 0)}
            />
            {showEliminatedBy && player.eliminatedBy ? (
              <Text variant="bodySmall" color={colors.danger} style={styles.killedBy}>
                {dynamicStrings.killedBy(getKillerName(player.eliminatedBy))}
              </Text>
            ) : null}
          </View>
        ))}
      </Stack>
    </Stack>
  );

  return (
    <View style={styles.container}>
      {winner ? (
        <Card style={isCurrentUserWinner ? styles.winnerCard : styles.loserCard}>
          <Stack gap={3} align="center">
            <Text variant="label" accent={isCurrentUserWinner}>
              {isInfinite
                ? strings.INTEL_OPERATION_CONCLUDED
                : isCurrentUserWinner
                  ? strings.INTEL_OPERATION_COMPLETE
                  : strings.INTEL_MISSION_TERMINATED}
            </Text>
            <Text variant="display">{winner.callsign}</Text>
            <Text variant="labelMicro" muted>
              {isInfinite
                ? isCurrentUserWinner
                  ? strings.INTEL_INFINITE_WINNER_SUB
                  : strings.INTEL_INFINITE_LOSER_SUB
                : isCurrentUserWinner
                  ? strings.INTEL_WINNER_SUB
                  : strings.INTEL_LOSER_SUB}
            </Text>
          </Stack>
        </Card>
      ) : null}

      <ScreenHeader
        title={strings.INTEL_HEADER_TITLE}
        trailing={
          gameId && onCopyGameCode ? (
            <GameCodeTag
              code={gameId}
              label={strings.GAME_CODE_LABEL}
              onPress={onCopyGameCode}
            />
          ) : undefined
        }
      />

      <Stack gap={12} style={styles.roster}>
        {renderRoster(sortedActive, rosterTitle)}
        {eliminatedPlayers.length > 0
          ? renderRoster(eliminatedPlayers, strings.INTEL_INACTIVE_AGENTS, true)
          : null}
      </Stack>

      {onOpenInvite ? (
        <View style={styles.actions}>
          <Button
            title={strings.GAME_INVITE_AGENTS}
            onPress={onOpenInvite}
            variant="ghost"
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  winnerCard: {
    marginBottom: space[10],
    borderColor: colors.successBorder,
    backgroundColor: colors.successSurface,
  },
  loserCard: {
    marginBottom: space[10],
    borderColor: colors.border,
  },
  sectionTitle: {
    marginBottom: space[1],
  },
  playerBlock: {
    marginBottom: space[1],
  },
  killedBy: {
    paddingLeft: space[6] + 28 + space[5],
    marginTop: space[3],
    marginBottom: space[4],
  },
  metric: {
    textAlign: 'right',
  },
  roster: {
    marginTop: space[2],
  },
  actions: {
    marginTop: space[10],
    paddingTop: space[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
