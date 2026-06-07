import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { getAvatarDisplay } from '@/utils/avatarDisplay';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { fontFamily } from '@/design-system/tokens/typography';
import { Text } from '@/design-system/components/Text';

/** Recolored avatar palette for light Midnight Wire background */
const AVATAR_COLORS: Record<string, string> = {
  'icon-binoculars': colors.inkSecondary,
  'icon-martini': colors.inkMuted,
  'icon-glasses': colors.accent,
  'icon-briefcase': colors.success,
  'icon-fedora': colors.inkPrimary,
  'icon-camera': colors.inkSecondary,
};

export interface AvatarProps {
  avatarId?: string;
  callsign?: string;
  size?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ avatarId, callsign, size = 28, selected, style }: AvatarProps) {
  const { data, Component } = getAvatarDisplay(avatarId);
  const iconColor = data ? (AVATAR_COLORS[data.id] ?? colors.inkSecondary) : colors.inkMuted;
  const iconSize = Math.round(size * 0.6);
  const initial = callsign?.[0]?.toUpperCase() ?? '?';

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
        },
        selected && styles.selected,
        style,
      ]}
    >
      {Component ? (
        <Component size={iconSize} color={iconColor} />
      ) : (
        <Text
          style={{
            fontFamily: fontFamily.serif,
            fontSize: size * 0.45,
            color: colors.inkPrimary,
          }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
    borderWidth: 2,
  },
});
