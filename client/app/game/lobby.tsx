import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Input,
  Avatar,
  Stack,
  Row,
  Banner,
  colors,
  space,
} from '@/design-system';
import { useAuth } from '@/features/auth/AuthContext';
import { createGame, joinGame } from '@/features/game/gameService';
import { storage } from '@/utils/storage';
import { useLayout } from '@/hooks/useLayout';
import { strings, dynamicStrings, serviceErrors } from '@/strings';
import { AVATARS, getRandomAvatar } from '@/data/avatars';
import { AgentKeyReveal } from '@/features/game/components/AgentKeyReveal';

type Mode = null | 'join-code' | 'join' | 'join-recover' | 'start' | 'reveal';

export default function LobbyScreen() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { contentStyle, contentMinHeight } = useLayout();
  const { code: urlCode, mode: urlMode } = useLocalSearchParams<{ code?: string; mode?: string }>();

  const [callsign, setCallsign] = useState('');
  const [agentKey, setAgentKey] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [avatarId, setAvatarId] = useState(() => getRandomAvatar().id);
  const [operationCode, setOperationCode] = useState('');
  const [mode, setMode] = useState<Mode>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!user && !authLoading) {
      signIn();
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadIdentity();
  }, []);

  useEffect(() => {
    if (urlCode) {
      setOperationCode(urlCode.toUpperCase());
      setMode('join');
    } else if (urlMode === 'join-code') {
      setMode('join-code');
    } else if (urlMode === 'start') {
      setMode('start');
    }
  }, [urlCode, urlMode]);

  useEffect(() => {
    if (!mode && !urlCode && !urlMode) {
      router.replace('/');
    }
  }, [mode, urlCode, urlMode, router]);

  const loadIdentity = async () => {
    const savedCallsign = await storage.get('user_callsign');
    const savedPin = await storage.get('user_pin');
    const savedAvatarId = await storage.get('user_avatar');

    if (savedCallsign) setCallsign(savedCallsign);
    if (savedPin && savedPin.length === 3 && /^\d{3}$/.test(savedPin)) {
      setAgentKey(savedPin);
    }
    if (savedAvatarId) setAvatarId(savedAvatarId);
  };

  const generateAgentKey = (): string => {
    const randomNum = Math.floor(Math.random() * 1000);
    return String(randomNum).padStart(3, '0');
  };

  const getOrCreateAgentKey = async (): Promise<string> => {
    if (agentKey && agentKey.length === 3 && /^\d{3}$/.test(agentKey)) {
      return agentKey;
    }
    const newKey = generateAgentKey();
    setAgentKey(newKey);
    await storage.save('user_pin', newKey);
    return newKey;
  };

  const validateIdentity = (): boolean => {
    if (!callsign.trim()) {
      setInlineError(strings.LOBBY_NAME_REQUIRED);
      return false;
    }
    if (!user || authLoading) {
      setInlineError(strings.LOBBY_CONNECTING);
      if (!user && !authLoading) signIn();
      return false;
    }
    return true;
  };

  const goToGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const handleCreate = async () => {
    if (!validateIdentity()) return;

    setCreateLoading(true);
    setInlineError(null);
    try {
      const key = await getOrCreateAgentKey();
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);

      const newGameId = await createGame(user!.uid, callsign, key, avatarId);
      setPendingGameId(newGameId);
      setMode('reveal');
    } catch (e) {
      if (__DEV__) console.error(e);
      setInlineError(e instanceof Error ? e.message : strings.ALERT_OPERATION_FAILED_INIT);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!validateIdentity()) return;
    if (operationCode.length !== 4) {
      setInlineError(strings.LOBBY_CODE_REQUIRED);
      return;
    }

    setJoinLoading(true);
    setInlineError(null);
    try {
      const key = await getOrCreateAgentKey();
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);

      const code = operationCode.toUpperCase();
      await joinGame(code, user!.uid, callsign, key, avatarId);
      goToGame(code);
    } catch (e) {
      if (__DEV__) console.error(e);
      const message = e instanceof Error ? e.message : '';
      if (message.includes('Identity active') || message.includes('Invalid credentials')) {
        setMode('join-recover');
        setRecoveryKey('');
      } else if (message.includes(serviceErrors.OPERATION_NOT_FOUND)) {
        setInlineError(strings.LOBBY_GAME_NOT_FOUND);
      } else {
        setInlineError(message || strings.ALERT_ACCESS_DENIED_JOIN);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRecoverJoin = async () => {
    if (!validateIdentity()) return;
    if (recoveryKey.length !== 3 || !/^\d{3}$/.test(recoveryKey)) {
      setInlineError(strings.ALERT_INVALID_KEY_MESSAGE);
      return;
    }

    setJoinLoading(true);
    setInlineError(null);
    try {
      await storage.save('user_callsign', callsign.trim());
      await storage.save('user_avatar', avatarId);

      const code = operationCode.toUpperCase();
      await joinGame(code, user!.uid, callsign, recoveryKey, avatarId);

      setAgentKey(recoveryKey);
      await storage.save('user_pin', recoveryKey);

      goToGame(code);
    } catch (e) {
      if (__DEV__) console.error(e);
      setInlineError(e instanceof Error ? e.message : strings.ALERT_ACCESS_DENIED_INVALID_KEY);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRevealComplete = () => {
    if (pendingGameId) {
      router.push(`/game/${pendingGameId}`);
    }
  };

  const handleWatch = () => {
    const code = operationCode.toUpperCase().trim();
    if (code.length !== 4) {
      setInlineError(strings.LOBBY_CODE_REQUIRED);
      return;
    }
    router.push(`/game/${code}`);
  };

  const handleBack = () => {
    setInlineError(null);
    if (urlMode) {
      router.replace('/');
    } else {
      setMode(null);
    }
  };

  const renderAvatarPicker = () => (
    <Row gap={6} style={styles.avatarRow}>
      {AVATARS.map((avatar) => (
        <Pressable key={avatar.id} onPress={() => setAvatarId(avatar.id)}>
          <Avatar avatarId={avatar.id} size={44} selected={avatarId === avatar.id} />
        </Pressable>
      ))}
    </Row>
  );

  const renderScreenLayout = (body: React.ReactNode, footer: React.ReactNode) => (
    <View style={[styles.page, contentStyle, { minHeight: contentMinHeight }]}>
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {body}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: contentMinHeight * 0.1 }]}>{footer}</View>
    </View>
  );

  const renderIdentityForm = () => (
    <Stack gap={16}>
      <View>
        <Text variant="bodySmall" muted style={styles.fieldLabel}>
          {strings.LOBBY_YOUR_NAME_LABEL}
        </Text>
        <Input
          value={callsign}
          onChangeText={(text) => {
            setCallsign(text);
            setInlineError(null);
          }}
          maxLength={24}
          autoCapitalize="words"
          autoFocus
        />
      </View>
      <View>
        <Text variant="bodySmall" muted style={styles.fieldLabel}>
          {strings.LOBBY_ICON_LABEL}
        </Text>
        {renderAvatarPicker()}
      </View>
    </Stack>
  );

  const renderBackLink = (label: string, onPress: () => void) => (
    <Pressable onPress={onPress} style={styles.backLink}>
      <Text variant="metaMicro" muted>
        {label}
      </Text>
    </Pressable>
  );

  const renderInlineError = () =>
    inlineError ? <Banner message={inlineError} variant="error" onDismiss={() => setInlineError(null)} /> : null;

  const renderJoinCodeContent = () =>
    renderScreenLayout(
      <Stack gap={16}>
        <Text variant="display">{strings.LOBBY_ENTER_CODE_TITLE}</Text>

        <Input
          label={strings.LOBBY_OPERATION_CODE_LABEL}
          value={operationCode}
          onChangeText={(text) => {
            setOperationCode(text.toUpperCase());
            setInlineError(null);
          }}
          placeholder={strings.LOBBY_GAME_CODE_PLACEHOLDER}
          maxLength={4}
          autoCapitalize="characters"
        />

        {renderInlineError()}
      </Stack>,
      <Stack gap={5} style={styles.actions}>
        <Button
          title={strings.LOBBY_CONTINUE}
          onPress={() => {
            if (operationCode.length !== 4) {
              setInlineError(strings.LOBBY_CODE_REQUIRED);
              return;
            }
            setInlineError(null);
            setMode('join');
          }}
          fullWidth
        />
        {operationCode.trim().length === 4 ? (
          <Pressable onPress={handleWatch} style={styles.secondaryLink}>
            <Text variant="metaMicro" muted>
              {strings.LOBBY_WATCH_SPECTATOR}
            </Text>
          </Pressable>
        ) : null}
        {renderBackLink(strings.LOBBY_BACK, handleBack)}
      </Stack>,
    );

  const renderJoinContent = () =>
    renderScreenLayout(
      <Stack gap={16}>
        <Text variant="display" style={styles.screenTitle}>
          {strings.LOBBY_CHOOSE_COVER}
        </Text>

        {renderIdentityForm()}
        {renderInlineError()}
      </Stack>,
      <Stack gap={5} style={styles.actions}>
        <Button title={strings.LOBBY_JOIN_OPERATION} onPress={handleJoin} loading={joinLoading} fullWidth />
        {renderBackLink(strings.LOBBY_BACK, () => {
          setInlineError(null);
          setMode(urlCode ? null : 'join-code');
        })}
      </Stack>,
    );

  const renderRecoveryContent = () =>
    renderScreenLayout(
      <Stack gap={16}>
        <Text variant="display">{strings.LOBBY_IDENTITY_CONFLICT_TITLE}</Text>
        <Text variant="bodySmall" muted>
          {dynamicStrings.identityConflictSubtitle(callsign)}
        </Text>

        <Input
          label={strings.LOBBY_AGENT_KEY_LABEL}
          value={recoveryKey}
          onChangeText={(text) => {
            setRecoveryKey(text.replace(/[^0-9]/g, ''));
            setInlineError(null);
          }}
          placeholder={strings.LOBBY_AGENT_KEY_PLACEHOLDER}
          maxLength={3}
          keyboardType="number-pad"
        />

        {renderInlineError()}
      </Stack>,
      <Stack gap={5} style={styles.actions}>
        <Button title={strings.LOBBY_VERIFY_IDENTITY} onPress={handleRecoverJoin} loading={joinLoading} fullWidth />
        {renderBackLink(strings.LOBBY_USE_DIFFERENT_NAME, () => {
          setInlineError(null);
          setMode('join');
        })}
      </Stack>,
    );

  const renderStartContent = () =>
    renderScreenLayout(
      <Stack gap={16}>
        <Text variant="display" style={styles.screenTitle}>
          {strings.LOBBY_CHOOSE_COVER}
        </Text>

        {renderIdentityForm()}
        {renderInlineError()}
      </Stack>,
      <Stack gap={5} style={styles.actions}>
        <Button title={strings.LOBBY_CONTINUE} onPress={handleCreate} loading={createLoading} fullWidth />
        {renderBackLink(strings.LOBBY_BACK, handleBack)}
      </Stack>,
    );

  if (mode === 'reveal') {
    return (
      <>
        <AgentKeyReveal agentKey={agentKey} onComplete={handleRevealComplete} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!mode) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.screen}>
          {mode === 'join-code' && renderJoinCodeContent()}
          {mode === 'join' && renderJoinContent()}
          {mode === 'join-recover' && renderRecoveryContent()}
          {mode === 'start' && renderStartContent()}
        </View>
      </KeyboardAvoidingView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: space[10],
  },
  page: {
    flex: 1,
    width: '100%',
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    paddingTop: space[20],
    paddingBottom: space[10],
  },
  footer: {
    paddingTop: space[8],
  },
  screenTitle: {
    marginBottom: space[4],
  },
  actions: {
    width: '100%',
  },
  fieldLabel: {
    marginBottom: space[4],
  },
  avatarRow: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backLink: {
    alignSelf: 'center',
    paddingTop: space[6],
  },
  secondaryLink: {
    alignSelf: 'center',
    paddingVertical: space[2],
  },
});
