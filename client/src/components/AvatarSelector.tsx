import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { AVATARS, getAvatarById } from '../data/avatars';
import { getAvatarComponent } from './avatars';
import { theme } from '../theme';
import { strings } from '../strings';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export const AvatarSelector = ({ selectedAvatarId, onSelect }: AvatarSelectorProps) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const currentAvatar = getAvatarById(selectedAvatarId) || AVATARS[0];
  const AvatarComponent = getAvatarComponent(currentAvatar.id);

  const handlePress = () => {
    const currentIndex = AVATARS.findIndex(a => a.id === selectedAvatarId);
    const nextIndex = (currentIndex + 1) % AVATARS.length;
    const nextAvatar = AVATARS[nextIndex];
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onSelect(nextAvatar.id);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.avatarCircle,
            { 
              borderColor: currentAvatar.color,
              transform: [{ scale: scaleAnim }],
              width: 80,
              height: 80,
              borderRadius: 40,
            }
          ]}
        >
          <AvatarComponent size={48} color={currentAvatar.color} />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.label}>{strings.AVATAR_TAP_TO_CHANGE}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginTop: theme.spacing.xs,
  },
  avatarButton: {
    marginBottom: 0,
  },
  avatarCircle: {
    borderWidth: 3,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
