import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PERK_CATALOG,
  PerkDefinition,
  isPerkItemActive,
  useGoldStore,
} from '../src/state/gold';

const formatDuration = (perk: PerkDefinition) => {
  if (!perk.duration) return 'No duration';
  if (perk.duration.kind === 'PERMANENT') return 'Permanent';
  if (perk.duration.kind === 'USES') return `${perk.duration.value ?? 0} uses`;
  const days = Math.max(1, Math.round((perk.duration.value ?? 0) / (24 * 60 * 60)));
  return `${days} days`;
};

const formatStacking = (rule?: PerkDefinition['stackingRule']) => {
  switch (rule) {
    case 'NONE':
      return 'Single-use';
    case 'MULTIPLICATIVE':
      return 'Stacks (multiplicative)';
    case 'ADDITIVE':
    default:
      return 'Stacks (additive)';
  }
};

const formatEffect = (value: number, mode: 'add' | 'mul' = 'add') => {
  if (mode === 'mul') {
    return `${Math.round(value * 100)}%`;
  }
  return `${value > 0 ? '+' : ''}${value}`;
};

const formatEffectLabel = (perk: PerkDefinition) =>
  (perk.effects ?? []).map((effect) => {
    switch (effect.type) {
      case 'DAILY_CLAIM_BONUS':
        return `Daily claim bonus ${formatEffect(effect.value, effect.mode)}`;
      case 'DAILY_CLAIM_MULTIPLIER':
        return `Daily claim x${(1 + effect.value).toFixed(2)}`;
      case 'EARNING_MULTIPLIER':
        return `Earnings x${(1 + effect.value).toFixed(2)}`;
      case 'DAILY_LIMIT_BONUS':
        return `Daily limit ${formatEffect(effect.value, effect.mode)}`;
      default:
        return `${effect.type} ${formatEffect(effect.value, effect.mode)}`;
    }
  });

export default function GoldShopScreen() {
  const balance = useGoldStore((state) => state.balance);
  const role = useGoldStore((state) => state.role);
  const perkInventory = useGoldStore((state) => state.perkInventory);
  const perkCatalog = useGoldStore((state) => state.perkCatalog);
  const getOwnedPerks = useGoldStore((state) => state.getOwnedPerks);
  const buyPerk = useGoldStore((state) => state.buyPerk);
  const canAfford = useGoldStore((state) => state.canAfford);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const perks = useMemo(() => perkCatalog ?? PERK_CATALOG, [perkCatalog]);
  const ownedPerks = useMemo(() => getOwnedPerks(), [getOwnedPerks, perkInventory]);
  const now = Date.now();

  const handleBuy = (perk: PerkDefinition) => {
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
          const activeItems = perkInventory.filter(
            (item) => item.perkId === perk.id && isPerkItemActive(item, now),
          );
          const owned = Boolean(ownedPerks?.[perk.id]);
          const hasPermanent = activeItems.some(
            (item) => !item.expiresAt && item.remainingUses === undefined,
          );
          const roleMismatch = perk.roleGate && perk.roleGate !== role;
          const canBuy =
            canAfford(perk.priceGold) &&
            !roleMismatch &&
            (perk.stackingRule !== 'NONE' || (!hasPermanent && !owned));
          return (
            <View key={perk.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{perk.title}</Text>
                  <Text style={styles.cardSubtitle}>{perk.description}</Text>
                </View>
                <Text style={styles.price}>{perk.priceGold} Gold</Text>
              </View>
              <Text style={styles.hintText}>
                {formatDuration(perk)} • {formatStacking(perk.stackingRule)}
              </Text>
              {(perk.effects?.length ?? 0) > 0 ? (
                <View style={styles.effectsBox}>
                  {formatEffectLabel(perk).map((label) => (
                    <Text key={label} style={styles.effectText}>
                      • {label}
                    </Text>
                  ))}
                </View>
              ) : null}
              {perk.roleGate ? (
                <Text style={styles.hintText}>Requires {perk.roleGate} role</Text>
              ) : null}
              {activeItems.length > 0 ? (
                <Text style={styles.activeText}>
                  {hasPermanent
                    ? 'Owned (permanent)'
                    : `Active (${activeItems[0]?.expiresAt ? `expires ${new Date(activeItems[0]?.expiresAt ?? '').toLocaleDateString()}` : 'in use'})`}
                </Text>
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
  activeText: {
    color: '#7dd97c',
    fontSize: 12,
  },
  effectsBox: {
    gap: 2,
  },
  effectText: {
    color: '#c5cad3',
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
