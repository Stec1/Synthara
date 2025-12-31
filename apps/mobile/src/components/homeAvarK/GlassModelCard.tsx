import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../ui';

type ModelCardModel = { id: number | string; name: string; tagline?: string; tags?: string[] };

type GlassModelCardProps = {
  model: ModelCardModel;
  variant: 'trending' | 'featured';
  imageSource?: any;
  onPress: () => void;
};

export function GlassModelCard({ model, variant, imageSource, onPress }: GlassModelCardProps) {
  const { theme } = useTheme();
  const isFeatured = variant === 'featured';
  const valueLine =
    model.tags?.length && model.tags.length > 0
      ? model.tags.slice(0, 2).join(' · ')
      : 'Diamond 1/1 · Gold series';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 12 },
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={[
              theme.typography.heading,
              { color: '#f6f6ff', fontSize: isFeatured ? 22 : 18, letterSpacing: 0.4 },
            ]}
            numberOfLines={1}
          >
            {model.name}
          </Text>
          {!!model.tagline && (
            <Text
              style={[
                theme.typography.body,
                { color: 'rgba(255,255,255,0.7)', maxWidth: '92%' },
              ]}
              numberOfLines={2}
            >
              {model.tagline}
            </Text>
          )}
          <Text style={[theme.typography.caption, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>
            {valueLine}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: 'rgba(247,201,72,0.4)',
            backgroundColor: 'rgba(247,201,72,0.08)',
          }}
        >
          <Text style={[theme.typography.label, { color: theme.colors.primary }]}>View</Text>
        </View>
      </View>

      <View style={{ width: '42%', alignItems: 'flex-end', justifyContent: 'center' }}>
        <View
          style={{
            width: '100%',
            aspectRatio: isFeatured ? 1 : 0.85,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          {imageSource ? (
            <Image source={imageSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(129,126,255,0.24)',
              }}
            />
          )}
          {!imageSource && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
