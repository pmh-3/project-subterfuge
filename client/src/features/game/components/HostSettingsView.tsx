import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Player } from '@/types';
import { DifficultySetting, TaskPack } from '@/types/taskPack';
import { INFINITE_KILL_GOAL_OPTIONS, DEFAULT_MAX_REROLLS } from '@/constants';
import { sortPlayersByLeaderboard, getDeathCount, PendingRow } from '@/features/game/gameLogic';
import {
  Text,
  Button,
  Stack,
  Row,
  ScreenHeader,
  AgentRow,
  Badge,
  Rule,
  PillSegments,
  IconTarget,
  IconSkull,
  IconShuffle,
  colors,
  space,
  radius,
} from '@/design-system';
import { strings, dynamicStrings } from '@/strings';

const DIFFICULTY_OPTIONS: DifficultySetting[] = ['Mixed', 'Easy', 'Medium', 'Hard'];
const SWAP_BUDGET_OPTIONS = [1, 3, 5, 10];

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
  // D6 — mid-game editable settings (Mission settings section, ACTIVE + infinite only).
  // `maxRerolls` is also read for the roster swaps chip below, so it is passed
  // regardless of mode; only the edit control is gated on `onUpdateMaxRerolls`
  // being provided (i.e. isInfinite).
  maxRerolls?: number;
  onUpdateMaxRerolls?: (n: number) => void;
  difficulty?: DifficultySetting;
  onUpdateDifficulty?: (d: DifficultySetting) => void;
  selectedPacks?: string[];
  availablePacks?: TaskPack[];
  onUpdatePacks?: (ids: string[]) => void;
  // D7 — Pending Confirmations panel.
  pendingRows?: PendingRow[];
  onConfirmPending?: (targetId: string, assassinId: string) => void;
  onDenyPending?: (targetId: string, assassinId: string) => void;
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
  maxRerolls,
  onUpdateMaxRerolls,
  difficulty,
  onUpdateDifficulty,
  selectedPacks,
  availablePacks,
  onUpdatePacks,
  pendingRows,
  onConfirmPending,
  onDenyPending,
}: HostSettingsViewProps) => {
  const router = useRouter();
  const activePlayers = players.filter((p) => p.status === 'ALIVE');
  const standings = isInfinite ? sortPlayersByLeaderboard(activePlayers) : activePlayers;
  // Batch-2 #6b: removed/eliminated players used to vanish from the host roster
  // (only ALIVE was shown), making a force-removed agent look like it disappeared.
  // Surface them in a read-only INACTIVE AGENTS section so the host can still see
  // who was removed.
  const eliminatedPlayers = players.filter((p) => p.status === 'ELIMINATED');

  const togglePack = (packId: string) => {
    if (!onUpdatePacks || !selectedPacks) return;
    const next = selectedPacks.includes(packId)
      ? selectedPacks.filter((id) => id !== packId)
      : [...selectedPacks, packId];
    if (next.length === 0) return; // never allow an empty selection
    onUpdatePacks(next);
  };

  const renderPlayerChips = (player: Player) => {
    const pendingCount = player.pendingEliminations?.length ?? 0;
    const swaps = player.rerollsUsed || 0;
    const swapsBudget = maxRerolls ?? DEFAULT_MAX_REROLLS;

    return (
      <Row gap={5} style={styles.chipsRow}>
        <Badge
          label={player.status}
          variant={
            player.status === 'WINNER' ? 'success' : player.status === 'ELIMINATED' ? 'danger' : 'default'
          }
          style={styles.statusBadge}
        />
        {player.targetCallsign ? (
          <Row gap={1} align="center">
            <Text variant="labelMicro" muted>
              {strings.HOST_CHIP_TARGET_PREFIX}
            </Text>
            <Text variant="labelMicro">{player.targetCallsign}</Text>
          </Row>
        ) : null}
        {isInfinite ? (
          <>
            <Row gap={1} align="center" accessibilityLabel={`${player.killCount || 0} ${strings.INTEL_ELIMINATIONS_MADE}`}>
              <IconTarget size={12} color={colors.inkSecondary} />
              <Text variant="labelMicro">{player.killCount || 0}</Text>
            </Row>
            <Row
              gap={1}
              align="center"
              accessibilityLabel={`${getDeathCount(player, isInfinite)} ${strings.INTEL_TIMES_ELIMINATED}`}
            >
              <IconSkull size={12} color={colors.inkSecondary} />
              <Text variant="labelMicro">{getDeathCount(player, isInfinite)}</Text>
            </Row>
          </>
        ) : null}
        <Row gap={1} align="center" accessibilityLabel={`${swaps} of ${swapsBudget} swaps used`}>
          <IconShuffle size={12} color={colors.inkSecondary} />
          <Text variant="labelMicro">
            {swaps}/{swapsBudget}
          </Text>
        </Row>
        {pendingCount > 0 ? (
          <Row gap={1} align="center">
            <Text variant="labelMicro" muted>
              {strings.HOST_CHIP_PENDING_PREFIX}
            </Text>
            <Text variant="labelMicro" color={colors.danger}>
              {pendingCount}
            </Text>
          </Row>
        ) : null}
      </Row>
    );
  };

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
            {/*
              Batch-2 #3: Pending Confirmations is the most time-sensitive thing a
              host handles mid-game (a claimed catch waiting to be confirmed/denied),
              so it renders FIRST — above Mission Success and Mission Settings —
              during an ACTIVE game. Confirm/deny wiring is unchanged.
            */}
            {isGameActive && pendingRows && pendingRows.length > 0 ? (
              <View style={styles.pendingSection}>
                <Text variant="label" muted style={styles.sectionLabel}>
                  {dynamicStrings.rosterSectionTitle(
                    strings.HOST_PENDING_CONFIRMATIONS_LABEL,
                    pendingRows.length,
                  )}
                </Text>
                <Stack gap={3}>
                  {pendingRows.map((row) => (
                    <View key={`${row.targetId}-${row.assassinId}`} style={styles.pendingRow}>
                      <Text variant="body">
                        {dynamicStrings.pendingRowSummary(row.assassinCallsign, row.targetCallsign)}
                      </Text>
                      {row.taskDescription ? (
                        <Text variant="labelMicro" muted style={styles.pendingSubtitle}>
                          {row.taskDescription}
                        </Text>
                      ) : null}
                      <Row gap={3} style={styles.pendingActions}>
                        <Button
                          title={strings.HOST_PENDING_CONFIRM_BUTTON}
                          onPress={() => onConfirmPending?.(row.targetId, row.assassinId)}
                          variant="primary"
                          size="sm"
                          style={styles.pendingActionButton}
                        />
                        <Button
                          title={strings.HOST_PENDING_DENY_BUTTON}
                          onPress={() => onDenyPending?.(row.targetId, row.assassinId)}
                          variant="ghost"
                          size="sm"
                          style={styles.pendingActionButton}
                        />
                      </Row>
                    </View>
                  ))}
                </Stack>
                <Rule marginVertical={8} />
              </View>
            ) : null}

            {/*
              Batch-2 #7: the kill goal (SCORE TO WIN) is an owner decision that is
              LOBBY-ONLY editable. During an ACTIVE game the host can still SEE the
              goal but not change it — the caller stops passing onUpdateKillGoal
              mid-game, so we render a read-only value with a "locked" hint.
            */}
            {isGameActive && isInfinite && killGoal != null ? (
              <View style={styles.infiniteSection}>
                <Text variant="label" muted style={styles.sectionLabel}>
                  {strings.HOST_MISSION_SUCCESS_LABEL}
                </Text>
                {onUpdateKillGoal ? (
                  <PillSegments
                    value={String(killGoal)}
                    onChange={(v) => onUpdateKillGoal(Number(v))}
                    options={INFINITE_KILL_GOAL_OPTIONS.map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                  />
                ) : (
                  <>
                    <Text variant="displayLarge">{String(killGoal)}</Text>
                    <Text variant="labelMicro" muted style={styles.subLabel}>
                      {strings.HOST_KILL_GOAL_LOCKED_HINT}
                    </Text>
                  </>
                )}
                <Rule marginVertical={8} />
              </View>
            ) : null}

            {/*
              D6: mode switch (classic <-> infinite) and manual roster add/remove/rename
              are intentionally NOT exposed here. Classic and infinite run different code
              paths (Hamiltonian cycle vs. independent targets + pending queues) and
              flipping mode mid-game would leave state in a shape the other mode's
              invariants reject. Roster changes must route through joinGame (add) or
              adminForceEliminate (remove) below — never a raw edit.
            */}
            {isGameActive && isInfinite && maxRerolls != null && onUpdateMaxRerolls ? (
              <View style={styles.infiniteSection}>
                <Text variant="label" muted style={styles.sectionLabel}>
                  {strings.HOST_MISSION_SETTINGS_SECTION}
                </Text>

                <Text variant="labelMicro" muted style={styles.subLabel}>
                  {strings.HOST_SWAPS_BUDGET_LABEL}
                </Text>
                <PillSegments
                  value={String(maxRerolls)}
                  onChange={(v) => onUpdateMaxRerolls(Number(v))}
                  options={SWAP_BUDGET_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                />

                {difficulty && onUpdateDifficulty ? (
                  <>
                    <Text variant="labelMicro" muted style={styles.subLabelSpaced}>
                      {strings.HOST_DIFFICULTY_LABEL}
                    </Text>
                    <PillSegments
                      value={difficulty}
                      onChange={(v) => onUpdateDifficulty(v as DifficultySetting)}
                      options={DIFFICULTY_OPTIONS.map((d) => ({
                        value: d,
                        label: d === 'Medium' ? 'Med' : d,
                      }))}
                    />
                  </>
                ) : null}

                {availablePacks && availablePacks.length > 0 && selectedPacks && onUpdatePacks ? (
                  <>
                    <Text variant="labelMicro" muted style={styles.subLabelSpaced}>
                      {strings.HOST_TASK_PACKS_LABEL}
                    </Text>
                    <Row gap={2} style={styles.packChipRow}>
                      {availablePacks.map((pack) => {
                        const selected = selectedPacks.includes(pack.id);
                        return (
                          <Pressable
                            key={pack.id}
                            onPress={() => togglePack(pack.id)}
                            style={[styles.packChip, selected && styles.packChipSelected]}
                          >
                            <Text
                              variant="labelMicro"
                              color={selected ? colors.background : colors.inkMuted}
                            >
                              {pack.displayName}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </Row>
                  </>
                ) : null}

                <Text variant="labelMicro" muted style={styles.futureOnlyHint}>
                  {strings.HOST_FUTURE_MISSIONS_ONLY_HINT}
                </Text>
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
                  <View style={styles.rowTop}>
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
                  {isGameActive ? renderPlayerChips(player) : null}
                </View>
              ))}
            </Stack>

            {activePlayers.length === 0 ? (
              <Text variant="bodySmall" muted style={styles.empty}>
                {strings.HOST_NO_ACTIVE_AGENTS}
              </Text>
            ) : null}

            {/* Batch-2 #6b: read-only roster of removed/eliminated agents. */}
            {isGameActive && eliminatedPlayers.length > 0 ? (
              <View style={styles.inactiveSection}>
                <Rule marginVertical={8} />
                <Text variant="label" muted style={styles.sectionLabel}>
                  {dynamicStrings.rosterSectionTitle(
                    strings.INTEL_INACTIVE_AGENTS,
                    eliminatedPlayers.length,
                  )}
                </Text>
                <Stack gap={3}>
                  {eliminatedPlayers.map((player) => (
                    <View key={player.uid} style={styles.row}>
                      <View style={styles.rowTop}>
                        <AgentRow
                          callsign={player.callsign}
                          avatarId={player.avatarId}
                          isHost={player.uid === hostId}
                          style={styles.agentInfo}
                        />
                        <Badge label={player.status} variant="danger" style={styles.statusBadge} />
                      </View>
                    </View>
                  ))}
                </Stack>
              </View>
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
  subLabel: {
    marginBottom: space[3],
  },
  subLabelSpaced: {
    marginTop: space[6],
    marginBottom: space[3],
  },
  futureOnlyHint: {
    marginTop: space[6],
    lineHeight: 18,
  },
  packChipRow: {
    flexWrap: 'wrap',
  },
  packChip: {
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginBottom: space[2],
  },
  packChipSelected: {
    backgroundColor: colors.inkPrimary,
    borderColor: colors.inkPrimary,
  },
  pendingSection: {
    marginBottom: space[6],
  },
  pendingRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: space[5],
  },
  pendingSubtitle: {
    marginTop: space[2],
  },
  pendingActions: {
    marginTop: space[4],
  },
  pendingActionButton: {
    flex: 1,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: space[3],
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: space[1],
  },
  chipsRow: {
    flexWrap: 'wrap',
    paddingLeft: space[6],
    paddingTop: space[2],
  },
  statusBadge: {
    marginLeft: 0,
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
  inactiveSection: {
    marginTop: space[8],
  },
});
