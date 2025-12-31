import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../ui';

export function SyntharaHeader() {
  const { theme } = useTheme();

  return (
    <View style={{ paddingTop: theme.spacing.xs, paddingBottom: theme.spacing.sm }}>
      <Text
        style={[
          theme.typography.heading,
          {
            color: theme.colors.text,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          },
        ]}
      >
        Synthara
      </Text>
    </View>
  );
}
