import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { strings } from '../../../strings';
import { Player } from '../../../types';
import { getAvatarDisplay } from '../../../utils/avatarDisplay';
import { AgentKeyBadge } from '../../../components/AgentKeyBadge';

interface IdentityHeaderProps {
  player?: Player;
  gameId: string;
}

export const IdentityHeader = ({ player, gameId }: IdentityHeaderProps) => {
  const { data: avatarData, Component: AvatarComponent } = getAvatarDisplay(player?.avatarId);
  
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {AvatarComponent && avatarData ? (
            <AvatarComponent size={36} color={avatarData.color} />
          ) : (
            <Text style={styles.avatarText}>
              {player?.callsign?.[0] || '?'}
            </Text>
          )}
        </View>
        <View>
          <Text style={styles.label}>{strings.IDENTITY_LABEL}</Text>
          <Text style={styles.callsign}>{player?.callsign || strings.IDENTITY_UNKNOWN}</Text>
          
          {/* Agent Key - tap to reveal */}
          {player?.emergencyPin && (
            <View style={styles.keyContainer}>
              <AgentKeyBadge agentKey={player.emergencyPin} size="sm" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.opLabel}>{strings.IDENTITY_OP_CODE}</Text>
        <Text style={styles.opCode}>{gameId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 20,
    width: '100%',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  opLabel: {
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 4,
    marginBottom: 2,
  },
  opCode: {
    color: theme.colors.primary,
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.serif,
  },
  label: {
    color: theme.colors.border,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 2,
    marginBottom: 4,
  },
  callsign: {
    color: theme.colors.surface,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 1,
  },
  keyContainer: {
    marginTop: 6,
  },
});
