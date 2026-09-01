import React from 'react';
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { space } from '@/design-system/tokens/spacing';
import { Text } from '@/design-system/components/Text';

export interface NavBarTab {
  key: string;
  label: string;
}

export interface NavBarProps {
  tabs: NavBarTab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function NavBar({ tabs, activeKey, onTabPress, style }: NavBarProps) {
  return (
    <View style={[styles.bar, style]}>
      {tabs.map((tab, index) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              index > 0 && styles.tabDivider,
              active && styles.tabActive,
              pressed && !active && styles.tabPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              variant="label"
              color={active ? colors.accent : colors.inkMuted}
              maxFontSizeMultiplier={1.4}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    marginTop: 'auto',
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    paddingVertical: space[5],
    paddingHorizontal: space[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.accent,
  },
  tabPressed: {
    backgroundColor: colors.surfaceHover,
  },
});
