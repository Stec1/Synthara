import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Web3 Login</Text>
        <Text style={styles.body}>Placeholder for wallet connection and signing.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.body}>Opt into Gold drops and auction reminders.</Text>
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
    marginBottom: 8,
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
});
