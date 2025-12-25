import React from 'react';
import { Image, Text, View } from 'react-native';

import { DemoModel } from '../../data/demoModels';
import { Badge, Card, useTheme } from '../../ui';

type PassportHeroProps = {
  model: DemoModel;
};

export function PassportHero({ model }: PassportHeroProps) {
  const { theme } = useTheme();

  const renderHeroImage = () => {
    if (model.heroImage) {
      return (
        <Image
          source={{ uri: model.heroImage }}
          style={{
            width: '100%',
            height: 220,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
          }}
          resizeMode="cover"
        />
      );
    }

    return (
      <View
        style={{
          height: 220,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.surfaceMuted,
          borderWidth: 1,
          borderColor: theme.colors.border,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            backgroundColor: theme.colors.primarySoft,
            opacity: 0.25,
            transform: [{ rotate: '-6deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            backgroundColor: theme.colors.surface,
            opacity: 0.4,
            borderRadius: theme.radius.lg,
            alignSelf: 'center',
            top: theme.spacing.md,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.12,
            shadowRadius: 24,
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Badge label={`Model ID: ${model.id}`} tone="primary" />
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>{model.name}</Text>
        <Text style={[theme.typography.subtitle, { color: theme.colors.subdued }]}>
          {model.tagline}
        </Text>
      </View>

      <Card muted style={{ padding: 0 }}>{renderHeroImage()}</Card>
    </View>
  );
}
