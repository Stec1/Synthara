import React, { PropsWithChildren } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';

type BadgeProps = PropsWithChildren<{
  label?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
  style?: StyleProp<ViewStyle>;
}>;

export function Badge({ label, tone = 'default', style, children }: BadgeProps) {
  const { theme } = useTheme();

  const getTone = () => {
    switch (tone) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primarySoft,
          color: theme.colors.primary,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.overlay,
          color: theme.colors.success,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.overlay,
          color: theme.colors.warning,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.surfaceMuted,
          color: theme.colors.subdued,
        };
    }
  };

  const toneColors = getTone();

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: toneColors.backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[theme.typography.caption, { color: toneColors.color }]}>
        {label ?? children}
      </Text>
    </View>
  );
}
