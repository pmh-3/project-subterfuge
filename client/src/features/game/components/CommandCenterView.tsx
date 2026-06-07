import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../../types';
import { theme } from '../../../theme';
import { strings, dynamicStrings } from '../../../strings';
import { getAvatarDisplay } from '../../../utils/avatarDisplay';

interface CommandCenterViewProps {
  activePlayers: Player[];
  eliminatedPlayers: Player[];
  currentUserId?: string;
  hostId: string;
  winnerId?: string;
}

export const CommandCenterView = ({ activePlayers, eliminatedPlayers, currentUserId, hostId, winnerId }: CommandCenterViewProps) => {
  const winner = activePlayers.find(p => p.uid === winnerId) || eliminatedPlayers.find(p => p.uid === winnerId);
  const allPlayers = [...activePlayers, ...eliminatedPlayers];
  const playerMap = new Map(allPlayers.map(p => [p.uid, p]));

  const getKillerName = (killerId: string) => {
    if (killerId === 'ADMIN') return strings.INTEL_KILLER_HOST;
    return playerMap.get(killerId)?.callsign || strings.INTEL_KILLER_UNKNOWN;
  };

  const renderRoster = (list: Player[], title: string, isDead = false) => (
    <View style={styles.rosterSection}>
      <Text style={[styles.sectionTitle, isDead && { borderColor: theme.colors.error, color: theme.colors.error }]}>
        {dynamicStrings.rosterSectionTitle(title, list.length)}
      </Text>
      {list.map((player) => {
        const { data: avatarData, Component: AvatarComponent } = getAvatarDisplay(player.avatarId);
        
        return (
          <View key={player.uid} style={styles.playerRow}>
            <View style={[
              styles.indicator, 
              player.uid === currentUserId && styles.activeIndicator,
              isDead && styles.deadIndicator,
              player.uid === winnerId && styles.winnerIndicator
            ]} />
            
            {/* Avatar */}
            <View style={[styles.avatarSmall, { borderColor: avatarData?.color || theme.colors.secondary }]}>
              {AvatarComponent && avatarData ? (
                <AvatarComponent size={20} color={avatarData.color} />
              ) : (
                <Text style={styles.avatarSmallText}>{player.callsign[0]}</Text>
              )}
            </View>
            
            <View style={styles.nameContainer}>
              <View style={styles.callsignRow}>
                <Text style={[
                  styles.callsign, 
                  player.uid === currentUserId && styles.activeCallsign,
                  isDead && styles.deadCallsign,
                  player.uid === winnerId && styles.winnerCallsign
                ]}>
                  {player.callsign}
                </Text>
                
                {isDead && player.eliminatedBy && (
                   <Text style={styles.killedBy}>{dynamicStrings.killedBy(getKillerName(player.eliminatedBy))}</Text>
                )}
              </View>

              {(player.uid === currentUserId || player.uid === hostId) && (
                <View style={styles.tagRow}>
                  {player.uid === currentUserId && <Text style={styles.tag}>{strings.INTEL_TAG_YOU}</Text>}
                  {player.uid === hostId && <Text style={styles.tag}>{strings.INTEL_TAG_HOST}</Text>}
                </View>
              )}
            </View>
            
            <View style={styles.stats}>
               <Text style={styles.confirmCount}>{player.killCount || 0}</Text>
               <Text style={styles.confirmLabel}>{strings.INTEL_CONFIRMED}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const isCurrentUserWinner = currentUserId === winnerId;

  return (
    <View style={styles.container}>
      {winner && (
        <View style={[
          styles.winnerBanner, 
          !isCurrentUserWinner && styles.loserBanner
        ]}>
          <Text style={[
            styles.winnerTitle,
            !isCurrentUserWinner && styles.loserTitle
          ]}>
            {isCurrentUserWinner ? strings.INTEL_OPERATION_COMPLETE : strings.INTEL_MISSION_TERMINATED}
          </Text>
          <Text style={[
            styles.winnerName,
            !isCurrentUserWinner && styles.loserName
          ]}>
            {winner.callsign}
          </Text>
          <Text style={[
            styles.winnerSub,
            !isCurrentUserWinner && styles.loserSub
          ]}>
            {isCurrentUserWinner ? strings.INTEL_WINNER_SUB : strings.INTEL_LOSER_SUB}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{strings.INTEL_HEADER_TITLE}</Text>
      </View>

      {renderRoster(activePlayers, strings.INTEL_ACTIVE_AGENTS)}
      {eliminatedPlayers.length > 0 && renderRoster(eliminatedPlayers, strings.INTEL_INACTIVE_AGENTS, true)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    color: theme.colors.surface, // Manila text
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: theme.colors.primary, // Brass
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 2,
    marginTop: 4,
  },
  // Winner Banner
  winnerBanner: {
    backgroundColor: theme.colors.successFaint,
    borderWidth: 2,
    borderColor: theme.colors.success,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  winnerTitle: {
    color: theme.colors.success,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  winnerName: {
    color: theme.colors.surface,
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  winnerSub: {
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
    marginTop: 4,
  },
  // Loser Banner variants
  loserBanner: {
    backgroundColor: theme.colors.errorFaint,
    borderColor: theme.colors.error,
  },
  loserTitle: {
    color: theme.colors.error,
  },
  loserName: {
    color: theme.colors.secondary,
  },
  loserSub: {
    color: theme.colors.secondary,
  },
  // Roster
  rosterSection: {
    marginBottom: 30,
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
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.surfaceFaint,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.secondary,
    marginRight: 12,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarSmallText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.serif,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  winnerIndicator: {
    backgroundColor: theme.colors.success,
    width: 12,
    height: 12,
  },
  deadIndicator: {
    backgroundColor: theme.colors.error,
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  callsign: {
    color: theme.colors.surface,
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  callsignRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  activeCallsign: {
    color: theme.colors.primary,
  },
  winnerCallsign: {
    color: theme.colors.success,
  },
  deadCallsign: {
    color: theme.colors.secondary,
    textDecorationLine: 'line-through',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  tag: {
    color: theme.colors.secondary,
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 1,
    marginRight: 8,
  },
  killedBy: {
    color: theme.colors.error,
    fontSize: 12, // Increased for readability
    fontFamily: theme.typography.fontFamily.sans,
    marginLeft: 8,
  },
  stats: {
    backgroundColor: theme.colors.statsBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  confirmCount: {
    color: theme.colors.surface,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  confirmLabel: {
    color: theme.colors.secondary,
    fontSize: 6,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 1,
    marginTop: 2,
  }
});
