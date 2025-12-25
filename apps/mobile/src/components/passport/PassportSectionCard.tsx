import React, { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { Card, useTheme } from '../../ui';

type PassportSectionCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function PassportSectionCard({ title, subtitle, children }: PassportSectionCardProps) {
  const { theme } = useTheme();

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </Card>
  );
}
