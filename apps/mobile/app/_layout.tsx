import { Stack } from 'expo-router';
import React from 'react';

import { AppProviders } from '../src/providers/AppProviders';
import { useTheme } from '../src/ui';

function ThemedStack() {
  const { theme } = useTheme();

  const headerOptions = {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
  };

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="gold-shop" options={{ title: 'Gold Shop', ...headerOptions }} />
      <Stack.Screen name="nft-inventory" options={{ title: 'NFT Inventory', ...headerOptions }} />
      <Stack.Screen name="profile/model" options={{ title: 'Model Profile', ...headerOptions }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedStack />
    </AppProviders>
  );
}
