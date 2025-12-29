import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GoldWalletCard } from '../../src/components/GoldWalletCard';
import { AccessChipRow } from '../../src/components/profileDashboard/AccessChipRow';
import { ActivitySummaryCard } from '../../src/components/profileDashboard/ActivitySummaryCard';
import { DashboardSection } from '../../src/components/profileDashboard/DashboardSection';
import { MiniModelCard } from '../../src/components/profileDashboard/MiniModelCard';
import { NftTierCard } from '../../src/components/profileDashboard/NftTierCard';
import { getDemoAssetsForUser } from '../../src/data/demoUserAssets';
import { useDemoIdentityStore } from '../../src/state/demoIdentity';
import { useGoldStore } from '../../src/state/gold';
import { useLocalInventoryStore } from '../../src/state/localInventory';
import { useModelRegistryStore } from '../../src/state/modelRegistry';
import { Badge, Button, Card, Screen, useTheme } from '../../src/ui';

export default function ProfileTab() {
  const { theme } = useTheme();
  const router = useRouter();
  const role = useGoldStore((state) => state.role);
  const balance = useGoldStore((state) => state.balance);
  const demoIdentity = useDemoIdentityStore();
  const localNfts = useLocalInventoryStore((state) => state.nfts);
  const registeredModels = useModelRegistryStore((state) =>
    state.getModelsByUser(demoIdentity.userId),
  );
  const isCreator = demoIdentity.enabled && demoIdentity.role === 'creator';

  const assets = useMemo(
    () => getDemoAssetsForUser(demoIdentity.userId, localNfts),
    [demoIdentity.userId, localNfts],
  );
  const registeredModelRefs = useMemo(
    () => registeredModels.map((model) => ({ modelId: model.modelId, relation: 'owned' as const })),
    [registeredModels],
  );
  const combinedModelRefs = useMemo(() => {
    const seen = new Set<string>();
    return [...registeredModelRefs, ...assets.models].filter((ref) => {
      if (seen.has(ref.modelId)) return false;
      seen.add(ref.modelId);
      return true;
    });
  }, [assets.models, registeredModelRefs]);
  const diamondNfts = assets.nfts.filter((item) => item.tier === 'diamond');
  const goldNfts = assets.nfts.filter((item) => item.tier === 'gold');

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>My Profile</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge label={`Role: ${role ?? 'fan'}`} tone="primary" />
            {demoIdentity.enabled ? <Badge label="Demo mode" tone="secondary" /> : null}
            <Badge label={`Gold: ${balance}`} tone="info" />
          </View>
        </View>

        <DashboardSection
          title="My Models"
          subtitle="Ownership and follows that open a passport."
        >
          {isCreator ? (
            <Button
              label="Register new model"
              variant="secondary"
              onPress={() => router.push('/profile/register-model')}
            />
          ) : null}
          {combinedModelRefs.map((item) => (
            <MiniModelCard key={`${item.modelId}-${item.relation}`} modelId={item.modelId} relation={item.relation} />
          ))}
        </DashboardSection>

        <DashboardSection title="My NFTs" subtitle="Diamond first, then your gold series.">
          {diamondNfts.length === 0 && goldNfts.length === 0 ? (
            <Card muted>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>No NFTs yet. Mint or claim to see them here.</Text>
            </Card>
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {diamondNfts.length > 0 ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Diamond</Text>
                  <View style={{ gap: theme.spacing.sm }}>
                    {diamondNfts.map((item) => (
                      <NftTierCard key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              ) : null}

              {goldNfts.length > 0 ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Gold Series</Text>
                  <View style={{ gap: theme.spacing.sm }}>
                    {goldNfts.map((item) => (
                      <NftTierCard key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </DashboardSection>

        <DashboardSection
          title="My Access"
          subtitle="Access updates after claims and perks."
        >
          <AccessChipRow />
        </DashboardSection>

        <DashboardSection title="Activity Summary">
          <ActivitySummaryCard />
        </DashboardSection>

        <DashboardSection title="Gold Economy">
          <GoldWalletCard />
        </DashboardSection>
      </View>
    </Screen>
  );
}
