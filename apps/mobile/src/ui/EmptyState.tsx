import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from './ThemeProvider';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, description, actionLabel, onActionPress }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
        alignItems: 'flex-start',
      }}
    >
      <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{description}</Text>
      ) : null}
      {actionLabel ? (
        <Button label={actionLabel} variant="secondary" onPress={onActionPress} />
      ) : null}
    </View>
  );
}
