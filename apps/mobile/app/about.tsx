import React from 'react';
import { Text, View } from 'react-native';

import { Screen, Card, useTheme } from '../src/ui';

export default function AboutScreen() {
  const { theme } = useTheme();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>About Synthara</Text>
        <Card>
          <View style={{ gap: theme.spacing.md }}>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Synthara curates luxury-grade AI models with a collector-first mindset.
            </Text>
            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>• Authenticated model passports.</Text>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>• Diamond + Gold ownership paths.</Text>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>• Live drops aligned with the community.</Text>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
