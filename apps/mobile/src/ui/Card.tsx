import React, { PropsWithChildren } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';

type CardProps = PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  muted?: boolean;
}>;

export function Card({ children, onPress, style, muted }: CardProps) {
  const { theme } = useTheme();
  const backgroundColor = muted ? theme.colors.surfaceMuted : theme.colors.surface;

  const sharedStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          sharedStyle,
          pressed && { backgroundColor: theme.colors.surfaceMuted },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={sharedStyle}>{children}</View>;
}
