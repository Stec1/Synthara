import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  insetTop?: boolean;
}>;

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  insetTop = true,
}: ScreenProps) {
  const { theme } = useTheme();
  const padding = theme.spacing.lg;

  if (scroll) {
    return (
      <SafeAreaView
        edges={insetTop ? ['top', 'left', 'right'] : ['left', 'right']}
        style={[
          { flex: 1, backgroundColor: theme.colors.background },
          style,
        ]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: padding, paddingVertical: padding, gap: theme.spacing.lg },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={insetTop ? ['top', 'left', 'right'] : ['left', 'right']}
      style={[
        {
          flex: 1,
          paddingHorizontal: padding,
          paddingVertical: padding,
          gap: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
