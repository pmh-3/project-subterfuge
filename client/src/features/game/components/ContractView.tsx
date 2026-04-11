import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Player } from '../../../types';
import { theme } from '../../../theme';
import { getAvatarDisplay } from '../../../utils/avatarDisplay';
import { strings, dynamicStrings } from '../../../strings';
import { DEFAULT_MAX_REROLLS } from '../../../constants';
import { useHoldToConfirm } from '../../../hooks/useHoldToConfirm';

interface ContractViewProps {
  player: Player;
  targetAvatarId?: string;
  isPending: boolean;
  onLogKill: () => void;
  onScramble: () => void;
  loading?: boolean;
  maxRerolls?: number;
}

export const ContractView = ({ player, targetAvatarId, isPending, onLogKill, onScramble, loading, maxRerolls = DEFAULT_MAX_REROLLS }: ContractViewProps) => {
  const { data: avatarData, Component: AvatarComponent } = getAvatarDisplay(targetAvatarId);
  const { isHolding, interpolatedWidth, onPressIn, onPressOut } = useHoldToConfirm(onLogKill);

  return (
    <View style={styles.container}>
      {/* Folder Tab Effect */}
      <View style={styles.folderTab}>
        <Text style={styles.tabText}>{strings.CONTRACT_TAB}</Text>
      </View>

      <View style={styles.folder}>
        {/* Top Secret Stamp */}
        <View style={styles.topSecret}>
          <Text style={styles.topSecretText}>{strings.CONTRACT_TOP_SECRET}</Text>
        </View>

        <View style={styles.headerSection}>
          <View style={[styles.photoBox, { borderColor: avatarData?.color || theme.colors.secondary }]}>
            {AvatarComponent && avatarData ? (
              <AvatarComponent size={70} color={avatarData.color} />
            ) : (
              <Text style={styles.photoPlaceholder}>
                {player.targetCallsign?.[0] || '?'}
              </Text>
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{strings.CONTRACT_TARGET_IDENTITY}</Text>
            <Text style={styles.targetName}>{player.targetCallsign || strings.CONTRACT_TARGET_UNKNOWN}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>{strings.CONTRACT_MISSION_OBJECTIVE}</Text>
          <Text style={styles.taskDesc}>{player.taskDescription}</Text>
          {!isPending && (player.rerollsUsed || 0) < maxRerolls && (
            <TouchableOpacity
              style={[styles.changeObjectiveButton, loading && styles.changeObjectiveButtonDisabled]}
              onPress={onScramble}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.changeObjectiveButtonText}>
                {dynamicStrings.rerollsLeft(maxRerolls - (player.rerollsUsed || 0))}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isPending ? (
          <View style={styles.pendingStamp}>
            <Text style={styles.pendingText}>{strings.CONTRACT_PENDING_CONFIRMATION}</Text>
          </View>
        ) : (
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={[styles.holdButton, loading && styles.holdButtonDisabled]}
              onPressIn={loading ? undefined : onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
              disabled={loading}
            >
              <Animated.View 
                style={[
                  styles.holdProgress,
                  { width: interpolatedWidth }
                ]} 
              />
              <Text style={styles.holdButtonText}>
                {isHolding ? strings.CONTRACT_HOLD_TO_CONFIRM : strings.CONTRACT_NEUTRALIZE_TARGET}
              </Text>
            </TouchableOpacity>
            <Text style={styles.holdHint}>{strings.CONTRACT_PRESS_AND_HOLD}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 10,
  },
  folderTab: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -1,
    zIndex: 1,
    marginLeft: 0,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 1,
  },
  folder: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 2,
    borderTopLeftRadius: 0,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
    minHeight: 400,
  },
  topSecret: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 3,
    borderColor: theme.colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.6,
    zIndex: 10,
    backgroundColor: theme.colors.surface,
  },
  topSecretText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  photoBox: {
    width: 80,
    height: 100,
    borderWidth: 2,
    backgroundColor: theme.colors.paperWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    fontSize: 32,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily.serif,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 1,
    marginBottom: 4,
  },
  targetName: {
    color: theme.colors.text,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 20,
    opacity: 0.5,
  },
  section: {
    marginBottom: 30,
  },
  changeObjectiveButton: {
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'center',
  },
  changeObjectiveButtonDisabled: {
    opacity: 0.5,
  },
  changeObjectiveButtonText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 1,
    fontWeight: '600',
  },
  taskDesc: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.serif,
    lineHeight: 32,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  actionArea: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  holdButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdButtonDisabled: {
    opacity: 0.5,
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.statsBackground,
  },
  holdButtonText: {
    color: theme.colors.surface,
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
  pendingStamp: {
    marginTop: 40,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 8,
  },
  pendingText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
