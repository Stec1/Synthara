import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../ui';

type UtilityListProps = {
  items: string[];
};

export function UtilityList({ items }: UtilityListProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Text style={[theme.typography.body, { color: theme.colors.primary }]}>•</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued, flex: 1 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
