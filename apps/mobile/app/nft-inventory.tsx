import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InventoryNft, useGoldStore } from '../src/state/gold';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export default function NftInventoryScreen() {
  const inventory = useGoldStore((state) => state.inventory);
  const mintMockNft = useGoldStore((state) => state.mintMockNft);
  const [lastMinted, setLastMinted] = useState<InventoryNft | null>(null);

  const handleMint = () => {
    const minted = mintMockNft();
    setLastMinted(minted);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>NFT Inventory</Text>
      <Text style={styles.body}>
        Track your mock NFTs. This list is local-only and great for testing mint flows.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleMint}>
          <Text style={styles.primaryButtonText}>Mint demo NFT</Text>
        </Pressable>
        {lastMinted ? (
          <Text style={styles.status}>
            Minted {lastMinted.name} ({lastMinted.tier})
          </Text>
        ) : null}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total NFTs</Text>
        <Text style={styles.summaryValue}>{inventory.length}</Text>
      </View>

      {inventory.length === 0 ? (
        <Text style={styles.emptyText}>No NFTs minted yet.</Text>
      ) : (
        <View style={styles.list}>
          {inventory.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.tier}>{item.tier.toUpperCase()}</Text>
              </View>
              <Text style={styles.body}>Minted: {formatDateTime(item.createdAt)}</Text>
              {item.sourcePerkId ? (
                <Text style={styles.body}>Source perk: {item.sourcePerkId}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 6,
  },
  body: {
    color: '#c5cad3',
  },
  actions: {
    marginVertical: 12,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  status: {
    color: '#7dd97c',
  },
  summaryBox: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#8d93a3',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#f5f5f5',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: '#8d93a3',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '800',
  },
  tier: {
    color: '#f7c948',
    fontWeight: '800',
  },
});
