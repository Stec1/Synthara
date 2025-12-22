import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ModelProfile } from '@synthara/shared';

interface Props {
  model: ModelProfile;
}

export function ModelCard({ model }: Props) {
  const router = useRouter();

  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/profile/model', params: { id: String(model.id) } })}>
      <Text style={styles.name}>{model.name}</Text>
      <Text style={styles.tagline}>{model.tagline}</Text>
      <View style={styles.tags}>
        {model.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            #{tag}
          </Text>
        ))}
      </View>
      <Text style={styles.meta}>Created {new Date(model.created_at).toLocaleDateString()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15151f',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#252537',
  },
  name: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
  },
  tagline: {
    color: '#b3b8c2',
    marginTop: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    color: '#f7c948',
    backgroundColor: '#1f1f2d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  meta: {
    color: '#7f8593',
    marginTop: 8,
    fontSize: 12,
  },
});
