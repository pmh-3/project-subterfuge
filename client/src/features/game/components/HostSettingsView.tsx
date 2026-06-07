import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Player } from '@/types';
import { INFINITE_KILL_GOAL_OPTIONS } from '@/constants';
import { sortPlayersByLeaderboard } from '@/features/game/gameLogic';
import {
  Text,
  Button,
  Stack,
  ScreenHeader,
  AgentRow,
  Rule,
  PillSegments,
  colors,
  space,
} from '@/design-system';
import { strings, dynamicStrings } from '@/strings';

interface HostSettingsViewProps {
  players: Player[];
  hostId: string;
  onForceEliminate: (targetId: string) => void;
  onEndGame?: () => void;
  loading?: boolean;
  endGameLoading?: boolean;
  isGameActive?: boolean;
  isLobby?: boolean;
  gameId?: string;
  onExit?: () => void;
  isInfinite?: boolean;
  killGoal?: number;
  onUpdateKillGoal?: (goal: number) => void;
}

export const HostSettingsView = ({
  players,
  hostId,
  onForceEliminate,
  onEndGame,
  loading,
  endGameLoading,
  isGameActive = false,
  isLobby = false,
  gameId,
  onExit,
  isInfinite = false,
  killGoal,
  onUpdateKillGoal,
}: HostSettingsViewProps) => {
  const router = useRouter();
  const activePlayers = players.filter(
    (p) => p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION',
  );
  const standings = isInfinite ? sortPlayersByLeaderboard(activePlayers) : activePlayers;

  return (
    <View style={styles.container}>
      <ScreenHeader title={strings.HOST_ADMIN_TITLE} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {isLobby && gameId ? (
          <View style={styles.setupSection}>
            <Button
              title={strings.GAME_CUSTOMIZE_GAME}
              onPress={() => router.push(`/game/configure?id=${gameId}`)}
              variant="ghost"
              fullWidth
            />
            <Rule marginVertical={8} />
          </View>
        ) : null}

        {isLobby || isGameActive ? (
          <>
            {isGameActive && isInfinite && killGoal != null && onUpdateKillGoal ? (
              <View style={styles.infiniteSection}>
                <Text variant="label" muted style={styles.sectionLabel}>
                  {strings.HOST_MISSION_SUCCESS_LABEL}
                </Text>
                <PillSegments
                  value={String(killGoal)}
                  onChange={(v) => onUpdateKillGoal(Number(v))}
                  options={INFINITE_KILL_GOAL_OPTIONS.map((n) => ({
                    value: String(n),
                    label: String(n),
                  }))}
                />
                <Rule marginVertical={8} />
              </View>
            ) : null}

            <Text variant="label" muted style={styles.sectionLabel}>
              {isGameActive && isInfinite
                ? strings.INTEL_LEADERBOARD
                : dynamicStrings.activeAgentsCount(activePlayers.length)}
            </Text>

            <Stack gap={3}>
              {(isGameActive && isInfinite ? standings : activePlayers).map((player) => (
                <View key={player.uid} style={isGameActive ? styles.row : styles.lobbyRow}>
                  <AgentRow
                    callsign={player.callsign}
                    avatarId={player.avatarId}
                    isHost={player.uid === hostId}
                    subtitle={
                      isGameActive && player.emergencyPin
                        ? dynamicStrings.agentKeySubtitle(player.emergencyPin)
                        : undefined
                    }
                    style={styles.agentInfo}
                    trailing={
                      isGameActive && isInfinite ? (
                        <Text variant="codeMedium">{String(player.killCount || 0)}</Text>
                      ) : undefined
                    }
                  />
                  {isGameActive ? (
                    <Button
                      title={strings.HOST_ELIMINATE}
                      onPress={() => onForceEliminate(player.uid)}
                      variant="danger"
                      size="sm"
                      loading={loading}
                    />
                  ) : null}
                </View>
              ))}
            </Stack>

            {activePlayers.length === 0 ? (
              <Text variant="bodySmall" muted style={styles.empty}>
                {strings.HOST_NO_ACTIVE_AGENTS}
              </Text>
            ) : null}

            {isGameActive && onEndGame ? (
              <View style={styles.endSection}>
                <Rule marginVertical={8} />
                <Button
                  title={strings.HOST_END_OPERATION}
                  onPress={onEndGame}
                  variant="danger"
                  loading={endGameLoading}
                  fullWidth
                />
              </View>
            ) : null}
          </>
        ) : null}

        {onExit ? (
          <View style={styles.exitSection}>
            <Button title={strings.GAME_LEAVE} onPress={onExit} variant="ghost" size="sm" fullWidth />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    paddingBottom: space[14],
  },
  setupSection: {
    marginBottom: space[6],
  },
  sectionLabel: {
    marginBottom: space[5],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingRight: space[4],
  },
  lobbyRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
  },
  agentInfo: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  empty: {
    textAlign: 'center',
    marginTop: space[10],
  },
  endSection: {
    marginTop: space[8],
  },
  exitSection: {
    marginTop: space[10],
  },
  infiniteSection: {
    marginBottom: space[6],
  },
});
