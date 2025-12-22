import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function GameTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Games</Text>
      <Text style={styles.subheading}>Durak-inspired modes coming soon.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Durak Arena</Text>
        <Text style={styles.body}>Gold required to enter. Matchmaking in progress.</Text>
        <Text style={styles.badge}>Requires Gold</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Solo Challenges</Text>
        <Text style={styles.body}>Practice hands with your favorite AI models.</Text>
        <Text style={styles.badge}>Requires Gold</Text>
      </View>
    </ScrollView>
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
  card: {
    backgroundColor: '#15151f',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#252537',
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: '#c5cad3',
    marginTop: 4,
  },
  badge: {
    marginTop: 10,
    color: '#f7c948',
    fontWeight: '700',
  },
});
