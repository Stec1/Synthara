import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PERK_CATALOG, Perk, useGoldStore } from '../src/state/gold';

export default function GoldShopScreen() {
  const balance = useGoldStore((state) => state.balance);
  const role = useGoldStore((state) => state.role);
  const ownedPerks = useGoldStore((state) => state.ownedPerks);
  const buyPerk = useGoldStore((state) => state.buyPerk);
  const canAfford = useGoldStore((state) => state.canAfford);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const perks = useMemo(() => PERK_CATALOG, []);

  const handleBuy = (perk: Perk) => {
    if (perk.roleGate && perk.roleGate !== role) {
      setStatusMessage('This perk is gated to a different role');
      return;
    }
    const result = buyPerk(perk.id);
    if (result.ok) {
      setStatusMessage(`Purchased ${perk.title}!`);
    } else {
      setStatusMessage(result.error ?? 'Unable to purchase right now');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Gold Shop</Text>
      <Text style={styles.body}>Spend Gold to unlock perks for your account.</Text>
      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{balance} Gold</Text>
      </View>
      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <View style={styles.list}>
        {perks.map((perk) => {
          const owned = Boolean(ownedPerks?.[perk.id]);
          const roleMismatch = perk.roleGate && perk.roleGate !== role;
          const canBuy = canAfford(perk.priceGold) && !owned && !roleMismatch;
          return (
            <View key={perk.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{perk.title}</Text>
                  <Text style={styles.cardSubtitle}>{perk.description}</Text>
                </View>
                <Text style={styles.price}>{perk.priceGold} Gold</Text>
              </View>
              {perk.roleGate ? (
                <Text style={styles.hintText}>Requires {perk.roleGate} role</Text>
              ) : null}
              <Pressable
                onPress={() => handleBuy(perk)}
                disabled={!canBuy}
                style={[styles.buyButton, (!canBuy || owned) && styles.buyButtonDisabled]}
              >
                <Text style={[styles.buyButtonText, (!canBuy || owned) && styles.buyButtonTextDim]}>
                  {owned ? 'Owned' : 'Buy'}
                </Text>
              </Pressable>
            </View>
          );
        })}
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
    marginBottom: 6,
  },
  body: {
    color: '#c5cad3',
    marginBottom: 12,
  },
  balanceBox: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#8d93a3',
    marginBottom: 4,
  },
  balanceValue: {
    color: '#f7c948',
    fontSize: 20,
    fontWeight: '800',
  },
  status: {
    color: '#7dd97c',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#c5cad3',
    marginTop: 2,
  },
  price: {
    color: '#f7c948',
    fontWeight: '800',
  },
  hintText: {
    color: '#8d93a3',
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#2a2a36',
  },
  buyButtonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  buyButtonTextDim: {
    color: '#8d93a3',
  },
});
