import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { PassportHero } from '../../../src/components/passport/PassportHero';
import { OwnershipLayerCard } from '../../../src/components/passport/OwnershipLayerCard';
import { PassportSectionCard } from '../../../src/components/passport/PassportSectionCard';
import { UtilityList } from '../../../src/components/passport/UtilityList';
import { getDemoModelById } from '../../../src/data/demoModels';
import { useEntitlementsStore } from '../../../src/state/entitlements';
import { useDemoIdentityStore } from '../../../src/state/demoIdentity';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../../src/ui';

export default function ModelPassportScreen() {
  const params = useLocalSearchParams<{ modelId?: string }>();
  const modelId = Array.isArray(params.modelId) ? params.modelId[0] : params.modelId;
  const model = modelId ? getDemoModelById(modelId) : undefined;
  const { theme } = useTheme();

  const isCreator = useDemoIdentityStore(
    (state) => state.enabled && state.role === 'creator',
  );
  const canViewLoraPassport = useEntitlementsStore(
    (state) => state.entitlements.CAN_VIEW_LORA_PASSPORT ?? false,
  );
  const showLoraPassport = isCreator || canViewLoraPassport;

  const combinedUtilities = useMemo(() => {
    if (!model) return [];
    return Array.from(new Set([...model.ownership.diamond.utilities, ...model.ownership.gold.utilities]));
  }, [model]);

  if (!model) {
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

  return (
    <Screen>
      <PassportHero model={model} />

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
    </Screen>
  );
}
