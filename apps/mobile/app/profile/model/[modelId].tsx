import React, { useMemo } from 'react';
import { Linking, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { PassportHero } from '../../../src/components/passport/PassportHero';
import { OwnershipLayerCard } from '../../../src/components/passport/OwnershipLayerCard';
import { PassportSectionCard } from '../../../src/components/passport/PassportSectionCard';
import { UtilityList } from '../../../src/components/passport/UtilityList';
import { getDemoModelById } from '../../../src/data/demoModels';
import { useEntitlementsStore } from '../../../src/state/entitlements';
import { useDemoIdentityStore } from '../../../src/state/demoIdentity';
import { useEventLogStore } from '../../../src/state/eventLog';
import { LocalNftItem, useLocalInventoryStore } from '../../../src/state/localInventory';
import { useModelRegistryStore } from '../../../src/state/modelRegistry';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../../src/ui';

export default function ModelPassportScreen() {
  const params = useLocalSearchParams<{ modelId?: string }>();
  const modelId = Array.isArray(params.modelId) ? params.modelId[0] : params.modelId;
  const registryModel = useModelRegistryStore((state) =>
    modelId ? state.getModelById(modelId) : undefined,
  );
  const model = useMemo(() => (modelId ? getDemoModelById(modelId) : undefined), [modelId]);
  const localNfts = useLocalInventoryStore((state) => state.nfts);
  const addNft = useLocalInventoryStore((state) => state.addNft);
  const logEvent = useEventLogStore((state) => state.logLocalEvent);
  const { theme } = useTheme();
  const demoIdentity = useDemoIdentityStore();

  const isCreator = demoIdentity.enabled && demoIdentity.role === 'creator';
  const canViewLoraPassport = useEntitlementsStore(
    (state) => state.entitlements.CAN_VIEW_LORA_PASSPORT ?? false,
  );
  const showLoraPassport = isCreator || canViewLoraPassport;

  const combinedUtilities = useMemo(() => {
    if (!model) return [];
    return Array.from(new Set([...model.ownership.diamond.utilities, ...model.ownership.gold.utilities]));
  }, [model]);

  const hasLocalDiamond = useMemo(
    () =>
      !!modelId &&
      localNfts.some(
        (item) =>
          item.modelId === modelId &&
          item.tier === 'diamond' &&
          (!registryModel || item.createdByUserId === registryModel.createdByUserId),
      ),
    [localNfts, modelId, registryModel],
  );

  const canMintMockDiamond = Boolean(
    registryModel &&
      isCreator &&
      registryModel.createdByUserId === demoIdentity.userId &&
      !hasLocalDiamond &&
      modelId,
  );

  const handleMintDiamond = () => {
    if (!registryModel || !modelId || hasLocalDiamond) return;
    const newNft: LocalNftItem = {
      id: `local-${registryModel.modelId}-diamond-${Date.now()}`,
      modelId: registryModel.modelId,
      tier: 'diamond',
      label: 'Diamond 1/1',
      status: 'owned',
      acquiredAtISO: new Date().toISOString(),
      source: 'mint_mock',
      createdByUserId: registryModel.createdByUserId,
    };
    addNft(newNft);
    logEvent('NFT_MINTED', { modelId: registryModel.modelId, tier: 'diamond', mode: 'mock' });
  };

  if (!registryModel && !model) {
    return (
      <Screen>
        <Card>
          <SectionHeader title="Model not found" subtitle="This passport is unavailable." />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            The requested model passport could not be located. Try opening one of the featured demo models.
          </Text>
          <Link href="/(tabs)/home" asChild>
            <Button label="Back to Home" variant="secondary" />
          </Link>
        </Card>
      </Screen>
    );
  }

  const passportHeroModel = registryModel
    ? {
        id: registryModel.modelId,
        name: registryModel.displayName,
        tagline: registryModel.bio,
        heroImage: registryModel.photoUri,
        badgeLabel: 'Creator registered model',
      }
    : {
        id: model!.id,
        name: model!.name,
        tagline: model!.tagline,
        heroImage: model!.heroImage,
      };

  return (
    <Screen>
      <PassportHero model={passportHeroModel} />

      {registryModel ? (
        <>
          <PassportSectionCard title="Model Bio">
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              {registryModel.bio}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
              Registered {new Date(registryModel.createdAtISO).toLocaleString()}
            </Text>
          </PassportSectionCard>

          <PassportSectionCard title="Social links" subtitle="Optional handles provided by the creator.">
            <View style={{ gap: theme.spacing.xs }}>
              {Object.entries(registryModel.socials).filter(([, value]) => value).length === 0 ? (
                <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                  No socials added yet.
                </Text>
              ) : (
                Object.entries(registryModel.socials)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <Text
                      key={key}
                      onPress={() => (value ? Linking.openURL(value) : undefined)}
                      style={[theme.typography.body, { color: theme.colors.primary }]}
                    >
                      {`${key}: ${value}`}
                    </Text>
                  ))
              )}
            </View>
          </PassportSectionCard>
        </>
      ) : null}

      {model ? (
        <>
          <PassportSectionCard title="Origin">
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{model.passport.origin}</Text>
          </PassportSectionCard>

          <PassportSectionCard title="Archetype & Style">
            <View style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                {model.passport.archetype}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                {model.passport.style}
              </Text>
            </View>
          </PassportSectionCard>

          <PassportSectionCard title="AI Stack">
            <View style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                Base model · {model.passport.aiStack.baseModel}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                LoRA · {model.passport.aiStack.loraVersion}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
                {model.passport.aiStack.notes}
              </Text>
            </View>
          </PassportSectionCard>

          {showLoraPassport ? (
            <PassportSectionCard title="LoRA Passport (Preview)" subtitle="Visible to creators and entitled fans.">
              <View style={{ gap: theme.spacing.xs }}>
                <Badge label={model.passport.aiStack.loraVersion} tone="primary" />
                <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                  Base: {model.passport.aiStack.baseModel}
                </Text>
              </View>
            </PassportSectionCard>
          ) : (
            <PassportSectionCard title="LoRA Passport locked (creator access)">
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                Switch to creator role in Demo Identity to preview the LoRA passport details.
              </Text>
            </PassportSectionCard>
          )}

          <PassportSectionCard title="Ownership Layers">
            <View style={{ gap: theme.spacing.md }}>
              <OwnershipLayerCard
                variant="diamond"
                title="Diamond NFT"
                supply={model.ownership.diamond.supply}
                statusLabel={model.ownership.diamond.statusLabel}
                utilities={model.ownership.diamond.utilities}
                badgeLabel="1/1"
              />
              <OwnershipLayerCard
                variant="gold"
                title="Gold Series"
                supply={model.ownership.gold.supply}
                statusLabel={model.ownership.gold.priceLabel}
                utilities={model.ownership.gold.utilities}
                badgeLabel={`${model.series.goldSeriesName}`}
                accentLabel={`Series ${model.series.goldSeriesCount}`}
              />
            </View>
          </PassportSectionCard>

          <PassportSectionCard title="What you unlock" subtitle="Access & utility across layers.">
            <UtilityList items={combinedUtilities} />
          </PassportSectionCard>

          <Card style={{ gap: theme.spacing.md }}>
            <SectionHeader
              title="Stay close"
              subtitle="Follow the model journey and track the Gold series."
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
              <Button label="View Gold Series" disabled />
              <Button label="Follow model" variant="ghost" />
            </View>
          </Card>
        </>
      ) : null}

      {registryModel ? (
        <Card style={{ gap: theme.spacing.sm }}>
          <SectionHeader
            title="Mint Diamond (mock)"
            subtitle="Creates a local 1/1 diamond for this registered model."
          />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Available only to creators on registered models. Adds a mock Diamond NFT to your local
            inventory for quick passport demos.
          </Text>
          <Button
            label={hasLocalDiamond ? 'Diamond minted' : 'Mint Diamond (mock)'}
            disabled={!canMintMockDiamond}
            onPress={handleMintDiamond}
            variant="primary"
          />
          {!isCreator ? (
            <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
              Switch to creator role in Demo Identity to mint.
            </Text>
          ) : null}
          {registryModel.createdByUserId !== demoIdentity.userId ? (
            <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
              Only the creator who registered this model can mint its mock Diamond.
            </Text>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}
