import React from 'react';
import { Text, View } from 'react-native';

import { useGoldStore } from '../../state/gold';
import { Badge, Card, useTheme } from '../../ui';

export function HeroBanner() {
  const { theme } = useTheme();
  const balance = useGoldStore((state) => state.balance);

  return (
    <Card
      style={{
        padding: theme.spacing.xl,
        overflow: 'hidden',
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: -40,
          top: -20,
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: theme.colors.primarySoft,
          opacity: 0.35,
        }}
      />
      <View style={{ gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Synthara 3.0</Text>
          <Text style={[theme.typography.subtitle, { color: theme.colors.subdued }]}>
            Premium discovery for AI creator investors.
          </Text>
        </View>
        <Badge
          tone="primary"
          label={`Gold Balance · ${balance}`}
          style={{
            backgroundColor: theme.colors.primarySoft,
            borderWidth: 1,
            borderColor: theme.colors.primary,
          }}
        />
      </View>
    </Card>
  );
}
