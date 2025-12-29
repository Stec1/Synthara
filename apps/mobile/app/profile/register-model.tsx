import React, { useMemo, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useDemoIdentityStore } from '../../src/state/demoIdentity';
import {
  RegisteredModelSocials,
  useModelRegistryStore,
} from '../../src/state/modelRegistry';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

const resolveSamplePhoto = () => {
  try {
    return Image.resolveAssetSource(require('../../assets/icon.png')).uri;
  } catch (_err) {
    return '';
  }
};

export default function RegisterModelScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const demoIdentity = useDemoIdentityStore();
  const createModel = useModelRegistryStore((state) => state.createModel);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUri, setPhotoUri] = useState(resolveSamplePhoto());
  const [socials, setSocials] = useState<RegisteredModelSocials>({});
  const [error, setError] = useState<string | null>(null);

  const isCreator = demoIdentity.enabled && demoIdentity.role === 'creator';
  const trimmedSocials = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(socials)
          .map(([key, value]) => [key, value?.trim()])
          .filter(([, value]) => value),
      ) as RegisteredModelSocials,
    [socials],
  );

  const handleSave = () => {
    if (!displayName.trim() || !bio.trim() || !photoUri.trim()) {
      setError('Display name, bio, and a photo are required.');
      return;
    }

    const created = createModel({
      displayName: displayName.trim(),
      bio: bio.trim(),
      photoUri: photoUri.trim(),
      socials: trimmedSocials,
      createdByUserId: demoIdentity.userId,
    });
    setError(null);
    router.push({ pathname: '/profile/model/[modelId]', params: { modelId: created.modelId } });
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Register Model</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Draft a passport-ready model. This flow is local-only and keeps your data on device.
          </Text>
          {!isCreator ? (
            <Badge label="Creator role recommended" tone="secondary" />
          ) : (
            <Badge label="Creator mode" tone="primary" />
          )}
        </View>

        <Card style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Identity" subtitle="Name and bio that appear on the passport." />
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.label, { color: theme.colors.subdued }]}>Display name*</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Aurora Flux"
              placeholderTextColor={theme.colors.subdued}
              style={{
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.label, { color: theme.colors.subdued }]}>Bio*</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="High-gloss synth vocalist with cyberpunk visuals."
              placeholderTextColor={theme.colors.subdued}
              multiline
              style={{
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                borderWidth: 1,
                minHeight: 120,
                textAlignVertical: 'top',
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
          </View>
        </Card>

        <Card style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Socials"
            subtitle="Add handles or links so fans can find the model."
          />
          {['instagram', 'x', 'tiktok', 'website'].map((key) => (
            <View key={key} style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.label, { color: theme.colors.subdued }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <TextInput
                value={(socials as Record<string, string>)[key] ?? ''}
                onChangeText={(text) => setSocials((prev) => ({ ...prev, [key]: text }))}
                placeholder={key === 'website' ? 'https://link' : `@${displayName.toLowerCase() || 'handle'}`}
                placeholderTextColor={theme.colors.subdued}
                autoCapitalize="none"
                style={{
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surfaceMuted,
                }}
              />
            </View>
          ))}
        </Card>

        <Card style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Model photo"
            subtitle="A hero image for the passport. Paste a URI or keep the sample."
          />
          <View style={{ gap: theme.spacing.sm }}>
            <TextInput
              value={photoUri}
              onChangeText={setPhotoUri}
              placeholder="Image URI (required)"
              placeholderTextColor={theme.colors.subdued}
              autoCapitalize="none"
              style={{
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
            <Button
              label="Use sample image"
              variant="secondary"
              onPress={() => setPhotoUri(resolveSamplePhoto())}
            />
            {photoUri ? (
              <Card muted style={{ padding: 0 }}>
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: theme.radius.lg,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  }}
                />
              </Card>
            ) : null}
          </View>
        </Card>

        {error ? (
          <Card muted>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>{error}</Text>
          </Card>
        ) : null}

        <Button label="Save Model" onPress={handleSave} variant="primary" />
      </View>
    </Screen>
  );
}
