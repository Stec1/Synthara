import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getDemoModelById } from '../../data/demoModels';
import { Card, Button, useTheme } from '../../ui';

type Props = {
  modelId: string;
};

export function FeaturedModelCard({ modelId }: Props) {
  const model = getDemoModelById(modelId);
  const { theme } = useTheme();
  const router = useRouter();

  if (!model) return null;

  return (
    <Card style={{ gap: theme.spacing.md, padding: theme.spacing.xl }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.label, { color: theme.colors.primary }]}>Featured Model</Text>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
          {model.name}
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
          {model.tagline}
        </Text>
      </View>

      <View
        style={{
          height: 160,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.colors.primarySoft,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: -24,
            top: -12,
            width: 120,
            height: 120,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
            opacity: 0.12,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: -32,
            bottom: -18,
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: theme.colors.overlay,
          }}
        />
      </View>

      <Button
        label="View Passport"
        onPress={() =>
          router.push({ pathname: '/profile/model/[modelId]', params: { modelId: model.id } })
        }
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: theme.spacing.xl,
        }}
      />
    </Card>
  );
}
