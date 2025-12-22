import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useModelDetail } from '../../src/api/hooks';

export default function ModelProfileScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const modelId = Number(params.id);
  const { data } = useModelDetail(Number.isNaN(modelId) ? undefined : modelId);

  if (!modelId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.body}>Missing model id</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>{data?.name ?? 'Model Profile'}</Text>
      <Text style={styles.subheading}>{data?.tagline}</Text>
      <View style={styles.tags}>
        {data?.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            #{tag}
          </Text>
        ))}
      </View>

      <Section title="LoRA Vault">
        {data?.loras.map((lora) => (
          <View key={lora.id} style={styles.card}>
            <Text style={styles.cardTitle}>{lora.version}</Text>
            <Text style={styles.body}>{lora.passport_metadata}</Text>
          </View>
        )) || <Text style={styles.body}>No assets yet.</Text>}
      </Section>

      <Section title="Gold Access">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gold Drop</Text>
          <Text style={styles.body}>
            {data?.gold.drop
              ? `${data.gold.drop.status} · ${data.gold.drop.remaining}/${data.gold.drop.supply} left`
              : 'No drop active'}
          </Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Buy Gold</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Auction</Text>
          <Text style={styles.body}>
            {data?.gold.auction
              ? `Current bid ${data.gold.auction.current_bid}G · Ends ${new Date(data.gold.auction.ends_at).toLocaleString()}`
              : 'No auction live'}
          </Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Place Bid</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="Ownership">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diamond Status</Text>
          <Text style={styles.body}>Wallet link placeholder. Web3 connect coming soon.</Text>
        </View>
      </Section>

      <Section title="Games">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Durak Arena</Text>
          <Text style={styles.body}>Gold gated entry. Prototype coming soon.</Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Enter (mock)</Text>
          </Pressable>
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  heading: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: '800',
  },
  subheading: {
    color: '#c5cad3',
    marginVertical: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    color: '#f7c948',
    backgroundColor: '#1f1f2d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#15151f',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252537',
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#c5cad3',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
});
