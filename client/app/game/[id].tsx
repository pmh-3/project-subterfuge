import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Share, Platform, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/AuthContext';
import { useGame } from '@/features/game/useGame';
import {
  startGame,
  challengeTarget,
  confirmElimination,
  denyElimination,
  scrambleTask,
  swapTarget,
  adminForceEliminate,
  endGame,
} from '@/features/game/gameService';
import { fetchTaskPacks } from '@/features/tasks/taskService';
import { TaskPack, DifficultySetting } from '@/types/taskPack';
import {
  Text,
  Button,
  Stack,
  NavBar,
  Sheet,
  Banner,
  colors,
  space,
} from '@/design-system';
import { ContractView } from '@/features/game/components/ContractView';
import { CommandCenterView } from '@/features/game/components/CommandCenterView';
import { GameLobbyView } from '@/features/game/components/GameLobbyView';
import { HostSettingsView } from '@/features/game/components/HostSettingsView';
import { BriefingView } from '@/features/game/components/BriefingView';
import { InviteAgentsSheet } from '@/features/game/components/InviteAgentsSheet';
import { VictoryOverlay } from '@/features/game/components/VictoryOverlay';
import { useAlert } from '@/hooks/useAlert';
import { useLayout } from '@/hooks/useLayout';
import { APP_URL, PULSE_DURATION, SPECTATOR_CHECK_DELAY } from '@/constants';
import { isInfiniteMode, getKillGoal, buildPendingRows, hasCallerClaimOnTarget } from '@/features/game/gameLogic';
import { storage } from '@/utils/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ProductMark, PRODUCT_MARK_SIZES } from '@/components/branding';
import { strings, dynamicStrings, useGameErrors, serviceErrors } from '@/strings';

type TabKey = 'CONTRACT' | 'SITUATION' | 'ADMIN' | 'INFO';

