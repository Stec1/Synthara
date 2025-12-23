import { Stack } from 'expo-router';
import React from 'react';

import { AppProviders } from '../src/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="gold-shop"
          options={{ title: 'Gold Shop', headerStyle: { backgroundColor: '#0b0b0f' }, headerTintColor: '#f5f5f5' }}
        />
        <Stack.Screen
          name="nft-inventory"
          options={{
            title: 'NFT Inventory',
            headerStyle: { backgroundColor: '#0b0b0f' },
            headerTintColor: '#f5f5f5',
          }}
        />
        <Stack.Screen name="profile/model" options={{ title: 'Model Profile' }} />
      </Stack>
    </AppProviders>
  );
}
