import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Player } from '../../../types';
import { Button } from '../../../components/Button';
import { AgentKeyBadge } from '../../../components/AgentKeyBadge';
import { theme } from '../../../theme';
import { strings, dynamicStrings } from '../../../strings';

interface HostSettingsViewProps {
  players: Player[];
  onForceEliminate: (targetId: string) => void;
  onEndGame?: () => void;
  loading?: boolean;
  endGameLoading?: boolean;
  isGameActive?: boolean;
}

export const HostSettingsView = ({ 
  players, 
  onForceEliminate, 
  onEndGame,
  loading,
  endGameLoading,
  isGameActive = false,
}: HostSettingsViewProps) => {
  const activePlayers = players.filter(p => p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.HOST_OVERRIDE_TITLE}</Text>
        <Text style={styles.subtitle}>{strings.HOST_OVERRIDE_SUBTITLE}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>{dynamicStrings.activeAgentsCount(activePlayers.length)}</Text>
        
        {activePlayers.map((player) => (
          <View key={player.uid} style={styles.row}>
            <View style={styles.playerInfo}>
              <Text style={styles.callsign}>{player.callsign}</Text>
              {player.emergencyPin && (
                <AgentKeyBadge agentKey={player.emergencyPin} size="sm" />
              )}
            </View>
            <Button 
              title={strings.HOST_ELIMINATE} 
              onPress={() => onForceEliminate(player.uid)} 
              variant="danger" 
              style={styles.killButton}
              loading={loading}
            />
          </View>
        ))}

        {activePlayers.length === 0 && (
          <Text style={styles.emptyText}>{strings.HOST_NO_ACTIVE_AGENTS}</Text>
        )}

        {/* End Game Button - only during active game */}
        {isGameActive && onEndGame && (
          <View style={styles.endGameSection}>
            <Text style={styles.endGameLabel}>{strings.HOST_TERMINATE_OPERATION}</Text>
            <Text style={styles.endGameHint}>
              {strings.HOST_END_GAME_HINT}
            </Text>
            <Button
              title={strings.HOST_END_OPERATION}
              onPress={onEndGame}
              variant="danger"
              loading={endGameLoading}
              style={styles.endGameButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 20,
  },
  title: {
    color: theme.colors.surface, // Manila
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: theme.colors.error,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 2,
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.surface,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans,
    marginBottom: 20,
    letterSpacing: 1,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceFaint,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.secondary,
  },
  playerInfo: {
    flex: 1,
    gap: 6,
  },
  callsign: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: theme.typography.fontFamily.mono,
  },
  killButton: {
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyText: {
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    fontFamily: theme.typography.fontFamily.serif,
  },
  endGameSection: {
    marginTop: 40,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  endGameLabel: {
    color: theme.colors.error,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  endGameHint: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    lineHeight: 18,
    marginBottom: 16,
  },
  endGameButton: {
    marginTop: 8,
  },
});