export default function GameRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { game, players, loading, error, retry } = useGame(id!);
  const { showAlert, AlertComponent } = useAlert();
  const { contentStyle } = useLayout();
  const router = useRouter();

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const [startLoading, setStartLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [denyLoading, setDenyLoading] = useState(false);
  const [endGameLoading, setEndGameLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('SITUATION');
  const [hostTargetId, setHostTargetId] = useState<string | null>(null);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [showForceEliminate, setShowForceEliminate] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [taskPacks, setTaskPacks] = useState<TaskPack[]>([]);
  const [showCoach, setShowCoach] = useState(false);

  const handleStart = useCallback(async () => {
    try {
      setStartLoading(true);
      await startGame(id!);
    } catch (e) {
      showAlert({
        title: strings.ALERT_OPERATION_FAILED_TITLE,
        message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
      });
    } finally {
      setStartLoading(false);
    }
  }, [id, showAlert]);

  const lastStatus = useRef<string | undefined>(undefined);
  const didInitialTabSet = useRef(false);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: PULSE_DURATION, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.6, duration: PULSE_DURATION, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading, pulseAnim]);

  const me = players.find((p) => p.uid === user?.uid);
  const isDead = me?.status === 'ELIMINATED';
  const isLobby = game?.status === 'LOBBY';
  const isCompleted = game?.status === 'COMPLETED';
  const isHost = user?.uid === game?.hostId;
  const isSpectator = !me && user?.uid !== undefined && !loading;
  const isHostSpectator = isSpectator && isHost;

  const [spectatorCheckComplete, setSpectatorCheckComplete] = useState(false);

  useEffect(() => {
    if (!loading && !spectatorCheckComplete) {
      const timeout = setTimeout(() => setSpectatorCheckComplete(true), SPECTATOR_CHECK_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [loading, spectatorCheckComplete]);

  useEffect(() => {
    if (spectatorCheckComplete && isSpectator && isLobby && !isHost) {
      router.replace(`/game/lobby?code=${id}`);
    }
  }, [spectatorCheckComplete, isSpectator, isLobby, isHost, id, router]);

  useEffect(() => {
    if (isSpectator && activeTab !== 'SITUATION' && activeTab !== 'ADMIN' && activeTab !== 'INFO') {
      setActiveTab('SITUATION');
    }
    if (isSpectator && !isHost && activeTab === 'ADMIN') {
      setActiveTab('SITUATION');
    } else if ((isLobby || isDead || isCompleted) && activeTab === 'CONTRACT') {
      setActiveTab('SITUATION');
    }
  }, [isLobby, isDead, isCompleted, activeTab, isSpectator, isHost]);

  useEffect(() => {
    if (!game) return;

    if (lastStatus.current === 'LOBBY' && game.status === 'ACTIVE') {
      setActiveTab('CONTRACT');
    }

    if (lastStatus.current === 'ACTIVE' && game.status === 'COMPLETED') {
      const isInfinite = isInfiniteMode(game);
      if (isInfinite || game.winnerId === user?.uid) {
        setShowVictoryOverlay(true);
      } else {
        setActiveTab('SITUATION');
      }
    }

    lastStatus.current = game.status;
  }, [game?.status, game, user?.uid]);

  // Batch-2 #1: a hard refresh into an already-ACTIVE game never crosses the
  // LOBBY→ACTIVE transition above, so it would otherwise stay on SITUATION. Run
  // once, after loading completes: if the game is ACTIVE and the viewer is an
  // alive participant, land them on their Mission (CONTRACT) tab. Dead/spectator/
  // completed viewers can't see the Contract tab, so they are left on SITUATION.
  useEffect(() => {
    if (loading || didInitialTabSet.current || !game) return;
    didInitialTabSet.current = true;
    if (
      game.status === 'ACTIVE' &&
      me &&
      !isDead &&
      !isSpectator &&
      !isCompleted
    ) {
      setActiveTab('CONTRACT');
    }
  }, [loading, game, me, isDead, isSpectator, isCompleted]);

  const isInfinite = game ? isInfiniteMode(game) : false;

  // D6: task packs for the Host tab's mid-game "Mission settings" section
  // (packs multi-select). Only needed for the host, and only in infinite.
  useEffect(() => {
    if (!isHost || !isInfinite) return;
    let cancelled = false;
    fetchTaskPacks()
      .then((packs) => {
        if (!cancelled) setTaskPacks(packs);
      })
      .catch(() => {
        // Non-fatal: the packs sub-section simply stays empty.
      });
    return () => {
      cancelled = true;
    };
  }, [isHost, isInfinite]);

  const alivePlayers = players.filter(
    (p) => p.status === 'ALIVE' || p.status === 'WINNER',
  );
  const deadPlayers = players.filter((p) => p.status === 'ELIMINATED');
  // Batch-2 #2: swap-target eligibility must match the service guard, which
  // counts only ALIVE agents (WINNER/PENDING are not valid swap targets). Pass
  // this stricter count to ContractView so the button's enabled state and the
  // service's <3-agent no-op guard agree.
  const strictlyAliveCount = players.filter((p) => p.status === 'ALIVE').length;

  const executeChallenge = async () => {
    try {
      setActionLoading(true);
      await challengeTarget(id!, me!.targetId!, user!.uid);
    } catch (e) {
      if (__DEV__) console.error(e);
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_LOG });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeath = async () => {
    try {
      setConfirmLoading(true);
      await confirmElimination(id!, user!.uid);
    } catch {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_CONFIRM });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDenyDeath = async () => {
    try {
      setDenyLoading(true);
      await denyElimination(id!, user!.uid);
    } catch {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_DISPUTE });
    } finally {
      setDenyLoading(false);
    }
  };

  const executeSwap = async () => {
    try {
      setActionLoading(true);
      await scrambleTask(id!, user!.uid);
    } catch {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_REASSIGN });
    } finally {
      setActionLoading(false);
    }
  };

  const executeSwapTarget = async () => {
    try {
      setActionLoading(true);
      await swapTarget(id!, user!.uid);
    } catch {
      showAlert({
        title: strings.ALERT_OPERATION_FAILED_TITLE,
        message: strings.GAME_ALERT_FAILED_SWAP_TARGET,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const executeForceEliminate = async () => {
    if (!hostTargetId) return;
    try {
      setActionLoading(true);
      await adminForceEliminate(id!, hostTargetId);
      setShowForceEliminate(false);
      setHostTargetId(null);
    } catch (e) {
      showAlert({
        title: strings.ALERT_OPERATION_FAILED_TITLE,
        message: dynamicStrings.operationFailedWithMessage(
          e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        ),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndGame = async () => {
    try {
      setEndGameLoading(true);
      await endGame(id!);
    } catch (e) {
      showAlert({
        title: strings.ALERT_OPERATION_FAILED_TITLE,
        message: dynamicStrings.endOperationFailed(
          e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        ),
      });
    } finally {
      setEndGameLoading(false);
    }
  };

  const inviteUrl = useMemo(() => `${APP_URL}/game/lobby?code=${id}`, [id]);

  const showTransientBanner = useCallback((message: string) => {
    setBannerMessage(message);
    setTimeout(() => setBannerMessage(null), 3000);
  }, []);

  useEffect(() => {
    if (!game || !me || !id) return;
    const checkMidJoinBanner = async () => {
      if (!isInfinite || game.status !== 'ACTIVE') return;
      // Only genuine mid-game joiners carry this flag (set in joinGame's ACTIVE
      // branch). Original lobby players — including the host — never do, so the
      // banner can't false-fire just because setup took longer than a minute.
      if (!me.joinedMidGame) return;
      const key = `mid_join_banner_${id}`;
      const shown = await storage.get(key);
      if (shown) return;
      showTransientBanner(strings.GAME_JOINED_MID_OPERATION);
      await storage.save(key, '1');
    };
    void checkMidJoinBanner();
  }, [game, me, id, isInfinite, showTransientBanner]);

  // First-run coach card (D9, #9): a one-time, global (not per-game) summary
  // of the core loop, shown the first time a player lands on the Contract
  // tab. Mirrors the mid-join-banner storage-gating pattern above.
  useEffect(() => {
    const checkCoachSeen = async () => {
      const seen = await storage.get('coach_contract_seen');
      if (!seen) setShowCoach(true);
    };
    void checkCoachSeen();
  }, []);

  const handleDismissCoach = useCallback(() => {
    setShowCoach(false);
    void storage.save('coach_contract_seen', '1');
  }, []);

  const copyText = useCallback(
    async (text: string, confirmation: string) => {
      try {
        if (Platform.OS === 'web') {
          await navigator.clipboard.writeText(text);
        } else {
          await Clipboard.setStringAsync(text);
        }
        showTransientBanner(confirmation);
      } catch {
        // Ignore clipboard errors
      }
    },
    [showTransientBanner],
  );

  const handleCopyInviteLink = useCallback(() => {
    void copyText(inviteUrl, strings.GAME_LINK_COPIED_MESSAGE);
  }, [copyText, inviteUrl]);

  const handleCopyGameCode = useCallback(() => {
    if (!id) return;
    void copyText(id, strings.GAME_CODE_COPIED);
  }, [copyText, id]);

  const handleShareInvite = async () => {
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({ url: inviteUrl });
      } else {
        await Share.share({ message: inviteUrl });
      }
    } catch {
      // Ignore share errors
    }
  };

  const handleLeaveGame = useCallback(() => {
    router.replace('/game/lobby');
  }, [router]);

  const handleUpdateKillGoal = useCallback(
    async (goal: number) => {
      if (!id) return;
      try {
        await updateDoc(doc(db, 'games', id), {
          infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: goal } },
        });
      } catch (e) {
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  // D6: mid-game editable settings, thin updateDoc handlers (Mission settings
  // section, Host tab). Difficulty/packs only affect the *next* task drawn —
  // existing assignments are untouched (resolveAvailableTasks reads these at
  // call time, gameService.ts).
  const handleUpdateMaxRerolls = useCallback(
    async (n: number) => {
      if (!id) return;
      try {
        await updateDoc(doc(db, 'games', id), { maxRerolls: n });
      } catch (e) {
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  const handleUpdateDifficulty = useCallback(
    async (d: DifficultySetting) => {
      if (!id) return;
      try {
        await updateDoc(doc(db, 'games', id), { difficultySetting: d });
      } catch (e) {
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  const handleUpdatePacks = useCallback(
    async (ids: string[]) => {
      if (!id || ids.length === 0) return; // never allow an empty selection
      try {
        await updateDoc(doc(db, 'games', id), { selectedPacks: ids });
      } catch (e) {
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  // D7: host panel resolves a SPECIFIC queued entry (assassinId provided). The
  // NO_PENDING_ELIMINATION race (victim resolved it from their own screen at the
  // same moment) is benign — the desired outcome already happened — so it is
  // swallowed silently; the live players snapshot removes the row on its own.
  const handleConfirmPending = useCallback(
    async (targetId: string, assassinId: string) => {
      try {
        await confirmElimination(id!, targetId, assassinId);
      } catch (e) {
        if (e instanceof Error && e.message === serviceErrors.NO_PENDING_ELIMINATION) return;
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  const handleDenyPending = useCallback(
    async (targetId: string, assassinId: string) => {
      try {
        await denyElimination(id!, targetId, assassinId);
      } catch (e) {
        if (e instanceof Error && e.message === serviceErrors.NO_PENDING_ELIMINATION) return;
        showAlert({
          title: strings.ALERT_OPERATION_FAILED_TITLE,
          message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR,
        });
      }
    },
    [id, showAlert],
  );

  const pendingRows = useMemo(() => buildPendingRows(players), [players]);

  const navTabs = useMemo(() => {
    const tabs: { key: TabKey; label: string }[] = [];
    if (!isDead && !isSpectator && !isLobby) {
      tabs.push({ key: 'CONTRACT', label: strings.GAME_TAB_CONTRACT });
    }
    tabs.push({
      key: 'SITUATION',
      label: isLobby ? strings.GAME_TAB_LOBBY : strings.GAME_TAB_LEADERBOARD,
    });
    if (isHost) {
      tabs.push({ key: 'ADMIN', label: strings.GAME_TAB_ADMIN });
    }
    tabs.push({ key: 'INFO', label: strings.GAME_TAB_INFO });
    return tabs;
  }, [isDead, isSpectator, isLobby, isHost]);

  const showNavBar = (!isSpectator && !isDead && !isCompleted) || isHost;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, contentStyle]}>
        <Animated.View style={[styles.loadingSeal, { opacity: pulseAnim }]}>
          <ProductMark size={PRODUCT_MARK_SIZES.lg} />
        </Animated.View>
      </View>
    );
  }

  if (error || !game) {
    const isNotFound = error === useGameErrors.OPERATION_NOT_FOUND;
    const isConnectionError = error === useGameErrors.CONNECTION_FAILED;

    return (
      <View style={[styles.container, styles.centered, contentStyle]}>
        <Text variant="title" color={colors.danger}>
          {isNotFound ? strings.GAME_NOT_FOUND : error || strings.GAME_OPERATION_COMPROMISED}
        </Text>
        {isNotFound ? (
          <Button
            title={strings.GAME_TRY_DIFFERENT_CODE}
            onPress={() => router.replace('/game/lobby?mode=join-code')}
            style={styles.errorButton}
            fullWidth
          />
        ) : isConnectionError ? (
          <Button
            title={strings.GAME_RETRY_CONNECTION}
            onPress={retry}
            style={styles.errorButton}
            fullWidth
          />
        ) : (
          <Button
            title={strings.GAME_RETURN_TO_BASE}
            onPress={() => router.replace('/game/lobby?mode=join-code')}
            style={styles.errorButton}
            fullWidth
          />
        )}
      </View>
    );
  }

  const pendingQueue = me?.pendingEliminations ?? [];
  const headClaim = pendingQueue[0];

  if (headClaim && !isCompleted) {
    return (
      <SafeAreaView style={[styles.container, styles.alertContainer]}>
        <Stack gap={8} align="center" style={styles.alertContent}>
          <Text variant="display" color={colors.danger}>
            {strings.GAME_ALERT_COMPROMISED}
          </Text>
          {pendingQueue.length > 1 ? (
            <Text variant="bodySmall" muted style={styles.alertObjective}>
              {dynamicStrings.multiClaimVictim(pendingQueue.length)}
            </Text>
          ) : null}
          {headClaim.taskDescription ? (
            <Text variant="body" style={styles.alertObjective}>
              {dynamicStrings.theirObjectiveWas(headClaim.taskDescription)}
            </Text>
          ) : null}
          <Button
            title={strings.GAME_CONFIRM_ELIMINATION}
            onPress={handleConfirmDeath}
            variant="danger"
            loading={confirmLoading}
            disabled={denyLoading}
            fullWidth
          />
          <Button
            title={strings.GAME_DENY_ELIMINATION}
            onPress={handleDenyDeath}
            variant="ghost"
            loading={denyLoading}
            disabled={confirmLoading}
            fullWidth
          />
        </Stack>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  const hostTargetPlayer = players.find((p) => p.uid === hostTargetId);

  const renderTabContent = () => {
    if (activeTab === 'INFO') {
      return (
        <BriefingView
          showPageHeader
          onLeave={!isHost && !isSpectator && !isCompleted ? handleLeaveGame : undefined}
        />
      );
    }

    if (activeTab === 'ADMIN' && isHost) {
      return (
        <HostSettingsView
          players={players}
          hostId={game.hostId}
          onForceEliminate={(targetId) => {
            setHostTargetId(targetId);
            setShowForceEliminate(true);
          }}
          onEndGame={handleEndGame}
          loading={actionLoading}
          endGameLoading={endGameLoading}
          isGameActive={game.status === 'ACTIVE'}
          isLobby={isLobby}
          gameId={game.id}
          onExit={handleLeaveGame}
          isInfinite={isInfinite}
          killGoal={isInfinite ? getKillGoal(game) : undefined}
          // Batch-2 #7: the kill goal is LOBBY-ONLY editable. Mid-game the host
          // sees it read-only, so we stop passing the update handler once ACTIVE.
          onUpdateKillGoal={isInfinite && isLobby ? handleUpdateKillGoal : undefined}
          maxRerolls={game.maxRerolls}
          onUpdateMaxRerolls={isInfinite ? handleUpdateMaxRerolls : undefined}
          difficulty={game.difficultySetting}
          onUpdateDifficulty={isInfinite ? handleUpdateDifficulty : undefined}
          selectedPacks={game.selectedPacks}
          availablePacks={isInfinite ? taskPacks : undefined}
          onUpdatePacks={isInfinite ? handleUpdatePacks : undefined}
          pendingRows={pendingRows}
          onConfirmPending={handleConfirmPending}
          onDenyPending={handleDenyPending}
        />
      );
    }

    if (activeTab === 'CONTRACT' && me && !isCompleted) {
      const targetPlayer = players.find((p) => p.uid === me.targetId);
      return (
        <ContractView
          player={me}
          targetAvatarId={targetPlayer?.avatarId}
          isPending={hasCallerClaimOnTarget(targetPlayer, user?.uid)}
          onLogKill={executeChallenge}
          onSwap={executeSwap}
          onSwapTarget={executeSwapTarget}
          isInfinite={isInfinite}
          aliveCount={strictlyAliveCount}
          loading={actionLoading}
          maxRerolls={game.maxRerolls}
          showCoach={showCoach}
          onDismissCoach={handleDismissCoach}
        />
      );
    }

    if (isLobby) {
      return (
        <GameLobbyView
          gameId={game.id}
          activePlayers={alivePlayers}
          currentUserId={user?.uid}
          hostId={game.hostId}
          isHost={isHost && !isSpectator}
          onCopyGameCode={handleCopyGameCode}
          onOpenInvite={() => setShowInviteSheet(true)}
          onStart={handleStart}
          startLoading={startLoading}
        />
      );
    }

    return (
      <CommandCenterView
        activePlayers={alivePlayers}
        eliminatedPlayers={deadPlayers}
        currentUserId={user?.uid}
        hostId={game.hostId}
        winnerId={game.winnerId}
        isInfinite={isInfinite}
        onOpenInvite={() => setShowInviteSheet(true)}
      />
    );
  };

  const renderScrollFooter = () => {
    if (activeTab !== 'SITUATION' || isLobby) return null;

    if (!isSpectator && (isDead || isCompleted)) {
      return (
        <Stack gap={5} style={styles.scrollFooter}>
          <Button title={strings.GAME_PLAY_AGAIN} onPress={() => router.replace('/game/lobby')} fullWidth />
        </Stack>
      );
    }

    if (isSpectator) {
      return (
        <Stack gap={5} style={styles.scrollFooter}>
          <Button title={strings.GAME_EXIT} onPress={() => router.replace('/game/lobby')} variant="ghost" fullWidth />
        </Stack>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.body}>
        {bannerMessage ? (
          <Banner message={bannerMessage} style={[styles.banner, contentStyle]} onDismiss={() => setBannerMessage(null)} />
        ) : null}

        {isSpectator ? (
          <View style={[styles.spectatorBanner, contentStyle]}>
            <Text variant="label">{strings.GAME_SPECTATOR_MODE}</Text>
            <Text variant="labelMicro" muted>
              {isHostSpectator ? strings.GAME_SPECTATOR_HOST : strings.GAME_SPECTATOR_READONLY}
            </Text>
          </View>
        ) : null}

        <View style={styles.contentArea}>
          <ScrollView contentContainerStyle={[styles.scrollContent, contentStyle]} style={styles.scroll}>
            {renderTabContent()}
            {renderScrollFooter()}
          </ScrollView>
        </View>

        {showNavBar ? (
          <NavBar tabs={navTabs} activeKey={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />
        ) : null}
      </View>

      <InviteAgentsSheet
        open={showInviteSheet}
        onClose={() => setShowInviteSheet(false)}
        gameCode={game.id}
        inviteUrl={inviteUrl}
        onCopyLink={handleCopyInviteLink}
        onCopyCode={handleCopyGameCode}
        onShare={handleShareInvite}
      />

      <Sheet open={showForceEliminate} onClose={() => setShowForceEliminate(false)}>
        <Stack gap={6}>
          <Text variant="title">{strings.GAME_MODAL_FORCE_ELIMINATION_TITLE}</Text>
          <Text variant="body">
            {hostTargetPlayer
              ? dynamicStrings.forceEliminateConfirm(hostTargetPlayer.callsign)
              : ''}
          </Text>
          <Button
            title={strings.GAME_MODAL_FORCE_ELIMINATE_BUTTON}
            onPress={executeForceEliminate}
            variant="danger"
            loading={actionLoading}
            fullWidth
          />
          <Button
            title={strings.GAME_MODAL_CANCEL}
            onPress={() => setShowForceEliminate(false)}
            variant="ghost"
            fullWidth
          />
        </Stack>
      </Sheet>

      <StatusBar style="dark" />
      {AlertComponent}
      <VictoryOverlay
        visible={showVictoryOverlay}
        avatarId={me?.avatarId}
        variant={isInfinite ? 'infinite' : 'classic'}
        onComplete={() => {
          setShowVictoryOverlay(false);
          setActiveTab('SITUATION');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[10],
  },
  contentArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[9],
    paddingTop: space[7],
    paddingBottom: space[6],
    flexGrow: 1,
  },
  loadingSeal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space[8],
  },
  errorButton: {
    marginTop: space[10],
  },
  spectatorBanner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: space[6],
    marginHorizontal: space[9],
    marginTop: space[6],
    alignItems: 'center',
    gap: space[2],
  },
  scrollFooter: {
    marginTop: space[10],
    width: '100%',
  },
  banner: {
    marginHorizontal: space[9],
    marginTop: space[4],
  },
  alertContainer: {
    justifyContent: 'center',
  },
  alertContent: {
    padding: space[10],
  },
  alertObjective: {
    textAlign: 'center',
  },
});
