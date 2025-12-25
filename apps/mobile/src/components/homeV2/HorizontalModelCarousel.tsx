import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DemoModel } from '../../data/demoModels';
import { Badge, Card, useTheme } from '../../ui';

type Props = {
  models: DemoModel[];
};

export function HorizontalModelCarousel({ models }: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.md, paddingRight: theme.spacing.lg }}
    >
      {models.map((model) => (
        <Card
          key={model.id}
          onPress={() =>
            router.push({ pathname: '/profile/model/[modelId]', params: { modelId: model.id } })
          }
          style={{
            width: 220,
            gap: theme.spacing.sm,
            padding: theme.spacing.lg,
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
              {model.name}
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {model.tagline}
            </Text>
          </View>
          <View
            style={{
              height: 90,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceMuted,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.colors.border,
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                position: 'absolute',
                right: -14,
                top: -16,
                width: 90,
                height: 90,
                borderRadius: 999,
                backgroundColor: theme.colors.primarySoft,
              }}
            />
          </View>
          {model.badges.isFeatured ? <Badge tone="primary" label="Featured" /> : null}
        </Card>
      ))}
    </ScrollView>
  );
}
