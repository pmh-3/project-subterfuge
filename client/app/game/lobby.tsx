import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { AvatarSelector } from '../../src/components/AvatarSelector';
import { useAuth } from '../../src/features/auth/AuthContext';
import { createGame, joinGame } from '../../src/features/game/gameService';
import { storage } from '../../src/utils/storage';
import { theme } from '../../src/theme';
import { useAlert } from '../../src/hooks/useAlert';
import { strings, dynamicStrings } from '../../src/strings';
import { getDefaultAvatar } from '../../src/data/avatars';
import { BriefingModal } from '../../src/features/game/components/BriefingModal';
import { AgentKeyReveal } from '../../src/features/game/components/AgentKeyReveal';

type Mode = null | 'join-code' | 'join' | 'join-recover' | 'start' | 'reveal';
type RevealContext = 'join' | 'create';

export default function LobbyScreen() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const { code: urlCode } = useLocalSearchParams<{ code?: string }>();
  
  // Identity state
  const [callsign, setCallsign] = useState('');
  const [agentKey, setAgentKey] = useState('');
  const [recoveryKey, setRecoveryKey] = useState(''); // Separate state for manual key entry
  const [avatarId, setAvatarId] = useState(getDefaultAvatar().id);
  
  // Join-specific state
  const [operationCode, setOperationCode] = useState('');
  
  // UI state
  const [mode, setMode] = useState<Mode>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [isNewKey, setIsNewKey] = useState(false);
  const [revealContext, setRevealContext] = useState<RevealContext>('join');
  
  const router = useRouter();

  // Auto sign-in if user lands here directly
  useEffect(() => {
    if (!user && !authLoading) {
      signIn();
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadIdentity();
  }, []);

  // Pre-fill operation code from URL param (deep link)
  useEffect(() => {
    if (urlCode) {
      setOperationCode(urlCode.toUpperCase());
      setMode('join');
    }
  }, [urlCode]);

  const loadIdentity = async () => {
    const savedCallsign = await storage.get('user_callsign');
    const savedPin = await storage.get('user_pin');
    const savedAvatarId = await storage.get('user_avatar');
    
    if (savedCallsign) setCallsign(savedCallsign);
    // Only use saved PIN if it's exactly 3 digits - don't migrate old 4-digit PINs
    if (savedPin && savedPin.length === 3 && /^\d{3}$/.test(savedPin)) {
      setAgentKey(savedPin);
    }
    if (savedAvatarId) setAvatarId(savedAvatarId);
  };

  // Generate a random 3-digit Agent Key
  const generateAgentKey = (): string => {
    const randomNum = Math.floor(Math.random() * 1000);
    return String(randomNum).padStart(3, '0');
  };

  // Get or create Agent Key (returns existing or generates new)
  const getOrCreateAgentKey = async (): Promise<string> => {
    // If we already have a valid 3-digit numeric key loaded, use it
    if (agentKey && agentKey.length === 3 && /^\d{3}$/.test(agentKey)) {
      setIsNewKey(false);
      return agentKey;
    }
    // Otherwise generate a new one
    const newKey = generateAgentKey();
    setAgentKey(newKey);
    setIsNewKey(true);
    await storage.save('user_pin', newKey);
    return newKey;
  };

  const validateIdentity = () => {
    if (!callsign.trim() || callsign.trim().length < 1) {
      showAlert({
        title: strings.ALERT_INVALID_CALLSIGN_TITLE,
        message: strings.ALERT_INVALID_CALLSIGN_MESSAGE,
      });
      return false;
    }
    if (!user || authLoading) {
      showAlert({
        title: strings.ALERT_ESTABLISHING_CONNECTION_TITLE,
        message: strings.ALERT_ESTABLISHING_CONNECTION_MESSAGE,
      });
      if (!user && !authLoading) signIn();
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateIdentity()) return;
    
    setCreateLoading(true);
    try {
      // Get existing or generate new Agent Key
      const key = await getOrCreateAgentKey();
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);
      
      const newGameId = await createGame(user!.uid, callsign, key, avatarId);
      setPendingGameId(newGameId);
      setRevealContext('create'); // Host goes to configure after reveal
      setMode('reveal');
    } catch (e) {
      if (__DEV__) console.error(e);
      showAlert({
        title: strings.ALERT_OPERATION_FAILED_TITLE,
        message: e instanceof Error ? e.message : strings.ALERT_OPERATION_FAILED_INIT,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!validateIdentity()) return;
    if (operationCode.length !== 4) {
      showAlert({
        title: strings.ALERT_INVALID_CODE_TITLE,
        message: strings.ALERT_INVALID_CODE_MESSAGE,
      });
      return;
    }

    setJoinLoading(true);
    try {
      // Get existing or generate new Agent Key
      const key = await getOrCreateAgentKey();
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);
      
      const code = operationCode.toUpperCase();
      await joinGame(code, user!.uid, callsign, key, avatarId);
      setPendingGameId(code);
      setRevealContext('join'); // Players go to game after reveal
      setMode('reveal');
    } catch (e) {
      if (__DEV__) console.error(e);
      const message = e instanceof Error ? e.message : '';
      if (message.includes('Identity active') || message.includes('Invalid credentials')) {
        setMode('join-recover');
        setRecoveryKey('');
      } else {
        showAlert({
          title: strings.ALERT_ACCESS_DENIED_TITLE,
          message: message || strings.ALERT_ACCESS_DENIED_JOIN,
        });
      }
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle rejoin with manually entered Agent Key
  const handleRecoverJoin = async () => {
    if (!validateIdentity()) return;
    if (recoveryKey.length !== 3 || !/^\d{3}$/.test(recoveryKey)) {
      showAlert({
        title: strings.ALERT_INVALID_KEY_TITLE,
        message: strings.ALERT_INVALID_KEY_MESSAGE,
      });
      return;
    }

    setJoinLoading(true);
    try {
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);
      
      const code = operationCode.toUpperCase();
      await joinGame(code, user!.uid, callsign, recoveryKey, avatarId);
      
      // Recovery successful - save this key for future use
      setAgentKey(recoveryKey);
      await storage.save('user_pin', recoveryKey);
      setIsNewKey(false);
      
      setPendingGameId(code);
      setRevealContext('join'); // Recovered players go to game after reveal
      setMode('reveal');
    } catch (e) {
      if (__DEV__) console.error(e);
      showAlert({
        title: strings.ALERT_ACCESS_DENIED_TITLE,
        message: e instanceof Error ? e.message : strings.ALERT_ACCESS_DENIED_INVALID_KEY,
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRevealComplete = () => {
    if (pendingGameId) {
      if (revealContext === 'create') {
        // Host goes to configure screen to set up task packs
        router.push(`/game/configure?id=${pendingGameId}`);
      } else {
        // Players go directly to the game
        router.push(`/game/${pendingGameId}`);
      }
    }
  };

  const handleWatch = () => {
    const code = operationCode.toUpperCase().trim();
    if (code.length !== 4) {
      showAlert({
        title: 'Invalid Code',
        message: 'Operation Code must be 4 characters',
      });
      return;
    }
    router.push(`/game/${code}`);
  };

  const handleBack = () => {
    setMode(null);
  };

  // Render the initial choice screen content
  const renderChoiceContent = () => (
    <View style={styles.contentArea}>
      <View style={styles.choiceButtons}>
        <Button 
title={strings.LOBBY_JOIN_OPERATION}
          onPress={() => setMode('join-code')}
          style={styles.choiceButton}
        />
        <Button 
          title={strings.LOBBY_START_OPERATION}
          onPress={() => setMode('start')}
          style={styles.choiceButton}
        />
      </View>
    </View>
  );

  // Render the operation code entry screen content (step 1 of join)
  const renderJoinCodeContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.formTitle}>{strings.LOBBY_ENTER_CODE_TITLE}</Text>
      <Text style={styles.formSubtitle}>{strings.LOBBY_ENTER_CODE_SUBTITLE}</Text>
      
      <View style={styles.formFields}>
        <Input
          label={strings.LOBBY_OPERATION_CODE_LABEL}
          value={operationCode}
          onChangeText={(text) => setOperationCode(text.toUpperCase())}
          placeholder={strings.LOBBY_OPERATION_CODE_PLACEHOLDER}
          maxLength={4}
          autoCapitalize="characters"
          style={{ marginBottom: theme.spacing.xl }}
        />
      </View>

      <View style={styles.actionButtons}>
        <Button 
          title={strings.LOBBY_CONTINUE} 
          onPress={() => {
            if (operationCode.length !== 4) {
              showAlert({
                title: strings.ALERT_INVALID_CODE_TITLE,
                message: strings.ALERT_INVALID_CODE_MESSAGE,
              });
              return;
            }
            setMode('join');
          }}
        />
        {operationCode.trim().length === 4 && (
          <Button 
            title={strings.LOBBY_WATCH_SPECTATOR} 
            onPress={handleWatch}
            style={{ marginTop: theme.spacing.md, borderColor: theme.colors.secondary, backgroundColor: 'transparent' }}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{strings.LOBBY_BACK}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render the identity form (shared between join and start)
  const renderIdentityForm = () => (
    <View style={styles.identitySection}>
      <View style={styles.avatarContainer}>
        <AvatarSelector 
          selectedAvatarId={avatarId}
          onSelect={setAvatarId}
        />
      </View>
      <Input
        label={strings.LOBBY_CALLSIGN_LABEL}
        value={callsign}
        onChangeText={setCallsign}
        placeholder={strings.LOBBY_CALLSIGN_PLACEHOLDER}
        maxLength={16}
        autoCapitalize="none"
      />
    </View>
  );

  // Render the join identity form content (step 2 of join, or directly if URL prefilled)
  const renderJoinContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.formTitle}>{strings.LOBBY_AGENT_DETAILS_TITLE}</Text>
      <Text style={styles.formSubtitle}>{strings.LOBBY_AGENT_DETAILS_SUBTITLE}</Text>

      <View style={styles.formFields}>
        {renderIdentityForm()}
      </View>

      <View style={styles.actionButtons}>
        <Button 
          title={strings.LOBBY_JOIN_OPERATION} 
          onPress={handleJoin} 
          loading={joinLoading}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setMode(urlCode ? null : 'join-code')} style={styles.backButton}>
          <Text style={styles.backText}>{strings.LOBBY_BACK}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render recovery form when callsign is already taken
  const renderRecoveryContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.formTitle}>{strings.LOBBY_IDENTITY_CONFLICT_TITLE}</Text>
      <Text style={styles.formSubtitle}>{dynamicStrings.identityConflictSubtitle(callsign)}</Text>

      <View style={styles.formFields}>
        <Input
          label={strings.LOBBY_AGENT_KEY_LABEL}
          value={recoveryKey}
          onChangeText={(text) => setRecoveryKey(text.replace(/[^0-9]/g, ''))}
          placeholder={strings.LOBBY_AGENT_KEY_PLACEHOLDER}
          maxLength={3}
          keyboardType="number-pad"
          style={{ marginBottom: theme.spacing.lg }}
        />
      </View>

      <View style={styles.actionButtons}>
        <Button 
          title={strings.LOBBY_VERIFY_IDENTITY} 
          onPress={handleRecoverJoin} 
          loading={joinLoading}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setMode('join')} style={styles.backButton}>
          <Text style={styles.backText}>{strings.LOBBY_USE_DIFFERENT_CALLSIGN}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render the start (create) form content
  const renderStartContent = () => (
    <View style={styles.contentArea}>
      <Text style={styles.formTitle}>{strings.LOBBY_AGENT_DETAILS_TITLE}</Text>
      <Text style={styles.formSubtitle}>{strings.LOBBY_AGENT_DETAILS_SUBTITLE}</Text>

      <View style={styles.formFields}>
        {renderIdentityForm()}
      </View>

      <View style={styles.actionButtons}>
        <Button 
          title={strings.LOBBY_START_OPERATION} 
          onPress={handleCreate} 
          loading={createLoading}
        />
      </View>

      <View style={styles.bottomNav}>
<TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>{strings.LOBBY_BACK}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  // Show reveal screen as full takeover
  if (mode === 'reveal') {
    return (
      <SafeAreaView style={styles.container}>
        <AgentKeyReveal 
          agentKey={agentKey}
          isNewKey={isNewKey}
          onComplete={handleRevealComplete} 
        />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <Text style={styles.title}>{strings.APP_NAME}</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {mode === null && renderChoiceContent()}
          {mode === 'join-code' && renderJoinCodeContent()}
          {mode === 'join' && renderJoinContent()}
          {mode === 'join-recover' && renderRecoveryContent()}
          {mode === 'start' && renderStartContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Manila Folder Help Tab */}
      <TouchableOpacity 
        onPress={() => setShowBriefing(true)}
        style={styles.helpTab}
        activeOpacity={0.9}
      >
        <Text style={styles.helpTabText}>{strings.LOBBY_BRIEFING_TAB}</Text>
      </TouchableOpacity>

      <StatusBar style="light" />
      {AlertComponent}
      <BriefingModal visible={showBriefing} onClose={() => setShowBriefing(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  
  // Fixed header that stays in place
  fixedHeader: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fontFamily.serif,
    textAlign: 'center',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  
  // Content area that changes between modes
  contentArea: {
    paddingTop: theme.spacing.lg,
  },
  
  // Choice screen styles
  choiceButtons: {
    width: '100%',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  choiceButton: {
    marginBottom: 0,
  },
  
  // Form styles
  formTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontFamily: theme.typography.fontFamily.serif,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    color: theme.colors.surfaceMuted,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  formFields: {
    marginBottom: theme.spacing.xl,
  },
  identitySection: {
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionButtons: {
    width: '100%',
  },
  
  // Bottom navigation
  bottomNav: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: theme.spacing.md,
  },
  backText: {
    color: theme.colors.surfaceMuted,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  
  // Manila Folder Help Tab
  helpTab: {
    position: 'absolute',
    bottom: 0,
    right: 24,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  helpTabText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
