import React, { PropsWithChildren } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../ui';

type DashboardSectionProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function DashboardSection({ title, subtitle, style, children }: DashboardSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={[{ gap: theme.spacing.sm }, style]}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={{ gap: theme.spacing.md }}>{children}</View>
    </View>
  );
}
