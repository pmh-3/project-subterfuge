import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Player } from '@/types';
import {
  Text,
  Stack,
  ScreenHeader,
  AgentRow,
  GameCodeTag,
  Button,
  colors,
  space,
} from '@/design-system';
import { strings } from '@/strings';
import { MIN_PLAYERS_TO_START } from '@/constants';

interface GameLobbyViewProps {
  gameId: string;
  activePlayers: Player[];
  currentUserId?: string;
  hostId: string;
  isHost: boolean;
  onCopyGameCode: () => void;
  onOpenInvite: () => void;
  onStart: () => void;
  startLoading: boolean;
}

export function GameLobbyView({
  gameId,
  activePlayers,
  currentUserId,
  hostId,
  isHost,
  onCopyGameCode,
  onOpenInvite,
  onStart,
  startLoading,
}: GameLobbyViewProps) {
  const canStartGame = activePlayers.length >= MIN_PLAYERS_TO_START;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={strings.GAME_LOBBY_TITLE}
        trailing={
          <GameCodeTag
            code={gameId}
            label={strings.GAME_CODE_LABEL}
            onPress={onCopyGameCode}
          />
        }
      />

      <Stack gap={3} style={styles.roster}>
        {activePlayers.map((player) => (
          <AgentRow
            key={player.uid}
            callsign={player.callsign}
            avatarId={player.avatarId}
            isYou={player.uid === currentUserId}
            isHost={player.uid === hostId}
          />
        ))}
      </Stack>

      <View style={styles.actions}>
        {isHost ? (
          <Stack gap={4}>
            <View style={styles.hostCtas}>
              <Button
                title={strings.GAME_INVITE_AGENTS}
                onPress={onOpenInvite}
                variant="ghost"
                style={styles.hostCtaButton}
              />
              <Button
                title={strings.GAME_BEGIN_OPERATION}
                onPress={onStart}
                disabled={!canStartGame}
                loading={startLoading}
                style={styles.hostCtaButton}
              />
            </View>
            {!canStartGame ? (
              <Text variant="labelMicro" muted style={styles.hint}>
                {strings.GAME_LOBBY_NEED_PLAYERS}
              </Text>
            ) : null}
          </Stack>
        ) : (
          <Stack gap={4} align="center">
            <Text variant="labelMicro" muted style={styles.hint}>
              {strings.GAME_WAITING_FOR_HOST}
            </Text>
            <Button
              title={strings.GAME_INVITE_AGENTS}
              onPress={onOpenInvite}
              variant="ghost"
              fullWidth
            />
          </Stack>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  roster: {
    marginBottom: space[8],
  },
  actions: {
    marginTop: space[4],
    paddingTop: space[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hostCtas: {
    flexDirection: 'row',
    width: '100%',
    gap: space[4],
  },
  hostCtaButton: {
    flex: 1,
  },
  hint: {
    textAlign: 'center',
  },
});
