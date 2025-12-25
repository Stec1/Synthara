import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

import { useTheme } from './ThemeProvider';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{label}</Text>
    </View>
  );
}
