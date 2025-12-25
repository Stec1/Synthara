import React, { PropsWithChildren } from 'react';
import { Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';

type ButtonProps = PropsWithChildren<{
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}>;

export function Button({
  children,
  label,
  onPress,
  disabled,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const getBackground = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.surfaceMuted;
      case 'ghost':
        return 'transparent';
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  const baseStyle: StyleProp<ViewStyle> = [
    {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radius.md,
      backgroundColor: getBackground(),
      borderWidth: variant === 'ghost' ? 1 : 0,
      borderColor: variant === 'ghost' ? theme.colors.border : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    style,
  ];

  const textColor =
    variant === 'secondary' || variant === 'ghost' ? theme.colors.text : theme.colors.inverseText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        baseStyle,
        pressed && !disabled && { opacity: 0.9 },
        disabled && { opacity: 0.6 },
      ]}
    >
      <Text
        style={[
          theme.typography.label,
          { color: textColor },
          variant === 'ghost' && { color: theme.colors.muted },
          textStyle,
        ]}
      >
        {label ?? children}
      </Text>
    </Pressable>
  );
}
