import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Share, Platform, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/features/auth/AuthContext';
import { useGame } from '../../src/features/game/useGame';
import { startGame, challengeTarget, confirmElimination, denyElimination, scrambleTask, adminForceEliminate, endGame } from '../../src/features/game/gameService';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { ContractView } from '../../src/features/game/components/ContractView';
import { CommandCenterView } from '../../src/features/game/components/CommandCenterView';
import { HostSettingsView } from '../../src/features/game/components/HostSettingsView';
import { IdentityHeader } from '../../src/features/game/components/IdentityHeader';
import { VictoryOverlay } from '../../src/features/game/components/VictoryOverlay';
import { BriefingModal } from '../../src/features/game/components/BriefingModal';
import { useAlert } from '../../src/hooks/useAlert';
import { useHoldToConfirm } from '../../src/hooks/useHoldToConfirm';
import { APP_URL, PULSE_DURATION, SPECTATOR_CHECK_DELAY } from '../../src/constants';
import { strings, dynamicStrings } from '../../src/strings';

type ModalType = 'HOST_KILL' | null;

export default function GameRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { game, players, loading, error } = useGame(id!);
  const { showAlert, AlertComponent } = useAlert();
  const router = useRouter();
  
  const [startLoading, setStartLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // General actions
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [denyLoading, setDenyLoading] = useState(false);
  const [endGameLoading, setEndGameLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTRACT' | 'INTEL' | 'ADMIN'>('CONTRACT');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [hostTargetId, setHostTargetId] = useState<string | null>(null);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const handleStart = useCallback(async () => {
    try {
      setStartLoading(true);
      await startGame(id!);
    } catch (e) {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR });
    } finally {
      setStartLoading(false);
    }
  }, [id, showAlert]);

  const startHold = useHoldToConfirm(handleStart);

  // Track previous game status for transitions
  const lastStatus = useRef<string | undefined>(undefined);

  // Pulsing animation for loading state
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  
  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: PULSE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: PULSE_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading]);

  const me = players.find(p => p.uid === user?.uid);
  const isDead = me?.status === 'ELIMINATED';
  const isLobby = game?.status === 'LOBBY';
  const isCompleted = game?.status === 'COMPLETED';
  const isHost = user?.uid === game?.hostId;
  
  // Spectator Detection: User has no player document in this game
  // Using 'me' (from players collection) is more reliable than playerIds on game doc
  const isSpectator = !me && user?.uid !== undefined && !loading;
  
  // Host can be a spectator too (if they left and came back to watch)
  const isHostSpectator = isSpectator && isHost;

  // Deep Link Redirect: If spectator in lobby (and NOT the host), redirect to lobby page with code
  // Host spectators can stay to use admin controls
  // Delay the redirect to allow Firestore sync to complete (prevents race condition after recovery)
  const [spectatorCheckComplete, setSpectatorCheckComplete] = useState(false);
  
  useEffect(() => {
    // Wait 600ms after loading completes before allowing spectator redirect
    if (!loading && !spectatorCheckComplete) {
      const timeout = setTimeout(() => {
        setSpectatorCheckComplete(true);
      }, SPECTATOR_CHECK_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [loading, spectatorCheckComplete]);
  
  useEffect(() => {
    if (spectatorCheckComplete && isSpectator && isLobby && !isHost) {
      router.replace(`/game/lobby?code=${id}`);
    }
  }, [spectatorCheckComplete, isSpectator, isLobby, isHost, id]);

  // Auto-switch tab logic (Maintenance)
  useEffect(() => {
    // Spectators should be on INTEL tab (unless host spectator on ADMIN)
    if (isSpectator && activeTab !== 'INTEL' && activeTab !== 'ADMIN') {
      setActiveTab('INTEL');
    }
    // Non-host spectators shouldn't access ADMIN
    if (isSpectator && !isHost && activeTab === 'ADMIN') {
      setActiveTab('INTEL');
    }
    // Only switch if we are in a state that FORBIDS Dossier (Dead/Lobby/Completed)
    // AND we are currently ON Dossier.
    else if ((isLobby || isDead || isCompleted) && activeTab === 'CONTRACT') {
      setActiveTab('INTEL');
    }
  }, [isLobby, isDead, isCompleted, activeTab, isSpectator, isHost]);

  // Auto-switch tab logic (Transitions)
  useEffect(() => {
    if (!game) return;

    // 1. Game Started (LOBBY -> ACTIVE)
    if (lastStatus.current === 'LOBBY' && game.status === 'ACTIVE') {
        setActiveTab('CONTRACT');
    }

    // 2. Game Ended (ACTIVE -> COMPLETED)
    if (lastStatus.current === 'ACTIVE' && game.status === 'COMPLETED') {
        if (game.winnerId === user?.uid) {
          setShowVictoryOverlay(true);
        } else {
          setActiveTab('INTEL');
        }
    }

    lastStatus.current = game.status;
  }, [game?.status]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Animated.View style={[styles.loadingSeal, { opacity: pulseAnim }]}>
          <Text style={styles.loadingSealText}>{strings.GAME_LOADING_SEAL}</Text>
        </Animated.View>
        <Text style={styles.loadingText}>{strings.GAME_LOADING_TEXT}</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error || strings.GAME_OPERATION_COMPROMISED}</Text>
        <Button title={strings.GAME_RETURN_TO_BASE} onPress={() => router.replace('/game/lobby')} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const alivePlayers = players.filter(p => p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION' || p.status === 'WINNER');
  const deadPlayers = players.filter(p => p.status === 'ELIMINATED');
  
  // Handlers

  // 1. My Kill Confirmation (called directly from press-and-hold)
  const executeChallenge = async () => {
    try {
      setActionLoading(true);
      await challengeTarget(id!, me!.targetId!, user!.uid);
    } catch(e) { 
      if (__DEV__) console.error(e);
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_LOG });
    } finally { 
      setActionLoading(false);  
    }
  };

  // 2. Incoming Death Confirmation
  const handleConfirmDeath = async () => {
    try {
      setConfirmLoading(true);
      await confirmElimination(id!, user!.uid);
    } catch(e) {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_CONFIRM });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDenyDeath = async () => {
    try {
      setDenyLoading(true);
      await denyElimination(id!, user!.uid);
    } catch(e) {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_DISPUTE });
    } finally {
      setDenyLoading(false);
    }
  };

  // 3. Scramble Logic
  const executeScramble = async () => {
    try {
      setActionLoading(true);
      await scrambleTask(id!, user!.uid);
      setActiveModal(null);
    } catch(e) { 
        showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: strings.GAME_ALERT_FAILED_REASSIGN }); 
    } finally { 
        setActionLoading(false); 
    }
  };

  // 4. Host Force Kill Logic
  const executeForceEliminate = async () => {
    if (!hostTargetId) return;
    try {
      setActionLoading(true);
      await adminForceEliminate(id!, hostTargetId);
      setActiveModal(null);
      setHostTargetId(null);
    } catch (e) {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: dynamicStrings.operationFailedWithMessage(e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR) });
    } finally {
      setActionLoading(false);
    }
  };

  // 5. End Game Early (Host)
  const handleEndGame = async () => {
    try {
      setEndGameLoading(true);
      await endGame(id!);
    } catch (e) {
      showAlert({ title: strings.ALERT_OPERATION_FAILED_TITLE, message: dynamicStrings.endOperationFailed(e instanceof Error ? e.message : strings.GAME_ALERT_UNKNOWN_ERROR) });
    } finally {
      setEndGameLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${APP_URL}/game/lobby?code=${id}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ url });
        } else {
          await navigator.clipboard.writeText(url);
          showAlert({ title: strings.GAME_LINK_COPIED_TITLE, message: strings.GAME_LINK_COPIED_MESSAGE });
        }
      } else {
        await Share.share({ message: url });
      }
    } catch (error) {
      // Ignore share errors
    }
  };

  // --- GLOBAL STATES ---

  // PENDING ELIMINATION (Alert Overlay) - Highest Priority
  if (me?.pendingEliminationBy && !isCompleted) {
    return (
      <View style={[styles.container, styles.alertContainer]}>
        <Text style={styles.alertTitle}>{strings.GAME_ALERT_TITLE}</Text>
        <Text style={styles.alertText}>{strings.GAME_ALERT_COMPROMISED}</Text>
        {me.pendingTaskDescription ? (
          <Text style={styles.alertObjective}>{dynamicStrings.theirObjectiveWas(me.pendingTaskDescription)}</Text>
        ) : null}
        <View style={styles.spacer} />
        <Button title={strings.GAME_CONFIRM_ELIMINATION} onPress={handleConfirmDeath} variant="danger" loading={confirmLoading} disabled={denyLoading} />
        <View style={styles.spacer} />
        <Button title={strings.GAME_DENY_ELIMINATION} onPress={handleDenyDeath} style={{ borderColor: '#fff' }} loading={denyLoading} disabled={confirmLoading} />
        <StatusBar style="light" />
      </View>
    );
  }

  // --- MAIN DASHBOARD ---

  const renderContent = () => {
    if (activeTab === 'ADMIN' && isHost) {
      return (
        <HostSettingsView 
          players={players} 
          onForceEliminate={(targetId) => {
              setHostTargetId(targetId);
              setActiveModal('HOST_KILL');
          }}
          onEndGame={handleEndGame}
          loading={actionLoading}
          endGameLoading={endGameLoading}
          isGameActive={game?.status === 'ACTIVE'}
        />
      );
    }

    if (activeTab === 'CONTRACT' && me && !isCompleted) {
      const targetPlayer = players.find(p => p.uid === me.targetId);
      return (
        <ContractView 
          player={me}
          targetAvatarId={targetPlayer?.avatarId}
          isPending={!!targetPlayer?.pendingEliminationBy}
          onLogKill={executeChallenge}
          onScramble={executeScramble}
          loading={actionLoading}
          maxRerolls={game.maxRerolls}
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
      />
    );
  };

  const hostTargetPlayer = players.find(p => p.uid === hostTargetId);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <IdentityHeader player={me} gameId={game.id} />
        
        {/* Spectator Mode Banner */}
        {isSpectator && (
          <View style={styles.spectatorBanner}>
            <Text style={styles.spectatorTitle}>{strings.GAME_SPECTATOR_MODE}</Text>
            <Text style={styles.spectatorSubtitle}>{isHostSpectator ? strings.GAME_SPECTATOR_HOST : strings.GAME_SPECTATOR_READONLY}</Text>
          </View>
        )}
        
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderContent()}

          {/* Lobby Actions */}
          {!isSpectator && isLobby && !isHost && activeTab === 'INTEL' && (
             <View style={styles.footer}>
              <Text style={styles.status}>{strings.GAME_WAITING_FOR_HOST}</Text>
              <Button title={strings.GAME_INVITE_AGENTS} onPress={handleShare} style={{ marginTop: 20 }} />
            </View>
          )}
          {/* Host controls in lobby - works for both player host and spectator host */}
          {isLobby && isHost && activeTab === 'INTEL' && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.holdStartButton, startLoading && styles.holdStartButtonDisabled]}
                onPressIn={startLoading ? undefined : startHold.onPressIn}
                onPressOut={startHold.onPressOut}
                activeOpacity={1}
                disabled={startLoading}
              >
                <Animated.View 
                  style={[
                    styles.holdStartProgress,
                    { width: startHold.interpolatedWidth }
                  ]} 
                />
                <Text style={styles.holdStartButtonText}>
                  {startLoading ? strings.GAME_HOLD_INITIATING : startHold.isHolding ? strings.GAME_HOLD_HOLDING : strings.GAME_BEGIN_OPERATION}
                </Text>
              </TouchableOpacity>
              <Text style={styles.holdHint}>{strings.GAME_PRESS_HOLD_START}</Text>
              <Button title={strings.GAME_INVITE_AGENTS} onPress={handleShare} style={{ marginTop: 20, borderColor: theme.colors.secondary }} />
            </View>
          )}
          {/* Play Again - for dead players or when game is completed (not for active spectators) */}
          {!isSpectator && (isDead || isCompleted) && (
             <View style={styles.footer}>
              <Button title={strings.GAME_PLAY_AGAIN} onPress={() => router.replace('/game/lobby')} />
            </View>
          )}
          {/* Exit for spectators */}
          {isSpectator && !isLobby && (
             <View style={styles.footer}>
              <Button title={strings.GAME_EXIT} onPress={() => router.replace('/game/lobby')} style={{ borderColor: theme.colors.secondary }} />
            </View>
          )}
        </ScrollView>

        {/* EXIT BUTTON - Positioned above tabs */}
        {((!isSpectator && !isDead && !isCompleted) || isHost) && (
          <TouchableOpacity 
            onPress={() => router.replace('/game/lobby')} 
            style={styles.exitBar}
          >
            <Text style={styles.exitText}>{strings.GAME_EXIT_OPERATION}</Text>
          </TouchableOpacity>
        )}

        {/* BOTTOM TAB BAR - Show only when user has multiple tabs to switch between */}
        {/* Alive players during game: CONTRACT + SITUATION ROOM (+ ADMIN if host) */}
        {/* Lobby: SITUATION ROOM + ADMIN (host only, no CONTRACT) */}
        {/* Dead/spectator non-hosts: no tabs (locked to SITUATION ROOM) */}
        {((!isSpectator && !isDead && !isCompleted) || isHost) && (
          <View style={styles.tabBar}>
            <View style={styles.tabGroup}>
              {/* Only show CONTRACT tab during active game (not in lobby) */}
              {!isDead && !isSpectator && !isLobby && (
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'CONTRACT' && styles.activeTab]} 
                  onPress={() => setActiveTab('CONTRACT')}
                >
                  <Text style={[styles.tabText, activeTab === 'CONTRACT' && styles.activeTabText]}>{strings.GAME_TAB_CONTRACT}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'INTEL' && styles.activeTab]} 
                onPress={() => setActiveTab('INTEL')}
              >
                <Text style={[styles.tabText, activeTab === 'INTEL' && styles.activeTabText]}>{strings.GAME_TAB_SITUATION_ROOM}</Text>
              </TouchableOpacity>
              {isHost && (
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'ADMIN' && styles.activeTab]} 
                  onPress={() => setActiveTab('ADMIN')}
                >
                  <Text style={[styles.tabText, activeTab === 'ADMIN' && styles.activeTabText]}>{strings.GAME_TAB_ADMIN}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.tab} 
                onPress={() => setShowBriefing(true)}
              >
                <Text style={styles.tabText}>{strings.GAME_TAB_BRIEFING}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* GLOBAL MODAL */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* HOST KILL */}
            {activeModal === 'HOST_KILL' && (
                <>
                    <Text style={styles.modalTitle}>{strings.GAME_MODAL_FORCE_ELIMINATION_TITLE}</Text>
                    <Text style={styles.modalText}>
                    {hostTargetPlayer ? dynamicStrings.forceEliminateConfirm(hostTargetPlayer.callsign) : ''}
                    </Text>
                    <Button title={strings.GAME_MODAL_FORCE_ELIMINATE_BUTTON} onPress={executeForceEliminate} variant="danger" loading={actionLoading} style={{ marginBottom: 16 }} />
                </>
            )}

            <Button title={strings.GAME_MODAL_CANCEL} onPress={() => setActiveModal(null)} style={{ borderColor: '#666', backgroundColor: 'transparent' }} />
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
      {AlertComponent}
      <BriefingModal visible={showBriefing} onClose={() => setShowBriefing(false)} />
      <VictoryOverlay 
        visible={showVictoryOverlay}
        avatarId={me?.avatarId}
        onComplete={() => {
          setShowVictoryOverlay(false);
          setActiveTab('INTEL');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  exitBar: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exitText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSeal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  loadingSealText: {
    color: theme.colors.primary,
    fontSize: 48,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
  },
  loadingText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
  },
  spectatorBanner: {
    backgroundColor: theme.colors.primaryFaint,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: 2,
  },
  spectatorTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: theme.spacing.xs,
  },
  spectatorSubtitle: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  status: {
    color: theme.colors.secondary,
    fontSize: 10,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  holdStartButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdStartButtonDisabled: {
    opacity: 0.5,
  },
  holdStartProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.holdOverlay,
  },
  holdStartButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
    zIndex: 1,
  },
  holdHint: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    marginTop: 10,
    letterSpacing: 1,
    opacity: 0.8,
  },
  error: {
    color: theme.colors.error,
    fontSize: 20,
    marginBottom: 20,
  },
  // Tabs - Manila envelope style
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: theme.colors.background,
    paddingBottom: 16,
  },
  tabGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceTint,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
  },
  activeTab: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderTopWidth: 2,
  },
  tabText: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: theme.typography.fontFamily.sans,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  // Alert
  alertContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.alertBackground,
    padding: 20,
  },
  alertTitle: {
    color: theme.colors.error,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: theme.typography.fontFamily.serif,
  },
  alertText: {
    color: theme.colors.surface,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  alertObjective: {
    color: theme.colors.surfaceLight,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  spacer: {
    height: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: theme.typography.fontFamily.serif,
  },
  modalText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: theme.typography.fontFamily.mono,
  },
});
