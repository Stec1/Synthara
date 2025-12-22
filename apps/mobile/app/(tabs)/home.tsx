import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ModelCard } from '../../src/components/ModelCard';
import { useModels } from '../../src/api/hooks';

export default function HomeScreen() {
  const { data: models = [] } = useModels();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Synthara 3.0</Text>
      <Text style={styles.subheading}>Build, own, and play with AI influencer creators.</Text>

      <Section title="Trending Models">
        {models.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </Section>

      <Section title="Gold Drops Live">
        <Text style={styles.body}>Track fixed-price Gold drops and grab early access.</Text>
      </Section>

      <Section title="Auctions Ending Soon">
        <Text style={styles.body}>Bid on Diamond and Gold auctions before timers expire.</Text>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
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
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#9aa0aa',
  },
});
