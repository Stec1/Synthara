import React from 'react';
import { Text, View } from 'react-native';

import { Card, Badge, useTheme } from '../../ui';
import { UtilityList } from './UtilityList';

type OwnershipLayerCardProps = {
  variant: 'diamond' | 'gold';
  title: string;
  supply: string;
  statusLabel: string;
  utilities: string[];
  badgeLabel?: string;
  accentLabel?: string;
};

export function OwnershipLayerCard({
  variant,
  title,
  supply,
  statusLabel,
  utilities,
  badgeLabel,
  accentLabel,
}: OwnershipLayerCardProps) {
  const { theme } = useTheme();

  const accentColor = variant === 'diamond' ? theme.colors.text : theme.colors.primary;
  const accentBackground =
    variant === 'diamond' ? theme.colors.surfaceMuted : theme.colors.primarySoft;

  return (
    <Card
      style={{
        gap: theme.spacing.md,
        borderColor: variant === 'gold' ? theme.colors.primarySoft : theme.colors.border,
        backgroundColor: variant === 'gold' ? theme.colors.surfaceMuted : theme.colors.surface,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{statusLabel}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: theme.spacing.xs }}>
          <Badge label={badgeLabel ?? supply} tone={variant === 'gold' ? 'primary' : 'default'} />
          {accentLabel ? (
            <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
              {accentLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: accentBackground,
          borderWidth: 1,
          borderColor: variant === 'gold' ? theme.colors.primary : theme.colors.border,
          gap: theme.spacing.sm,
        }}
      >
        <Text style={[theme.typography.caption, { color: accentColor }]}>Supply · {supply}</Text>
        <UtilityList items={utilities} />
      </View>
    </Card>
  );
}
