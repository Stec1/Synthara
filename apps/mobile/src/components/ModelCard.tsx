import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ModelProfile } from '@synthara/shared';

import { Badge, Card, useTheme } from '../ui';

interface Props {
  model: ModelProfile;
}

export function ModelCard({ model }: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card
      onPress={() =>
        router.push({ pathname: '/profile/model', params: { id: String(model.id) } })
      }
      style={{ gap: theme.spacing.sm }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{model.name}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{model.tagline}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.xs,
        }}
      >
        {model.tags.map((tag) => (
          <Badge key={tag} tone="primary" label={`#${tag}`} />
        ))}
      </View>
      <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
        Created {new Date(model.created_at).toLocaleDateString()}
      </Text>
    </Card>
  );
}
