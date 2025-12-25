import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, subtitle, action, style }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[{ gap: subtitle ? theme.spacing.xs : 0 }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{title}</Text>
        {action}
      </View>
      {subtitle ? (
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
