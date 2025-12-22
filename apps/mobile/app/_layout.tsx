import { Stack } from 'expo-router';
import React from 'react';

import { AppProviders } from '../src/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/model" options={{ title: 'Model Profile' }} />
      </Stack>
    </AppProviders>
  );
}
